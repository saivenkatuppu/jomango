const axios = require('axios');

let token = null;
let tokenExpiry = null;

// Helper: Login to Shiprocket and get Token
const getShiprocketToken = async () => {
    // If token exists and is valid (less than 9 days old - token valid for 10 days), return it
    if (token && tokenExpiry && new Date() < tokenExpiry) {
        return token;
    }

    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        });

        token = response.data.token;
        // Set expiry to 9 days from now (APIs usually valid for 10 days)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 9);
        tokenExpiry = expiryDate;

        return token;
    } catch (error) {
        console.error('Shiprocket Login Failed:', error.response?.data || error.message);
        throw new Error('Shiprocket Authentication Failed');
    }
};

// Main: Create Order in Shiprocket
const createShiprocketOrder = async (order) => {
    try {
        const token = await getShiprocketToken();

        // 1. Format date (YYYY-MM-DD HH:mm)
        const date = new Date(order.createdAt || Date.now());
        const formattedDate = date.toISOString().slice(0, 10) + ' ' + date.toTimeString().slice(0, 5);

        // 2. Map Items
        const orderItems = order.items.map(item => ({
            name: item.name + (item.variant ? ` - ${item.variant}` : ''),
            sku: item.variant || item.name,
            units: item.quantity,
            selling_price: item.price,
            discount: 0,
            tax: 0,
            hsn: 441211 // Standard HSN for some wood/fruits, needs update based on exact mango HSN (08045020 or similar)
        }));

        // 3. Construct Payload
        const payload = {
            order_id: order._id.toString(),
            order_date: formattedDate,
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION_ID || 'Primary', // Must match your added pickup location name in Shiprocket dashboard
            billing_customer_name: order.customerName.split(' ')[0], // First Name
            billing_last_name: order.customerName.split(' ').slice(1).join(' ') || '.', // Last Name
            billing_address: order.shippingAddress.address,
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.zip,
            billing_state: "Andhra Pradesh", // Defaulting, ideally should come from address or zip lookup
            billing_country: "India",
            billing_email: order.customerEmail,
            billing_phone: order.customerPhone,
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: order.paymentMode === 'cod' ? 'COD' : 'Prepaid',
            sub_total: order.totalAmount,
            length: 30, // Approx box dimensions for 3kg/5kg
            breadth: 20,
            height: 15,
            weight: order.items.reduce((acc, item) => {
                // Approximate weight calc: "5 KG Box" -> 5
                const w = item.name.match(/(\d+)\s?KG/i);
                return acc + (w ? parseFloat(w[1]) : 3) * item.quantity;
            }, 0)
        };

        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Shiprocket Order Created: ${response.data.order_id}`);
        return response.data;

    } catch (error) {
        console.error('Shiprocket Order Creation Failed:', error.response?.data || error.message);
        // We log but don't throw, to strictly avoid breaking the user's checkout experience if shipping fails
        return null;
    }
};

module.exports = { createShiprocketOrder };
