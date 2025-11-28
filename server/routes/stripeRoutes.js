const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require('../controllers/stripeController');

router.post('/create-checkout-session', createCheckoutSession);

module.exports = router;