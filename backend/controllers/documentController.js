const db = require('../config/db');

// GET /api/documents/:shipmentId
exports.getByShipment = async (req, res, next) => {
  try {
    const [shipmentRows] = await db.execute(
      'SELECT shipper_id, client_id, carrier_id FROM shipments WHERE id = ?',
      [req.params.shipmentId]
    );
    if (shipmentRows.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });
    const shipment = shipmentRows[0];
    const canAccess =
      req.user.role === 'admin' ||
      shipment.shipper_id === req.user.id ||
      shipment.carrier_id === req.user.id ||
      shipment.client_id === req.user.id;
    if (!canAccess) return res.status(403).json({ message: 'Accès refusé.' });

    const [rows] = await db.execute(
      `SELECT d.*, u.name as uploaded_by_name
       FROM documents d
       JOIN users u ON u.id = d.uploaded_by
       WHERE d.shipment_id = ? ORDER BY d.created_at DESC`,
      [req.params.shipmentId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/documents
exports.getAll = async (req, res, next) => {
  try {
    let query = `
      SELECT d.*, u.name as uploaded_by_name, s.reference
      FROM documents d
      JOIN shipments s ON s.id = d.shipment_id
      JOIN users u ON u.id = d.uploaded_by`;
    const params = [];
    if (req.user.role === 'shipper') { query += ' WHERE s.shipper_id = ?'; params.push(req.user.id); }
    else if (req.user.role === 'client') { query += ' WHERE s.client_id = ?'; params.push(req.user.id); }
    else if (req.user.role === 'carrier') { query += ' WHERE s.carrier_id = ?'; params.push(req.user.id); }
    query += ' ORDER BY d.created_at DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/documents
exports.create = async (req, res, next) => {
  try {
    const { shipment_id, type } = req.body;
    const [shipmentRows] = await db.execute(
      'SELECT shipper_id, client_id, carrier_id FROM shipments WHERE id = ?',
      [shipment_id]
    );
    if (shipmentRows.length === 0) return res.status(404).json({ message: 'Expédition introuvable.' });
    const shipment = shipmentRows[0];
    const canUpload =
      req.user.role === 'admin' ||
      shipment.shipper_id === req.user.id ||
      shipment.carrier_id === req.user.id ||
      shipment.client_id === req.user.id;
    if (!canUpload) return res.status(403).json({ message: 'Accès refusé.' });

    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await db.execute(
      'INSERT INTO documents (shipment_id, type, file_url, uploaded_by) VALUES (?, ?, ?, ?)',
      [shipment_id, type, file_url, req.user.id]
    );
    const [rows] = await db.execute('SELECT * FROM documents WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};
