const asyncHandler = require('express-async-handler');
const StallCustomer = require('../models/StallCustomer');
const Stall = require('../models/Stall');
const StallMango = require('../models/StallMango');

// @desc    Add a new customer from a stall
// @route   POST /api/crm/customers
// @access  Private/StallOwner|Admin
const addCustomer = asyncHandler(async (req, res) => {
    const { name, mobile, consent, notes, email, purchasedVariety, purchasedQuantity } = req.body;

    // A stall owner's req.user will have stallId and assignedStall (ObjectId)
    if (!req.user.assignedStall && !(req.user.isAdmin || req.user.role === 'admin')) {
        res.status(403);
        throw new Error('User is not assigned to any stall');
    }

    const stallObjectId = req.body.stallObjectId || req.user.assignedStall;
    const stallId = req.body.stallId || req.user.stallId;

    const stallIdString = stallObjectId?.toString() || '';
    if (!stallIdString.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error('Invalid stall ObjectId');
    }

    // Check if customer already exists for THIS stall
    let customer = await StallCustomer.findOne({ mobile, stall: stallObjectId });

    if (customer) {
        customer.name = name || customer.name;
        customer.email = email || customer.email;
        customer.purchasedVariety = purchasedVariety || customer.purchasedVariety;
        customer.purchasedQuantity = purchasedQuantity !== undefined ? purchasedQuantity : customer.purchasedQuantity;
        customer.consent = consent !== undefined ? consent : customer.consent;
        customer.notes = notes || customer.notes;
        await customer.save();
    } else {
        customer = await StallCustomer.create({
            name,
            mobile,
            email,
            purchasedVariety,
            purchasedQuantity,
            stallId,
            stall: stallObjectId,
            consent,
            notes,
            type: 'New'
        });
    }

    // Deduct from Stall Inventory automatically if a variety and quantity were logged
    const qtyPurchased = Number(purchasedQuantity);
    if (purchasedVariety && !isNaN(qtyPurchased) && qtyPurchased > 0) {
        const stallMango = await StallMango.findOne({ stall: stallObjectId, variety: purchasedVariety });
        if (stallMango) {
            stallMango.quantity = Math.max(0, stallMango.quantity - qtyPurchased);
            await stallMango.save();
        }
    }

    res.status(customer.isNew ? 201 : 200).json(customer);
});

// @desc    Get customers (Stall specific or all for Admin)
// @route   GET /api/crm/customers
// @access  Private/StallOwner|Admin
const getCustomers = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'stall_owner') {
        const stallIdString = req.user.assignedStall?.toString() || '';
        if (!stallIdString.match(/^[0-9a-fA-F]{24}$/)) {
            // Invalid ObjectId, return empty
            return res.json([]);
        }
        query = { stall: req.user.assignedStall };
    } else if ((req.user.isAdmin || req.user.role === 'admin') && req.query.stallId) {
        query = { stall: req.query.stallId };
    }

    try {
        const customers = await StallCustomer.find(query)
            .populate('stall', 'stallName stallId')
            .sort({ createdAt: -1 });

        res.json(customers);
    } catch (e) {
        res.json([]);
    }
});

// @desc    Get customer breakdown/counts for Admin or Stall Owner
// @route   GET /api/crm/stats
// @access  Private/Admin|StallOwner
const getCRMStats = asyncHandler(async (req, res) => {
    let matchStage = {};
    if (req.user.role === 'stall_owner') {
        const stallIdString = req.user.assignedStall?.toString() || '';
        if (!stallIdString.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({ totalCustomers: 0, stallWiseCounts: [] });
        }
        matchStage = { stall: req.user.assignedStall };
    }

    try {
        const totalCustomers = await StallCustomer.countDocuments(matchStage);

        const stallWiseCounts = await StallCustomer.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$stall',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'stalls',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'stallInfo'
                }
            },
            {
                $unwind: {
                    path: '$stallInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    stallName: '$stallInfo.stallName',
                    stallId: '$stallInfo.stallId',
                    count: 1
                }
            }
        ]);

        res.json({
            totalCustomers,
            stallWiseCounts
        });
    } catch (e) {
        res.json({ totalCustomers: 0, stallWiseCounts: [] });
    }
});

module.exports = {
    addCustomer,
    getCustomers,
    getCRMStats,
};
