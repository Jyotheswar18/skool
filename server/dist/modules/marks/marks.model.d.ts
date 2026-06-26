import mongoose, { Document } from 'mongoose';
export interface IMarksDocument extends Document {
    _id: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    class: string;
    section: string;
    subject: string;
    examName: string;
    marksObtained: number;
    maxMarks: number;
    comments?: string;
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Marks: mongoose.Model<IMarksDocument, {}, {}, {}, mongoose.Document<unknown, {}, IMarksDocument, {}, mongoose.DefaultSchemaOptions> & IMarksDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMarksDocument>;
//# sourceMappingURL=marks.model.d.ts.map