"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const apiResponse_1 = require("../shared/utils/apiResponse");
// Memory storage to buffer files in memory before uploading to Cloudinary/Local
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and MP4 are allowed.'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size (for videos)
    },
});
// Single file upload middleware
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return (0, apiResponse_1.sendError)(res, err.message || 'File upload error', 400, 'UPLOAD_ERROR');
            }
            next();
        });
    };
};
exports.uploadSingle = uploadSingle;
// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 10) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                return (0, apiResponse_1.sendError)(res, err.message || 'Files upload error', 400, 'UPLOAD_ERROR');
            }
            next();
        });
    };
};
exports.uploadMultiple = uploadMultiple;
//# sourceMappingURL=upload.middleware.js.map