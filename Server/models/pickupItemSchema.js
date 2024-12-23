const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pickupItemSchema = new Schema(
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
      default: null
    },
    warehouse: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true
    },
    remark: {
      type: String,
    },
    status: {
      type: Boolean,
      default: null
    },
    incoming: {
      type: Boolean,
      default: null
    },
    pickupDate: {
      type: Date,
    },
    arrivedDate: {
      type: Date
    }
  },
  { collection: "inPickupItems" }
);

const PickupItem = mongoose.model("InPickupItem", pickupItemSchema);
module.exports = PickupItem;
