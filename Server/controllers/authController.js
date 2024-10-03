const User = require("../models/userSchema");
const {createSecretToken} = require("../util/secretToken");
const bcrypt = require("bcrypt");

module.exports.Signup = async(req, res) => {
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
        const existingAdmin = await User.findOne({email});
        if(existingAdmin){
            res.status(400). json({
                success: false,
                message: "Admin already exists"
            });
        }

        const newAdmin = new User({email, password, createdAt});
        await newAdmin.save();
        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            data: newAdmin
        }); 
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const roles = {
    "admin@example.com": "admin",
    "inventory@example.com": "inventory",
};

module.exports.Login = async(req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await User.findOne({email});
        console.log(user);
        if(!user){
            return res.status(401).json({
                success: false,               
                message: "Incorrect password or email",
                
            });
        }

        const auth = await bcrypt.compare(password, user.password);
        if(!auth){
            return res.status(401).json({
                success: false,
                message: "Incorrect password or email"
            });
        }
        const role = roles[email];

        const token = createSecretToken(user._id, role);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: true, 
            secure: true
        });

        res.status(200 ).json({
            success: true,
            message: `Logged in successfully`,   
            email,
            token
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}
