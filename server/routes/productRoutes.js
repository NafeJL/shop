const express = require('express');
const router = express.Router();
const { getProducts, seedProducts, getProductById } = require('../controllers/productController');
// When the user visits /api/products/
router.get('/', getProducts);

// When the user visits /api/products/seed
const { requireAdmin } = require('../middleware/authMiddleware');
router.get('/seed', requireAdmin, seedProducts);

router.get('/:id', getProductById);

module.exports = router;