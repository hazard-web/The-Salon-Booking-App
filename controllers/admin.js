const { User, Salon, Booking, Revenue } = require('../models');
const path = require('path');


exports.adminPage = async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "../", "public", "views", "admin.html"));
    } catch (err) {
        console.error('Error serving customer page:', err);
        res.status(500).send('Server Error: Unable to load customer page');
    }
};

// Controller to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller to get all salons
exports.getAllSalons = async (req, res) => {
    try {
        const salons = await Salon.findAll({ include: [User] });
        res.json(salons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller to approve or disapprove a salon
exports.approveSalon = async (req, res) => {
    const { salonId, approved } = req.body;
    try {
        const salon = await Salon.findByPk(salonId);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        salon.approved = approved;
        await salon.save();
        res.json({ message: `Salon ${approved ? 'approved' : 'disapproved'} successfully`, salon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller to get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                // { model: Service, as: 'service' }, 
                { model: User, as: 'customer' } // Using 'customer' as alias
            ]
        });
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error); // Log the full error object
        res.status(500).json({ error: error.message });
    }
};


// Controller to manage payments
exports.managePayments = async (req, res) => {
    // Example implementation for managing payments
    try {
        // Implement payment management logic here
        res.json({ message: 'Payment management feature to be implemented' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
