const {addTransaction, viewTransactions} = require("../controllers/transactionController");
const {userVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();
const upload = require("../middlewares/multerConfig");

router.post("/new-transaction", upload.single("videoProof"), addTransaction);
router.get("/show-transactions", viewTransactions);

module.exports = router;