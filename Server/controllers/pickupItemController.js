const moment = require("moment-timezone");
const PickupItem = require("../models/pickupItemSchema");

//ServicePerson Access
module.exports.returnItems = async (req, res) => {
  try {
    const id = req.user._id;
    const {
      farmerName,
      farmerContact,
      farmerVillage,
      items,
      warehouse,
      remark,
      status,
      pickupDate,
    } = req.body;
    let contact = Number(farmerContact);
    let parsedItems = JSON.parse(items);

    if (!farmerName || !contact || !farmerVillage || !items || !warehouse) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items must be a non-empty array",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }
    console.log(req.file);
    const image = req.file.filename;

    const returnItems = new PickupItem({
      servicePerson: id,
      farmerName,
      farmerContact: contact,
      farmerVillage,
      items: parsedItems,
      image,
      warehouse,
      remark: remark || "",
      status: status || false,
      pickupDate,
    });
    console.log(returnItems);
    await returnItems.save();

    res.status(200).json({
      success: true,
      message: "Data Logged Successfully",
      returnItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.pickupItemOfServicePerson = async (req, res) => {
  try {
    console.log(req.user);
    const id = req.user._id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const pickupItems = await PickupItem.find({ servicePerson: id }).select(
      "-__v -servicePerson"
    );
    if (!pickupItems) {
      return res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
    }

    const pickupItemsDetail = pickupItems.map((pickupItem) => {
      return {
        ...pickupItem.toObject(),
        pickupDate: moment(pickupItem.pickupDate)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    res.status(200).json({
      success: true,
      message: "Data Fetched Successfully",
      pickupItemsDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Warehouse Access
module.exports.getPickupItems = async (req, res) => {
  try {
    const pickupItems = await PickupItem.find().populate(
      "servicePerson",
      "-_id name contact"
    );
    if (!pickupItems) {
      return res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
    }

    const pickupItemsDetail = pickupItems.map((pickupItem) => {
      return {
        ...pickupItem.toObject(),
        pickupDate: moment(pickupItem.pickupDate)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    res.status(200).json({
      success: true,
      message: "Pickup items retrieved successfully",
      pickupItemsDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
