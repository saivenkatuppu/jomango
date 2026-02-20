const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createShiprocketOrder } = require('../utils/shiprocket');

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
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

module.exports = {
    createOrder,
    getAdminOrders,
    updateOrderStatus,
    getMyOrders,
};
