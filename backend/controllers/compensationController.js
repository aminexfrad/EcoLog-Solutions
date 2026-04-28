const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

const PROJECTS = [
  { name: 'Reforestation Amazonie', certification: 'Gold Standard',      price_per_ton: 18 },
  { name: 'Parc Solaire Sahel',     certification: 'VCS Verra',           price_per_ton: 14 },
  { name: 'Éoliennes Normandes',    certification: 'Label Bas-Carbone',   price_per_ton: 22 },
];

// GET /api/compensations/projects  (available carbon credit projects)
exports.getProjects = async (_req, res, next) => {
  try {
    res.json(PROJECTS);
  } catch (err) { next(err); }
};

// POST /api/compensations  (buy carbon credits)
exports.buy = async (req, res, next) => {
  try {
    const { tons, shipment_id, project_index = 0 } = req.body;
    if (!tons || isNaN(parseFloat(tons)) || parseFloat(tons) <= 0)
      return res.status(400).json({ message: 'Quantité de tonnes invalide.' });

    const project = PROJECTS[parseInt(project_index)] || PROJECTS[0];
    const tons_float = parseFloat(tons);
    const price_eur = parseFloat((tons_float * project.price_per_ton).toFixed(2));

    // Unique certificate number
    const cert_id = `CERT-${Date.now()}-${req.user.id}`;
    const certificate_url = `/certificates/${cert_id}.pdf`;

    const [result] = await db.execute(
      `INSERT INTO compensations
         (shipment_id, user_id, tons_compensated, price_eur, project_name, certification, certificate_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shipment_id || null, req.user.id, tons_float, price_eur, project.name, project.certification, certificate_url]
    );

    // Audit
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'BUY_CREDITS', 'compensation', ?, ?)`,
      [req.user.id, result.insertId, `Achat ${tons_float}t CO2 crédits — ${project.name} — ${price_eur}€`]
    );

    // Notify
    await createNotification(
      req.user.id, 'compensation_bought',
      `Achat de ${tons_float}t crédits carbone (${project.name}) — ${price_eur}€. Certificat disponible.`
    );

    // If linked to a shipment, add document
    if (shipment_id) {
      await db.execute(
        `INSERT INTO documents (shipment_id, type, file_url, uploaded_by) VALUES (?, 'CERTIFICAT_CO2', ?, ?)`,
        [shipment_id, certificate_url, req.user.id]
      );
    }

    const [rows] = await db.execute('SELECT * FROM compensations WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// GET /api/compensations  (user's compensation history)
exports.getAll = async (req, res, next) => {
  try {
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const where = req.user.role === 'admin' ? '' : 'WHERE c.user_id = ?';
    const [rows] = await db.execute(
      `SELECT c.*, u.name as buyer_name, s.reference as shipment_ref
       FROM compensations c
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN shipments s ON s.id = c.shipment_id
       ${where}
       ORDER BY c.created_at DESC`,
      params
    );
    const total_tons = rows.reduce((s, r) => s + parseFloat(r.tons_compensated), 0);
    const total_eur  = rows.reduce((s, r) => s + parseFloat(r.price_eur), 0);
    res.json({ total_tons: parseFloat(total_tons.toFixed(4)), total_eur: parseFloat(total_eur.toFixed(2)), entries: rows });
  } catch (err) { next(err); }
};

// GET /api/compensations/:id/certificate
exports.getCertificate = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM compensations WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Certificat introuvable.' });
    res.json({
      certificate_url: rows[0].certificate_url,
      project:         rows[0].project_name,
      certification:   rows[0].certification,
      tons:            rows[0].tons_compensated,
      price:           rows[0].price_eur,
      issued_at:       rows[0].created_at,
    });
  } catch (err) { next(err); }
};
