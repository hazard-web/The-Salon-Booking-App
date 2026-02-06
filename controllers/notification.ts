import { Request, Response } from 'express';
import path from 'path';
import Booking from '../models/booking';
import User from '../models/user';
const { sendSMS } = require('../utils/sms');

// Update export syntax to use ES6 exports
export const notificationPage = async (req: Request, res: Response) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "notification.html"));
  } catch (err) {
    console.error('Error serving notification page:', err);
    res.status(500).send('Server Error: Unable to load notification page');
  }
};

export const notifyBookingConfirmation = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.id as string, 10);
        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Log the mobileNumber
        console.log('Mobile Number:', booking.customer.mobileNumber); 
  
        // Ensure the customer has a valid mobileNumber
        if (!booking.customer.mobileNumber) {
            return res.status(400).json({ error: 'Customer mobile number not found.' });
        }

        // Send SMS notification
        const message = `Dear ${booking.customer.username}, your booking for ${booking.bookingDate} has been confirmed.`;
        await sendSMS(booking.customer.mobileNumber, message);

        res.json({ message: 'Booking confirmation notification sent successfully' });
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const sendReminder = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.id as string, 10);
        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Log the mobileNumber
        console.log('Mobile Number:', booking.customer.mobileNumber); 
  
        // Ensure the customer has a valid mobileNumber
        if (!booking.customer.mobileNumber) {
            return res.status(400).json({ error: 'Customer mobile number not found.' });
        }

        // Send SMS reminder
        const message = `Dear ${booking.customer.username}, this is a reminder for your booking on ${booking.bookingDate}.`;
        await sendSMS(booking.customer.mobileNumber, message);

        res.json({ message: 'Reminder notification sent successfully' });
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};
