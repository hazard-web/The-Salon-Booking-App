const Razorpay = require('razorpay');
const { Billing, Service } = require('../models');
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

// Middleware to fetch services based on the request (if needed)
exports.fetchServices = async (req, res) => {
    try {
        const { salonId } = req.query; // Expecting salonId in query params
        const services = salonId
            ? await Service.findAll({ where: { salonId } })
            : await Service.findAll(); // Fetch all services if no salonId provided

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

        // Extract customerId from the authenticated user
        const customerId = req.user.id; // Assuming user ID is set in req.user after authentication

        console.log('Customer ID:', customerId);

        // Validate inputs
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount provided' });
        }

        // Fetch the service based on serviceId
        const service = await Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Create a Razorpay order with customerId in notes
        const order = await razorpay.orders.create({
            amount: Math.round(service.price * 100), // Convert to paise
            currency: "INR",
            receipt: `receipt_${serviceId}`,
            payment_capture: 1,
            notes: {
                customerId: customerId // Pass the customer ID
            }
        });

        // Return order details to the frontend
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

        // Fetch payment details from Razorpay
        const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
        console.log('Payment details:', paymentDetails);

        // Retrieve customerId from payment details
        const customerId = paymentDetails.notes?.customerId;

        if (!customerId) {
            console.error('Invalid customerId: undefined');
            return res.status(400).json({ error: 'Invalid customerId' });
        }

        // Save billing information to the database
        const billing = await Billing.create({
            customerId: customerId,  // This should now have a valid value
            amount: paymentDetails.amount / 100,  // Convert from paise to INR
            paymentIntentId: paymentDetails.id,
            status: paymentDetails.status
        });

        console.log('Billing record created:', billing);

        // Send the success response with billing details
        res.status(201).json({
            message: 'Payment recorded successfully',
            billing: {
                customerId: billing.customerId,
                amount: billing.amount,
                paymentIntentId: billing.paymentIntentId,
                status: billing.status,
                createdAt: billing.createdAt,
                billingDetails: paymentDetails
            }
        });
    } catch (error) {
        console.error('Error recording payment:', error.message);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

// Controller to get billing history for a customer
exports.getBillingHistory = async (req, res) => {
    try {
        const billingHistory = await Billing.findAll({
            where: { customerId: req.user.id }, // Ensure req.user.id is populated correctly
            order: [['createdAt', 'DESC']], // Order by the most recent billing entries
        });

        // Check if the user has billing history
        if (billingHistory.length === 0) {
            return res.status(404).json({ message: 'No billing history found for this user' });
        }

        res.status(200).json(billingHistory);
    } catch (error) {
        console.error('Error fetching billing history:', error.message);
        res.status(500).json({ error: 'Failed to fetch billing history' });
    }
};
