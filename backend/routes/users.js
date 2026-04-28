const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/carriers',  ctrl.getCarriers);
router.get('/',          requireRole('admin'), ctrl.getAll);
router.get('/:id',       ctrl.getById);
router.put('/:id',       ctrl.update);
router.patch('/:id/toggle', requireRole('admin'), ctrl.toggle);
router.delete('/:id',    requireRole('admin'), ctrl.remove);

module.exports = router;
