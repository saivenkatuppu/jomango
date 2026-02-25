const axios = require('axios');

async function testLock() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/users/login', {
            email: 'jamango@gmail.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Fetching stalls...');

        const stallsRes = await axios.get('http://localhost:5000/api/stalls', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const stall = stallsRes.data[0];

        if (!stall) {
            console.log('No stalls found.');
            return;
        }

        console.log(`Toggling lock for stall: ${stall.stallName} (current isLocked: ${stall.isLocked})...`);

        const lockRes = await axios.put(`http://localhost:5000/api/stalls/${stall._id}/lock`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success! New isLocked status:', lockRes.data.isLocked);

        console.log('Toggling back to original state...');
        const unlockRes = await axios.put(`http://localhost:5000/api/stalls/${stall._id}/lock`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success! Reverted isLocked status:', unlockRes.data.isLocked);

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

testLock();
