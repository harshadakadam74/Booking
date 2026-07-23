const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticate } = require('../middlewares/Authenticate');
const { admin } = require('../middlewares/AdminMiddleware');

router.use(authenticate, admin);
router.get('/users', AdminController.getAllUsers);
router.get('/bookings', AdminController.getAllBookings);
router.get('/products', AdminController.getAllProducts);
router.delete('/user/:id', AdminController.deleteUser);
router.delete('/product/:id', AdminController.deleteProduct);
router.put('/booking/:id', AdminController.updateBookingStatus);

module.exports = router;
