import mongoose from 'mongoose';
export declare class DashboardService {
    /**
     * Get KPI statistics for Admin Dashboard
     */
    static getAdminKpis: () => Promise<{
        stats: {
            totalStudents: number;
            totalTeachers: number;
            totalFeesExpected: number;
            totalFeesCollected: number;
            totalFeesPending: number;
            totalFeesOverdue: number;
            todayAttendance: {
                present: number;
                absent: number;
                late: number;
                total: number;
            };
        };
        recentEvents: (mongoose.Document<unknown, {}, import("../event/event.model").IEventDocument, {}, mongoose.DefaultSchemaOptions> & import("../event/event.model").IEventDocument & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        recentNotifications: (mongoose.Document<unknown, {}, import("../notification/notification.model").INotificationDocument, {}, mongoose.DefaultSchemaOptions> & import("../notification/notification.model").INotificationDocument & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    /**
     * Get KPI statistics for Teacher Dashboard
     */
    static getTeacherKpis: (teacherId: string) => Promise<{
        stats: {
            assignedClassesCount: number;
            totalStudents: number;
            todayAttendance: {
                present: number;
                absent: number;
                late: number;
                total: number;
            };
            assignedSectionsCount?: undefined;
        };
        classCompletion: never[];
    } | {
        stats: {
            assignedClassesCount: number;
            assignedSectionsCount: number;
            totalStudents: number;
            todayAttendance: {
                present: number;
                absent: number;
                late: number;
                total: number;
            };
        };
        classCompletion: {
            class: string;
            section: string;
            studentCount: number;
            isMarked: boolean;
            subject: string;
            timing: string;
            presentStudentsCount: number;
            presentStudents: any[];
        }[];
    }>;
}
//# sourceMappingURL=dashboard.service.d.ts.map