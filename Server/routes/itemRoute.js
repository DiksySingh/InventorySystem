const {addItem, showItems, updateItem, deleteItem} = require("../controllers/itemController");
const {userVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();

//Admin Accessible Route
router.get("/viewItems", userVerification(['admin']), showItems);

//Inventory Accessible Route
router.post("/newItem", userVerification(['warehouseAdmin']), addItem);
router.patch("/updateItem", userVerification(['warehouseAdmin']), updateItem);
router.delete("/deleteItem", userVerification(['warehouseAdmin']), deleteItem);

module.exports = router;