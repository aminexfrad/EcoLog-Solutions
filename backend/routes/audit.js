const router = require('express').Router();
const ctrl = require('../controllers/auditController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken, requireRole('admin'));

router.get('/logs', ctrl.getLogs);

module.exports = router;
