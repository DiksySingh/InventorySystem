const {userSignup, Login, technicianLogin, Logout } = require("../controllers/authController");
const {userVerification, technicianVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();

router.post("/signup",userSignup);
router.post("/login", Login);
router.post("/technician-login", technicianLogin);
router.post("/logout", Logout);

module.exports = router;