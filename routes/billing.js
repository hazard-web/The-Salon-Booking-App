const express = require('express');
const { billingPage, success_url, fetchServices, createCheckoutSession, paymentSuccess, getBillingHistory } = require('../controllers/billing');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const billingRouter = express.Router();

billingRouter.get('/', billingPage);

billingRouter.get('/services', authMiddleware, roleMiddleware('Customer'), fetchServices);

billingRouter.post('/create-checkout-session', authMiddleware, roleMiddleware('Customer'), createCheckoutSession);

billingRouter.post('/payment-success', authMiddleware, roleMiddleware('Customer'), paymentSuccess);

billingRouter.get('/billing-history', authMiddleware, roleMiddleware('Customer'), getBillingHistory);

module.exports = billingRouter;
