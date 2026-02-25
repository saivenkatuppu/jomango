const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Stall = require('../models/Stall');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user && user.status === 'disabled') {
                res.status(403);
                throw new Error('Account disabled');
            }
            req.user = user;
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
};

const adminOrStaff = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized for admin/staff dashboard');
    }
};

const stallOrAdmin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'admin' || req.user.role === 'stall_owner' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as stall owner, staff or admin');
    }
};

const checkStallLock = asyncHandler(async (req, res, next) => {
    // Admins are never blocked by stall locks
    if (req.user && (req.user.isAdmin || req.user.role === 'admin')) {
        return next();
    }

    // Check if the user is a stall owner and has an assigned stall
    if (req.user && req.user.role === 'stall_owner' && req.user.assignedStall) {
        const stall = await Stall.findById(req.user.assignedStall);
        if (stall && stall.isLocked) {
            res.status(403);
            throw new Error('Your stall is currently locked by the administrator. Operations are read-only.');
        }
    }

    next();
});

module.exports = { protect, admin, adminOrStaff, stallOrAdmin, checkStallLock };
