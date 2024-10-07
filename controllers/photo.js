const Photo = require('../models/photo');
const path = require('path');

exports.photoPage = async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "../", "public", "views", "photo.html"));
    } catch (err) {
        console.error('Error serving billing page:', err.message);
        res.status(500).send('Server Error: Unable to load the billing page.');
    }
};

// Controller to upload a photo
exports.uploadPhoto = async (req, res) => {
  const { description, serviceId } = req.body;
  const { path } = req.file;
  try {
    const photo = await Photo.create({
      url: path,
      description,
      uploadedBy: req.user.id,
      serviceId,
    });
    res.status(201).json({ message: 'Photo uploaded successfully', photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get photos for a service
exports.getServicePhotos = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const photos = await Photo.findAll({ where: { serviceId } });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
