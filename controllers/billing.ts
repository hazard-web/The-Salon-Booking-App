import { Request, Response } from 'express';
import path from 'path';
const Razorpay = require('razorpay');
import Billing from '../models/billing';

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

// Controller to serve the billing page
export const billingPage = async (req: Request, res: Response): Promise<void> => {
    try {
        res.sendFile(path.join(__dirname, "../", "public", "views", "billing.html"));
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error('Error serving billing page:', err.message);
        } else {
            console.error('Error serving billing page: An unknown error occurred.');
        }
        res.status(500).send('Server Error: Unable to load the billing page.');
    }
};

// ✅ MOCK fetchServices (no Service model needed yet)
export const fetchServices = async (req: Request, res: Response): Promise<void> => {
    try {
        const { salonId } = req.query;
        // Mock data for testing
        const services = [
            { id: 1, name: 'Haircut', price: 500 },
            { id: 2, name: 'Hair Color', price: 1500 },
            { id: 3, name: 'Massage', price: 800 }
        ];
        res.json(services);
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error('Error fetching services:', err.message);
        } else {
            console.error('Error fetching services: An unknown error occurred.');
        }
        res.status(500).json({ error: 'Error fetching services.' });
    }
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    console.log('Creating Razorpay order...');
    try {
        const { amount, serviceId } = req.body;
        const customerId = 123; // Mock for now (add auth later)

        console.log('Customer ID:', customerId);

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({ error: 'Invalid amount provided' });
            return;
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
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error creating checkout session:', error.message);
        } else {
            console.error('Error creating checkout session: An unknown error occurred.');
        }
        res.status(500).json({ error: 'Error creating checkout session.' });
    }
};

export const paymentSuccess = async (req: Request, res: Response): Promise<void> => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        res.status(400).json({ error: 'Payment details are required' });
        return;
    }

    try {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpaySignature) {
            res.status(400).json({ error: 'Payment verification failed' });
            return;
        }

        const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
        console.log('Payment details:', paymentDetails);

        const customerId = paymentDetails.notes?.customerId || 123;

        const billing = new Billing(
            customerId,
            paymentDetails.amount / 100,
            paymentDetails.id
        );
        await billing.save();

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
    } catch (error: unknown) {
        console.error('Error recording payment:', (error as Error).message);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

export const getBillingHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const getdb = require('../config/db').getdb;
        const db = getdb();
        const customerId = 123;

        const billingHistory = await db.collection('Billing')
            .find({ customerId: customerId })
            .sort({ createdAt: -1 })
            .toArray();

        if (billingHistory.length === 0) {
            res.status(404).json({ message: 'No billing history found for this user' });
            return;
        }

        res.status(200).json(billingHistory);
    } catch (error: unknown) {
        console.error('Error fetching billing history:', (error as Error).message);
        res.status(500).json({ error: 'Failed to fetch billing history' });
    }
};
