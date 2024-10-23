const moment = require("moment-timezone");
const Item = require("../models/itemSchema");
const PickupItem = require("../models/pickupItemSchema");
const TotalOrderDetails = require("../models/servicePersonOrderDetails");
const { json } = require("express");

//ServicePerson Access
module.exports.returnItems = async (req, res) => {
  try {
    console.log(req.body);
    const id = req.user._id;
    const {
      farmerName,
      farmerContact,
      farmerVillage,
      items,
      warehouse,
      serialNumber,
      remark,
      status,
      pickupDate,
    } = req.body;

    let contact = Number(farmerContact);
    //let parsedItems = JSON.parse(items);

    if (
      !farmerName ||
      !contact ||
      !farmerVillage ||
      !items ||
      !warehouse ||
      !serialNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
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
      items,
      warehouse,
      serialNumber,
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
    const pickupItems = await PickupItem.find().populate(
      "servicePerson",
      "_id name contact "
    ); // Assuming you have a reference model for ServicePerson

    // // Modify the result to include the full URL of the image
    // const itemsWithImageUrl = pickupItems.map((item) => ({
    //   ...item.toObject(), // Convert to plain object to modify the response
    //   imageUrl: `${req.protocol}://${req.get("host")}/uploads/images/${
    //     item.image
    //   }`, // Construct image URL
    // }));

    //res.status(200).json(itemsWithImageUrl);

    res.status(200).json({
      success: true,
      message: "Data Fetched Successfully",
      pickupItems,
    });
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
      items: itemsData, // Include all items, with 0 for not picked-up items
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

// module.exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status, pickupItemId } = req.body;

//     // Step 1: Check if status is true
//     if (status == true) {
//       // Step 2: Find the PickupItem by ID
//       const pickupItem = await PickupItem.findById(pickupItemId);
//       if (!pickupItem) {
//         return res.status(404).json({
//           success: false,
//           message: "PickupItem not found",
//         });
//       }

//       // Step 3: Update the status of PickupItem to true
//       pickupItem.status = true;
//       //await pickupItem.save();

//       const itemsToUpdate = pickupItem.items;
//       const servicePersonId = pickupItem.servicePerson;
//       const orderDetails = await TotalOrderDetails.findOne({
//         servicePerson: servicePersonId,
//       });
//       if (!orderDetails) {
//         return res.status(400).json({
//           success: false,
//           message: "TotalOrderDetails Not Found",
//         });
//       }

//       for (let item of itemsToUpdate) {
//         const matchingItem = orderDetails.items.find(
//           (i) => i.itemName === item.itemName
//         );
//         if (!matchingItem) {
//           return res.status(404).json({
//             success: false,
//             message: `Item ${item.itemName} not found in TotalOrderDetails`,
//           });
//         }
//         console.log("match", matchingItem.quantity);
//         console.log("item", item.quantity);
//         // Check if the quantity is enough to be decremented
//         if (matchingItem.quantity < item.quantity) {
//           return res.status(400).json({
//             success: false,
//             message: `Not enough stock for ${item.itemName}. Available: ${matchingItem.quantity}, Requested: ${item.quantity}`,
//           });
//         }

//         if (matchingItem.quantity === item.quantity) {
//           matchingItem.quantity = 0; // Set to zero if it matches exactly
//         } else {
//           matchingItem.quantity -= item.quantity; // Otherwise, just decrease the quantity
//         }
//       }
//       console.log(orderDetails);
//       // Save the updated TotalOrderDetails after modifying quantities
//       await orderDetails.save();

//       // Return success response
//       return res.status(200).json({
//         success: true,
//         message:
//           "PickupItem status updated and quantities adjusted successfully",
//         pickupItem,
//         orderDetails,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, pickupItemId } = req.body;
    const pickupData = await PickupItem.findById(pickupItemId);
    if (!pickupData) {
      return res.status(400).json({
        success: false,
        message: "no data found by pickup id",
      });
    }
    // console.log(pickupData);
    const itemData = pickupData.items;
    const servicePersonID = pickupData.servicePerson.toString();
    // console.log(itemData);
    for (let item of itemData) {
      console.log(item.itemName);

      const serviceOrder = await TotalOrderDetails.findOne({
        $and: [
          { servicePerson: servicePersonID },
          { "items.itemName": item.itemName },
        ],
      }).exec();


      ///
      const filteredOrderDetails = orderDetails.map((order) => {
      const matchingItems = order.items.filter(
        (item) => item.itemName === itemName
      );

      return {
        _id: order._id,
        servicePerson: order.servicePerson,
        items: matchingItems, // Only return the matching items
      };
      });
      console.log("SO", serviceOrder);
      // if (serviceOrder) {
      //   await TotalOrderDetails.updateOne(
      //     {
      //       servicePerson: serviceId,
      //       "items.itemName": itemName,
      //     },
      //     {
      //       $set: {
      //         "items.$.quantity": quantity,
      //       },
      //     }
      //   );
      // }
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }
};
