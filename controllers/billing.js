// const { Billing, Service } = require('../models');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const { getPaymentDetails } = require('../utils/payment');
// const path = require('path');
// const fs = require('fs');

// // Controller to serve the billing page
// exports.billingPage = async (req, res) => {
//     try {
//         res.sendFile(path.join(__dirname, "../", "public", "views", "billing.html"));
//     } catch (err) {
//         console.error('Error serving billing page:', err.message);
//         res.status(500).send('Server Error: Unable to load the billing page.');
//     }
// };

// exports.success_url = async (req, res) => {
//     try {
//         const sessionId = req.query.session_id;

//         // Ensure sessionId is present to fetch payment details
//         if (!sessionId) {
//             return res.status(400).send('Missing session_id.');
//         }

//         // Fetch payment details using sessionId
//         const paymentDetails = await getPaymentDetails(sessionId); // Implement this function

//         // Read the static HTML file (success.html)
//         const successHtml = fs.readFileSync(path.join(__dirname, "../", "public", "views", "sucess.html"), 'utf-8');

//         // Inject dynamic payment details into the static HTML
//         const updatedHtml = successHtml
//             .replace('{{paymentIntentId}}', paymentDetails.paymentIntentId)
//             .replace('{{amount}}', (paymentDetails.billing.amount / 100).toFixed(2))
//             .replace('{{status}}', paymentDetails.billing.status);

//         // Send the updated HTML with dynamic values injected
//         res.send(updatedHtml);

//     } catch (err) {
//         console.error('Error serving billing page:', err.message);
//         res.status(500).send('Server Error: Unable to load the billing page.');
//     }
// };

// // Middleware to fetch services based on the request (if needed)
// exports.fetchServices = async (req, res) => {
//     try {
//         const { salonId } = req.query; // Expecting salonId in query params
//         const services = salonId
//             ? await Service.findAll({ where: { salonId } })
//             : await Service.findAll(); // Fetch all services if no salonId provided

//         res.json(services);
//     } catch (error) {
//         console.error('Error fetching services:', error);
//         res.status(500).json({ error: 'Error fetching services.' });
//     }
// };

// // Controller to create a Stripe checkout session
// exports.createCheckoutSession = async (req, res) => {
//     console.log('Creating checkout session...');
//     try {
//         const { amount, serviceId } = req.body;
//         console.log('Amount:', amount, 'Service ID:', serviceId);

//         // Check if amount is provided and is a valid number
//         if (!amount || typeof amount !== 'number' || amount <= 0) {
//             return res.status(400).json({ error: 'Invalid amount provided' });
//         }

//         // Check if serviceId is provided
//         if (!serviceId) {
//             return res.status(400).json({ error: 'Service ID is required' });
//         }

//         // Fetch the service based on the serviceId
//         const service = await Service.findByPk(serviceId);

//         // Check if the service exists
//         if (!service) {
//             return res.status(404).json({ error: 'Service not found' });
//         }

//         // Create a customer in Stripe
//         const customer = await stripe.customers.create({
//             description: `Customer for service ${service.name}`,
//         });
//         const customerId = customer.id;

//         // Create Stripe checkout session
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [
//                 {
//                     price_data: {
//                         currency: 'usd',
//                         product_data: {
//                             name: service.name,
//                             description: service.description,
//                         },
//                         unit_amount: Math.round(service.price * 100), // Convert to cents
//                     },
//                     quantity: 1,
//                 },
//             ],
//             mode: 'payment',
//             success_url: `http://localhost:4000/billing/success?amount=${amount}&serviceId=${serviceId}&session_id={CHECKOUT_SESSION_ID}&customerId=${customerId}`,
//             cancel_url: 'http://localhost:4000/cancel',
//         });

//         // Retrieve the session details after session creation
//         const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);

//         // Extract the paymentIntentId from the session details
//         const paymentIntentId = sessionDetails.payment_intent;

//         // Log for debugging
//         console.log('Payment Intent ID:', paymentIntentId);

//         // Create the success URL with paymentIntentId
//         const successUrl = `http://localhost:4000/billing/success?amount=${amount}&serviceId=${serviceId}&session_id={CHECKOUT_SESSION_ID}&customerId=${customerId}&paymentIntentId=${paymentIntentId}`;

//         // Send back the sessionId and successUrl
//         res.status(201).json({ sessionId: session.id, successUrl });
//     } catch (error) {
//         console.error('Error creating payment intent or checkout session:', error.message);
//         res.status(500).json({ error: 'Failed to create payment intent or checkout session' });
//     }
// };



// // Controller to handle successful payment
// exports.paymentSuccess = async (req, res) => {
//     const { paymentIntentId, customerId } = req.body;

//     // Check if paymentIntentId and customerId are provided
//     if (!paymentIntentId || !customerId) {
//         return res.status(400).json({ error: 'Payment Intent ID and Customer ID are required' });
//     }

//     try {
//         // Fetch payment intent from Stripe
//         console.log('Fetching payment intent from Stripe:', paymentIntentId);
//         const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//         console.log('Retrieved payment intent:', paymentIntent);

//         // Check if payment was successful
//         if (paymentIntent.status !== 'succeeded') {
//             return res.status(400).json({ error: 'Payment not successful' });
//         }

//         // Check if the billing record already exists (to avoid duplicates)
//         const existingBilling = await Billing.findOne({ where: { paymentIntentId } });
//         if (existingBilling) {
//             return res.status(400).json({ error: 'Billing record already exists for this payment' });
//         }

//         // Extracting billing details from paymentIntent if needed (optional)
//         const billingDetails = paymentIntent.charges.data[0].billing_details;

//         // Log the retrieved billing details (for debugging purposes)
//         console.log('Billing Details:', billingDetails);

//         // Record payment information in the billing table
//         console.log('Saving billing information to database...');
//         const billing = await Billing.create({
//             customerId,  // Ensure customerId is correctly passed
//             amount: paymentIntent.amount / 100,  // Convert to dollars from cents
//             paymentIntentId,
//             status: paymentIntent.status,
//         });
//         console.log('Billing record created:', billing);

//         // Send the success response with billing details
//         res.status(201).json({
//             message: 'Payment recorded successfully',
//             billing: {
//                 customerId: billing.customerId,
//                 amount: billing.amount,
//                 paymentIntentId: billing.paymentIntentId,
//                 status: billing.status,
//                 createdAt: billing.createdAt,
//                 billingDetails: billingDetails // Optionally include these details in response
//             }
//         });
//     } catch (error) {
//         // Handle Stripe-specific errors
//         if (error.type === 'StripeInvalidRequestError') {
//             console.error('Stripe error:', error);
//             return res.status(400).json({ error: 'Invalid payment details provided' });
//         }
//         // Log general errors and return failure message
//         console.error('Error recording payment:', error.message);
//         res.status(500).json({ error: 'Failed to record payment' });
//     }
// };



// // Controller to get billing history for a customer
// exports.getBillingHistory = async (req, res) => {
//     try {
//         const billingHistory = await Billing.findAll({
//             where: { customerId: req.user.id }, // Ensure req.user.id is populated correctly
//             order: [['createdAt', 'DESC']], // Order by the most recent billing entries
//         });

//         // Check if the user has billing history
//         if (billingHistory.length === 0) {
//             return res.status(404).json({ message: 'No billing history found for this user' });
//         }

//         res.status(200).json(billingHistory);
//     } catch (error) {
//         console.error('Error fetching billing history:', error.message);
//         res.status(500).json({ error: 'Failed to fetch billing history' });
//     }
// };
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
