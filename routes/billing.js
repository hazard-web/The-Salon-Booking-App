const express = require('express');
const { billingPage, success_url, fetchServices, createCheckoutSession, paymentSuccess, getBillingHistory } = require('../controllers/billing');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const billingRouter = express.Router();

billingRouter.get('/', billingPage);

billingRouter.get('/services', authMiddleware, roleMiddleware('Customer'), fetchServices);

billingRouter.post('/create-checkout-session', authMiddleware, roleMiddleware('Customer'), createCheckoutSession);

// billingRouter.get('/success', success_url);

// Route to handle successful payment
billingRouter.post('/payment-success', authMiddleware, roleMiddleware('Customer'), paymentSuccess);

// Route to get billing history
billingRouter.get('/billing-history', authMiddleware, roleMiddleware('Customer'), getBillingHistory);

module.exports = billingRouter;
