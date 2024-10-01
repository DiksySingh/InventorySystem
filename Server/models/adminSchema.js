const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minLength: [8, "Password should atleast contain 8 characters"]
    },
    role: {
        type: String,
        default: 'admin',
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

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;