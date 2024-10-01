const {addItem, showItems} = require("../controllers/itemController");
const router = require("express").Router();

router.post("/add-item", addItem);
router.get("/get-items", showItems);

module.exports = router;