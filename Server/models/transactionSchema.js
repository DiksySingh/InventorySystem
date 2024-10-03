const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
   items: [{
        itemName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
   }],
   videoProof: {
        type: String,
        required: true,
   },
   transactionDate: {
       type: Date,
       default: Date.now 
   },
   warehouse: {
       type: String,
       required: true
   }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;