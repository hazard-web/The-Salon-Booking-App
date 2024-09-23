const { Salon, Service, Booking, User } = require('../models'); // Ensure User is imported
const path = require('path');

// Serve the owner dashboard page
exports.ownerPage = async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../', 'public', 'views', 'owner.html'));
    } catch (err) {
        console.error('Error sending owner page:', err);
        res.status(500).json({ error: 'Failed to load the owner page.' });
    }
};

// Register a new salon
exports.registerSalon = async (req, res) => {
  if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
  }

  const { name, address, phone } = req.body;

  if (!name || !address || !phone) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
      const newSalon = await Salon.create({
          name,
          address,
          phone,
          ownerId: req.user.id,
      });
      res.status(201).json({ message: 'Salon registered successfully', newSalon });
  } catch (error) {
      console.error('Error registering salon:', error);
      res.status(500).json({ error: error.message });
  }
};


// Add a new service to a salon
exports.addService = async (req, res) => {
    const { name, description, price, duration, salonId } = req.body;

    if (!name || !description || !price || !duration || !salonId) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const newService = await Service.create({
            name,
            description,
            price,
            duration,
            salonId,
        });
        res.status(201).json({ message: 'Service added successfully', newService });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all services of a salon
exports.getSalonServices = async (req, res) => {
    const { salonId } = req.params;

    try {
        const services = await Service.findAll({ where: { salonId } });
        res.json(services);
    } catch (error) {
        console.error('Error fetching salon services:', error);
        res.status(500).json({ error: error.message });
    }
};

// Manage appointments
exports.getAppointments = async (req, res) => {
    const { salonId } = req.params;

    // Validate salonId
    if (!salonId) {
        return res.status(400).json({ error: 'salonId is required.' });
    }

    try {
        const appointments = await Booking.findAll({
            where: { salonId },
            include: [Service, { model: User, as: 'customer' }],
        });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get service history
exports.getServiceHistory = async (req, res) => {
    const { salonId } = req.params;

    try {
        const history = await Booking.findAll({
            where: { salonId },
            include: [Service, { model: User, as: 'customer' }],
        });
        res.json(history);
    } catch (error) {
        console.error('Error fetching service history:', error);
        res.status(500).json({ error: error.message });
    }
};
