const router = require('express').Router();
const ctrl = require('../controllers/missionController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/',                requireRole('carrier','admin'), ctrl.getAll);
router.patch('/:id/accept',    requireRole('carrier'), ctrl.accept);
router.patch('/:id/reject',    requireRole('carrier'), ctrl.reject);
router.patch('/:id/status',    requireRole('carrier','admin'), ctrl.updateStatus);

module.exports = router;
