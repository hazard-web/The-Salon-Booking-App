import express from 'express';
import { customerPage, getAllServices, bookService, getCustomerBookings } from '../controllers/customer';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const customerRouter = express.Router();

customerRouter.get('/', customerPage);

// Route to get all services
customerRouter.get('/services', authMiddleware, roleMiddleware('Customer'), getAllServices);

// Route to book a service
customerRouter.post('/book', authMiddleware, roleMiddleware('Customer'), bookService);

// Route to get customer bookings
customerRouter.get('/bookings', authMiddleware, roleMiddleware('Customer'), getCustomerBookings);

export default customerRouter;
