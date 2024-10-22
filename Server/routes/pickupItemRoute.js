const {
  returnItems,
  getPickupItems
} = require("../controllers/pickupItemController");
const { userVerification } = require("../middlewares/authMiddlewares");
const {upload, resizeImageMiddleware} = require("../middlewares/multerConfig");
const router = require("express").Router();
// 
router.post(
  "/create-pickup-items",
  upload.single("image"),
  userVerification(["serviceperson"]),
  returnItems
);
router.get("/view-pickup-items", userVerification(['warehouseAdmin']), getPickupItems);

module.exports = router;