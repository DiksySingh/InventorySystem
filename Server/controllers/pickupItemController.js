const moment = require("moment-timezone");
const Item = require("../models/itemSchema");
const PickupItem = require("../models/pickupItemSchema");
const TotalOrderDetails = require("../models/servicePersonOrderDetails");

//ServicePerson Access
module.exports.returnItems = async (req, res) => {
  try {
    console.log("file:", req.file);
    console.log(req.body);
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

    // if (!req.file) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Image is required",
    //   });
    // }
    // const image = req.file.filename;

    const returnItems = new PickupItem({
      servicePerson: id,
      farmerName,
      farmerContact: contact,
      farmerVillage,
      items: parsedItems,
      // image,
      warehouse,
      remark: remark || "",
      status: status || false,
      pickupDate,
    });
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
    //By Shiv

    const pickupItems = await PickupItem.find()
      .populate("servicePerson", " _id name contact") // Assuming you have a reference model for ServicePerson
      .exec();

    // Modify the result to include the full URL of the image
    const itemsWithImageUrl = pickupItems.map((item) => ({
      ...item.toObject(), // Convert to plain object to modify the response
      imageUrl: `${req.protocol}://${req.get("host")}/uploads/images/${
        item.image
      }`, // Construct image URL
    }));

    res.status(200).json(itemsWithImageUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.servicePersonDashboard = async (req, res) => {
  try {
    const items = await Item.find();
    if (!items) {
      return res.status(404).json({
        success: false,
        message: "Items Data Not Found",
      });
    }

    const allPickupDetails = await PickupItem.find({
      servicePerson: req.user._id,
    });

    const itemValues = {};

    allPickupDetails.forEach((pickupItem) => {
      const pickupItems = pickupItem.items;

      pickupItems.forEach((item) => {
        const itemName = item.itemName;
        const itemValue = item.quantity;

        if (itemValues[itemName]) {
          itemValues[itemName] += itemValue;
        } else {
          itemValues[itemName] = itemValue;
        }
      });
    });

    const itemsData = items.map((item) => ({
      itemName: item.itemName,
      quantity: itemValues[item.itemName] || 0,
    }));

    const orderDetails = {
      servicePerson: req.user._id,
      items: Object.keys(itemValues).map((itemName) => ({
        itemName,
        quantity: itemValues[itemName],
      })),
    };

    // Upsert (insert if not exists, update if exists) the order totals for the service person
    const result = await TotalOrderDetails.findOneAndUpdate(
      { servicePerson: req.user._id },
      orderDetails,
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Items Fetched Successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
