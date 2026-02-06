import { Request, Response } from 'express';
import { Salon, Service, Booking, User, Billing } from '../models';
import path from 'path';

// Update export syntax to use ES6 exports
export const ownerPage = async (req: Request, res: Response) => {
    try {
        res.sendFile(path.join(__dirname, '../', 'public', 'views', 'owner.html'));
    } catch (err) {
        console.error('Error sending owner page:', err);
        res.status(500).json({ error: 'Failed to load the owner page.' });
    }
};

export const registerSalon = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
  }

  const { name, address, phone } = req.body;

  if (!name || !address || !phone) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
      const formattedPhone = String(phone); // Ensure phone is a string
      const newSalon = new Salon(name, address, formattedPhone, Number(req.user.id));
      await newSalon.save();
      res.status(201).json({ message: 'Salon registered successfully', newSalon });
  } catch (error: unknown) {
      console.error('Error registering salon:', error);
      res.status(500).json({ error: (error as Error).message });
  }
};

export const addService = async (req: Request, res: Response) => {
    const { name, description, price, duration, salonId } = req.body;

    if (!name || !description || !price || !duration || !salonId) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const newService = new Service(name, description, Number(price), Number(duration), Number(salonId));
        await newService.save();
        res.status(201).json({ message: 'Service added successfully', newService });
    } catch (error: unknown) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

// Update export syntax for remaining functions
export const getSalonServices = async (req: Request, res: Response) => {
    const { salonId } = req.params;

    try {
        const services = await Service.findAll(); // Replace with a method to filter by salonId
        const filteredServices = services.filter((service: { salonId: number }) => service.salonId === Number(salonId));
        res.json(filteredServices);
    } catch (error: unknown) {
        console.error('Error fetching salon services:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const appointments = await Booking.findByService(Number(req.params.salonId));
        res.json(appointments);
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getServiceHistory = async (req: Request, res: Response) => {
    const { salonId } = req.params;

    try {
        const history = await Booking.findByService(Number(salonId));
        res.json(history);
    } catch (error: unknown) {
        console.error('Error fetching service history:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};
