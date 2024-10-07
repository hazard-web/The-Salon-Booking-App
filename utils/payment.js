const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 


// Function to fetch payment details
const getPaymentDetails = async (sessionId) => {
    try {
        // Example: Fetching session details from Stripe using the session ID
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // Retrieve payment intent details from Stripe using the paymentIntent ID from the session
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

        // Return relevant details
        return {
            billing: {
                amount: paymentIntent.amount,
                status: paymentIntent.status
            },
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        console.error('Error retrieving payment details:', error);
        throw new Error('Failed to fetch payment details.');
    }
};

module.exports = { getPaymentDetails };
