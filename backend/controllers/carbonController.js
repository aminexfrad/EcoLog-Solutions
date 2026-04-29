const db = require('../config/db');
const { calculateCO2, compareOptions, estimateDistance } = require('../services/carbonService');

// GET /api/carbon/:shipmentId
exports.getByShipment = async (req, res, next) => {
  try {
    const [shipmentRows] = await db.execute(
      'SELECT shipper_id, client_id, carrier_id FROM shipments WHERE id = ?',
      [req.params.shipmentId]
    );
    if (shipmentRows.length === 0) {
      return res.status(404).json({ message: 'Expédition introuvable.' });
    }
    const shipment = shipmentRows[0];
    const canAccess =
      req.user.role === 'admin' ||
      shipment.shipper_id === req.user.id ||
      shipment.carrier_id === req.user.id ||
      shipment.client_id === req.user.id;
    if (!canAccess) return res.status(403).json({ message: 'Accès refusé.' });

    const [rows] = await db.execute(
      `SELECT cf.*, s.origin, s.destination, s.weight_kg, r.vehicle_type
       FROM carbon_footprints cf
       JOIN shipments s ON s.id = cf.shipment_id
       LEFT JOIN routes r ON r.shipment_id = cf.shipment_id
       WHERE cf.shipment_id = ?`,
      [req.params.shipmentId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Bilan carbone introuvable.' });

    const cf = rows[0];
    const options = compareOptions(cf.distance_km, cf.weight_kg);
    res.json({ ...cf, options });
  } catch (err) { next(err); }
};

// POST /api/carbon/calculate  (on-the-fly estimate without saving)
exports.calculate = async (req, res, next) => {
  try {
    const { origin, destination, weight_kg, vehicle_type = 'diesel' } = req.body;
    if (!origin || !destination || !weight_kg)
      return res.status(400).json({ message: 'Origine, destination et poids requis.' });

    const distanceKm = estimateDistance(origin, destination);
    const result = calculateCO2(distanceKm, parseFloat(weight_kg), vehicle_type);
    const options = compareOptions(distanceKm, parseFloat(weight_kg));
    res.json({ ...result, options });
  } catch (err) { next(err); }
};

// GET /api/carbon/summary  (shipper: CO2 total + history)
exports.getSummary = async (req, res, next) => {
  try {
    let query = `
      SELECT cf.co2_kg, cf.calculated_at, s.reference, s.origin, s.destination, s.status
      FROM carbon_footprints cf
      JOIN shipments s ON s.id = cf.shipment_id`;
    const params = [];

    if (req.user.role === 'shipper') {
      query += ' WHERE s.shipper_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'carrier') {
      query += ' WHERE s.carrier_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY cf.calculated_at DESC';

    const [rows] = await db.execute(query, params);
    const total_co2 = rows.reduce((sum, r) => sum + parseFloat(r.co2_kg), 0);
    res.json({ total_co2: parseFloat(total_co2.toFixed(4)), entries: rows });
  } catch (err) { next(err); }
};
