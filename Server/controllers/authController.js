const User = require("../models/userSchema");
const ServicePerson = require("../models/servicePersonSchema");
const {
  createSecretToken,
  createRefreshToken,
} = require("../util/secretToken");
const bcrypt = require("bcrypt");
const { refreshToken } = require("../middlewares/authMiddlewares");

//Admin and Inventory SignUp Controller
module.exports.userSignup = async (req, res) => {
  const { email, password, createdAt, role } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = new User({ email, password, createdAt, role });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.servicePersonSignup = async (req, res) => {
  const { name, email, contact, password, createdAt, role } = req.body;
  if (!name || !email || !contact || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingServicePerson = await ServicePerson.findOne({
      $or: [{ email }, { contact }],
    });
    if (existingServicePerson) {
      res.status(400).json({
        success: false,
        message: "Technician already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newServicePrson = new ServicePerson({
      name,
      email,
      contact,
      password: hashedPassword,
      createdAt,
      role,
      refreshToken: null,
    });
    await newServicePrson.save();
    res.status(200).json({
      success: true,
      message: "Technician registered successfully",
      data: {
        name: newServicePrson.name,
        email: newServicePrson.email,
        contact: newServicePrson.contact,
        password: newServicePrson.password,
        createdAt: newServicePrson.createdAt,
        role: newServicePrson.role,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const options = {
      withCredentials: true,
      httpOnly: true,
      secure: false,
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
    //const role = roles[email] || 'serviceperson';
    const role = user.role;
    const accessToken = createSecretToken(user._id, role);
    const refreshToken = createRefreshToken(user._id);

    // Update the refreshToken in the database
    if (user.constructor.modelName === "User") {
      await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken });
    } else {
      await ServicePerson.findByIdAndUpdate(user._id, {
        refreshToken: refreshToken,
      });
    }

    // Set cookies for tokens
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: `Logged in successfully`,
        id: user._id,
        email: user.email,
        accessToken,
        refreshToken,
        role,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.Logout = async (req, res) => {
  try {
    const userID = req.user._id; // req.user will contain either User or ServicePerson based on the role
    const role = req.user.role; // Assuming role is set in the token

    if (role === "serviceperson") {
      await ServicePerson.findByIdAndUpdate(userID, {
        $set: { refreshToken: null },
      });
    } else {
      await User.findByIdAndUpdate(userID, { $set: { refreshToken: null } });
    }

    return res
      .status(200)
      .clearCookie("accessToken", { httpOnly: true, secure: true })
      .clearCookie("refreshToken", { httpOnly: true, secure: true })
      .json({
        success: true,
        message: "Logged Out Successfully",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const servicePerson = await ServicePerson.findById(req.user._id);

    if (!servicePerson) {
      return res
        .status(404)
        .json({ success: false, message: "Service person not found" });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(
      currentPassword,
      servicePerson.password
    );
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    servicePerson.password = hashedPassword;
    await servicePerson.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
