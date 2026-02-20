const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createShiprocketOrder } = require('../utils/shiprocket');

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: amount * 100, // convert rupees to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await instance.orders.create(options);

        if (!order) {
            res.status(500);
            throw new Error('Failed to create Razorpay order');
        }

        res.json(order);
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Razorpay order creation failed');
    }
});

// @desc    Verify Razorpay Payment & Save Order
// @route   POST /api/payments/verify
// @access  Public
const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        // Order details passed from frontend after payment
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items,
        totalAmount,
        orderNotes,
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Save the confirmed order to DB
        try {
            const order = await Order.create({
                user: req.user ? req.user._id : null,
                customerName: customerName || 'Guest',
                customerEmail: customerEmail || '',
                customerPhone: customerPhone || '',
                shippingAddress: shippingAddress || { address: '', city: '', zip: '' },
                items: items || [],
                totalAmount: totalAmount || 0,
                paymentMode: 'online',
                paymentStatus: 'paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: 'Confirmed',
                orderNotes: orderNotes || '',
            });

            // Trigger Shiprocket asynchronously
            createShiprocketOrder(order);

            // Deduct stock
            if (items && items.length > 0) {
                for (const item of items) {
                    const productName = item.variant || item.name;
                    if (productName) {
                        await Product.findOneAndUpdate(
                            { name: productName },
                            { $inc: { stock: -item.quantity } }
                        );
                    }
                }
            }

            res.json({
                success: true,
                msg: 'Payment verified and order saved',
                orderId: order._id,
            });
        } catch (dbError) {
            // Payment was valid but DB save failed — still return success to avoid double-charge confusion
            console.error('Order save failed after payment:', dbError.message);
            res.json({
                success: true,
                msg: 'Payment verified. Order recording failed — contact support.',
                razorpay_payment_id,
            });
        }
    } else {
        res.status(400);
        throw new Error('Payment verification failed — signature mismatch');
    }
});

module.exports = {
    createOrder,
    verifyPayment,
};
