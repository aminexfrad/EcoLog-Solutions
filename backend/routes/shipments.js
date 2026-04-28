const router = require('express').Router();
const ctrl = require('../controllers/shipmentController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/',                requireRole('shipper','admin'), ctrl.create);
router.get('/',                 ctrl.getAll);
router.get('/:id',              ctrl.getById);
router.patch('/:id/assign',     requireRole('shipper','admin'), ctrl.assign);
router.patch('/:id/status',     requireRole('carrier','admin'), ctrl.updateStatus);

module.exports = router;
