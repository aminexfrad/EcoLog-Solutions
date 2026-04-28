const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const ctrl   = require('../controllers/documentController');
const { verifyToken } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(verifyToken);

router.get('/shipment/:shipmentId', ctrl.getByShipment);
router.get('/',                     ctrl.getAll);
router.post('/', upload.single('file'), ctrl.create);

module.exports = router;
