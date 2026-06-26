import mongoose, { Document } from 'mongoose';
export interface IMediaItem {
    url: string;
    type: 'image' | 'video';
    thumbnail?: string;
    publicId?: string;
    originalName?: string;
    size?: number;
}
export interface ITargetAudience {
    type: 'school' | 'classes' | 'sections';
    classes?: string[];
    sections?: string[];
}
export interface IEventDocument extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    eventDate: Date;
    targetAudience: ITargetAudience;
    media: IMediaItem[];
    isPublished: boolean;
    publishedAt?: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Event: mongoose.Model<IEventDocument, {}, {}, {}, mongoose.Document<unknown, {}, IEventDocument, {}, mongoose.DefaultSchemaOptions> & IEventDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEventDocument>;
//# sourceMappingURL=event.model.d.ts.map