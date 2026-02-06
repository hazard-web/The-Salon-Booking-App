const express = require('express');
const { adminPage, getAllUsers, getAllSalons, approveSalon, getAllBookings, managePayments } = require('../controllers/admin');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const adminRouter = express.Router();


adminRouter.get('/', adminPage);

// Route to get all users
adminRouter.get('/users', authMiddleware, roleMiddleware('Admin'), getAllUsers);

// Route to get all salons
adminRouter.get('/salons', authMiddleware, roleMiddleware('Admin'), getAllSalons);

// Route to approve or disapprove a salon
adminRouter.post('/approve-salon', authMiddleware, roleMiddleware('Admin'), approveSalon);

// Route to get all bookings
adminRouter.get('/bookings', authMiddleware, roleMiddleware('Admin'), getAllBookings);

// Route to manage payments
adminRouter.post('/manage-payments', authMiddleware, roleMiddleware('Admin'), managePayments);

module.exports = adminRouter;
