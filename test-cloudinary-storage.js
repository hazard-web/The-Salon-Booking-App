const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Test CloudinaryStorage import
try {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'test-folder',
      format: 'png',
      public_id: 'test-file',
    },
  });
  console.log('CloudinaryStorage initialized successfully:', storage);
} catch (error) {
  console.error('Error initializing CloudinaryStorage:', error);
}