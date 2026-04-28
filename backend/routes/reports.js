const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/dashboard', requireRole('admin'), ctrl.dashboard);
router.get('/carbon',    ctrl.carbon);
router.get('/esg',       requireRole('shipper','admin'), ctrl.esg);

module.exports = router;
