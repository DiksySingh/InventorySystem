const Item = require("../models/itemSchema");
const IncomingItem = require("../models/incomingItemSchema");
//Add New Item
module.exports.addItem = async (req, res) => {
  const itemName = req.body.itemName.trim();
  const { stock, createdAt, updatedAt } = req.body;
  if (!itemName) {
    return res.status(400).json({
      success: false,
      message: "itemName is required",
    });
  }

  if(!stock){
    return res.status(400).json({
        success: false,
        message: "Stock is required"
    });
  }
  try{
  const existingItem = await Item.findOne({itemName: { $regex: new RegExp(`^${itemName}$`, "i") }});
  console.log(existingItem);
  if(existingItem){
    return res.status(400).json({
      success: false,
      message: "Item exists in warehouse"
    });
  }
  
    const newItem = new Item({ itemName, stock, createdAt, updatedAt });
    const itemData = await newItem.save();
    if (!itemData) {
      return res.status(400).json({
        success: false,
        message: "Data Insertion Failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data Inserted Successfully",
      data: itemData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//View All Items
module.exports.showItems = async (req, res) => {
  try {
    const allItems = await Item.find();
    if (!allItems) {
      return res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Data Fetched Successfully",
      data: allItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.incomingItems = async (req, res) => {
  try {
    const {
      warehouse,
      itemComingFrom,
      itemName,
      quantity,
      defectiveItem,
      arrivedDate,
    } = req.body;
    if (!warehouse || !itemComingFrom || !itemName || !quantity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const foundItem = await Item.findOne({ itemName });
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: `Item ${itemName} not found`,
      });
    }
    //const nondefectItem = quantity - defectiveItem;
    foundItem.stock = parseInt(foundItem.stock) + parseInt(quantity);
    foundItem.updatedAt = Date.now();
    await foundItem.save();

    const incomingItems = new IncomingItem({
      warehouse,
      itemComingFrom,
      itemName,
      quantity,
      defectiveItem,
      arrivedDate,
    });

    await incomingItems.save();

    res.status(200).json({
      success: true,
      message: "Data Inserted Successfully",
      incomingItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


module.exports.incomingItemDetails = async(req, res) => {
    try{
        const itemDetails = await IncomingItem.find();
        if(!itemDetails){
            return res.status(404).json({
                success: false,
                message: "Data Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Data Fetched Successfully",
            itemDetails
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



//Delete Item
module.exports.deleteItem = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Item ID is required",
    });
  }

  try {
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item Not Found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      data: deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
