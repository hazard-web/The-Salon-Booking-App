import express from 'express';
import { photoPage, uploadPhoto, getServicePhotos } from '../controllers/photo';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import upload from '../config/multer';

const photoRouter = express.Router();

photoRouter.get('/', photoPage);

// Route to upload a photo
photoRouter.post('/upload', authMiddleware, roleMiddleware('Owner'), upload.single('photo'), uploadPhoto);

// Route to get photos for a service
photoRouter.get('/service/:serviceId', authMiddleware, getServicePhotos);

export default photoRouter;
