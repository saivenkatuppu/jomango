const asyncHandler = require('express-async-handler');
const StallMango = require('../models/StallMango');

// @desc    Get mangoes for a stall
// @route   GET /api/stall-mangoes
// @access  Private
const getStallMangoes = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'stall_owner') {
        query = { stall: req.user.assignedStall };
    } else if (req.query.stallId) {
        query = { stall: req.query.stallId };
    }

    const mangoes = await StallMango.find(query);
    res.json(mangoes);
});

// @desc    Get global mango templates
// @route   GET /api/stall-mangoes/templates
// @access  Private
const getGlobalTemplates = asyncHandler(async (req, res) => {
    const templates = await StallMango.find({ isGlobalTemplate: true });
    res.json(templates);
});

// @desc    Create a mango entry for a stall (or global if admin)
// @route   POST /api/stall-mangoes
// @access  Private
const addStallMango = asyncHandler(async (req, res) => {
    const { variety, ripeningType, price, priceUnit, weight, quantity, qualityGrade, status, isGlobalTemplate, mrp, showDiscount, discountLabel, description, showBadge, badgeType, badge } = req.body;

    if (isGlobalTemplate && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to create global templates');
    }

    const stallData = isGlobalTemplate ? {} : {
        stallId: req.user.role === 'admin' ? req.body.stallIdString : req.user.stallId,
        stall: req.user.role === 'admin' ? req.body.stall : req.user.assignedStall,
    };

    if (!isGlobalTemplate && !stallData.stall) {
        res.status(400);
        throw new Error('Stall reference is required');
    }

    const mango = await StallMango.create({
        ...stallData,
        variety,
        ripeningType,
        price,
        priceUnit,
        weight,
        quantity,
        qualityGrade,
        status,
        mrp,
        showDiscount,
        discountLabel,
        description,
        showBadge,
        badgeType,
        badge,
        isGlobalTemplate: Boolean(isGlobalTemplate),
    });

    res.status(201).json(mango);
});

// @desc    Update a mango entry
// @route   PUT /api/stall-mangoes/:id
// @access  Private
const updateStallMango = asyncHandler(async (req, res) => {
    const mango = await StallMango.findById(req.params.id);

    if (!mango) {
        res.status(404);
        throw new Error('Mango not found');
    }

    if (mango.isGlobalTemplate && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to edit global templates');
    }

    if (!mango.isGlobalTemplate && req.user.role !== 'admin' && String(mango.stall) !== String(req.user.assignedStall)) {
        res.status(403);
        throw new Error('Not authorized to edit this mango');
    }

    mango.variety = req.body.variety || mango.variety;
    mango.ripeningType = req.body.ripeningType || mango.ripeningType;
    mango.price = req.body.price !== undefined ? req.body.price : mango.price;
    mango.priceUnit = req.body.priceUnit || mango.priceUnit;
    mango.weight = req.body.weight !== undefined ? req.body.weight : mango.weight;
    mango.quantity = req.body.quantity !== undefined ? req.body.quantity : mango.quantity;
    mango.qualityGrade = req.body.qualityGrade || mango.qualityGrade;
    mango.status = req.body.status || mango.status;
    mango.mrp = req.body.mrp !== undefined ? req.body.mrp : mango.mrp;
    mango.showDiscount = req.body.showDiscount !== undefined ? req.body.showDiscount : mango.showDiscount;
    mango.discountLabel = req.body.discountLabel !== undefined ? req.body.discountLabel : mango.discountLabel;
    mango.description = req.body.description !== undefined ? req.body.description : mango.description;
    mango.showBadge = req.body.showBadge !== undefined ? req.body.showBadge : mango.showBadge;
    mango.badgeType = req.body.badgeType !== undefined ? req.body.badgeType : mango.badgeType;
    mango.badge = req.body.badge !== undefined ? req.body.badge : mango.badge;

    const updatedMango = await mango.save();
    res.json(updatedMango);
});

// @desc    Delete a mango entry
// @route   DELETE /api/stall-mangoes/:id
// @access  Private
const deleteStallMango = asyncHandler(async (req, res) => {
    const mango = await StallMango.findById(req.params.id);

    if (!mango) {
        res.status(404);
        throw new Error('Mango not found');
    }

    if (mango.isGlobalTemplate && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete global templates');
    }

    if (!mango.isGlobalTemplate && req.user.role !== 'admin' && String(mango.stall) !== String(req.user.assignedStall)) {
        res.status(403);
        throw new Error('Not authorized to delete this mango');
    }

    await StallMango.findByIdAndDelete(mango._id);
    res.json({ message: 'Mango removed' });
});

module.exports = {
    getStallMangoes,
    getGlobalTemplates,
    addStallMango,
    updateStallMango,
    deleteStallMango,
};
