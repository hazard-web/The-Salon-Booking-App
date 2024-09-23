const { Service, Booking } = require('../models');
const path = require('path');

// Serve the customer page
exports.customerPage = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "customer.html"));
  } catch (err) {
    console.error('Error serving customer page:', err);
    res.status(500).send('Server Error: Unable to load customer page');
  }
};

// Controller to get all services
exports.getAllServices = async (req, res) => {
  console.log('Fetching services for user:', req.user);
  try {
    const services = await Service.findAll();

    if (!services || services.length === 0) {
      return res.status(200).json({ message: 'No services available at the moment.' });
    }

    console.log('Services fetched:', services);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Error fetching services' });
  }
};


exports.bookService = async (req, res) => {
  const { serviceId, bookingDate } = req.body;

  try {
    // Ensure the service ID and booking date are provided
    if (!serviceId || !bookingDate) {
      return res.status(400).json({ error: 'Service ID and booking date are required.' });
    }

    // Check if the service exists (Optional: add validation to ensure service is valid)
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Check if the booking date is in the future
    const currentDate = new Date();
    const parsedBookingDate = new Date(bookingDate);
    if (parsedBookingDate < currentDate) {
      return res.status(400).json({ error: 'Booking date must be in the future.' });
    }

    // Create the booking
    const booking = await Booking.create({
      serviceId,
      customerId: req.user.id, // User ID from auth middleware
      bookingDate: parsedBookingDate,
    });

    // Send a success response
    res.status(201).json({ message: 'Service booked successfully', booking });
  } catch (error) {
    console.error('Error booking service:', error.message);

    // Handle Sequelize validation errors specifically
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    // Generic error response
    res.status(500).json({ error: 'Error booking service, please try again later.' });
  }
};


// Controller to get customer bookings
exports.getCustomerBookings = async (req, res) => {
  console.log('User:', req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized access. User information is missing.' });
  }

  try {
    const bookings = await Booking.findAll({
      where: { customerId: req.user.id },
      include: [{ model: Service }] // Include the Service model
    });

    if (bookings.length === 0) {
      return res.status(200).json({ message: 'No bookings found for this customer.', bookings: [] });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings, please try again later.' });
  }
};
