const Transaction = require("../models/transactionSchema");
const Item = require("../models/itemSchema");

module.exports.addTransaction = async(req, res) => {
    try{
        const {name, contact, items, transactionDate, warehouse} = req.body
        let itemsData = JSON.parse(items);
        console.log(itemsData);
        let personContact = Number(contact);
        if(!name || !personContact || !itemsData || !warehouse){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!Array.isArray(itemsData) || itemsData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items must be a non-empty array"
            });
        }

        if(!req.file){
            return res.status(400).json({
                success: false,
                message: "Video Proof is required"
            });
        }

        const videoProof = req.file.path;
        for (const item of itemsData) {
            const { itemName, quantity } = item;
            console.log(itemName);
            if (!itemName || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: "itemName and quantity is required"
                });
            }
            try{
                const foundItem = await Item.findOne({ itemName });

                if (!foundItem) {
                    return res.status(404).json({
                        success: false,
                        message: `Item ${itemName} not found`
                    });
                }
            
                // Check if sufficient stock is available
                if (foundItem.stock < quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Not enough stock for ${itemName}`
                    });
                }
            
                // Update stock and update time
                foundItem.stock -= quantity;
                foundItem.updatedAt = Date.now();
                await foundItem.save();
            }catch(error){
                return res.status(500).json({
                    success: false,
                    message: `Error: ${error.message}`
                });
            }
        }

        const newTransaction = new Transaction({
            name,
            contact,
            items: itemsData,
            videoProof,
            transactionDate,
            warehouse 
        });
        console.log(newTransaction);
        await newTransaction.save();

        res.status(200).json({
            success: true,
            message: "Transaction Created Successfully",
            newTransaction
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};