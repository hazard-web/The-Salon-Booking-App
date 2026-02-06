import { Request, Response } from 'express';
import path from 'path';
import { Service, Booking } from '../models';
import { ensureAuthenticated } from '../middleware/authMiddleware';
import { isAuthenticated } from '../middleware/authMiddleware';

// Adjust `AuthenticatedRequest` to allow optional `user`
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
    [key: string]: any;
  };
}

export const customerPage = async (req: Request, res: Response) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "customer.html"));
  } catch (err) {
    console.error('Error serving customer page:', err);
    res.status(500).send('Server Error: Unable to load customer page');
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  console.log('Fetching services for user:', req.user);
  try {
    const services = await Service.findAll();

    if (!services || services.length === 0) {
      return res.status(200).json({ message: 'No services available at the moment.' });
    }

    console.log('Services fetched:', services);
    res.json(services);
  } catch (error: unknown) {
    console.error('Error fetching services:', (error as Error).message);
  }
};

export const bookService = async (req: AuthenticatedRequest, res: Response) => {
  const { serviceId, bookingDate } = req.body;

  try {
    if (!serviceId || !bookingDate) {
      return res.status(400).json({ error: 'Service ID and booking date are required.' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const currentDate = new Date();
    const parsedBookingDate = new Date(bookingDate);
    if (parsedBookingDate < currentDate) {
      return res.status(400).json({ error: 'Booking date must be in the future.' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }

    const booking = new Booking(Number(serviceId), Number(userId), parsedBookingDate);
    const bookingId = await booking.save();

    res.status(201).json({ message: 'Service booked successfully', bookingId });
  } catch (error: unknown) {
    console.error('Error booking service:', (error as Error).message);
    res.status(500).json({ error: 'Error booking service, please try again later.' });
  }
};

export const getCustomerBookings = async (req: AuthenticatedRequest, res: Response) => {
  console.log('User:', req.user);

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: customerId } = req.user;

  try {
    const bookings = await Booking.findByCustomer(Number(customerId));

    if (bookings.length === 0) {
      return res.status(200).json({ message: 'No bookings found for this customer.', bookings: [] });
    }

    res.status(200).json({ bookings });
  } catch (error: unknown) {
    console.error('Error fetching bookings:', (error as Error).message);
  }
};
