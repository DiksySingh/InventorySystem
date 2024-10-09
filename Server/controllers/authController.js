const User = require("../models/userSchema");
const ServicePerson = require("../models/servicePersonSchema");
const {createTechnicianToken} = require("../util/secretToken");
const {createSecretToken, createRefreshToken} = require("../util/secretToken");
const bcrypt = require("bcrypt");


//Admin and Inventory SignUp Controller
module.exports.userSignup = async(req, res) => {
    const {email, password, createdAt} = req.body;

    if(!email){
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    if(!password){
        return res.status(400).json({
            success: false,
            message: "Password is required"
        });
    }

    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            res.status(400). json({
                success: false,
                message: "User already exists"
            });
        }

        const newUser = new User({email, password, createdAt});
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        }); 
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports.servicePersonSignup = async(req, res) => {
    const {name, email, contact, password, createdAt} = req.body;
    if(!name || !email || !contact || !password){
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    } 

    try{
        const existingServicePerson = await ServicePerson.findOne({ $or: [{ email }, { contact }] });
        if(existingServicePerson){
            res.status(400). json({
                success: false,
                message: "Technician already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newServicePrson = new ServicePerson({
            name, 
            email, 
            contact, 
            password: hashedPassword,
            createdAt, 
            refreshToken: null
        });
        await newServicePrson.save();
        res.status(200).json({
            success: true,
            message: "Technician registered successfully",
            data: {
                name: newServicePrson.name,
                email: newServicePrson.email,
                contact: newServicePrson.contact,
                createdAt: newServicePrson.createdAt
            }
        }); 
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}


//Admin and Inventory Login Controller

// module.exports.Login = async(req, res) => {
//     try{
//         const {email, password} = req.body;
//         const options = {
//             withCredentials: true,
//             httpOnly: true,
//             secure: true
//         }
//         if(!email || !password){
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required",
//             });
//         }

//         const user = await User.findOne({email});
//         console.log(user);
//         if(!user){
//             return res.status(401).json({
//                 success: false,               
//                 message: "Incorrect password or email",
                
//             });
//         }

//         const auth = await bcrypt.compare(password, user.password);
//         if(!auth){
//             return res.status(401).json({
//                 success: false,
//                 message: "Incorrect password or email"
//             });
//         }
//         const role = roles[email];
//         console.log(role);
//         const accessToken = createSecretToken(user._id, role);
//         const refreshToken = createRefreshToken(user._id);

//         await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken });
//         // res.cookie("accessToken", accessToken, {
//         //     withCredentials: true,
//         //     httpOnly: true, 
//         //     secure: true
//         // });

//         res.status(200)
//         .cookie('accessToken', accessToken, options)
//         .cookie('refreshToken', refreshToken, options)
//         .json({
//             success: true,
//             message: `Logged in successfully`,   
//             id: user._id,
//             email: user.email,
//             accessToken,
//             refreshToken
//         });
//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// }

const roles = {
    "admin@example.com": "admin",
    "warehouseadmin@example.com": "warehouseAdmin",
};

module.exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const options = {
            httpOnly: true,
            secure: true,
        };

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if user exists in User schema
        let user = await User.findOne({ email });
        if (!user) {
            // If user not found, check Technician schema
            user = await ServicePerson.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Incorrect email or password",
                });
            }
        }

        // Compare password
        const auth = await bcrypt.compare(password, user.password);
        if (!auth) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password",
            });
        }
        const role = roles[email] || 'serviceperson'; 
        const accessToken = createSecretToken(user._id, role);
        const refreshToken = createRefreshToken(user._id);

        // Update the refreshToken in the database
        if (user.constructor.modelName === 'User') {
            await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken });
        } else {
            await ServicePerson.findByIdAndUpdate(user._id, { refreshToken: refreshToken });
        }

        // Set cookies for tokens
        res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({
                success: true,
                message: `Logged in successfully`,
                id: user._id,
                email: user.email,
                accessToken,
                refreshToken,
                role
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


//Technician Login Controller
// module.exports.technicianLogin = async(req, res) => {
//     try{
//         const {contact} = req.body;
//         const options = {
//             withCredentials: true,
//             httpOnly: true,
//             secure: true
//         }
//         console.log(req.body);
//         if(!contact){
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }
        
//         const technician = await Technician.findOne({contact});
//         console.log(technician)
//         if(!technician){
//             res.status(401).json({
//                 success: false,
//                 message: "Technician Not Found"
//             });
//         }

//         const accessToken = createTechnicianToken(technician._id);
//         const refreshToken = createRefreshToken(technician._id);

//         const updatedTechnician = await Technician.findByIdAndUpdate(technician._id, { refreshToken: refreshToken });
        
//         res.status(200)
//         .cookie('accessToken', accessToken, options)
//         .cookie('refreshToken', refreshToken, options)
//         .json({
//             success: true,
//             message: `Logged in successfully`,   
//             data: updatedTechnician,
//             accessToken,
//             refreshToken
//         });
//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// }

// module.exports.Logout = async(req, res) => {
//     try{
//         const userID = req.user._id;
//         const updateData = await User.findByIdAndUpdate(userID, {$set: { refreshToken: null}}, { new: true });
        
//         if(updateData){
//             return res.status(200)
//             .clearCookie("accessToken", {httpOnly: true, secure: true})
//             .clearCookie("refreshToken", {httpOnly: true, secure: true})
//             .json({
//                 sucess: true,
//                 message: "Logged Out Successfully"
//             });
//         }

//         return res.status(400).json({
//             success: false,
//             message: "Some error occurred"
//         });
//     }catch(error){
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// }

// module.exports.Logout = async (req, res) => {
//     try {
//         let userID;
//         let userType;

//         if (req.user) {
//             // Assuming req.user is set for users
//             userID = req.user._id;
//             userType = "user";
//         } else if (req.technician) {
//             // Assuming req.technician is set for technicians
//             userID = req.technician._id;
//             userType = "technician";
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: "No user or technician found in request",
//             });
//         }

//         const Model = userType === "user" ? User : Technician;

//         const user = await Model.findById(userID);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} not found`,
//             });
//         }

//         await Model.findByIdAndUpdate(userID, { $set: { refreshToken: null } });

//         return res.status(200)
//             .clearCookie("accessToken", { httpOnly: true, secure: true })
//             .clearCookie("refreshToken", { httpOnly: true, secure: true })
//             .json({
//                 success: true,
//                 message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} logged out successfully`
//             });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// };

module.exports.Logout = async (req, res) => {
    try {
        const userID = req.user ? req.user._id : null; // Assuming userVerification sets req.user
        const technicianID = req.technician ? req.technician._id : null; // Assuming technicianVerification sets req.technician

        if (userID) {
            await User.findByIdAndUpdate(userID, { $set: { refreshToken: null } });
        } else if (technicianID) {
            await Technician.findByIdAndUpdate(technicianID, { $set: { refreshToken: null } });
        }

        return res.status(200)
            .clearCookie("accessToken", { httpOnly: true, secure: true })
            .clearCookie("refreshToken", { httpOnly: true, secure: true })
            .json({
                success: true,
                message: "Logged Out Successfully"
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};