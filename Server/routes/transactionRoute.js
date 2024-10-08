const {addTransaction, viewTransactions,getTransactionByID, updateTransaction, returnItems, deleteTransaction, updateTransactionStatus, getTechnicianTransactions} = require("../controllers/transactionController");
const {userVerification, technicianVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();
const upload = require("../middlewares/multerConfig");

//Inventory
router.post("/transactions/newTransaction", upload.single("videoProof"), addTransaction);
router.get("/transactions/view", getTransactionByID);
router.patch("/transactions/update", upload.single('videoProof'), updateTransaction);
router.delete("/transactions/delete", deleteTransaction);
router.patch("/transactions/return", returnItems);

//Admin and Inventory Both
router.get("/transactions/allTransactions", userVerification(['admin','inventory']), viewTransactions);

//Technician
router.get("/transactions/transactionDetails", technicianVerification, getTechnicianTransactions)
router.patch("/transactions/updateStatus", technicianVerification, updateTransactionStatus);



module.exports = router;