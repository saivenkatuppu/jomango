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

    const stallExists = await Stall.findOne({ stallId });

    if (stallExists) {
        res.status(400);
        throw new Error('Stall ID already exists');
    }

    // Create the Stall Owner User Account
    // password default to mobile number for initial login
    const user = await User.create({
        name: ownerName,
        email: ownerEmail || `${stallId.toLowerCase()}@jamango.in`,
        phone: ownerMobile,
        password: ownerMobile,
        role: 'stall_owner',
        stallId: stallId,
    });

    if (user) {
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
    } else {
        res.status(400);
        throw new Error('Invalid user data');
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
        // ... update other fields as needed

        const updatedStall = await stall.save();
        res.json(updatedStall);
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
};
