import mongoose from 'mongoose';
import { IAttendanceDocument } from './attendance.model';
export declare class AttendanceService {
    /**
     * Helper to normalize a date to midnight UTC
     */
    static normalizeDate: (dateInput: string | Date) => Date;
    /**
     * Bulk mark/edit student attendance
     */
    static markAttendance: (classVal: string, section: string, dateStr: string, records: {
        student: string;
        status: "present" | "absent" | "late";
    }[], markedById: string, isTeacher: boolean) => Promise<any[]>;
    /**
     * Asynchronously triggers alerts for all marked student attendance
     */
    private static processAttendanceAlerts;
    /**
     * List attendance logs based on filters
     */
    static queryAttendance: (filters: {
        class?: string;
        section?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        student?: string;
    }) => Promise<IAttendanceDocument[]>;
    /**
     * Generate aggregated attendance reports for a class/section over a date range
     */
    static generateReport: (classVal: string, section: string, startDateStr: string, endDateStr: string) => Promise<{
        class: string;
        section: string;
        startDate: Date;
        endDate: Date;
        overallPercentage: number;
        studentStats: {
            student: (mongoose.Document<unknown, {}, import("../student/student.model").IStudentDocument, {}, mongoose.DefaultSchemaOptions> & import("../student/student.model").IStudentDocument & Required<{
                _id: mongoose.Types.ObjectId;
            }> & {
                __v: number;
            } & {
                id: string;
            }) | null;
            totalDays: any;
            present: any;
            absent: any;
            late: any;
            percentage: number;
        }[];
    }>;
}
//# sourceMappingURL=attendance.service.d.ts.map