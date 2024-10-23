const {
  returnItems,
  getPickupItems,
  pickupItemOfServicePerson
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
router.get("/all-pickup-items", userVerification(['warehouseAdmin']), getPickupItems);
router.get("/view-pickup-items", userVerification(['serviceperson']), pickupItemOfServicePerson);

module.exports = router;