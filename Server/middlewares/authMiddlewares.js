const User = require("../models/userSchema");
const Technician = require("../models/servicePersonSchema");
require('dotenv').config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (roles) => {
    return async (req, res, next) => {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        console.log(token);
        if(!token){
            return res.status(400).json({status: false, message: "No token provided"});
        }
        jwt.verify(token, process.env.TOKEN_KEY, async(err, data) =>{
            if(err){
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        status: false, 
                        message: "Token Expired" 
                    });
                }
                return res.status(400).json({
                    status: false, 
                    message: "Invalid Token"
                });
            }else{
                try {
                    console.log(data);
                    const user = await User.findById(data.id);
                    if (!user) {
                        return res.status(404).json({ 
                            status: false, 
                            message: "User Not Found" 
                        });
                    }

                    // Check if the user's role matches any of the allowed roles
                    if (Array.isArray(roles) && roles.includes(data.role)) {
                        req.user = user;
                        console.log(req.user); 
                        next(); 
                    } else {
                        return res.status(403).json({ 
                            status: false, 
                            message: "Access Denied" 
                        });
                    }
                } catch (error) {
                    return res.status(500).json({ 
                        status: false, 
                        message: "Internal Server Error" 
                    });
                }
            }
        });
    };
};

module.exports.technicianVerification = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(400).json({ 
            status: false, 
            message: "No token provided" 
        });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    status: false, 
                    message: "Token Expired" 
                });
            }
            return res.status(400).json({ 
                status: false, 
                message: "Invalid Token" 
            });
        }

        try {
            const technician = await Technician.findById(data.id);
            
            if (!technician) {
                return res.status(404).json({ 
                    status: false, 
                    message: "Technician not found" 
                });
            }

            req.technician = technician;  
            next(); 

        } catch (error) {
            return res.status(500).json({ 
                status: false, 
                message: "Internal Server Error" 
            });
        }
    });
};