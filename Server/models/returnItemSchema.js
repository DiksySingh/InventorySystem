const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const returnItemSchema = new Schema(
  {
    itemsToReturn: [
      {
        itemName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    returnDate: {
      type: Date,
      default: Date.now,
    },
    returnedBy: {
      type: Schema.Types.ObjectId,
      ref: "ServicePerson",
      required: true,
    },
  },
  { collection: "inReturnItems" }
);

const ReturnItem = mongoose.model("ReturnItem", returnItemSchema);
module.exports = ReturnItem;