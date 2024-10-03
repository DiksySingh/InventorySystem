const Item = require("../models/itemSchema");

module.exports.addItem = async(req, res) => {
        const {itemName, stock, createdAt, updatedAt} = req.body;
        if(!itemName){
            return res.status(400).json({
                success: false,
                message: "itemName is required"
            });
        }

        // if(!stock){
        //     return res.status(400).json({
        //         success: false,
        //         message: "Stock is required"
        //     });
        // }

        try{
            const newItem = new Item({itemName, stock, createdAt, updatedAt});
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

module.exports.productsOut = async(req, res) => {

}