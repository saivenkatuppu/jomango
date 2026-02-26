const http = require('http');

const data = JSON.stringify({ email: 'saivenkatuppu@gmail.com', password: 'sai123' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });

    res.on('end', () => {
        const parsedData = JSON.parse(rawData);
        if (!parsedData.token) {
            console.error('Login failed!', parsedData);
            return;
        }

        const token = parsedData.token;
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
                console.log('Stats Response:', statsRaw);
            });
        });
        reqStats.on('error', console.error);
        reqStats.end();
    });
});
req.on('error', console.error);
req.write(data);
req.end();
