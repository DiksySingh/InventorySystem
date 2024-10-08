const Transaction = require("../models/transactionSchema");
const Item = require("../models/itemSchema");
const Technician = require("../models/technicianSchema");

//Add New Transaction
module.exports.addTransaction = async(req, res) => {
    try{
        const {name, contact, items, transactionDate, warehouse, status} = req.body
        let itemsData = JSON.parse(items);
        console.log(req.body);
        //console.log(itemsData);
        console.log(contact);
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

        let technician = await Technician.findOne({ contact: personContact });
        // If the person doesn't exist, create a new person
        if (!technician) {
            technician = new Technician({ name, contact: personContact });
            console.log(technician);
            await technician.save();
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
            technicianDetail: technician._id,
            items: itemsData,
            videoProof,
            transactionDate,
            warehouse,
            status
        });
        console.log(newTransaction);
        await newTransaction.save();

        res.status(200).json({
            success: true,
            message: "Transaction Created Successfully",
            data: newTransaction
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

//View All Transactions
module.exports.viewTransactions = async(req, res) =>{
    try {
        const allTransactions = await Transaction.find().populate('technicianDetail');
        if(!allTransactions){
            return res.status(404).json({
                success: false,
                message: "Data Not Found"
            });
        }
        res.status(200).json({
            success:true,
            message: "Data Fetched Successfully",
            data: allTransactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

//View Particular Transaction Using ID
module.exports.getTransactionByID = async(req, res) => {
    const {id} = req.query;
    if(!id){
        return res.status(400).json({
            success: false,
            message: "Transaction ID is required"
        });
    }

    try{
        const transaction = await Transaction.findById(id).populate('technicianDetail', 'name contact');
        if(!transaction){
            return res.status(404).json({
                success: false,
                message: "Transaction Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction Fetched Successfully",
            transaction
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


//Update a transaction using ID
module.exports.updateTransaction = async(req, res) => {
    try{
        const {id} = req.query;
        const updates = req.body;
        console.log(req.body)
        if(!id){
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required"
            });
        }
        
        const transaction = await Transaction.findById(id).populate('technicianDetail');
        console.log(transaction);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // if (updates.name) transaction.name = updates.name;
        // if (updates.contact) transaction.contact = Number(updates.contact);

        if (updates.name || updates.contact) {
            console.log(transaction.technicianDetail._id);
            const technician = await Technician.findById({_id: transaction.technicianDetail._id});
            console.log(technician);
            if (!technician) {
                return res.status(404).json({
                    success: false,
                    message: "Person not found"
                });
            }
            if(updates.name){
                technician.name = updates.name;
            }
            if(updates.contact){
                const technicianContact = Number(updates.contact);
                technician.contact = technicianContact;
            }
            
            await technician.save();
        }
        
        if (updates.items) {
            const newItems = JSON.parse(updates.items);  

            for (const newItem of newItems) {
                const { itemName, quantity: newQuantity } = newItem;

                const foundItem = await Item.findOne({ itemName });

                if (!foundItem) {
                    return res.status(404).json({
                        success: false,
                        message: `Item ${itemName} not found`
                    });
                }

                // Find the corresponding old item in the transaction
                const oldItem = transaction.items.find(item => item.itemName === itemName);

                if (!oldItem) {
                    // If the item is new in the transaction, just reduce the stock
                    if (foundItem.stock < newQuantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Not enough stock for ${itemName}`
                        });
                    }
                    foundItem.stock -= newQuantity;
                } else {
                    const oldQuantity = oldItem.quantity;
                    const quantityDifference = newQuantity - oldQuantity;

                    if (quantityDifference > 0) {
                        // Quantity has increased, decrease stock accordingly
                        if (foundItem.stock < quantityDifference) {
                            return res.status(400).json({
                                success: false,
                                message: `Not enough stock for ${itemName}`
                            });
                        }
                        foundItem.stock -= quantityDifference;
                    } else if (quantityDifference < 0) {
                        // Quantity has decreased, increase stock accordingly
                        foundItem.stock += Math.abs(quantityDifference);
                    }
                }

                // Update stock and save the item
                foundItem.updatedAt = Date.now();
                await foundItem.save();
            }

            // Replace old items with new ones
            transaction.items = newItems;
        }

        if (updates.warehouse) transaction.warehouse = updates.warehouse;
        if (updates.status) transaction.status = updates.status;

        // Check if a new videoProof file is uploaded
        if (req.file) {
            const videoProof = req.file.path;
            transaction.videoProof = videoProof;
        }

        // Save the updated transaction
        await transaction.save();
        const updatedTransaction = await Transaction.findById(id).populate('technicianDetail', 'name contact');
        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            updatedTransaction
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

//Return Items at Inventory
module.exports.returnItems = async(req, res) => {
    try{
        const {id} = req.query;
        console.log(req.body);
        const {itemsToReturn} = req.body;
        console.log(id, " ", itemsToReturn);
        if(!id || !itemsToReturn || !Array.isArray(itemsToReturn)){
            return res.status(400).json({
                success: false,
                message: "Transaction ID and itemsToReturn required"
            });
        }

        const transaction = await Transaction.findById(id);
        if(!transaction){
            return res.status(404).json({
                success: false,
                message: "Transaction Not Found"
            });
        }

        for (const item of itemsToReturn){
            const {itemName , quantity} = item;
            const foundItem = await Item.findOne({ itemName });
            if (!foundItem) {
                return res.status(404).json({
                    success: false,
                    message: `Item ${itemName} not found`
                });
            }

            const oldItem = transaction.items.find(item => item.itemName === itemName);
            if (!oldItem || oldItem.quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot return more ${itemName} than was taken`
                });
            }

            // Update stock
            foundItem.stock += quantity;
            foundItem.updatedAt = Date.now();
            await foundItem.save();

            // Log the returned item
            transaction.returnedItems.push({ itemName, quantity, returnDate: Date.now() });

            // Update the original transaction
            // oldItem.quantity -= quantity;
            // if (oldItem.quantity === 0) {
            //     transaction.items = transaction.items.filter(item => item.itemName !== itemName);
            // }
        }

        // Save the updated original transaction
        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Items returned successfully",
            transaction
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

//Delete a transaction using ID
module.exports.deleteTransaction = async(req, res) => {
    const {id} = req.query;
    if(!id){
        return res.status(400).json({
            success: false,
            message: "Transaction ID is required"
        });
    }

    try{
        const deletedTransaction = await Transaction.findByIdAndDelete(id);
        if(!deletedTransaction){
            return res.status(404).json({
                success: false,
                message: "Transaction Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction Removed Successfully",
            deletedTransaction
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}



//Technician Controller
//Get Specific Transaction of Technician
module.exports.getTechnicianTransactions = async(req, res) =>{
    try {
        const transactions = await Transaction.find({ technicianDetail: req.user._id }).populate('technicianDetail');
        if(!transactions){
            return res.status(404).json({
                success: false,
                message: "Data Not Found"
            });
        }

        res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//Update Status of Transaction
module.exports.updateTransactionStatus = async(req, res) => {
    const technicianId = req.user._id;
    const {id} = req.query;
    const {newStatus} = req.body;
    if(!id){
        return res.status(400).json({
            success: false,
            message: "Transaction ID is required"
        });
    }
    if(!newStatus){
        return res.status(400).json({
            success: false,
            message: "Status is required"
        });
    }

    try{
        const transaction = await Transaction.findById(id);
        if(!transaction){
            return res.status(404).json({
                success: false,
                message: "Data Not Found"
            });
        }

        transaction.status = newStatus;
        await transaction.save();
        const updatedStatus = await Transaction.findById(id).populate('technicianDetail');
        res.status(200).json({
            success: true,
            message: "Status Updated Successfully",
            data: updatedStatus
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};