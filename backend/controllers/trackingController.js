const db = require('../config/db');

// POST /api/tracking/:shipmentId  (carrier sends GPS update)
exports.update = async (req, res, next) => {
  try {
    const { latitude, longitude, location_label, progress_pct } = req.body;
    const { shipmentId } = req.params;

    const [rows] = await db.execute('SELECT * FROM shipments WHERE id = ?', [shipmentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });

    if (req.user.role === 'carrier' && rows[0].carrier_id !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé.' });

    await db.execute(
      'INSERT INTO gps_updates (shipment_id, latitude, longitude, location_label, progress_pct) VALUES (?, ?, ?, ?, ?)',
      [shipmentId, latitude, longitude, location_label || null, progress_pct || 0]
    );

    res.json({ message: 'Position GPS enregistrée.' });
  } catch (err) { next(err); }
};

// GET /api/tracking/:shipmentId  (latest GPS position + progress)
exports.getLatest = async (req, res, next) => {
  try {
    const { shipmentId } = req.params;
    const [shipment] = await db.execute(
      'SELECT id, shipper_id, carrier_id, status, deadline, reference FROM shipments WHERE id = ?',
      [shipmentId]
    );
    if (shipment.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });
    const s = shipment[0];
    const canAccess =
      req.user.role === 'admin' ||
      s.shipper_id === req.user.id ||
      s.carrier_id === req.user.id;
    if (!canAccess) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const [latest] = await db.execute(
      `SELECT * FROM gps_updates WHERE shipment_id = ? ORDER BY recorded_at DESC LIMIT 1`,
      [shipmentId]
    );
    const [history] = await db.execute(
      `SELECT shipment_id, latitude, longitude, location_label, progress_pct, recorded_at
       FROM gps_updates WHERE shipment_id = ? ORDER BY recorded_at ASC`,
      [shipmentId]
    );

    res.json({
      current: latest[0] || null,
      history,
      status: s.status,
      reference: s.reference,
      eta: s.deadline,
    });
  } catch (err) { next(err); }
};

// POST /api/tracking/:shipmentId/simulate  (advance GPS for demo purposes)
exports.simulate = async (req, res, next) => {
  try {
    const { shipmentId } = req.params;
    const [shipRows] = await db.execute('SELECT shipper_id, carrier_id FROM shipments WHERE id = ?', [shipmentId]);
    if (shipRows.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });
    if (req.user.role === 'carrier' && shipRows[0].carrier_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    const [rows] = await db.execute(
      `SELECT r.origin_lat, r.origin_lng, r.dest_lat, r.dest_lng,
              g.progress_pct, g.latitude, g.longitude
       FROM routes r
       LEFT JOIN gps_updates g ON g.shipment_id = r.shipment_id
       WHERE r.shipment_id = ?
       ORDER BY g.recorded_at DESC LIMIT 1`,
      [shipmentId]
    );

    if (rows.length === 0 || !rows[0].origin_lat)
      return res.status(400).json({ message: 'Pas de route configurée pour cette expédition.' });

    const r = rows[0];
    const progress = Math.min(100, (r.progress_pct || 0) + 10);
    const ratio = progress / 100;
    const lat = parseFloat(r.origin_lat) + (parseFloat(r.dest_lat) - parseFloat(r.origin_lat)) * ratio;
    const lng = parseFloat(r.origin_lng) + (parseFloat(r.dest_lng) - parseFloat(r.origin_lng)) * ratio;

    await db.execute(
      'INSERT INTO gps_updates (shipment_id, latitude, longitude, location_label, progress_pct) VALUES (?, ?, ?, ?, ?)',
      [shipmentId, lat.toFixed(7), lng.toFixed(7), `Position simulée (${progress}%)`, progress]
    );

    res.json({ latitude: lat, longitude: lng, progress_pct: progress });
  } catch (err) { next(err); }
};
