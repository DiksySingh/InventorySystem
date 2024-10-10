const User = require("../models/userSchema");
const ServicePerson = require("../models/servicePersonSchema");
const { createSecretToken, createRefreshToken } = require('../util/secretToken'); 
require('dotenv').config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (allowedRoles) => {
    return async (req, res, next) => {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
        console.log(token);
        if (!token) {
            return res.status(400).json({ 
                status: false, 
                message: "No token provided" 
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_KEY, async (err, data) => {
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
            } else {
                try {
                    console.log(data);
                    let user;

                    // Fetch user or serviceperson based on the role
                    if (data.role === 'serviceperson') {
                        user = await ServicePerson.findById(data.id);
                    } else {
                        user = await User.findById(data.id);
                    }

                    if (!user) {
                        return res.status(404).json({ 
                            status: false, 
                            message: `${data.role === 'serviceperson' ? 'ServicePerson' : 'User'} Not Found` 
                        });
                    }

                    // Check if the user's role matches any of the allowed roles
                    if (Array.isArray(allowedRoles) && allowedRoles.includes(data.role)) {
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

module.exports.refreshToken = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken || req.headers['x-refresh-token'];

        if (!oldRefreshToken) {
            return res.status(403).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        // Verify the old refresh token
        jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_KEY, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid refresh token"
                });
            }

            const { id } = decoded;

            // Match the refresh token in either User or Technician schema
            let user;
            user = await User.findById(id);
            if (!user) {
                user = await ServicePerson.findById(id);
                if(!user){
                    return res.status(400).json({
                        success: false,
                        message: "User or ServicePerson Not Found"
                    });
                }
            }

            // Check if the user or serviceperson exists and if the refresh token matches
            if (!user || user.refreshToken !== oldRefreshToken) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid refresh token or user not found"
                });
            }

            // Generate new tokens
            const newAccessToken = createSecretToken(user._id, role);
            const newRefreshToken = createRefreshToken(user._id);

            // Save the new refresh token to the user's schema
            user.refreshToken = newRefreshToken;
            await user.save();

            // Send the new tokens in response
            res.status(200)
                .cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None"
                })
                .cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None"
                })
                .json({
                    success: true,
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



// module.exports.userVerification = (roles) => {
//     return async (req, res, next) => {
//         const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
//         console.log(token);
//         if(!token){
//             return res.status(400).json({status: false, message: "No token provided"});
//         }
//         jwt.verify(token, process.env.TOKEN_KEY, async(err, data) =>{
//             if(err){
//                 if (err.name === 'TokenExpiredError') {
//                     return res.status(401).json({ 
//                         status: false, 
//                         message: "Token Expired" 
//                     });
//                 }
//                 return res.status(400).json({
//                     status: false, 
//                     message: "Invalid Token"
//                 });
//             }else{
//                 try {
//                     console.log(data);
//                     const user = await User.findById(data.id);
//                     if (!user) {
//                         return res.status(404).json({ 
//                             status: false, 
//                             message: "User Not Found" 
//                         });
//                     }

//                     // Check if the user's role matches any of the allowed roles
//                     if (Array.isArray(roles) && roles.includes(data.role)) {
//                         req.user = user;
//                         console.log(req.user); 
//                         next(); 
//                     } else {
//                         return res.status(403).json({ 
//                             status: false, 
//                             message: "Access Denied" 
//                         });
//                     }
//                 } catch (error) {
//                     return res.status(500).json({ 
//                         status: false, 
//                         message: "Internal Server Error" 
//                     });
//                 }
//             }
//         });
//     };
// };

// module.exports.technicianVerification = (req, res, next) => {
//     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
//     if (!token) {
//         return res.status(400).json({ 
//             status: false, 
//             message: "No token provided" 
//         });
//     }

//     jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
//         if (err) {
//             if (err.name === 'TokenExpiredError') {
//                 return res.status(401).json({ 
//                     status: false, 
//                     message: "Token Expired" 
//                 });
//             }
//             return res.status(400).json({ 
//                 status: false, 
//                 message: "Invalid Token" 
//             });
//         }

//         try {
//             const technician = await Technician.findById(data.id);
            
//             if (!technician) {
//                 return res.status(404).json({ 
//                     status: false, 
//                     message: "Technician not found" 
//                 });
//             }

//             req.technician = technician;  
//             next(); 

//         } catch (error) {
//             return res.status(500).json({ 
//                 status: false, 
//                 message: "Internal Server Error" 
//             });
//         }
//     });
// };

