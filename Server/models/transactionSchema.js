const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
   technicianDetail: {
        type: Schema.Types.ObjectId,
        ref: 'Technician',
        required: true
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
   },
   status: {
        type: String,
        enum:['OUT', 'IN'],
        default: 'OUT'
   },
   returnedItems: {
        type: [{
            itemName: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            returnDate: {
                type: Date,
                default: Date.now,
            },
        }],
        default: []
    },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;