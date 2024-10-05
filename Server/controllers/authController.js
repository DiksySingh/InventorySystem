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
        console.log(role);
        const token = createSecretToken(user._id, role);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: true, 
            secure: true
        });

        res.status(200 ).json({
            success: true,
            message: `Logged in successfully`,   
            id: user._id,
            email: user.email,
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
