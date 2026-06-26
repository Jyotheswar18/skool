import mongoose, { Document } from 'mongoose';
export interface IInstallmentDocument extends Document {
    _id: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    installmentNumber: number;
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    status: 'pending' | 'paid' | 'overdue';
    notes?: string;
    markedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Installment: mongoose.Model<IInstallmentDocument, {}, {}, {}, mongoose.Document<unknown, {}, IInstallmentDocument, {}, mongoose.DefaultSchemaOptions> & IInstallmentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInstallmentDocument>;
//# sourceMappingURL=installment.model.d.ts.map