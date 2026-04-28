const router = require('express').Router();
const ctrl = require('../controllers/trackingController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/:shipmentId',           ctrl.getLatest);
router.post('/:shipmentId',          requireRole('carrier','admin'), ctrl.update);
router.post('/:shipmentId/simulate', ctrl.simulate);

module.exports = router;
