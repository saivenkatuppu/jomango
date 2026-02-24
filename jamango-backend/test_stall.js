const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('./models/User.js');
require('./models/Stall.js');
require('./models/StallCustomer.js');
const mongooseConnect = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User');
    const user = await User.findOne({ role: 'stall_owner' });
    if (!user) { console.log('No stall owner found'); process.exit(); }
    console.log('User found:', user.role);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const http = require('http');

    const getReq = (path) => new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.end();
    });

    try {
        console.log('STATS:', await getReq('/api/crm/stats'));
    } catch (e) {
        console.error('STATS Error:', e);
    }

    try {
        console.log('CUSTOMERS:', await getReq('/api/crm/customers'));
    } catch (e) {
        console.error('CUSTOMERS Error:', e);
    }
    process.exit();
}
mongooseConnect().catch(console.error);
