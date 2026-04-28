const router = require('express').Router();
const ctrl = require('../controllers/compensationController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/projects',          ctrl.getProjects);
router.get('/',                  ctrl.getAll);
router.post('/',                 ctrl.buy);
router.get('/:id/certificate',   ctrl.getCertificate);

module.exports = router;
