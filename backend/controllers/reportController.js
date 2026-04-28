const db = require('../config/db');

// GET /api/reports/dashboard  (admin KPIs)
exports.dashboard = async (req, res, next) => {
  try {
    const [[users]]     = await db.execute('SELECT COUNT(*) as cnt FROM users WHERE is_active = 1');
    const [[carriers]]  = await db.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'carrier' AND is_active = 1");
    const [[shipments]] = await db.execute('SELECT COUNT(*) as cnt FROM shipments');
    const [[co2]]       = await db.execute('SELECT SUM(co2_kg) as total FROM carbon_footprints');
    const [[credits]]   = await db.execute('SELECT SUM(tons_compensated) as total, SUM(price_eur) as eur FROM compensations');

    res.json({
      active_users:       users.cnt,
      certified_carriers: carriers.cnt,
      total_shipments:    shipments.cnt,
      total_co2_kg:       parseFloat((co2.total || 0).toFixed(2)),
      total_compensated_tons: parseFloat((credits.total || 0).toFixed(2)),
      total_credits_eur:  parseFloat((credits.eur || 0).toFixed(2)),
    });
  } catch (err) { next(err); }
};

// GET /api/reports/carbon  (carbon report for logged-in user's scope)
exports.carbon = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const params = isAdmin ? [] : [req.user.id];
    const where  = isAdmin ? '' : 'WHERE s.shipper_id = ?';
    const [rows] = await db.execute(
      `SELECT cf.co2_kg, cf.calculated_at, s.reference, s.origin, s.destination, r.vehicle_type
       FROM carbon_footprints cf
       JOIN shipments s ON s.id = cf.shipment_id
       LEFT JOIN routes r ON r.shipment_id = cf.shipment_id
       ${where} ORDER BY cf.calculated_at DESC`,
      params
    );
    const total = rows.reduce((s, r) => s + parseFloat(r.co2_kg), 0);
    res.json({ total_co2_kg: parseFloat(total.toFixed(4)), entries: rows });
  } catch (err) { next(err); }
};

// GET /api/reports/esg  (ESG report)
exports.esg = async (req, res, next) => {
  try {
    const [[shipments]] = await db.execute('SELECT COUNT(*) as cnt FROM shipments WHERE shipper_id = ?', [req.user.id]);
    const [[co2]]       = await db.execute(
      'SELECT SUM(cf.co2_kg) as total FROM carbon_footprints cf JOIN shipments s ON s.id = cf.shipment_id WHERE s.shipper_id = ?',
      [req.user.id]
    );
    const [[comp]] = await db.execute(
      'SELECT SUM(tons_compensated) as tons, SUM(price_eur) as eur FROM compensations WHERE user_id = ?',
      [req.user.id]
    );
    const total_co2   = parseFloat((co2.total || 0).toFixed(4));
    const compensated = parseFloat((comp.tons || 0).toFixed(4));
    const score = Math.min(100, Math.round(50 + (compensated / Math.max(total_co2, 0.01)) * 50));

    res.json({
      esg_score:          score,
      total_shipments:    shipments.cnt,
      total_co2_kg:       total_co2,
      compensated_tons:   compensated,
      compensation_pct:   total_co2 > 0 ? parseFloat(((compensated / total_co2) * 100).toFixed(1)) : 0,
      credit_spent_eur:   parseFloat((comp.eur || 0).toFixed(2)),
      ghg_compliance:     'GHG Protocol Scope 1-3',
      methodology:        'ADEME / GHG Protocol',
    });
  } catch (err) { next(err); }
};
