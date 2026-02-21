const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get dashboard stats + recent orders
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6); // last 7 days

    const [
        totalOrders,
        todayOrders,
        pendingOrders,
        deliveredToday,
        revenueResult,
        todayRevenueResult,
        recentOrders,
        lowStockProducts,
        weeklyOrders,
        productBreakdown,
        todayBoxesResult,
        todayBoxesByPaymentResult,
        cancelledTodayResult,
    ] = await Promise.all([
        // Total orders ever
        Order.countDocuments(),
        // Today's orders
        Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        // Pending orders
        Order.countDocuments({ status: 'Pending' }),
        // Delivered today
        Order.countDocuments({ status: 'Delivered', createdAt: { $gte: startOfToday } }),
        // Total revenue (paid orders, not cancelled)
        Order.aggregate([
            { $match: { paymentStatus: 'paid', status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        // Today's revenue
        Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfToday }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        // Recent 5 orders
        Order.find({}).sort({ createdAt: -1 }).limit(5),
        // Low stock products (stock < 15)
        Product.find({ stock: { $lt: 15 }, active: true }).select('name stock'),
        // Orders per day for last 7 days (not cancelled)
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        // Product name breakdown from order items
        Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    count: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                },
            },
            { $sort: { count: -1 } },
        ]),
        // Boxes ordered today
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            { $unwind: '$items' },
            { $group: { _id: null, totalBoxes: { $sum: '$items.quantity' } } }
        ]),
        // Boxes ordered today grouped by payment mode
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            { $unwind: '$items' },
            { $group: { _id: '$paymentMode', totalBoxes: { $sum: '$items.quantity' } } }
        ]),
        // Cancelled orders today
        Order.countDocuments({ status: 'Cancelled', createdAt: { $gte: startOfToday } })
    ]);

    let totalRevenue = revenueResult[0]?.total || 0;
    let todayRevenue = todayRevenueResult[0]?.total || 0;
    let avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    let processedRecentOrders = recentOrders;
    let processedWeeklyOrders = weeklyOrders;
    let processedProductBreakdown = productBreakdown;

    if (req.user && req.user.role === 'staff') {
        totalRevenue = 0;
        todayRevenue = 0;
        avgOrderValue = 0;

        processedRecentOrders = recentOrders.map((ro) => {
            const copy = JSON.parse(JSON.stringify(ro));
            delete copy.totalAmount;
            return copy;
        });

        processedWeeklyOrders = weeklyOrders.map((wo) => {
            const copy = { ...wo };
            delete copy.revenue;
            return copy;
        });

        processedProductBreakdown = productBreakdown.map((pb) => {
            const copy = { ...pb };
            delete copy.revenue;
            return copy;
        });
    }

    const boxesToday = todayBoxesResult[0]?.totalBoxes || 0;
    const paidBoxesToday = todayBoxesByPaymentResult.find(r => r._id === 'online')?.totalBoxes || 0;
    const cancelledToday = cancelledTodayResult || 0;

    res.json({
        stats: {
            totalOrders,
            todayOrders,
            pendingOrders,
            deliveredToday,
            totalRevenue,
            todayRevenue,
            avgOrderValue,
            boxesToday,
            paidBoxesToday,
            cancelledToday
        },
        recentOrders: processedRecentOrders,
        lowStockProducts,
        weeklyOrders: processedWeeklyOrders,
        productBreakdown: processedProductBreakdown,
    });
});

// @desc    Download Sales & Inventory Report
// @route   GET /api/analytics/report
// @access  Private/Admin|Staff
const getSalesReport = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isStaff = req.user && req.user.role === 'staff';

    // Get all today's orders (including cancelled)
    const orders = await Order.find({
        createdAt: { $gte: startOfToday }
    }).populate('user', 'name email').sort({ createdAt: 1 });

    const products = await Product.find({});

    // Calculate boxes sold today (excluding cancelled) and boxes cancelled today per product
    const boxesSoldToday = {};
    const boxesCancelledToday = {};
    products.forEach(p => {
        boxesSoldToday[p._id.toString()] = 0;
        boxesCancelledToday[p._id.toString()] = 0;
    });

    // Tally boxes sold and cancelled
    orders.forEach(order => {
        order.items.forEach(item => {
            const matchedProduct = products.find(p => p.name === item.name);
            if (matchedProduct) {
                if (order.status === 'Cancelled') {
                    boxesCancelledToday[matchedProduct._id.toString()] += item.quantity;
                } else {
                    boxesSoldToday[matchedProduct._id.toString()] += item.quantity;
                }
            }
        });
    });

    const reportRows = [];

    // Generate row for each order item
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
        const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN');

        order.items.forEach(item => {
            const matchedProduct = products.find(p => p.name === item.name);
            const remainingInv = matchedProduct ? matchedProduct.stock : 0;
            const soldToday = matchedProduct ? boxesSoldToday[matchedProduct._id.toString()] : 0;
            const cancelledTodayQuant = matchedProduct ? boxesCancelledToday[matchedProduct._id.toString()] : 0;
            // Total Inventory start of day conceptually means remaining + soldToday. 
            // Cancelled items were added back to remaining, so they don't offset startOfDayInv.
            const startOfDayInv = remainingInv + soldToday;

            const row = {
                orderId: order._id.toString(),
                productName: item.name,
                productVariant: item.variant || '',
                boxesSoldInThisOrder: item.quantity,
                orderDate,
                orderTime,
                totalInventoryStartOfDay: startOfDayInv,
                totalBoxesSoldToday: soldToday,
                cancelledQuantityToday: cancelledTodayQuant,
                remainingInventoryNow: remainingInv,
                orderStatus: order.status === 'Cancelled' ? 'Cancelled (Added back to inventory)' : 'Completed'
            };

            // Admin only fields
            if (!isStaff) {
                row.revenuePerOrder = order.totalAmount;
                row.productPrice = item.price;
                row.itemRevenue = order.status === 'Cancelled' ? 0 : (item.price * item.quantity);
            }

            reportRows.push(row);
        });
    });

    res.json(reportRows);
});

module.exports = {
    getDashboardStats,
    getSalesReport,
};
