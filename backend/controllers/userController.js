const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users  (admin: all, others: themselves)
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, email, role, company, phone, is_active, green_score, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/users/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, company, phone, is_active, green_score, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/users/:id  (update own profile or admin updates any)
exports.update = async (req, res, next) => {
  try {
    const { name, company, phone, password } = req.body;
    const targetId = parseInt(req.params.id);

    // Only admin or the user themselves can update
    if (req.user.role !== 'admin' && req.user.id !== targetId)
      return res.status(403).json({ message: 'Accès refusé.' });

    const updates = [];
    const params = [];
    if (name)    { updates.push('name = ?');    params.push(name); }
    if (company) { updates.push('company = ?'); params.push(company); }
    if (phone)   { updates.push('phone = ?');   params.push(phone); }
    if (password && password.length >= 6) {
      updates.push('password_hash = ?');
      params.push(await bcrypt.hash(password, 10));
    }
    if (updates.length === 0)
      return res.status(400).json({ message: 'Aucun champ à mettre à jour.' });

    params.push(targetId);
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await db.execute(
      'SELECT id, name, email, role, company, phone, is_active, green_score FROM users WHERE id = ?',
      [targetId]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// PATCH /api/users/:id/toggle  (admin only: activate/deactivate)
exports.toggle = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const user = rows[0];
    await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [user.is_active ? 0 : 1, user.id]);
    res.json({ message: `Utilisateur ${user.is_active ? 'désactivé' : 'activé'}.`, is_active: !user.is_active });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id  (admin only)
exports.remove = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { next(err); }
};

// GET /api/users/carriers  (list available carriers for assignment)
exports.getCarriers = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.company, u.green_score,
              COUNT(v.id) as vehicle_count
       FROM users u
       LEFT JOIN vehicles v ON v.carrier_id = u.id AND v.is_active = 1
       WHERE u.role = 'carrier' AND u.is_active = 1
       GROUP BY u.id ORDER BY u.green_score DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};
