const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Verify JWT token from Authorization header.
 * Attaches req.user = { id, email, role, name } on success.
 */
const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.execute(
      'SELECT id, email, role, name, is_active FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }
    if (!rows[0].is_active) {
      return res.status(403).json({ message: 'Compte désactivé. Contactez l\'administrateur.' });
    }
    req.user = {
      id: rows[0].id,
      email: rows[0].email,
      role: rows[0].role,
      name: rows[0].name,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

/**
 * Role-based access control.
 * Usage: requireRole('admin') or requireRole('admin','shipper')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié.' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Accès refusé. Rôle requis: ${roles.join(' ou ')}.` });
  }
  next();
};

module.exports = { verifyToken, requireRole };
