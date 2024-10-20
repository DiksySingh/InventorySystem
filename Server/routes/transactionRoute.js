const {addTransaction, viewTransactions,getTransactionByID, updateTransaction, returnItems, deleteTransaction, updateTransactionStatus, getServicePersonTransactions, servicePersonDashboard} = require("../controllers/transactionController");
const {userVerification} = require("../middlewares/authMiddlewares");
const router = require("express").Router();
//const upload = require("../middlewares/multerConfig");

//Inventory
//upload.single("videoProof")
router.post("/transactions/newTransaction", userVerification(['warehouseAdmin']), addTransaction); 
router.patch("/transactions/update", userVerification(['warehouseAdmin']), updateTransaction);
router.delete("/transactions/delete", userVerification(['warehouseAdmin']), deleteTransaction);
router.patch("/transactions/returnItems", userVerification(['warehouseAdmin']), returnItems);

//Admin and Inventory Both
router.get("/transactions/allTransactions", userVerification(['admin','warehouseAdmin']), viewTransactions);
router.get("/transactions/view", userVerification(['admin','warehouseAdmin']), getTransactionByID);

//Technician
router.get("/dashboard", userVerification(['serviceperson']), servicePersonDashboard);
router.get("/transactions/transactionDetails", userVerification(['serviceperson']), getServicePersonTransactions);
router.patch("/transactions/updateStatus", userVerification(['serviceperson']), updateTransactionStatus);

module.exports = router;