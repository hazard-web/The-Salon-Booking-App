import express from 'express';
import { notificationPage, notifyBookingConfirmation, sendReminder } from '../controllers/notification';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const notificationRouter = express.Router();

notificationRouter.get('/', notificationPage);

// Route to notify customer about booking confirmation
notificationRouter.post('/notify-booking', authMiddleware, roleMiddleware('Owner'), notifyBookingConfirmation);

// Route to send SMS reminders one day before the booking date
notificationRouter.post('/send-reminder', authMiddleware, roleMiddleware('Owner'), sendReminder);

export default notificationRouter;
