import mongoose, { Document } from 'mongoose';
export interface IAttendanceDocument extends Document {
    _id: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    class: string;
    section: string;
    date: Date;
    status: 'present' | 'absent' | 'late';
    markedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Attendance: mongoose.Model<IAttendanceDocument, {}, {}, {}, mongoose.Document<unknown, {}, IAttendanceDocument, {}, mongoose.DefaultSchemaOptions> & IAttendanceDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAttendanceDocument>;
//# sourceMappingURL=attendance.model.d.ts.map