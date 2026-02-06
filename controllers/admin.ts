import { Request, Response } from 'express';
import Salon from '../models/salon';
import Booking from '../models/booking';
import User from '../models/user'; // Added missing import for User model
import path from 'path';

export const adminPage = async (req: Request, res: Response): Promise<void> => {
    try {
        res.sendFile(path.join(__dirname, "../", "public", "views", "admin.html"));
    } catch (err: unknown) {
        console.error('Error serving customer page:', err);
        res.status(500).send('Server Error: Unable to load customer page');
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getAllSalons = async (req: Request, res: Response): Promise<void> => {
    try {
        const salons = await Salon.findAll();
        res.json(salons);
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const approveSalon = async (req: Request, res: Response): Promise<void> => {
    const { salonId, approved } = req.body;
    try {
        const salon = await Salon.findById(salonId);
        if (!salon) {
            res.status(404).json({ error: 'Salon not found' });
            return;
        }
        salon.approved = approved;
        await Salon.updateById(salonId, { approved: Boolean(approved) }); // Fixed type issue
        res.json({ message: `Salon ${approved ? 'approved' : 'disapproved'} successfully`, salon });
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = parseInt(req.query.customerId as string, 10); // Cast to number
        if (isNaN(customerId)) {
            res.status(400).json({ error: 'Invalid customer ID' });
            return;
        }
        const bookings = await Booking.findByCustomer(customerId);
        res.json(bookings);
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const managePayments = async (req: Request, res: Response): Promise<void> => {
    try {
        res.json({ message: 'Payment management feature to be implemented' });
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
};
