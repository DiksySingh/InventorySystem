const Warehouse = require("../models/warehouseSchema");
const WarehouseItems = require("../models/warehouseItemsSchema");

module.exports.addWarehouse = async (req, res) => {
    const {warehouseName, state} = req.body;
    if(!warehouseName || !state){
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try{
        const existingWarehouse = await Warehouse.findOne({warehouseName});
        if(existingWarehouse){
            return res.status(400).json({
                success: false,
                message: "Warehouse already exists"
            });
        }

        const newWarehouse = new Warehouse({warehouseName, state});
        await newWarehouse.save();

        return res.status(200).json({
            success: true,
            message: "Warehouse Added Successfully",
            newWarehouse
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports.addWarehouseItems = async(req, res) => {
    try{
        const {warehouseName, items} = req.body;

        
    }
}