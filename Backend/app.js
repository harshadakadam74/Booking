const express = require('express');
const app = express();
const cors = require('cors');
 
app.use(express.json());
app.use(cors());

const Auth_Route = require('./routes/AuthRoutes')
app.use('/api/v1/auth', Auth_Route);

const User_Route = require('./routes/UserRoutes')
app.use('/api/v1/user', User_Route);

const Booking_Route = require('./routes/BookingRoutes')
app.use('/api/v1/bookings', Booking_Route);

const Cart_Route = require('./routes/CartRoutes')
app.use('/api/v1/cart', Cart_Route);

const Product_Route = require('./routes/ProductRoutes')
app.use('/api/v1/products', Product_Route);

module.exports = app;