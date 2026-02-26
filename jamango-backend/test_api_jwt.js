const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const user = await User.findOne({ isAdmin: true });

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const today = new Date().toISOString().split('T')[0];
    const statsPath = `/api/analytics/stats?startDate=${today}&endDate=${today}`;

    const reqStats = http.request({
        hostname: 'localhost',
        port: 5000,
        path: statsPath,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }, (resStats) => {
        let statsRaw = '';
        resStats.on('data', chunk => statsRaw += chunk);
        resStats.on('end', () => {
            const data = JSON.parse(statsRaw);
            console.log('Today Orders from API:', data?.stats?.todayOrders);
            console.log('Recent Orders:', data?.recentOrders?.length);
            console.log('Total Orders from API:', data?.stats?.totalOrders);
            process.exit(0);
        });
    });
    reqStats.on('error', (e) => {
        console.error(e);
        process.exit(1);
    });
    reqStats.end();
}
run();
