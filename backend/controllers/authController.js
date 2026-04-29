const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'client', company, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Nom, email et mot de passe sont requis.' });

    const allowedRoles = ['shipper', 'carrier', 'client'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide pour inscription publique.' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email déjà utilisé.' });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role, company, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, role, company || null, phone || null]
    );

    const userId = result.insertId;
    await createNotification(userId, 'system', `Bienvenue sur EcoLog Solutions, ${name} !`);

    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const token = signToken(rows[0]);
    res.status(201).json({ token, user: sanitize(rows[0]) });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis.' });

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    const user = rows[0];
    if (!user.is_active)
      return res.status(403).json({ message: 'Compte désactivé. Contactez l\'administrateur.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(sanitize(rows[0]));
  } catch (err) { next(err); }
};

function sanitize(user) {
  const { password_hash, ...safe } = user;
  return safe;
}
