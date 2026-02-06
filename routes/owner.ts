import express from 'express';
import { ownerPage, registerSalon, addService, getSalonServices, getAppointments, getServiceHistory } from '../controllers/owner';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const ownerRouter = express.Router();

ownerRouter.get('/', ownerPage);

// Route to register a new salon
ownerRouter.post('/register-salon', authMiddleware, roleMiddleware('Owner'), registerSalon);

// Route to add a new service
ownerRouter.post('/add-service', authMiddleware, roleMiddleware('Owner'), addService);

// Route to get all services of a salon
ownerRouter.get('/salon-services/:salonId', authMiddleware, roleMiddleware('Owner'), getSalonServices);

// Route to manage appointments
ownerRouter.get('/appointments/:salonId', authMiddleware, roleMiddleware('Owner'), getAppointments);

// Route to get service history
ownerRouter.get('/service-history/:salonId', authMiddleware, roleMiddleware('Owner'), getServiceHistory);

export default ownerRouter;
