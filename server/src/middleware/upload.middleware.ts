import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../shared/utils/apiResponse';

// Memory storage to buffer files in memory before uploading to Cloudinary/Local
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed mime types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and MP4 are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size (for videos)
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return sendError(res, err.message || 'File upload error', 400, 'UPLOAD_ERROR');
      }
      next();
    });
  };
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return sendError(res, err.message || 'Files upload error', 400, 'UPLOAD_ERROR');
      }
      next();
    });
  };
};
