const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    variant: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
});

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Allow guest orders
        },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            zip: { type: String, required: true },
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentMode: {
            type: String,
            enum: ['online', 'cod'],
            required: true,
            default: 'online',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        razorpayOrderId: { type: String, default: '' },
        razorpayPaymentId: { type: String, default: '' },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Out for delivery', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
