const asyncHandler = require('express-async-handler');
const Stall = require('../models/Stall');
const User = require('../models/User');

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
        email: ownerEmail || `${stallId.toLowerCase()}@jamango.in`,
        phone: ownerMobile,
        password: ownerMobile,
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
                    password: ownerMobile
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
        stall.stallName = req.body.stallName || stall.stallName;
        stall.ownerName = req.body.ownerName || stall.ownerName;
        stall.location = req.body.location || stall.location;
        stall.status = req.body.status || stall.status;
        stall.address = req.body.address || stall.address;
        stall.stallType = req.body.stallType || stall.stallType;

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
        // Find associated user and delete them as well
        await User.findOneAndDelete({ assignedStall: stall._id });
        await Stall.findByIdAndDelete(stall._id);
        res.json({ message: 'Stall and owner account deleted successfully' });
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
