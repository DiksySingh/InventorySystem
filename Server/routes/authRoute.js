const {Signup, Login, technicianLogin} = require("../controllers/authController");
const router = require("express").Router();

router.post("/signup",Signup);
router.post("/login", Login);
router.post("/technician-login", technicianLogin);

module.exports = router;