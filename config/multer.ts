/// <reference path="../types/multer-storage-cloudinary.d.ts" /> // Added reference to custom type declaration

import multer from 'multer';
import cloudinaryStorage from 'multer-storage-cloudinary'; // Updated to use the correct function export
import cloudinary from '../utils/cloudinary';

const storage = cloudinaryStorage({
  cloudinary,
  params: (req: any, file: any) => ({
    folder: 'beauty-salon-app',
    format: 'png',
    public_id: `beauty-salon-app/${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage });

export default upload;
