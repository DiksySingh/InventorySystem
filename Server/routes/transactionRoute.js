const {addTransaction, viewTransactions,getTransactionByID, updateTransaction, returnItems, deleteTransaction, updateTransactionStatus, getTechnicianTransactions} = require("../controllers/transactionController");
const {userVerification, technicianVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();
const upload = require("../middlewares/multerConfig");

//Inventory
router.post("/transactions/newTransaction", userVerification(['inventory']), upload.single("videoProof"), addTransaction);
router.patch("/transactions/update", userVerification(['inventory']), upload.single('videoProof'), updateTransaction);
router.delete("/transactions/delete", userVerification(['inventory']), deleteTransaction);
router.patch("/transactions/return", userVerification(['inventory']), returnItems);

//Admin and Inventory Both
router.get("/transactions/allTransactions", userVerification(['admin','inventory']), viewTransactions);
router.get("/transactions/view", userVerification(['admin','inventory']), getTransactionByID);

//Technician
router.get("/transactions/transactionDetails", technicianVerification, getTechnicianTransactions)
router.patch("/transactions/updateStatus", technicianVerification, updateTransactionStatus);



module.exports = router;