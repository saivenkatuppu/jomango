const asyncHandler = require('express-async-handler');
const Slot = require('../models/Slot');

// @desc    Get all slots
// @route   GET /api/slots
// @access  Public
const getSlots = asyncHandler(async (req, res) => {
    const slots = await Slot.find({}).sort({ startTime: 1 });
    res.json(slots);
});

// @desc    Create a slot
// @route   POST /api/slots
// @access  Public (admin panel — no JWT for now)
const createSlot = asyncHandler(async (req, res) => {
    const { label, startTime, endTime, maxOrders, enabled } = req.body;

    if (!label || !startTime || !endTime) {
        res.status(400);
        throw new Error('Label, startTime, and endTime are required');
    }

    const slot = await Slot.create({
        label,
        startTime,
        endTime,
        maxOrders: maxOrders || 20,
        currentOrders: 0,
        enabled: enabled !== undefined ? enabled : true,
    });

    res.status(201).json(slot);
});

// @desc    Update a slot (toggle enabled, change maxOrders)
// @route   PUT /api/slots/:id
// @access  Public (admin panel)
const updateSlot = asyncHandler(async (req, res) => {
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    const { label, startTime, endTime, maxOrders, enabled, currentOrders } = req.body;

    slot.label = label ?? slot.label;
    slot.startTime = startTime ?? slot.startTime;
    slot.endTime = endTime ?? slot.endTime;
    slot.maxOrders = maxOrders ?? slot.maxOrders;
    slot.enabled = enabled !== undefined ? enabled : slot.enabled;
    slot.currentOrders = currentOrders ?? slot.currentOrders;

    const updated = await slot.save();
    res.json(updated);
});

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Public (admin panel)
const deleteSlot = asyncHandler(async (req, res) => {
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    await slot.deleteOne();
    res.json({ message: 'Slot removed' });
});

module.exports = { getSlots, createSlot, updateSlot, deleteSlot };
