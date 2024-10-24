const moment = require("moment-timezone");
const Item = require("../models/itemSchema");
const PickupItem = require("../models/pickupItemSchema");
const OutgoingItem = require("../models/outgoingItemSchema");
const OutgoingItemDetails = require("../models/outgoingItemsTotal");
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
      incoming,
      pickupDate,
    } = req.body;

    let contact = Number(farmerContact);

    if (!farmerName || !contact || !farmerVillage || !items || !warehouse || !serialNumber) {
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

    if(incoming === false){
       for (let item of items) {
         const itemName = item.itemName;
         const quantityToDecrease = item.quantity;

         // Find the corresponding item in the Item schema
         const itemRecord = await Item.findOne({ itemName });

         if (!itemRecord) {
           return res.status(404).json({
             success: false,
             message: `Item ${itemName} not found in inventory`,
           });
         }

         // Check if there is enough stock
         if (itemRecord.stock < quantityToDecrease) {
           return res.status(400).json({
             success: false,
             message: `Not enough stock for item ${itemName}`,
           });
         }

         // Decrease the stock
         itemRecord.stock -= quantityToDecrease;

         // Save the updated item record
         await itemRecord.save();
       }
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
      incoming,
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

    const pickupItemsDetail = pickupItems
      .map((pickupItem) => {
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


 // // Modify the result to include the full URL of the image
    // const itemsWithImageUrl = pickupItems.map((item) => ({
    //   ...item.toObject(), // Convert to plain object to modify the response
    //   imageUrl: `${req.protocol}://${req.get("host")}/uploads/images/${
    //     item.image
    //   }`, // Construct image URL
    // }));

    //res.status(200).json(itemsWithImageUrl);

//Warehouse Access
module.exports.getPickupItems = async (req, res) => {
  try {
    const pickupItems = await PickupItem.find()
      .populate("servicePerson", "_id name contact ")
      .sort({ pickupDate: -1 }); 

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
      status: false,
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

// module.exports.servicePersonDashboard = async (req, res) => {
//   try {
//     const items = await Item.find();
//     if (!items) {
//       return res.status(404).json({
//         success: false,
//         message: "Items Data Not Found",
//       });
//     }

//     const allPickupDetails = await PickupItem.find({
//       servicePerson: req.user._id,
//       status: false,
//     });

//     const itemValues = {};

//     allPickupDetails.forEach((pickupItem) => {
//       const pickupItems = pickupItem.items;

//       pickupItems.forEach((item) => {
//         const itemName = item.itemName;
//         const itemValue = item.quantity;

//         if (itemValues[itemName]) {
//           itemValues[itemName] += itemValue;
//         } else {
//           itemValues[itemName] = itemValue;
//         }
//       });
//     });



//     const itemsData = items.map((item) => ({
//       itemName: item.itemName,
//       quantity: itemValues[item.itemName] || 0,
//     }));

//     const orderDetails = {
//       servicePerson: req.user._id,
//       items: itemsData, // Include all items, with 0 for not picked-up items
//     };

//     // Upsert (insert if not exists, update if exists) the order totals for the service person
//     const result = await TotalOrderDetails.findOneAndUpdate(
//       { servicePerson: req.user._id },
//       orderDetails,
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Items Fetched Successfully",
//       data: result,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };


module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, pickupItemId } = req.body;
    console.log("Body", req.body);

    if (status === true) {
      const pickupItem = await PickupItem.findById(pickupItemId);
      console.log("pickup", pickupItem);
      if (!pickupItem) {
        return res.status(404).json({
          success: false,
          message: "PickupItem not found",
        });
      }

      pickupItem.status = true;

      const itemsToUpdate = pickupItem.items;
      const servicePersonId = pickupItem.servicePerson;

      const orderDetails = await TotalOrderDetails.findOne({
        servicePerson: servicePersonId,
      });
      console.log("orderdetils", orderDetails);
      if (!orderDetails) {
        return res.status(400).json({
          success: false,
          message: "TotalOrderDetails not found for the service person",
        });
      }

      for (let item of itemsToUpdate) {
        console.log("Item", item);
        const matchingItem = orderDetails.items.find(
          (i) => i.itemName === item.itemName
        );
        console.log("matching", matchingItem);

        if (!matchingItem) {
          return res.status(404).json({
            success: false,
            message: `Item ${item.itemName} not found in TotalOrderDetails`,
          });
        }

        if (matchingItem.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough quantity for ${item.itemName}`,
          });
        }

        if (matchingItem.quantity === item.quantity) {
          matchingItem.quantity = 0;
        } else {
          matchingItem.quantity -= item.quantity;
        }
      }

      await orderDetails.save();

      await pickupItem.save();

      return res.status(200).json({
        success: true,
        message: "Status updated and quantities adjusted successfully",
        pickupItem,
        orderDetails,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// module.exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status, pickupItemId, incoming } = req.body;
//     console.log("Body", req.body);

//     if (status === true && incoming === true) {
//       const pickupItem = await PickupItem.findById(pickupItemId);
//       console.log("pickup", pickupItem);
//       if (!pickupItem) {
//         return res.status(404).json({
//           success: false,
//           message: "PickupItem not found",
//         });
//       }

//       pickupItem.status = true;

//       const itemsToUpdate = pickupItem.items;
//       const servicePersonId = pickupItem.servicePerson;

//       const orderDetails = await TotalOrderDetails.findOne({
//         servicePerson: servicePersonId,
//       });
//       console.log("orderdetils",orderDetails);
//       if (!orderDetails) {
//         return res.status(400).json({
//           success: false,
//           message: "TotalOrderDetails not found for the service person",
//         });
//       }

//       for (let item of itemsToUpdate) {
//         console.log("Item",item)
//         const matchingItem = orderDetails.items.find(
//           (i) => i.itemName === item.itemName
//         );
//         console.log("matching",matchingItem);

//         if (!matchingItem) {
//           return res.status(404).json({
//             success: false,
//             message: `Item ${item.itemName} not found in TotalOrderDetails`,
//           });
//         }

//         if (matchingItem.quantity < item.quantity) {

//           return res.status(400).json({
//             success: false,
//             message: `Not enough quantity for ${item.itemName}`,
//           });
//         }

//         if (matchingItem.quantity === item.quantity) {
//           matchingItem.quantity = 0;
//         } else {
//           matchingItem.quantity -= item.quantity;
//         }
//       }

//       await orderDetails.save();

//       await pickupItem.save();

//       return res.status(200).json({
//         success: true,
//         message:
//           "Status updated and quantities adjusted successfully",
//         pickupItem,
//         orderDetails,
//       });
//     } else if (status === true && incoming === false){
//           const pickupItem = await PickupItem.findById(pickupItemId);
//           console.log("pickup", pickupItem);
//           if (!pickupItem) {
//             return res.status(404).json({
//               success: false,
//               message: "PickupItem not found",
//             });
//           }

//           pickupItem.status = true;

//           const itemsToUpdate = pickupItem.items;
//           const servicePersonId = pickupItem.servicePerson;

//             const outgoingOrderDetails = await OutgoingItemDetails.findOne({
//               servicePerson: servicePersonId,
//             });
//             console.log("orderdetils", orderDetails);
//             if (!orderDetails) {
//               return res.status(400).json({
//                 success: false,
//                 message: "OutgoingItemDetails not found for the service person",
//               });
//             }

//             for (let item of itemsToUpdate) {
//               console.log("Item", item);
//               const matchingItem = outgoingOrderDetails.items.find(
//                 (i) => i.itemName === item.itemName
//               );
//               console.log("matching", matchingItem);

//               if (!matchingItem) {
//                 return res.status(404).json({
//                   success: false,
//                   message: `Item ${item.itemName} not found in OutgoingItemDetails`,
//                 });
//               }

//               if (matchingItem.quantity < item.quantity) {
//                 return res.status(400).json({
//                   success: false,
//                   message: `Not enough quantity for ${item.itemName}`,
//                 });
//               }

//               if (matchingItem.quantity === item.quantity) {
//                 matchingItem.quantity = 0;
//               } else {
//                 matchingItem.quantity -= item.quantity;
//               }
//             }

//             await outgoingOrderDetails.save();

//             await pickupItem.save();

//             return res.status(200).json({
//               success: true,
//               message: "Status updated and quantities adjusted successfully",
//               pickupItem,
//               outgoingOrderDetails,
//             });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// module.exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status, pickupItemId } = req.body;
//     const pickupData = await PickupItem.findById(pickupItemId);
//     if (!pickupData) {
//       return res.status(400).json({
//         success: false,
//         message: "no data found by pickup id",
//       });
//     }
//     // console.log(pickupData);
//     const itemData = pickupData.items;
//     const servicePersonID = pickupData.servicePerson.toString();
//     // console.log(itemData);
//     for (let item of itemData) {
//       console.log(item.itemName);

//       const serviceOrder = await TotalOrderDetails.findOne({
//         $and: [
//           { servicePerson: servicePersonID },
//           { "items.itemName": item.itemName },
//         ],
//       }).exec();


//       ///
//       const filteredOrderDetails = orderDetails.map((order) => {
//       const matchingItems = order.items.filter(
//         (item) => item.itemName === itemName
//       );

//       return {
//         _id: order._id,
//         servicePerson: order.servicePerson,
//         items: matchingItems, // Only return the matching items
//       };
//       });
//       console.log("SO", serviceOrder);
//       // if (serviceOrder) {
//       //   await TotalOrderDetails.updateOne(
//       //     {
//       //       servicePerson: serviceId,
//       //       "items.itemName": itemName,
//       //     },
//       //     {
//       //       $set: {
//       //         "items.$.quantity": quantity,
//       //       },
//       //     }
//       //   );
//       // }
//     }
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error,
//     });
//   }
// };
