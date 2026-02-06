const express = require('express');
const { customerPage, getAllServices, bookService, getCustomerBookings } = require('../controllers/customer');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const customerRouter = express.Router();

customerRouter.get('/', customerPage);

// Route to get all services
customerRouter.get('/services', authMiddleware, roleMiddleware('Customer'), getAllServices);

// Route to book a service
customerRouter.post('/book', authMiddleware, roleMiddleware('Customer'), bookService);

// Route to get customer bookings
customerRouter.get('/bookings', authMiddleware, roleMiddleware('Customer'), getCustomerBookings);

module.exports = customerRouter;
