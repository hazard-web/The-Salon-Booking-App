import { Router } from 'express';
import { billingPage, fetchServices, createCheckoutSession, paymentSuccess, getBillingHistory } from '../controllers/billing';

const router = Router();

router.get('/billing', billingPage);
router.get('/services', fetchServices);
router.post('/checkout', createCheckoutSession);
router.post('/payment-success', paymentSuccess);
router.get('/billing-history', getBillingHistory);

export default router;
