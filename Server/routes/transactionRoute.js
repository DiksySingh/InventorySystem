const {addTransaction, viewTransactions,getTransactionByID, updateTransaction, returnItems, deleteTransaction, updateTransactionStatus, getServicePersonTransactions} = require("../controllers/transactionController");
const {userVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();
const upload = require("../middlewares/multerConfig");

//Inventory
router.post("/transactions/newTransaction", userVerification(['warehouseAdmin']), upload.single("videoProof"), addTransaction);
router.patch("/transactions/update", userVerification(['warehouseAdmin']), upload.single('videoProof'), updateTransaction);
router.delete("/transactions/delete", userVerification(['warehouseAdmin']), deleteTransaction);
router.patch("/transactions/return", userVerification(['warehouseAdmin']), returnItems);

//Admin and Inventory Both
router.get("/transactions/allTransactions", userVerification(['admin','warehouseAdmin']), viewTransactions);
router.get("/transactions/view", userVerification(['admin','warehouseAdmin']), getTransactionByID);

//Technician
router.get("/transactions/transactionDetails", userVerification(['serviceperson']), getServicePersonTransactions);
router.patch("/transactions/updateStatus", userVerification(['serviceperson']), updateTransactionStatus);



module.exports = router;