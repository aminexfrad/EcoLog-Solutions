require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded proofs, certificates)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/docs', express.static(path.join(__dirname, 'uploads', 'docs')));
app.use('/certificates', express.static(path.join(__dirname, 'uploads', 'certificates')));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/shipments',     require('./routes/shipments'));
app.use('/api/missions',      require('./routes/missions'));
app.use('/api/carbon',        require('./routes/carbon'));
app.use('/api/compensations', require('./routes/compensations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tracking',      require('./routes/tracking'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/audit',         require('./routes/audit'));
app.use('/api/vehicles',      require('./routes/vehicles'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Error handler ────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌿 EcoLog Backend running on http://localhost:${PORT}`);
});
