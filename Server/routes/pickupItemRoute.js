const {
  returnItems,
  getPickupItems,
  pickupItemOfServicePerson,
  servicePersonDashboard,
  updateOrderStatus
} = require("../controllers/pickupItemController");
const { userVerification } = require("../middlewares/authMiddlewares");
const router = require("express").Router();
// const {
//   upload,
//   resizeImageMiddleware,
// } = require("../middlewares/multerConfig");


router.get(
  "/dashboard",
  userVerification(["serviceperson"]),
  servicePersonDashboard
);

router.post(
  "/create-pickup-items",
  userVerification(["serviceperson"]),
  returnItems
);

router.get("/all-pickup-items",userVerification(["warehouseAdmin"]), getPickupItems);

router.get(
  "/view-pickup-items",
  userVerification(["serviceperson"]),
  pickupItemOfServicePerson
);

router.put(
  "/update-status",
  userVerification(["warehouseAdmin"]),
  updateOrderStatus
);

module.exports = router;
