import mongoose, { Document } from 'mongoose';
export interface IStudentDocument extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    admissionNumber: string;
    class: string;
    section: string;
    parentName: string;
    parentMobile: string;
    alternateMobile?: string;
    address?: string;
    joiningDate: Date;
    totalFee: number;
    numberOfInstallments: number;
    feeEndDate?: Date;
    status: 'active' | 'inactive';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Student: mongoose.Model<IStudentDocument, {}, {}, {}, mongoose.Document<unknown, {}, IStudentDocument, {}, mongoose.DefaultSchemaOptions> & IStudentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStudentDocument>;
//# sourceMappingURL=student.model.d.ts.map