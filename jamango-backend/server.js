const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const slotRoutes = require('./routes/slotRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const stallRoutes = require('./routes/stallRoutes');
const crmRoutes = require('./routes/crmRoutes');
const stallMangoRoutes = require('./routes/stallMangoRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

// High Traffic & Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // protect headers, false for image viewing
app.use(compression()); // gzip compress payloads

// Rate Limiting (Prevent DDoS)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: { message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('JAMANGO API is running...');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/notifications', notificationRoutes);
// Webhook Routes (e.g., Shiprocket tracking)
app.use('/api/webhooks', webhookRoutes);
app.use('/api/stalls', stallRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/stall-mangoes', stallMangoRoutes);
app.use('/api/upload', uploadRoutes);

const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
