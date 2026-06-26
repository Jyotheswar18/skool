import mongoose, { Document } from 'mongoose';
export interface ISchoolConfigDocument extends Document {
    _id: mongoose.Types.ObjectId;
    schoolName: string;
    schoolLogo?: string;
    classes: string[];
    sections: string[];
    academicYear: string;
    sms: {
        provider: 'mock' | 'twilio';
        apiKey?: string;
        apiUrl?: string;
        senderNumber?: string;
        enabled: boolean;
    };
    feeReminder: {
        daysBeforeDue: number;
        sendOnDueDate: boolean;
        overdueFrequency: 'daily' | 'weekly';
    };
    attendanceAlert: {
        enabled: boolean;
        sendTime: string;
    };
    updatedAt: Date;
    createdAt: Date;
}
export declare const SchoolConfig: mongoose.Model<ISchoolConfigDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISchoolConfigDocument, {}, mongoose.DefaultSchemaOptions> & ISchoolConfigDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISchoolConfigDocument>;
//# sourceMappingURL=schoolConfig.model.d.ts.map