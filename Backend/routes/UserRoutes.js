const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middlewares/Authenticate');

router.get('/all-users', UserController.getAllUser);
router.get('/profile', authenticate, UserController.getUserProfile);
router.put('/update', authenticate, UserController.updateProfile);

module.exports = router;