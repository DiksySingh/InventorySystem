require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.createSecretToken = (id, role) => {
    return jwt.sign({id, role}, process.env.TOKEN_KEY, {
        expiresIn: 3 * 24 * 60 * 60
    });
};

module.exports.createTechnicianToken = (technicianId) => {
    return jwt.sign({ id: technicianId }, process.env.TOKEN_KEY, {
        expiresIn: 3 * 24 * 60 * 60
    });
};