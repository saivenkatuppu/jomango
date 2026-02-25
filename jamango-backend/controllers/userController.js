const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, phone, identifier, password } = req.body;

    let user;
    const loginId = identifier || email || phone;

    if (loginId) {
        // Try to find user by either email or phone
        user = await User.findOne({
            $or: [{ email: loginId }, { phone: loginId }]
        });
    }

    if (user && (await user.matchPassword(password))) {
        if (user.status === 'disabled') {
            res.status(403);
            throw new Error('Account is disabled');
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            role: user.role,
            status: user.status,
            stallId: user.stallId,
            assignedStall: user.assignedStall,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!phone || !password || !name) {
        res.status(400);
        throw new Error('Name, Phone, and Password are required');
    }

    const userExists = await User.findOne({ phone });

    if (userExists) {
        res.status(400);
        throw new Error('User with this phone number already exists');
    }

    const userData = {
        name,
        password,
        phone,
    };
    if (email && email.trim() !== '') {
        userData.email = email;
    }

    const user = await User.create(userData);

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            role: user.role,
            status: user.status,
            stallId: user.stallId,
            assignedStall: user.assignedStall,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get all staff (Admin only)
// @route   GET /api/users/staff
// @access  Private/Admin
const getStaffs = asyncHandler(async (req, res) => {
    const staffs = await User.find({ role: 'staff' }).select('-password');
    res.json(staffs);
});

// @desc    Create a staff user (Admin only)
// @route   POST /api/users/staff
// @access  Private/Admin
const createStaff = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const staff = await User.create({
        name,
        email,
        password,
        phone,
        role: 'staff',
        status: 'active'
    });

    if (staff) {
        res.status(201).json({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            status: staff.status
        });
    } else {
        res.status(400);
        throw new Error('Invalid staff data');
    }
});

// @desc    Update staff status/details (Admin only)
// @route   PUT /api/users/staff/:id
// @access  Private/Admin
const updateStaff = asyncHandler(async (req, res) => {
    const staff = await User.findById(req.params.id);

    if (staff && staff.role === 'staff') {
        staff.name = req.body.name || staff.name;
        staff.email = req.body.email || staff.email;
        staff.status = req.body.status || staff.status;
        staff.phone = req.body.phone || staff.phone;

        if (req.body.password) {
            staff.password = req.body.password;
        }

        const updatedStaff = await staff.save();

        res.json({
            _id: updatedStaff._id,
            name: updatedStaff.name,
            email: updatedStaff.email,
            role: updatedStaff.role,
            status: updatedStaff.status,
            phone: updatedStaff.phone
        });
    } else {
        res.status(404);
        throw new Error('Staff not found');
    }
});

// @desc    Delete staff (Admin only)
// @route   DELETE /api/users/staff/:id
// @access  Private/Admin
const deleteStaff = asyncHandler(async (req, res) => {
    const staff = await User.findById(req.params.id);

    if (staff && staff.role === 'staff') {
        await staff.deleteOne();
        res.json({ message: 'Staff removed' });
    } else {
        res.status(404);
        throw new Error('Staff not found');
    }
});

// @desc    Impersonate any user (Admin only)
// @route   POST /api/users/:id/impersonate
// @access  Private/Admin
const impersonateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user && (user.role === 'staff' || user.role === 'stall_owner')) {
        if (user.status === 'disabled') {
            res.status(403);
            throw new Error('Account is disabled');
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role,
            status: user.status,
            stallId: user.stallId,
            assignedStall: user.assignedStall,
            token: generateToken(user._id),
            isImpersonated: true
        });
    } else {
        res.status(404);
        throw new Error('User not found or cannot be impersonated');
    }
});

module.exports = {
    authUser,
    registerUser,
    getStaffs,
    createStaff,
    updateStaff,
    deleteStaff,
    impersonateUser
};
