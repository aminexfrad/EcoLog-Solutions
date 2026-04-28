const router = require('express').Router();
const ctrl = require('../controllers/vehicleController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/',      requireRole('carrier','admin'), ctrl.getAll);
router.post('/',     requireRole('carrier'), ctrl.create);
router.delete('/:id',requireRole('carrier'), ctrl.remove);

module.exports = router;
