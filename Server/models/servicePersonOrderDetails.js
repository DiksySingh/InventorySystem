const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const servicePersonOrderDetails = new Schema(
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
        },
        quantity: {
          type: Number,
        },
      },
    ],
  },
  { collection: "inTotalOrderDetails" }
);

const TotalOrderDetails = mongoose.model(
  "TotalOrderDetails",
  servicePersonOrderDetails
);
module.exports = TotalOrderDetails;
