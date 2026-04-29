const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth");
const ctrl = require("../controllers/aiController");

router.use(verifyToken);
router.post("/chat", ctrl.chat);

module.exports = router;
