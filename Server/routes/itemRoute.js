const {addItem, showItems, updateItem, deleteItem} = require("../controllers/itemController");
const {userVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();

router.post("/newItem", userVerification(['inventory']), addItem);
router.get("/viewItems", userVerification(['admin']), showItems);
router.patch("/updateItem", updateItem);
router.delete("/deleteItem", deleteItem);

module.exports = router;