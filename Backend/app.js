const express = require('express');
const app = express();
const cors = require('cors');
const { errorHandler } = require('./middlewares/ErrorMiddleware');
 
app.use(express.json());
app.use(cors());

const Auth_Route = require('./routes/AuthRoutes');
const User_Route = require('./routes/UserRoutes');
const Booking_Route = require('./routes/BookingRoutes');
const Cart_Route = require('./routes/CartRoutes');
const Product_Route = require('./routes/ProductRoutes');
const Payment_Route = require('./routes/PaymentRoutes');
const Review_Route = require('./routes/ReviewRoutes');
const Admin_Route = require('./routes/AdminRoutes');

app.use('/api/v1/auth', Auth_Route);
app.use('/api/v1/user', User_Route);
app.use('/api/v1/bookings', Booking_Route);
app.use('/api/v1/cart', Cart_Route);
app.use('/api/v1/products', Product_Route);
app.use('/api/v1/payments', Payment_Route);
app.use('/api/v1/reviews', Review_Route);
app.use('/api/v1/admin', Admin_Route);

app.use(errorHandler);

module.exports = app;