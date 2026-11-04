const express = require('express');
const PropertyController = require('../controllers/PropertyController');
const PropertyOwnerController = require('../controllers/PropertyOwnerController');
const { authenticate } = require('../middlewares/Authenticate');
const { propertyOwner } = require('../middlewares/PropertyOwnerMiddleware');

const router = express.Router();

router.get('/owner', authenticate, propertyOwner, PropertyOwnerController.listOwnProperties);
router.post('/owner', authenticate, propertyOwner, PropertyOwnerController.submitProperty);
router.put('/owner/:id', authenticate, propertyOwner, PropertyOwnerController.updateOwnProperty);
router.patch('/owner/:id/status', authenticate, propertyOwner, PropertyOwnerController.setOwnPropertyStatus);
router.delete('/owner/:id', authenticate, propertyOwner, PropertyOwnerController.deleteOwnProperty);
router.get('/search', PropertyController.getProperties);
router.get('/', PropertyController.getProperties);
router.get('/nearby', PropertyController.getNearbyProperties);

module.exports = router;