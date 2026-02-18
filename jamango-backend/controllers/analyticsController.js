const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

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
    ] = await Promise.all([
        // Total orders ever
        Order.countDocuments(),
        // Today's orders
        Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        // Pending orders
        Order.countDocuments({ status: 'Pending' }),
        // Delivered today
        Order.countDocuments({ status: 'Delivered', createdAt: { $gte: startOfToday } }),
        // Total revenue (paid orders)
        Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        // Today's revenue
        Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        // Recent 5 orders
        Order.find({}).sort({ createdAt: -1 }).limit(5),
        // Low stock products (stock < 15)
        Product.find({ stock: { $lt: 15 }, active: true }).select('name stock'),
        // Orders per day for last 7 days
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfWeek } } },
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
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.json({
        stats: {
            totalOrders,
            todayOrders,
            pendingOrders,
            deliveredToday,
            totalRevenue,
            todayRevenue,
            avgOrderValue,
        },
        recentOrders,
        lowStockProducts,
        weeklyOrders,
        productBreakdown,
    });
});

module.exports = { getDashboardStats };
