import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';

// Configure Cloudinary if keys exist
const isCloudinaryConfigured =
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary initialized successfully.');
} else {
  console.log('⚠️ Cloudinary keys not provided. Media uploads will fall back to local disk storage.');
}

export class MediaService {
  /**
   * Upload file to Cloudinary or Local Server public directory
   */
  static uploadFile = async (
    file: Express.Multer.File,
    folder: string = 'edunest_events'
  ): Promise<{ url: string; type: 'image' | 'video'; publicId?: string; originalName: string; size: number }> => {
    const originalName = file.originalname;
    const size = file.size;
    const type = file.mimetype.startsWith('video/') ? 'video' : 'image';

    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload failure:', error);
              return reject(error);
            }
            if (!result) {
              return reject(new Error('Empty upload result from Cloudinary'));
            }
            resolve({
              url: result.secure_url,
              type,
              publicId: result.public_id,
              originalName,
              size,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    } else {
      // Local fallback storage
      const uploadsDir = path.join(__dirname, '../../../public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique name
      const fileExt = path.extname(originalName);
      const filename = `${Date.now()}-${Math.floor(Math.random() * 100000)}${fileExt}`;
      const filePath = path.join(uploadsDir, filename);

      // Write buffer to disk
      fs.writeFileSync(filePath, file.buffer);

      // Return local server URL
      const url = `http://localhost:${env.PORT}/uploads/${filename}`;
      return {
        url,
        type,
        publicId: filename, // Use filename as ID for deletion
        originalName,
        size,
      };
    }
  };

  /**
   * Delete uploaded file
   */
  static deleteFile = async (publicId: string): Promise<boolean> => {
    if (!publicId) return false;

    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
      } catch (error) {
        console.error('Cloudinary destroy failure:', error);
        return false;
      }
    } else {
      // Local delete
      try {
        const filePath = path.join(__dirname, '../../../public/uploads', publicId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Local file unlink failure:', error);
        return false;
      }
    }
  };
}
