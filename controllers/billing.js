const Razorpay = require('razorpay');
const Billing = require('../models/billing'); // ✅ Your MongoDB class
const path = require('path');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

// Controller to serve the billing page
exports.billingPage = async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "../", "public", "views", "billing.html"));
    } catch (err) {
        console.error('Error serving billing page:', err.message);
        res.status(500).send('Server Error: Unable to load the billing page.');
    }
};

// ✅ MOCK fetchServices (no Service model needed yet)
exports.fetchServices = async (req, res) => {
    try {
        const { salonId } = req.query;
        // Mock data for testing
        const services = [
            { id: 1, name: 'Haircut', price: 500 },
            { id: 2, name: 'Hair Color', price: 1500 },
            { id: 3, name: 'Massage', price: 800 }
        ];
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Error fetching services.' });
    }
};

exports.createCheckoutSession = async (req, res) => {
    console.log('Creating Razorpay order...');
    try {
        const { amount, serviceId } = req.body;
        const customerId = 123; // Mock for now (add auth later)

        console.log('Customer ID:', customerId);

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount provided' });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${serviceId}`,
            payment_capture: 1,
            notes: {
                customerId: customerId 
            }
        });

        res.status(201).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error.message);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

exports.paymentSuccess = async (req, res) => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ error: 'Payment details are required' });
    }

    try {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
        console.log('Payment details:', paymentDetails);

        const customerId = paymentDetails.notes?.customerId || 123;

        // ✅ USE YOUR MONGODB BILLING CLASS
        const billing = new Billing(
            customerId,
            paymentDetails.amount / 100,
            paymentDetails.id
        );
        await billing.save(); // ✅ Saves to MongoDB!

        console.log('✅ Billing record saved to MongoDB!');

        res.status(201).json({
            message: 'Payment recorded successfully in MongoDB',
            billing: {
                customerId: customerId,
                amount: paymentDetails.amount / 100,
                paymentIntentId: paymentDetails.id,
                status: paymentDetails.status
            }
        });
    } catch (error) {
        console.error('Error recording payment:', error.message);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

exports.getBillingHistory = async (req, res) => {
    try {
        const getdb = require('../config/db').getdb;
        const db = getdb();
        const customerId = 123; // Mock for now

        const billingHistory = await db.collection('Billing')
            .find({ customerId: customerId })
            .sort({ createdAt: -1 })
            .toArray();

        if (billingHistory.length === 0) {
            return res.status(404).json({ message: 'No billing history found for this user' });
        }

        res.status(200).json(billingHistory);
    } catch (error) {
        console.error('Error fetching billing history:', error.message);
        res.status(500).json({ error: 'Failed to fetch billing history' });
    }
};
