const db = require('../config/db');

// GET /api/vehicles  (carrier sees own, admin sees all)
exports.getAll = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const params = isAdmin ? [] : [req.user.id];
    const where  = isAdmin ? '' : 'WHERE v.carrier_id = ?';
    const [rows] = await db.execute(
      `SELECT v.*, u.name as carrier_name FROM vehicles v JOIN users u ON u.id = v.carrier_id ${where} ORDER BY v.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/vehicles  (carrier adds a vehicle)
exports.create = async (req, res, next) => {
  try {
    const { name, energy_type, capacity_tons, emission_factor } = req.body;
    const [result] = await db.execute(
      'INSERT INTO vehicles (carrier_id, name, energy_type, capacity_tons, emission_factor) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, energy_type, capacity_tons, emission_factor]
    );
    const [rows] = await db.execute('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/vehicles/:id
exports.remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM vehicles WHERE id = ? AND carrier_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Véhicule supprimé.' });
  } catch (err) { next(err); }
};
