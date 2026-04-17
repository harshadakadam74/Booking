const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.post('/register',AuthController.register);
router.post('/login',AuthController.login);
router.post('/logout',AuthController.logout);
router.post('/forgot-password',AuthController.forgotPassword);
router.post('/reset-password',AuthController.resetPassword);
router.get('/users', AuthenticatorResponse,admin('ADMIN'),AuthController.getAllUsers);
router.get('/profile',Authenticate, AuthController.getUserProfile);
router.put('/update',Authenticate, AuthController.updateProfile);

module.exports = router;