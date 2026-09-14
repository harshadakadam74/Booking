const express = require('express');
const PropertyController = require('../controllers/PropertyController');

const router = express.Router();

router.get('/', PropertyController.getProperties);
router.get('/nearby', PropertyController.getNearbyProperties);

module.exports = router;