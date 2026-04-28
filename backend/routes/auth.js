const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        verifyToken, ctrl.me);

module.exports = router;
