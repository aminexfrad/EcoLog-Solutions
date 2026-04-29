const db = require('../config/db');
const { calculateCO2, estimateDistance, compareOptions } = require('../services/carbonService');
const { createNotification, notifyCarriersNewShipment, notifyStatusUpdate } = require('../services/notificationService');

// Helper: generate shipment reference
async function generateRef() {
  const [rows] = await db.execute('SELECT COUNT(*) as cnt FROM shipments');
  const next = (rows[0].cnt + 248).toString().padStart(4, '0');
  return `EXP-${next}`;
}

// POST /api/shipments  (shipper only)
exports.create = async (req, res, next) => {
  try {
    const { origin, destination, weight_kg, volume_m3, deadline, vehicle_type = 'diesel', client_id, client_email } = req.body;
    if (!origin || !destination || !weight_kg)
      return res.status(400).json({ message: 'Origine, destination et poids sont requis.' });

    let resolvedClientId = null;
    if (client_id) {
      const [clientRows] = await db.execute(
        'SELECT id FROM users WHERE id = ? AND role = ? AND is_active = 1 LIMIT 1',
        [client_id, 'client']
      );
      if (clientRows.length === 0) return res.status(404).json({ message: 'Client introuvable.' });
      resolvedClientId = clientRows[0].id;
    } else if (client_email) {
      const [clientRows] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND role = ? AND is_active = 1 LIMIT 1',
        [client_email, 'client']
      );
      if (clientRows.length === 0) return res.status(404).json({ message: 'Client introuvable (email).' });
      resolvedClientId = clientRows[0].id;
    }

    const reference = await generateRef();
    const [result] = await db.execute(
      `INSERT INTO shipments (reference, shipper_id, client_id, origin, destination, weight_kg, volume_m3, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference, req.user.id, resolvedClientId, origin, destination, weight_kg, volume_m3 || null, deadline || null]
    );
    const shipmentId = result.insertId;

    // Calculate CO2 + create route
    const distanceKm = estimateDistance(origin, destination);
    const carbon = calculateCO2(distanceKm, parseFloat(weight_kg), vehicle_type);

    await db.execute(
      `INSERT INTO routes (shipment_id, distance_km, transport_mode, vehicle_type, duration_min, origin_lat, origin_lng, dest_lat, dest_lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [shipmentId, distanceKm, vehicle_type === 'rail' ? 'rail' : 'road', vehicle_type, Math.round(distanceKm * 0.6), 48.8566, 2.3522, 45.7640, 4.8357]
    );

    await db.execute(
      `INSERT INTO carbon_footprints (shipment_id, co2_kg, emission_factor, distance_km, weight_tons)
       VALUES (?, ?, ?, ?, ?)`,
      [shipmentId, carbon.co2_kg, carbon.emission_factor, carbon.distance_km, carbon.weight_tons]
    );

    // Create CMR document
    await db.execute(
      `INSERT INTO documents (shipment_id, type, uploaded_by) VALUES (?, 'CMR', ?)`,
      [shipmentId, req.user.id]
    );

    // Audit log
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES (?, 'CREATE_SHIPMENT', 'shipment', ?, ?)`,
      [req.user.id, shipmentId, `Expédition ${reference} créée`]
    );

    // Notify shipper
    await createNotification(
      req.user.id, 'shipment_created',
      `Expédition ${reference} créée. CO2 estimé: ${carbon.co2_kg} kg`
    );

    // Notify all carriers
    await notifyCarriersNewShipment(shipmentId, reference, origin, destination);

    const [shipment] = await db.execute(
      `SELECT s.*, cf.co2_kg, r.distance_km, r.vehicle_type
       FROM shipments s
       LEFT JOIN carbon_footprints cf ON cf.shipment_id = s.id
       LEFT JOIN routes r ON r.shipment_id = s.id
       WHERE s.id = ?`,
      [shipmentId]
    );
    res.status(201).json(shipment[0]);
  } catch (err) { next(err); }
};

// GET /api/shipments
exports.getAll = async (req, res, next) => {
  try {
    let query = `
      SELECT s.*,
             u1.name as shipper_name, u1.company as shipper_company,
             u2.name as carrier_name, u2.company as carrier_company,
             cf.co2_kg, r.distance_km, r.vehicle_type
      FROM shipments s
      LEFT JOIN users u1 ON u1.id = s.shipper_id
      LEFT JOIN users u2 ON u2.id = s.carrier_id
      LEFT JOIN carbon_footprints cf ON cf.shipment_id = s.id
      LEFT JOIN routes r ON r.shipment_id = s.id`;

    const params = [];
    if (req.user.role === 'shipper') {
      query += ' WHERE s.shipper_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'carrier') {
      query += ' WHERE s.carrier_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'client') {
      query += ' WHERE s.client_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY s.created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/shipments/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*,
              u1.name as shipper_name, u1.company as shipper_company,
              u2.name as carrier_name, u2.company as carrier_company,
              cf.co2_kg, r.distance_km, r.vehicle_type, r.duration_min,
              r.origin_lat, r.origin_lng, r.dest_lat, r.dest_lng
       FROM shipments s
       LEFT JOIN users u1 ON u1.id = s.shipper_id
       LEFT JOIN users u2 ON u2.id = s.carrier_id
       LEFT JOIN carbon_footprints cf ON cf.shipment_id = s.id
       LEFT JOIN routes r ON r.shipment_id = s.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });
    const shipment = rows[0];
    const canAccess =
      req.user.role === 'admin' ||
      shipment.shipper_id === req.user.id ||
      shipment.carrier_id === req.user.id ||
      shipment.client_id === req.user.id;
    if (!canAccess) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Options de comparaison CO2
    const cf = shipment;
    const options = cf.distance_km ? compareOptions(cf.distance_km, cf.weight_kg) : [];
    res.json({ ...rows[0], co2_options: options });
  } catch (err) { next(err); }
};

// PATCH /api/shipments/:id/assign  (shipper assigns a carrier)
exports.assign = async (req, res, next) => {
  try {
    const { carrier_id } = req.body;
    const [rows] = await db.execute('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });
    const shipment = rows[0];
    if (shipment.shipper_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Accès refusé.' });

    // Verify carrier exists
    const [carrier] = await db.execute('SELECT * FROM users WHERE id = ? AND role = ?', [carrier_id, 'carrier']);
    if (carrier.length === 0) return res.status(404).json({ message: 'Transporteur introuvable.' });

    await db.execute(
      'UPDATE shipments SET carrier_id = ?, status = ? WHERE id = ?',
      [carrier_id, 'ASSIGNED', shipment.id]
    );

    await createNotification(carrier_id, 'mission_assigned',
      `Vous avez été assigné à l'expédition ${shipment.reference}: ${shipment.origin} → ${shipment.destination}`
    );
    await notifyStatusUpdate(shipment.shipper_id, shipment.reference, 'ASSIGNED');

    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'ASSIGN_CARRIER', 'shipment', ?, ?)`,
      [req.user.id, shipment.id, `Transporteur ${carrier[0].name} assigné`]
    );

    res.json({ message: 'Transporteur assigné avec succès.' });
  } catch (err) { next(err); }
};

// PATCH /api/shipments/:id/status  (carrier updates status)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['PENDING','ASSIGNED','IN_PROGRESS','DELIVERED','CANCELLED'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Statut invalide.' });

    const [rows] = await db.execute('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });
    const shipment = rows[0];

    if (req.user.role === 'carrier' && shipment.carrier_id !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé.' });

    const updates = { status };
    if (status === 'DELIVERED') updates.delivered_at = new Date();

    await db.execute(
      'UPDATE shipments SET status = ?, delivered_at = COALESCE(?, delivered_at) WHERE id = ?',
      [status, updates.delivered_at || null, shipment.id]
    );

    // Notify shipper and all clients
    await notifyStatusUpdate(shipment.shipper_id, shipment.reference, status);

    // On delivery, auto-generate BON_LIVRAISON
    if (status === 'DELIVERED') {
      await db.execute(
        `INSERT INTO documents (shipment_id, type, uploaded_by) VALUES (?, 'BON_LIVRAISON', ?)`,
        [shipment.id, req.user.id]
      );
    }

    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'UPDATE_STATUS', 'shipment', ?, ?)`,
      [req.user.id, shipment.id, `Statut → ${status}`]
    );

    res.json({ message: `Statut mis à jour: ${status}` });
  } catch (err) { next(err); }
};
