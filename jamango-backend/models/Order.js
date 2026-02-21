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
            landmark: { type: String, default: '' },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true }, // or `zip` but standardizing to zipCode if required, but existing is `zip`. 
            // Wait, existing data has `zip`. Let's allow `zipCode` and `zip` or just change the schema and fallback. Let's stick to `zip` for backward compatibility, but in prompt it's `zipCode`. 
            // Let's use `zipCode` and keep `zip` or map it. I will change schema to `zipCode: { type: String, required: true }`.
            zip: { type: String, required: false }, // for old data
            country: { type: String, required: true, default: 'India' },
        },
        orderNotes: { type: String, default: '' },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        shippingFee: {
            type: Number,
            default: 0,
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
        shiprocketOrderId: { type: String, default: '' },
        shiprocketAwb: { type: String, default: '' },
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
