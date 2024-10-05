const {addItem, showItems} = require("../controllers/itemController");
const {userVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();

router.post("/newItem", userVerification(['inventory']), addItem);
router.get("/viewItems", userVerification(['admin']), showItems);


module.exports = router;