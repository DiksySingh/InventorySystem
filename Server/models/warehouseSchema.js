const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const warehouseSchemna = new Schema({
    warehouseName: {
        type: String,
        required: true
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
    ]
},{collection: "inWarehouses"});

const Warehouse = mongoose.model("Warehouse", warhouseSchema);
module.exports = Warehouse;