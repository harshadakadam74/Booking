const express = require('express');
const multer = require('multer');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticate } = require('../middlewares/Authenticate');
const { admin } = require('../middlewares/AdminMiddleware');

router.use(authenticate, admin);
const hotelImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      callback(new Error('Hotel images must be JPEG, PNG, WebP, or GIF files.'));
      return;
    }
    callback(null, true);
  },
});
const parseHotelImage = (req, res, next) => {
  hotelImageUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 20 },
  ])(req, res, (error) => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: error.message });
    }
    return next();
  });
};
router.get('/dashboard', AdminController.getDashboard);
router.get('/hotels/export', AdminController.exportProperties);
router.get('/hotels', AdminController.getAllProperties);
router.post('/hotels', AdminController.createProperty);
router.post('/hotels/import', AdminController.importProperties);
router.post('/hotels/images', parseHotelImage, AdminController.uploadHotelImage);
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
