const express = require('express');
const { photoPage, uploadPhoto, getServicePhotos } = require('../controllers/photo');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const upload = require('../config/multer');
const photoRouter = express.Router();

photoRouter.get('/',photoPage);

// Route to upload a photo
photoRouter.post('/upload', authMiddleware, roleMiddleware('Owner'), upload.single('photo'), uploadPhoto);

// Route to get photos for a service
photoRouter.get('/service/:serviceId', authMiddleware, getServicePhotos);

module.exports = photoRouter;
