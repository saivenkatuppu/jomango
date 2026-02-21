const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createShiprocketOrder, calculateShippingRate } = require('../utils/shiprocket');

// @desc    Create a new order (from cart)
// @route   POST /api/orders
// @access  Public (guest or logged-in)
const createOrder = asyncHandler(async (req, res) => {
    const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items,
        totalAmount,
        paymentMode,
        razorpayOrderId,
        razorpayPaymentId,
        orderNotes,
    } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // Process inventory
    for (const item of items) {
        // Try to find the product. 'item.name' might map to `Product.name` or `Product.variety` + weight etc.
        // Assuming item.name matches product.variety + weight or similar, or we might need productId.
        // Looking at CheckoutPage: item.name is categoryTitle (e.g., "3 KG Box"), item.variant is fullName ("Kesar 3KG")
        // But the schema is Product: { name: "Kesar 3KG", variety: "Kesar", weight: 3... }
        // Let's decrement stock by matching `name: item.variant` or `name: item.name` if variant is absent.

        const productName = item.variant || item.name;
        if (productName) {
            await Product.findOneAndUpdate(
                { name: productName },
                { $inc: { stock: -item.quantity } }
            );
        }
    }

    const order = await Order.create({
        user: req.user ? req.user._id : null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items,
        totalAmount,
        paymentMode: paymentMode || 'online',
        paymentStatus: paymentMode === 'cod' ? 'pending' : 'paid',
        razorpayOrderId: razorpayOrderId || '',
        razorpayPaymentId: razorpayPaymentId || '',
        status: 'Confirmed',
        orderNotes: orderNotes || '',
    });

    // Trigger Shiprocket asynchronously
    createShiprocketOrder(order);

    res.status(201).json(order);
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = asyncHandler(async (req, res) => {
    let orders = await Order.find({})
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .lean();

    if (req.user && req.user.role === 'staff') {
        orders = orders.map((order) => {
            delete order.totalPrice;
            delete order.paymentMethod;
            delete order.paymentResult;
            if (order.items) {
                order.items = order.items.map(item => {
                    delete item.price;
                    return item;
                });
            }
            return order;
        });
    }

    res.json(orders);
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const Product = require('../models/Product'); // Ensure it is available if needed locally

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Out for delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status value');
    }

    // Inventory restoration logic
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
        // Restock items
        for (const item of order.items) {
            const productName = item.variant || item.name;
            if (productName) {
                await Product.findOneAndUpdate(
                    { name: productName },
                    { $inc: { stock: item.quantity } }
                );
            }
        }
    }

    order.status = status;
    const updated = await order.save();
    res.json(updated);
});

// @desc    Get orders for logged-in user
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const conditions = [{ user: req.user._id }];
    if (req.user.email) {
        conditions.push({ customerEmail: req.user.email });
    }
    if (req.user.phone) {
        conditions.push({ customerPhone: req.user.phone });
    }

    const orders = await Order.find({ $or: conditions }).sort({ createdAt: -1 });
    res.json(orders);
});



// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getMyOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Only allow if user is owner or matches email/phone
        const isOwner = (order.user && order.user.toString() === req.user._id.toString()) ||
            (req.user.email && order.customerEmail === req.user.email) ||
            (req.user.phone && order.customerPhone === req.user.phone);

        if (isOwner) {
            res.json(order);
        } else {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Calculate live shipping rate
// @route   POST /api/orders/shipping-rate
// @access  Public
const getShippingRate = asyncHandler(async (req, res) => {
    const { pincode, items } = req.body;

    if (!pincode || pincode.length !== 6) {
        return res.status(400).json({ message: 'Invalid pincode' });
    }

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Cart items required' });
    }

    // Calculate total weight from items array in কেজি
    const totalWeight = items.reduce((acc, item) => {
        const w = (item.name || '').match(/(\d+)\s?KG/i);
        return acc + (w ? parseFloat(w[1]) : 3) * item.quantity;
    }, 0);

    const shippingCost = await calculateShippingRate(pincode, totalWeight);

    res.json({ shippingCost });
});

module.exports = {
    createOrder,
    getAdminOrders,
    updateOrderStatus,
    getMyOrders,
    getMyOrderById,
    getShippingRate,
};
