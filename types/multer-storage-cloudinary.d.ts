declare module 'multer-storage-cloudinary' {
  import { StorageEngine } from 'multer';
  import { ConfigOptions, UploadApiOptions, UploadApiResponse } from 'cloudinary';

  const cloudinaryStorage: (options: {
    cloudinary: any;
    params?: UploadApiOptions | ((req: any, file: any) => UploadApiOptions);
  }) => StorageEngine;

  export = cloudinaryStorage; // Corrected to use `export =` for CommonJS compatibility
}