const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Map Shiprocket statuses to your order statuses
const statusMap = {
    'PICKUP SCHEDULED': 'Confirmed',
    'PICKED UP': 'Confirmed',
    'IN TRANSIT': 'Out for delivery',
    'OUT FOR DELIVERY': 'Out for delivery',
    'DELIVERED': 'Delivered',
    'UNDELIVERED': 'Out for delivery',
    'CANCELLED': 'Cancelled',
    'RTO INITIATED': 'Cancelled',
    'RTO DELIVERED': 'Cancelled',
};

// @desc    Receive tracking shipment status webhooks
// @route   POST /api/webhooks/tracking
// @access  Public (protected by token in header)
router.post('/tracking', async (req, res) => {
    try {
        // Verify the secret token sent by Shiprocket in the x-api-key header
        const token = req.headers['x-api-key'];
        const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;

        if (expectedToken && token !== expectedToken) {
            console.warn('Shiprocket webhook: Invalid token received');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const body = req.body;
        console.log('Shiprocket webhook received:', JSON.stringify(body, null, 2));

        // Shiprocket sends different payload shapes. Handle both.
        const shiprocketOrderId = body.order_id || body.awb_code;
        const shiprocketStatus = (body.current_status || body.status || '').toUpperCase().trim();
        const awbCode = body.awb_code || body.awb || '';

        if (!shiprocketOrderId && !awbCode) {
            return res.status(200).json({ message: 'No identifiable order in payload' });
        }

        // Map Shiprocket status to our internal status
        const newStatus = statusMap[shiprocketStatus];

        if (!newStatus) {
            console.log(`Shiprocket webhook: Unrecognized status "${shiprocketStatus}", skipping.`);
            return res.status(200).json({ message: 'Status not mapped, skipping.' });
        }

        // Find the order by Shiprocket order ID stored in the order
        // We store the Shiprocket order ID in razorpayOrderId field or a dedicated field
        // Try to match by awb code or shiprocket order id stored in order
        let order = null;

        if (awbCode) {
            order = await Order.findOne({ shiprocketAwb: awbCode });
        }

        if (!order && shiprocketOrderId) {
            order = await Order.findOne({ shiprocketOrderId: String(shiprocketOrderId) });
        }

        if (!order) {
            console.warn(`Shiprocket webhook: No order found for shiprocket_id=${shiprocketOrderId}, awb=${awbCode}`);
            // Return 200 so Shiprocket doesn't retry
            return res.status(200).json({ message: 'Order not found in our system, skipping.' });
        }

        // Only update if status is progressing forward (don't downgrade)
        const statusOrder = ['Pending', 'Confirmed', 'Out for delivery', 'Delivered', 'Cancelled'];
        const currentIndex = statusOrder.indexOf(order.status);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex > currentIndex || newStatus === 'Cancelled') {
            order.status = newStatus;
            if (awbCode) order.shiprocketAwb = awbCode;
            await order.save();
            console.log(`Order ${order._id} status updated to "${newStatus}" via Shiprocket webhook.`);
        } else {
            console.log(`Order ${order._id} status NOT updated (${order.status} -> ${newStatus} is not a forward move).`);
        }

        res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Shiprocket webhook error:', error);
        // Still return 200 so Shiprocket doesn't keep retrying
        res.status(200).json({ message: 'Error processing webhook' });
    }
});

module.exports = router;
