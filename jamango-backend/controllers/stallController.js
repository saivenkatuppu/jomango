const Stall = require('../models/Stall');
const User = require('../models/User');
const StallCustomer = require('../models/StallCustomer');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Create a new stall and its owner account
// @route   POST /api/stalls
// @access  Private/Admin
const createStall = asyncHandler(async (req, res) => {
    const {
        stallName,
        stallId,
        ownerName,
        ownerMobile,
        ownerEmail,
        password, // Accept password from frontend
        location,
        address,
        stallType,
        operatingDates,
    } = req.body;

    // Check if Stall ID exists
    const stallExists = await Stall.findOne({ stallId });
    if (stallExists) {
        res.status(400);
        throw new Error(`Stall ID "${stallId}" is already taken.`);
    }

    // Check if User Phone exists
    const userExists = await User.findOne({ phone: ownerMobile });
    if (userExists) {
        res.status(400);
        throw new Error(`Mobile number ${ownerMobile} is already registered to another user/stall.`);
    }

    // Create the Stall Owner User Account
    const user = await User.create({
        name: ownerName,
        email: ownerMobile, // Using mobile as the primary login ID (Dashboard Access ID)
        phone: ownerMobile,
        password: password || ownerMobile, // Use assigned password or fallback
        role: 'stall_owner',
        stallId: stallId,
    });

    if (user) {
        try {
            const stall = await Stall.create({
                stallName,
                stallId,
                ownerName,
                ownerMobile,
                ownerEmail,
                location,
                address,
                stallType,
                operatingDates,
                createdBy: req.user._id,
            });

            // Link assignedStall back to user
            user.assignedStall = stall._id;
            await user.save();

            res.status(201).json({
                stall,
                credentials: {
                    username: user.phone,
                    password: password || ownerMobile
                }
            });
        } catch (error) {
            // Rollback user creation if stall creation fails
            await User.findByIdAndDelete(user._id);
            res.status(400);
            throw new Error('Failed to create stall entry: ' + error.message);
        }
    } else {
        res.status(400);
        throw new Error('Invalid stall owner data');
    }
});

// @desc    Get all stalls
// @route   GET /api/stalls
// @access  Private/Admin
const getStalls = asyncHandler(async (req, res) => {
    const stalls = await Stall.find({}).sort({ createdAt: -1 });
    res.json(stalls);
});

// @desc    Get stall by ID
// @route   GET /api/stalls/:id
// @access  Private/Admin|StallOwner
const getStallById = asyncHandler(async (req, res) => {
    const stall = await Stall.findById(req.params.id);

    if (stall) {
        // Access control: Admin or the owner of this stall
        if (req.user.role !== 'admin' && req.user.stallId !== stall.stallId) {
            res.status(403);
            throw new Error('Not authorized to view this stall details');
        }
        res.json(stall);
    } else {
        res.status(404);
        throw new Error('Stall not found');
    }
});

// @desc    Update stall
// @route   PUT /api/stalls/:id
// @access  Private/Admin
const updateStall = asyncHandler(async (req, res) => {
    const stall = await Stall.findById(req.params.id);

    if (stall) {
        if (req.body.stallId && req.body.stallId !== stall.stallId) {
            const idExists = await Stall.findOne({ stallId: req.body.stallId });
            if (idExists) {
                res.status(400);
                throw new Error('This Stall ID is already taken');
            }
        }

        if (req.body.ownerMobile && req.body.ownerMobile !== stall.ownerMobile) {
            const userExists = await User.findOne({ phone: req.body.ownerMobile });
            if (userExists) {
                res.status(400);
                throw new Error('This mobile number is already in use by another account');
            }
        }

        stall.stallName = req.body.stallName || stall.stallName;
        stall.stallId = req.body.stallId || stall.stallId;
        stall.ownerName = req.body.ownerName || stall.ownerName;
        stall.ownerMobile = req.body.ownerMobile || stall.ownerMobile;
        stall.location = req.body.location || stall.location;
        stall.status = req.body.status || stall.status;
        stall.address = req.body.address || stall.address;
        stall.stallType = req.body.stallType || stall.stallType;

        // Sync with the User account associated with this stall
        const user = await User.findOne({ assignedStall: stall._id });
        if (user) {
            user.name = stall.ownerName;
            user.phone = stall.ownerMobile;
            user.email = stall.ownerMobile;
            user.stallId = stall.stallId;

            if (req.body.password) {
                user.password = req.body.password;
            }
            await user.save();
        }

        const updatedStall = await stall.save();
        res.json(updatedStall);
    } else {
        res.status(404);
        throw new Error('Stall not found');
    }
});

// @desc    Delete stall
// @route   DELETE /api/stalls/:id
// @access  Private/Admin
const deleteStall = asyncHandler(async (req, res) => {
    const stall = await Stall.findById(req.params.id);

    if (stall) {
        // 1. Delete the Stall Owner User account
        await User.findOneAndDelete({ assignedStall: stall._id });

        // 2. Delete all CRM customers linked to this stall
        await StallCustomer.deleteMany({ stall: stall._id });

        // 3. Delete any products specific to this stall
        await Product.deleteMany({ stallId: stall.stallId });

        // 4. Finally delete the stall itself
        await Stall.findByIdAndDelete(stall._id);

        res.json({ message: 'Stall, owner, customers and stall products deleted permanently' });
    } else {
        res.status(404);
        throw new Error('Stall not found');
    }
});

module.exports = {
    createStall,
    getStalls,
    getStallById,
    updateStall,
    deleteStall,
};
