const db = require('../config/db');

// GET /api/audit/logs  (admin only)
exports.getLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await db.execute(
      `SELECT al.*, u.name as user_name, u.role as user_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC LIMIT ${limit}`
    );
    res.json(rows);
  } catch (err) { next(err); }
};
