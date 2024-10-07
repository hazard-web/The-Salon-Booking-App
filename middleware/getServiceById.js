const { Service } = require('../models');
console.log('Service model:', Service);

// Middleware to fetch the service by ID
async function getServiceById(req, res, next) {
    const serviceId = req.params.id;
    console.log('Service ID received:', serviceId); // Debugging the received service ID

    try {
        if (!serviceId) {
            return res.status(400).json({ error: 'Service ID is required' });
        }

        // Check if Service is defined and has findByPk method
        if (!Service || typeof Service.findByPk !== 'function') {
            console.error('Service model is not defined or does not have findByPk method');
            return res.status(500).json({ error: 'Service model is not initialized properly' });
        }

        const service = await Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        req.service = service;
        next();
    } catch (error) {
        console.error('Error fetching service:', error); // More detailed error logging
        return res.status(500).json({ error: 'Failed to fetch service' });
    }
}

module.exports = getServiceById; // Ensure you're exporting it correctly
