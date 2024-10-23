const {
  addItem,
  showItems,
  updateItem,
  deleteItem,
  incomingItems,
  incomingItemDetails
} = require("../controllers/itemController");
const { userVerification } = require("../middlewares/authMiddlewares");
const router = require("express").Router();

//Admin Accessible Route
router.get(
  "/viewItems",
  userVerification(["admin", "warehouseAdmin"]),
  showItems
);

//Inventory Accessible Route
router.post("/newItem", userVerification(["warehouseAdmin"]), addItem);
router.post("/updateItem", userVerification(["warehouseAdmin"]), incomingItems);
router.get(
  "/order-details",
  userVerification(["warehouseAdmin"]),
  incomingItemDetails
);
router.delete("/deleteItem", userVerification(["warehouseAdmin"]), deleteItem);

module.exports = router;
