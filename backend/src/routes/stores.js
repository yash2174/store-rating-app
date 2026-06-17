const express = require('express');
const router = express.Router();

const { getStores, submitRating } = require('../controllers/storeController');
const { getMyStoreDashboard } = require('../controllers/ownerController');
const { authenticate, requireRole } = require('../middleware/auth');

// Normal users - browse and rate stores
router.get('/', authenticate, requireRole('user'), getStores);
router.post('/:storeId/ratings', authenticate, requireRole('user'), submitRating);

// Store owner - view own store dashboard
router.get('/my-store', authenticate, requireRole('store_owner'), getMyStoreDashboard);

module.exports = router;
