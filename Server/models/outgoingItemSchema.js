const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const outgoingItemSchema = new Schema(
  {
    servicePerson: {
      type: Schema.Types.ObjectId,
      ref: "ServicePerson",
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    farmerContact: {
      type: Number,
      required: true,
    },
    farmerVillage: {
      type: String,
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
    image: {
      type: String,
      default: null,
    },
    warehouse: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
    pickupDate: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "inOutgoingItems" }
);

const OutgoingItem = mongoose.model("OutgoingItem", outgoingItemSchema);
module.exports = OutgoingItem;