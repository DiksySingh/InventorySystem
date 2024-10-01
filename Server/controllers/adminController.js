const Admin = require("../models/adminSchema");

module.exports.adminSignup = async(req, res) => {
    const {username, email, password, role, createdAt} = req.body;
    if(!username){
        return res.status(400).json({
            success: false,
            message: "Username is required"
        });
    }

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

    if(!role){
        return res.status(400).json({
            success: false,
            message: "Role is required"
        });
    }

    try{
        const existingAdmin = await Admin.findOne({email});
        if(existingAdmin){
            res.status(400). json({
                success: false,
                message: "Admin already exists"
            });
        }

        const newAdmin = new Admin({username, email, password, role, createdAt});
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