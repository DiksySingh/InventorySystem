const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    servicePerson: {
      type: Schema.Types.ObjectId,
      ref: "ServicePerson",
      required: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    //    videoProof: {
    //         type: String,
    //         required: true,
    //    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    warehouse: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["OUT", "IN"],
      default: "OUT",
    },
    activity: {
      type: String,
      enum: ["In Progress", "Success"],
      default: null,
    },
  },
  { collection: "inTransactions" }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;