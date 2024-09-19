const { Service, Booking } = require('../models');
const path = require('path');


exports.customerPage = async (req,res) => {
    try {
        res.sendFile(path.join(__dirname, "../", "public", "views", "customer.html"));
    } catch {
        (err) => console.log(err);
    }
}

// Controller to get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to book a service
exports.bookService = async (req, res) => {
  const { serviceId, bookingDate } = req.body;
  try {
    const booking = await Booking.create({
      serviceId,
      customerId: req.user.id,
      bookingDate,
    });
    res.status(201).json({ message: 'Service booked successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get customer bookings
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { customerId: req.user.id }, include: [Service] });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
