import mongoose from 'mongoose';
import { IStudentDocument } from './student.model';
import { PaginationQuery } from '../../shared/types/common.types';
export declare class StudentService {
    /**
     * Create a new student, auto-generate installments, and send onboarding SMS message
     */
    static createStudent: (studentData: any, creatorId: string) => Promise<IStudentDocument>;
    /**
     * Update student details
     */
    static updateStudent: (id: string, updateData: any) => Promise<IStudentDocument | null>;
    /**
     * Delete student (soft delete by marking as inactive or fully deleting depending on requirements)
     * For safety, we will soft delete (status -> inactive) and delete unpaid pending installments
     */
    static deleteStudent: (id: string) => Promise<boolean>;
    /**
     * Get student profile by ID along with installment schedule and attendance summary
     */
    static getStudentProfile: (id: string) => Promise<{
        student: mongoose.Document<unknown, {}, IStudentDocument, {}, mongoose.DefaultSchemaOptions> & IStudentDocument & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        installments: (mongoose.Document<unknown, {}, import("../fee/installment.model").IInstallmentDocument, {}, mongoose.DefaultSchemaOptions> & import("../fee/installment.model").IInstallmentDocument & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        attendanceSummary: any;
    } | null>;
    /**
     * Search, filter, and paginate students
     */
    static queryStudents: (query: PaginationQuery & {
        search?: string;
        class?: string;
        section?: string;
        status?: string;
    }) => Promise<{
        students: (mongoose.Document<unknown, {}, IStudentDocument, {}, mongoose.DefaultSchemaOptions> & IStudentDocument & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: import("../../shared/types/common.types").PaginationResult;
    }>;
}
//# sourceMappingURL=student.service.d.ts.map