const {addTransaction, viewTransactions,getTransactionByID, updateTransaction, returnItems, deleteTransaction, updateTransactionStatus} = require("../controllers/transactionController");
const {userVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();
const upload = require("../middlewares/multerConfig");

router.post("/transactions/newTransaction", upload.single("videoProof"), addTransaction);
router.get("/transactions/allTransactions", viewTransactions);
router.get("/transactions/view", getTransactionByID);
router.patch("/transactions/update", upload.single('videoProof'), updateTransaction);
router.delete("/transactions/delete", deleteTransaction);
router.patch("/transactions/return", returnItems);
router.patch("/transactions/updateStatus",updateTransactionStatus);

module.exports = router;