const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/all-users',UserController.getAllUsers);
router.get()

module.exports = router;