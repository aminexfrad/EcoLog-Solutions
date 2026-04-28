const db = require('../config/db');
const { notifyMissionResponse, notifyStatusUpdate } = require('../services/notificationService');

// GET /api/missions  (carrier sees their missions = shipments assigned to them)
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.id, s.reference, s.origin, s.destination, s.weight_kg, s.status,
              s.deadline, s.created_at,
              u.name as shipper_name, u.company as shipper_company,
              cf.co2_kg, r.distance_km, r.vehicle_type
       FROM shipments s
       LEFT JOIN users u ON u.id = s.shipper_id
       LEFT JOIN carbon_footprints cf ON cf.shipment_id = s.id
       LEFT JOIN routes r ON r.shipment_id = s.id
       WHERE s.carrier_id = ? OR s.status = 'PENDING'
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// PATCH /api/missions/:id/accept  (carrier accepts a mission)
exports.accept = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Mission introuvable.' });
    const shipment = rows[0];

    await db.execute(
      'UPDATE shipments SET carrier_id = ?, status = ? WHERE id = ?',
      [req.user.id, 'ASSIGNED', shipment.id]
    );

    await notifyMissionResponse(shipment.shipper_id, shipment.reference, req.user.name, true);
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'ACCEPT_MISSION', 'shipment', ?, ?)`,
      [req.user.id, shipment.id, `Mission ${shipment.reference} acceptée`]
    );

    res.json({ message: `Mission ${shipment.reference} acceptée.` });
  } catch (err) { next(err); }
};

// PATCH /api/missions/:id/reject  (carrier rejects — keeps as PENDING for other carriers)
exports.reject = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Mission introuvable.' });
    const shipment = rows[0];

    await notifyMissionResponse(shipment.shipper_id, shipment.reference, req.user.name, false);
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'REJECT_MISSION', 'shipment', ?, ?)`,
      [req.user.id, shipment.id, `Mission ${shipment.reference} refusée`]
    );

    res.json({ message: `Mission ${shipment.reference} refusée.` });
  } catch (err) { next(err); }
};

// PATCH /api/missions/:id/status  (carrier updates: IN_PROGRESS, DELIVERED)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['IN_PROGRESS', 'DELIVERED'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Statut invalide pour une mission.' });

    const [rows] = await db.execute(
      'SELECT * FROM shipments WHERE id = ? AND carrier_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Mission introuvable ou non assignée.' });

    const shipment = rows[0];
    const updates = [status, null];
    if (status === 'DELIVERED') updates[1] = new Date();

    await db.execute(
      'UPDATE shipments SET status = ?, delivered_at = COALESCE(?, delivered_at) WHERE id = ?',
      [status, updates[1], shipment.id]
    );

    await notifyStatusUpdate(shipment.shipper_id, shipment.reference, status);

    if (status === 'DELIVERED') {
      await db.execute(
        `INSERT INTO documents (shipment_id, type, uploaded_by) VALUES (?, 'BON_LIVRAISON', ?)`,
        [shipment.id, req.user.id]
      );
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'DELIVER_MISSION', 'shipment', ?, ?)`,
        [req.user.id, shipment.id, `Livraison confirmée: ${shipment.reference}`]
      );
    } else {
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'UPDATE_STATUS', 'shipment', ?, ?)`,
        [req.user.id, shipment.id, `Statut → ${status}`]
      );
    }

    res.json({ message: `Statut mission mis à jour: ${status}` });
  } catch (err) { next(err); }
};
