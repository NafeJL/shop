const express = require('express');
const router = express.Router();
const { getAllOrders, shipOrder } = require('../controllers/orderController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Admin check all routes in this file
router.use(requireAdmin);

router.get('/', getAllOrders);
router.put('/:id/ship', shipOrder);

module.exports = router;