const moment = require("moment-timezone");
const Item = require("../models/itemSchema");
const PickupItem = require("../models/pickupItemSchema");
const OutgoingItemDetails = require("../models/outgoingItemsTotal");
const TotalOrderDetails = require("../models/incomingItemsTotal");

//ServicePerson Access
module.exports.returnItems = async (req, res) => {
  try {
    console.log("Req.body:", req.body);
    const id = req.user._id;
    console.log("ID:", id);
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
    const outgoingItemsData = [];

    for (let item of items) {
      const itemName = item.itemName;
      const quantityToAdjust = item.quantity;

      // Find the corresponding item in the Item schema
      const itemRecord = await Item.findOne({ itemName });

      if (!itemRecord) {
        return res.status(404).json({
          success: false,
          message: `Item ${itemName} not found in inventory`,
        });
      }

      if (incoming === false) {
        // Check if there is enough stock
        if (itemRecord.stock < quantityToAdjust) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for item ${itemName}`,
          });
        }

        // Decrease the stock
        itemRecord.stock -= quantityToAdjust;
       
        console.log("outgoingItemsData: ", outgoingItemsData);
      }
      //  else {
      //   // Increase the stock if incoming is true
      //   itemRecord.stock += quantityToAdjust;
      // }

      // Save the updated item record
      outgoingItemsData.push({ itemName, quantity: quantityToAdjust });
      console.log("ItemsSchemaData: ", await itemRecord.save());
    }

    if (incoming === false) {
      // Update OutgoingItemDetails for outgoing items
      let existingOutgoingRecord = await OutgoingItemDetails.findOne({
        servicePerson: id,
      });

      if (existingOutgoingRecord) {
        // Update existing quantities or add new items
        outgoingItemsData.forEach((outgoingItem) => {
          const existingItemIndex = existingOutgoingRecord.items.findIndex(
            (item) => item.itemName === outgoingItem.itemName
          );

          if (existingItemIndex > -1) {
            existingOutgoingRecord.items[existingItemIndex].quantity +=
              outgoingItem.quantity;
          } else {
            existingOutgoingRecord.items.push(outgoingItem);
          }
        });

        await existingOutgoingRecord.save();
      } else {
        // No existing record, so create a new one
        existingOutgoingRecord = new OutgoingItemDetails({
          servicePerson: id,
          items: outgoingItemsData,
        });
        console.log("Outgoing:", existingOutgoingRecord);
        await existingOutgoingRecord.save();
      }
    } else {
      // Update or create TotalOrderDetails for incoming items
      let existingIncomingRecord = await TotalOrderDetails.findOne({
        servicePerson: id,
      });

      items.forEach((incomingItem) => {
        const existingItemIndex = existingIncomingRecord?.items.findIndex(
          (item) => item.itemName === incomingItem.itemName
        );

        if (existingIncomingRecord && existingItemIndex > -1) {
          existingIncomingRecord.items[existingItemIndex].quantity +=
            incomingItem.quantity;
        } else if (existingIncomingRecord) {
          existingIncomingRecord.items.push(incomingItem);
        }
      });

      if (existingIncomingRecord) {
        await existingIncomingRecord.save();
      } else {
        // No existing record, so create a new one
        existingIncomingRecord = new TotalOrderDetails({
          servicePerson: id,
          items,
        });
        console.log("Incoming: ", existingIncomingRecord);
        await existingIncomingRecord.save();
      }
    }

    const returnItems = new PickupItem({
      servicePerson: id,
      farmerName,
      farmerContact: contact,
      farmerVillage,
      items,
      warehouse,
      serialNumber,
      remark: remark || "",
      status,
      incoming,
      pickupDate,
    });
    console.log("returnsItem: ", returnItems);
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

    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 5; 
    const skip = (page - 1) * limit;

    const pickupItems = await PickupItem.find({ servicePerson: id })
      .sort({ pickupDate: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v -servicePerson");

    if (!pickupItems) {
      return res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
    }

    // const pickupItemsDetail = pickupItems.map((pickupItem) => {
    //   return {
    //     ...pickupItem.toObject(),
    //     pickupDate: moment(pickupItem.pickupDate)
    //       .tz("Asia/Kolkata")
    //       .format("YYYY-MM-DD HH:mm:ss"),
    //   };
    // });

    const totalDocuments = await PickupItem.countDocuments({ servicePerson: id });
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      success: true,
      message: "Data Fetched Successfully",
      page,
      totalPages,
      limit,
      totalDocuments,
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

// res.status(200).json(itemsWithImageUrl);

//Warehouse Access
module.exports.getPickupItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 5; 
    const skip = (page - 1) * limit;

    const pickupItems = await PickupItem.find()
      .populate("servicePerson", "_id name contact ")
      .skip(skip)
      .limit(limit)
      .sort({ pickupDate: -1 });

    const totalDocuments = await PickupItem.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      success: true,
      message: "Data Fetched Successfully",
      page,
      totalPages,
      limit,
      totalDocuments,
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
    const servicePersonId = req.user._id
    // Fetch incoming and outgoing item data
    const incomingItemData = await TotalOrderDetails.find({servicePerson: servicePersonId}).select(
      "-servicePerson"
    );
    const outgoingItemData = await OutgoingItemDetails.find({servicePerson: servicePersonId}).select(
      "-servicePerson"
    );

    // Create a unified response array
    const mergedData = [];

    // Add incoming items to mergedData
    incomingItemData.forEach((item) => {
      mergedData.push({
        type: "incoming",
        items: item.items,
      });
    });
    console.log("Incoming", incomingItemData);

    // Add outgoing items to mergedData
    outgoingItemData.forEach((item) => {
      mergedData.push({
        type: "outgoing",
        items: item.items,
      });
    });
    console.log("Outgoing", outgoingItemData);
    console.log("Merged", mergedData);
    res.status(200).json({
      success: true,
      message: "Data Merged Successfully",
      mergedData: mergedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, pickupItemId, incoming, arrivedDate } = req.body;
    console.log("Body", req.body);

    if (status === true && incoming === true) {
      const pickupItem = await PickupItem.findById(pickupItemId);
      console.log("pickup", pickupItem);
      if (!pickupItem) {
        return res.status(404).json({
          success: false,
          message: "PickupItem not found",
        });
      }

      pickupItem.status = true;
      pickupItem.arrivedDate = arrivedDate;
      const items = pickupItem.items;
      for (let item of items) {
        const itemName = item.itemName;
        const quantityToAdjust = item.quantity;
  
        // Find the corresponding item in the Item schema
        const itemRecord = await Item.findOne({ itemName });
  
        if (!itemRecord) {
          return res.status(404).json({
            success: false,
            message: `Item ${itemName} not found in inventory`,
          });
        }
  
        if (incoming === true) {
          // Increase the stock
          itemRecord.stock = parseInt(itemRecord.stock) + parseInt(quantityToAdjust);
        }
        console.log("ItemsSchemaData: ", await itemRecord.save());
      }

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
        incomingDetails: orderDetails,
      });
    } else if (status === true && incoming === false) {
      const pickupItem = await PickupItem.findById(pickupItemId);
      console.log("pickup", pickupItem);
      if (!pickupItem) {
        return res.status(404).json({
          success: false,
          message: "PickupItem not found",
        });
      }

      pickupItem.status = true;
      pickupItem.arrivedDate = arrivedDate;
      
      const itemsToUpdate = pickupItem.items;
      const servicePersonId = pickupItem.servicePerson;

      const outgoingOrderDetails = await OutgoingItemDetails.findOne({
        servicePerson: servicePersonId,
      });
      console.log("orderdetils", outgoingOrderDetails);
      if (!outgoingOrderDetails) {
        return res.status(400).json({
          success: false,
          message: "OutgoingItemDetails not found for the service person",
        });
      }

      for (let item of itemsToUpdate) {
        console.log("Item", item);
        const matchingItem = outgoingOrderDetails.items.find(
          (i) => i.itemName === item.itemName
        );
        console.log("matching", matchingItem);

        if (!matchingItem) {
          return res.status(404).json({
            success: false,
            message: `Item ${item.itemName} not found in OutgoingItemDetails`,
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

      await outgoingOrderDetails.save();

      await pickupItem.save();

      return res.status(200).json({
        success: true,
        message: "Status updated and quantities adjusted successfully",
        pickupItem,
        outgoingDetails: outgoingOrderDetails,
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
