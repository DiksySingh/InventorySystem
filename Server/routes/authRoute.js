const {userSignup, Login, technicianLogin, Logout, servicePersonSignup } = require("../controllers/authController");
const {userVerification, refreshToken} = require("../middlewares/authMiddlewares");
const router = require("express").Router();

router.post("/user-signup",userSignup);
router.post("/service-person-signup", servicePersonSignup)
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/refresh-token", refreshToken);
// router.post("/technician-login", technicianLogin);

module.exports = router;