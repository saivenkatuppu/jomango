const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');
require('./models/User.js');
require('./models/Stall.js');
require('./models/StallCustomer.js');
const test = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User');
    const users = await User.find({ role: 'stall_owner' });
    const http = require('http');

    const getReq = (path, token) => new Promise((resolve) => {
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

    for (let u of users) {
        const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET);
        const stats = await getReq('/api/crm/stats', token);
        const custs = await getReq('/api/crm/customers', token);
        console.log(`User: ${u.email} (${u._id}) - Stats: ${stats.status}, Custs: ${custs.status}`);
        if (stats.status >= 400 || custs.status >= 400) {
            console.error('ERROR DATA:', stats.status >= 400 ? stats.data : custs.data);
        }
    }
    process.exit();
}
test().catch(console.error);
