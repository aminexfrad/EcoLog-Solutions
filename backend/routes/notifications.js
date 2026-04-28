const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/',              ctrl.getAll);
router.patch('/read-all',    ctrl.markAllRead);
router.patch('/:id/read',    ctrl.markRead);

module.exports = router;
