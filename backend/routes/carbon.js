const router = require('express').Router();
const ctrl = require('../controllers/carbonController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/summary',           ctrl.getSummary);
router.post('/calculate',        ctrl.calculate);
router.get('/:shipmentId',       ctrl.getByShipment);

module.exports = router;
