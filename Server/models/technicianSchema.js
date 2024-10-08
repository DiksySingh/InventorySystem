const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const technicianSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                // Regular expression to check for exactly 10 digits
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    }
});

const Technician = mongoose.model("Technician", technicianSchema);
module.exports = Technician;