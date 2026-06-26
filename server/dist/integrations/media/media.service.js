"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../../config/env");
// Configure Cloudinary if keys exist
const isCloudinaryConfigured = env_1.env.CLOUDINARY_CLOUD_NAME && env_1.env.CLOUDINARY_API_KEY && env_1.env.CLOUDINARY_API_SECRET;
if (isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary initialized successfully.');
}
else {
    console.log('⚠️ Cloudinary keys not provided. Media uploads will fall back to local disk storage.');
}
class MediaService {
}
exports.MediaService = MediaService;
_a = MediaService;
/**
 * Upload file to Cloudinary or Local Server public directory
 */
MediaService.uploadFile = async (file, folder = 'edunest_events') => {
    const originalName = file.originalname;
    const size = file.size;
    const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
    if (isCloudinaryConfigured) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'auto',
            }, (error, result) => {
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
            });
            uploadStream.end(file.buffer);
        });
    }
    else {
        // Local fallback storage
        const uploadsDir = path_1.default.join(__dirname, '../../../public/uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        // Generate unique name
        const fileExt = path_1.default.extname(originalName);
        const filename = `${Date.now()}-${Math.floor(Math.random() * 100000)}${fileExt}`;
        const filePath = path_1.default.join(uploadsDir, filename);
        // Write buffer to disk
        fs_1.default.writeFileSync(filePath, file.buffer);
        // Return local server URL
        const url = `http://localhost:${env_1.env.PORT}/uploads/${filename}`;
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
MediaService.deleteFile = async (publicId) => {
    if (!publicId)
        return false;
    if (isCloudinaryConfigured) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            return result.result === 'ok';
        }
        catch (error) {
            console.error('Cloudinary destroy failure:', error);
            return false;
        }
    }
    else {
        // Local delete
        try {
            const filePath = path_1.default.join(__dirname, '../../../public/uploads', publicId);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Local file unlink failure:', error);
            return false;
        }
    }
};
//# sourceMappingURL=media.service.js.map