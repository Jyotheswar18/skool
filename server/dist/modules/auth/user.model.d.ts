import mongoose, { Document } from 'mongoose';
export interface IUserDocument extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher';
    mobile?: string;
    assignedClasses: string[];
    assignedSections: string[];
    status: 'active' | 'inactive';
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, mongoose.DefaultSchemaOptions> & IUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUserDocument>;
//# sourceMappingURL=user.model.d.ts.map