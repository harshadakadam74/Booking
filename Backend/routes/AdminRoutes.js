const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticate } = require('../middlewares/Authenticate');
const { admin } = require('../middlewares/AdminMiddleware');

router.use(authenticate, admin);
router.get('/dashboard', AdminController.getDashboard);
router.get('/hotels', AdminController.getAllProperties);
router.post('/hotels', AdminController.createProperty);
router.put('/hotels/:id', AdminController.updateProperty);
router.patch('/hotels/:id/status', AdminController.updatePropertyStatus);
router.patch('/hotels/:id/approval', AdminController.updatePropertyApprovalStatus);
router.delete('/hotels/:id', AdminController.deleteProperty);
router.get('/bookings', AdminController.getAllBookings);
router.patch('/bookings/:id/status', AdminController.updateBookingStatus);
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createAdmin);
router.patch('/users/:id/role', AdminController.setUserRole);
router.get('/properties', AdminController.getAllProperties);
router.post('/properties', AdminController.createProperty);
router.put('/property/:id', AdminController.updateProperty);
router.delete('/property/:id', AdminController.deleteProperty);
router.get('/products', AdminController.getAllProducts);
router.delete('/user/:id', AdminController.deleteUser);
router.delete('/product/:id', AdminController.deleteProduct);
router.put('/booking/:id', AdminController.updateBookingStatus);

module.exports = router;
