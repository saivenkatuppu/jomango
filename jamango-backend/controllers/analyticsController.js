const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Stall = require('../models/Stall');
const StallMango = require('../models/StallMango');
const StallCustomer = require('../models/StallCustomer');

// @desc    Get dashboard stats + recent orders
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    let rangeStart;
    let rangeEnd;
    let isCustomRange = false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (startDate && endDate) {
        rangeStart = new Date(startDate);
        rangeStart.setHours(0, 0, 0, 0); // Start of day

        rangeEnd = new Date(endDate);
        rangeEnd.setHours(23, 59, 59, 999); // End of day
        isCustomRange = true;
    } else {
        rangeStart = startOfToday;
        rangeEnd = new Date(now);
        rangeEnd.setHours(23, 59, 59, 999);
    }

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6); // default last 7 days for trend if no custom range

    // If custom range is selected, we use that for the trend graph instead of strictly 'weekly'
    const trendStart = isCustomRange ? rangeStart : startOfWeek;
    const trendEnd = isCustomRange ? rangeEnd : new Date(now.setHours(23, 59, 59, 999));

    console.log('[API getDashboardStats] user:', req.user?.email, req.user?.role);
    console.log('[API getDashboardStats] query:', req.query);
    console.log('[API getDashboardStats] rangeStart:', rangeStart);
    console.log('[API getDashboardStats] rangeEnd:', rangeEnd);

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
    ] = await Promise.all([
        // Total orders ever
        Order.countDocuments(),
        // Total orders in range (Replacing todayOrders logic)
        Order.countDocuments({ createdAt: { $gte: rangeStart, $lte: rangeEnd } }),
        // Pending orders in range
        Order.countDocuments({ status: 'Pending', createdAt: { $gte: rangeStart, $lte: rangeEnd } }),
        // Delivered in range
        Order.countDocuments({ status: 'Delivered', createdAt: { $gte: rangeStart, $lte: rangeEnd } }),
        // Total revenue ALL TIME (all valid orders, not cancelled)
        Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        // Selected Dates Revenue
        Order.aggregate([
            { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        // Recent 5 orders inside the range
        Order.find({ createdAt: { $gte: rangeStart, $lte: rangeEnd } }).sort({ createdAt: -1 }).limit(5),
        // Low stock products (stock < 15) - doesn't depend on date
        Product.find({ stock: { $lt: 15 }, active: true }).select('name stock'),
        // Orders per day for trend (not cancelled)
        Order.aggregate([
            { $match: { createdAt: { $gte: trendStart, $lte: trendEnd }, status: { $ne: 'Cancelled' } } },
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
        // Product name breakdown from order items in range
        Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
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
        // Boxes ordered in range
        Order.aggregate([
            { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
            { $unwind: '$items' },
            { $group: { _id: null, totalBoxes: { $sum: '$items.quantity' } } }
        ]),
        // Boxes ordered in range grouped by payment mode
        Order.aggregate([
            { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
            { $unwind: '$items' },
            { $group: { _id: '$paymentMode', totalBoxes: { $sum: '$items.quantity' } } }
        ])
    ]);

    let totalRevenue = revenueResult[0]?.total || 0;
    let todayRevenue = todayRevenueResult[0]?.total || 0;
    
    // Dynamically calculate average based on the selected dates range instead of all time
    let avgOrderValue = todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0;

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

    const payload = {
        stats: {
            totalOrders,
            todayOrders,
            pendingOrders,
            deliveredToday,
            totalRevenue,
            todayRevenue,
            avgOrderValue,
            boxesToday,
            paidBoxesToday
        },
        recentOrders: processedRecentOrders,
        lowStockProducts,
        weeklyOrders: processedWeeklyOrders,
        productBreakdown: processedProductBreakdown,
    };

    console.log('[API getDashboardStats] Response stats:', payload.stats);
    res.json(payload);
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

const getStallInventory = asyncHandler(async (req, res) => {
    const { timeRange } = req.query; // 'today', 'week', 'month', 'season'

    let matchStage = {};
    const now = new Date();
    if (timeRange === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        matchStage.createdAt = { $gte: startOfToday };
    } else if (timeRange === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        matchStage.createdAt = { $gte: startOfWeek };
    } else if (timeRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchStage.createdAt = { $gte: startOfMonth };
    }

    const isStaff = req.user && req.user.role === 'staff';

    const stalls = await Stall.find({ status: 'Active' }).select('stallName stallId _id location');
    const stallMangoes = await StallMango.find({});

    const salesAgg = await StallCustomer.aggregate([
        { $match: { ...matchStage, purchasedVariety: { $exists: true, $ne: '' } } },
        {
            $group: {
                _id: { stall: '$stall', variety: '$purchasedVariety' },
                unitsSold: { $sum: { $ifNull: ['$purchasedQuantity', 1] } }
            }
        }
    ]);

    const trendAgg = await StallCustomer.aggregate([
        { $match: { ...matchStage, purchasedVariety: { $exists: true, $ne: '' } } },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+05:30' } },
                    stall: '$stall',
                    variety: '$purchasedVariety'
                },
                sold: { $sum: { $ifNull: ['$purchasedQuantity', 1] } }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    let totalStockAvailable = 0;
    let totalUnitsSold = 0;
    let totalRevenue = 0;
    let stallsWithInventory = new Set();

    const stallsData = stalls.map(stall => {
        const sMangoes = stallMangoes.filter(m => String(m.stall) === String(stall._id));
        let stallStock = 0;
        let stallSold = 0;
        let stallRevenue = 0;

        const varieties = sMangoes.map(m => {
            const saleRec = salesAgg.find(s => String(s._id.stall) === String(stall._id) && s._id.variety === m.variety);
            const unitsSold = saleRec ? saleRec.unitsSold : 0;
            const revenue = unitsSold * m.price;

            stallStock += m.quantity;
            stallSold += unitsSold;
            stallRevenue += revenue;
            totalStockAvailable += m.quantity;
            totalUnitsSold += unitsSold;
            totalRevenue += revenue;

            if (m.quantity > 0) stallsWithInventory.add(String(stall._id));

            return {
                variety: m.variety,
                currentStock: m.quantity,
                unitsSold,
                priceUnit: m.priceUnit,
                ...(isStaff ? {} : { price: m.price, revenue })
            };
        });

        // Add contribution percentages
        varieties.forEach(v => {
            v.contribution = stallSold > 0 ? Math.round((v.unitsSold / stallSold) * 100) : 0;
        });

        return {
            _id: stall._id,
            stallId: stall.stallId,
            stallName: stall.stallName,
            location: stall.location,
            totalStockAvailable: stallStock,
            totalUnitsSold: stallSold,
            ...(isStaff ? {} : { totalRevenue: stallRevenue }),
            varieties: varieties.sort((a, b) => b.unitsSold - a.unitsSold)
        };
    });

    const trendsMap = {};
    trendAgg.forEach(t => {
        const date = t._id.date;
        if (!date) return;
        const stallId = String(t._id.stall);
        const variety = t._id.variety;
        const sold = t.sold;

        const sm = stallMangoes.find(m => String(m.stall) === stallId && m.variety === variety);
        const price = sm ? sm.price : 0;
        const revenue = sold * price;

        if (!trendsMap[date]) {
            trendsMap[date] = { date, totalSold: 0, ...(isStaff ? {} : { totalRevenue: 0 }) };
        }
        trendsMap[date].totalSold += sold;
        if (!isStaff) {
            trendsMap[date].totalRevenue += revenue;
        }
    });

    const trends = Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
        summary: {
            totalStockAvailable,
            totalUnitsSold,
            activeStallsWithInventory: stallsWithInventory.size,
            ...(isStaff ? {} : { totalRevenue })
        },
        stalls: stallsData.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold),
        trends
    });
});

module.exports = {
    getDashboardStats,
    getSalesReport,
    getStallInventory,
};
