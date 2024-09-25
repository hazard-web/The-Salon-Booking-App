const Booking = require('../models/booking');
const User = require('../models/user');
const { sendSMS } = require('../utils/sms');
const path = require('path');

// Serve the notification page
exports.notificationPage = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "notification.html"));
  } catch (err) {
    console.error('Error serving notification page:', err);
    res.status(500).send('Server Error: Unable to load notification page');
  }
};

// Notify Booking Confirmation
exports.notifyBookingConfirmation = async (req, res) => {
    const { bookingId } = req.body;
  
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required.' });
    }
  
    try {
      const booking = await Booking.findByPk(bookingId, {
        include: [{
          model: User,
          as: 'customer',
        }]
      });
  
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
  
      // Log the mobileNumber
      console.log('Mobile Number:', booking.customer.mobileNumber); // Log the mobile number
  
      // Ensure the customer has a valid mobileNumber
      if (!booking.customer.mobileNumber) {
        return res.status(400).json({ error: 'Customer mobile number not found.' });
      }
  
      // Send SMS notification
      const message = `Dear ${booking.customer.username}, your booking for ${booking.bookingDate} has been confirmed.`;
      await sendSMS(booking.customer.mobileNumber, message); // Use mobileNumber here
  
      res.json({ message: 'Booking confirmation notification sent successfully' });
    } catch (error) {
      console.error('Error in notifyBookingConfirmation:', {
        error: error.message,
        bookingId,
      });
      res.status(500).json({ error: 'An error occurred while notifying booking confirmation.' });
    }
  };
  

// Send SMS reminder one day before the booking date
exports.sendReminder = async (req, res) => {
  const { bookingId } = req.body;

  // Validate bookingId presence
  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId is required.' });
  }

  try {
    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: User,
        as: 'customer',
      }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Ensure the customer has a valid mobileNumber
    if (!booking.customer.mobileNumber) {
      return res.status(400).json({ error: 'Customer mobile number not found.' });
    }

    const bookingDate = new Date(booking.bookingDate);
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 1);

    // Send reminder if the booking is scheduled for tomorrow
    if (bookingDate.toDateString() === reminderDate.toDateString()) {
      const message = `Reminder: Dear ${booking.customer.username}, you have a booking scheduled for tomorrow at ${bookingDate.toLocaleTimeString()}.`;
      await sendSMS(booking.customer.mobileNumber, message); // Use mobileNumber here
      res.json({ message: 'Reminder sent successfully' });
    } else {
      res.status(400).json({ message: 'No bookings for tomorrow to send reminders' });
    }
  } catch (error) {
    console.error('Error in sendReminder:', {
      error: error.message,
      bookingId,
    });
    res.status(500).json({ error: 'An error occurred while sending the reminder.' });
  }
};
