import mongoose from 'mongoose';
import { IInstallmentDocument } from './installment.model';
export declare class FeeService {
    /**
     * Record payment for an installment
     */
    static payInstallment: (installmentId: string, notes: string | undefined, adminId: string) => Promise<IInstallmentDocument | null>;
    /**
     * Get installments list for a student
     */
    static getStudentInstallments: (studentId: string) => Promise<IInstallmentDocument[]>;
    /**
     * Cron helper to scan pending installments past their due date and flag them as overdue
     */
    static markPendingAsOverdue: () => Promise<number>;
    /**
     * Scans and queues SMS reminders based on due dates
     */
    static sendScheduledReminders: () => Promise<void>;
    /**
     * Generates collections reports for fee dashboard
     */
    static getFeeReport: (filters: {
        class?: string;
        section?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }) => Promise<{
        summary: any;
        classWise: {
            class: any;
            collected: any;
        }[];
    }>;
    /**
     * List all overdue installments
     */
    static getOverdueInstallments: () => Promise<(mongoose.Document<unknown, {}, IInstallmentDocument, {}, mongoose.DefaultSchemaOptions> & IInstallmentDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    /**
     * Get ALL active students with their aggregated fee status for the fee board
     */
    static getAllStudentsWithFeeStatus: (filters: {
        class?: string;
        section?: string;
        search?: string;
    }) => Promise<{
        _id: mongoose.Types.ObjectId;
        name: string;
        admissionNumber: string;
        class: string;
        section: string;
        totalFee: number;
        numberOfInstallments: number;
        parentName: string;
        parentMobile: string;
        paidAmount: any;
        pendingAmount: any;
        overdueAmount: any;
        feeStatus: "partial" | "overdue" | "fully_paid" | "unpaid";
        nextInstallment: {
            installmentNumber: any;
            amount: any;
            dueDate: any;
            status: any;
        } | null;
        paidCount: number;
        totalInstallments: number;
    }[]>;
    /**
     * Send a manual SMS fee reminder for a specific installment
     */
    static sendManualFeeReminder: (installmentId: string) => Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=fee.service.d.ts.map