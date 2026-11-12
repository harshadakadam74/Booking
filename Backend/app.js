const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const { errorHandler } = require('./middlewares/ErrorMiddleware');
const { createCorsOptions } = require('./config/corsOptions');

app.use(cors(createCorsOptions()));
app.use(express.json({ limit: '5mb' }));

const Auth_Route = require('./routes/AuthRoutes');
const User_Route = require('./routes/UserRoutes');
const Booking_Route = require('./routes/BookingRoutes');
const Cart_Route = require('./routes/CartRoutes');
const Product_Route = require('./routes/ProductRoutes');
const Payment_Route = require('./routes/PaymentRoutes');
const Review_Route = require('./routes/ReviewRoutes');
const Admin_Route = require('./routes/AdminRoutes');
const Property_Route = require('./routes/PropertyRoutes');
const AI_Route = require('./routes/AIRoutes');
const Destination_Route = require('./routes/DestinationRoutes');

app.get('/api/v1/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  return res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    database: ready ? 'connected' : 'disconnected',
  });
});

app.use('/api/v1/auth', Auth_Route);
app.use('/api/v1/user', User_Route);
app.use('/api/v1/bookings', Booking_Route);
app.use('/api/v1/cart', Cart_Route);
app.use('/api/v1/products', Product_Route);
app.use('/api/v1/payments', Payment_Route);
app.use('/api/v1/reviews', Review_Route);
app.use('/api/v1/admin', Admin_Route);
app.use('/api/v1/properties', Property_Route);
app.use('/api/v1/hotels', Property_Route);
app.use('/api/v1/destinations', Destination_Route);
app.use('/api/v1/ai', AI_Route);

app.use(errorHandler);

module.exports = app;