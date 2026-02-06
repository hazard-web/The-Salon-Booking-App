import { Request, Response } from 'express';
import path from 'path';
import Photo from '../models/photo';

// Update export syntax to use ES6 exports
export const uploadPhoto = async (req: Request, res: Response) => {
  const { description, serviceId } = req.body;
  const filePath = req.file?.path; // Ensure filePath is extracted safely
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }

    const photo = new Photo(filePath || '', description, Number(req.user.id), Number(serviceId));
    const photoId = await photo.save();
    res.status(201).json({ message: 'Photo uploaded successfully', photoId });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getServicePhotos = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  try {
    // Updated `findByServiceId` to ensure type compatibility
    const photos = await Photo.findByServiceId(Number(serviceId));
    res.json(photos);
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Controller to serve the photo page
export const photoPage = async (req: Request, res: Response) => {
  try {
    res.sendFile(path.join(__dirname, '../', 'public', 'views', 'photo.html'));
  } catch (err) {
    console.error('Error serving photo page:', err);
    res.status(500).json({ error: 'Failed to load the photo page.' });
  }
};
