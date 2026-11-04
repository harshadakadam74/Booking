const express = require('express');
const DestinationController = require('../controllers/DestinationController');
const { authenticate } = require('../middlewares/Authenticate');
const { admin } = require('../middlewares/AdminMiddleware');

const router = express.Router();

router.get('/', DestinationController.searchDestinations);
router.get('/admin', authenticate, admin, DestinationController.getAdminDestinations);
router.post('/', authenticate, admin, DestinationController.createDestination);
router.put('/:id', authenticate, admin, DestinationController.updateDestination);
router.patch('/:id/status', authenticate, admin, DestinationController.setDestinationStatus);
router.delete('/:id', authenticate, admin, DestinationController.deleteDestination);

module.exports = router;
