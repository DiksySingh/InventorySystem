const Item = require("../models/itemSchema");

module.exports.addItem = async(req, res) => {
        const {name, itemType, stock, createdAt, updatedAt} = req.body;
        if(!name){
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        if(!itemType){
            return res.status(400).json({
                success: false,
                message: "itemType is required"
            });
        }

        try{
            const newItem = new Item({name, itemType, stock, createdAt, updatedAt});
            const itemData = await newItem.save();
            if(!itemData){
                return res.status(400).json({
                    success: false,
                    message: "Data Insertion Failed"
                });
            }
            
            res.status(200).json({
                success: true,
                message: "Data Inserted Successfully",
                data: itemData
            });
        }catch(error){
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
}

module.exports.showItems = async(req, res) => {
    try{
        const allItems = await Item.find();
        if(!allItems){
            return res.status(404).json({
                success: false,
                message: "Data Not Found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Data Fetched Successfully",
            data: allItems
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}