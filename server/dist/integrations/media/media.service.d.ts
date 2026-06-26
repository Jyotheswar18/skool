export declare class MediaService {
    /**
     * Upload file to Cloudinary or Local Server public directory
     */
    static uploadFile: (file: Express.Multer.File, folder?: string) => Promise<{
        url: string;
        type: "image" | "video";
        publicId?: string;
        originalName: string;
        size: number;
    }>;
    /**
     * Delete uploaded file
     */
    static deleteFile: (publicId: string) => Promise<boolean>;
}
//# sourceMappingURL=media.service.d.ts.map