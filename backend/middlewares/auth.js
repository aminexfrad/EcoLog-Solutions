const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from Authorization header.
 * Attaches req.user = { id, email, role, name } on success.
 */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
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
