const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minLength: [8, "Password should atleast contain 8 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

adminSchema.pre("save", async function(next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model("User", adminSchema);
module.exports = User;