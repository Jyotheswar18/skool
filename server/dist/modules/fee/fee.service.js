"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const installment_model_1 = require("./installment.model");
const student_model_1 = require("../student/student.model");
const notification_service_1 = require("../notification/notification.service");
const attendance_service_1 = require("../attendance/attendance.service");
class FeeService {
}
exports.FeeService = FeeService;
_a = FeeService;
/**
 * Record payment for an installment
 */
FeeService.payInstallment = async (installmentId, notes, adminId) => {
    const installment = await installment_model_1.Installment.findById(installmentId);
    if (!installment)
        return null;
    if (installment.status === 'paid') {
        throw new Error('Installment is already paid.');
    }
    installment.status = 'paid';
    installment.paidDate = new Date();
    installment.notes = notes;
    installment.markedBy = new mongoose_1.default.Types.ObjectId(adminId);
    await installment.save();
    return installment;
};
/**
 * Get installments list for a student
 */
FeeService.getStudentInstallments = async (studentId) => {
    return installment_model_1.Installment.find({ student: new mongoose_1.default.Types.ObjectId(studentId) }).sort({
        installmentNumber: 1,
    });
};
/**
 * Cron helper to scan pending installments past their due date and flag them as overdue
 */
FeeService.markPendingAsOverdue = async () => {
    const todayMidnight = attendance_service_1.AttendanceService.normalizeDate(new Date());
    const result = await installment_model_1.Installment.updateMany({
        status: 'pending',
        dueDate: { $lt: todayMidnight },
    }, {
        $set: { status: 'overdue' },
    });
    console.log(`🧹 Fee Overdue Marker processed. Updated ${result.modifiedCount} installments to overdue.`);
    return result.modifiedCount;
};
/**
 * Scans and queues SMS reminders based on due dates
 */
FeeService.sendScheduledReminders = async () => {
    const today = attendance_service_1.AttendanceService.normalizeDate(new Date());
    // 1. Due Today Reminders
    const dueToday = await installment_model_1.Installment.find({
        status: 'pending',
        dueDate: today,
    }).populate('student');
    for (const inst of dueToday) {
        const student = inst.student;
        if (!student || student.status !== 'active')
            continue;
        const dateStr = inst.dueDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        notification_service_1.NotificationService.sendFeeReminder({
            studentName: student.name,
            parentName: student.parentName,
            parentMobile: student.parentMobile,
            parentEmail: student.parentEmail,
            studentId: student._id.toString(),
            installmentId: inst._id.toString(),
            amount: inst.amount,
            dueDateStr: dateStr,
            installmentNumber: inst.installmentNumber,
            reminderType: 'due_today',
        }).catch((err) => console.error('Failed to send due today reminder:', err));
    }
    // 2. Upcoming Reminders (3 days prior)
    const threeDaysLater = new Date(today);
    threeDaysLater.setUTCDate(today.getUTCDate() + 3);
    const upcoming = await installment_model_1.Installment.find({
        status: 'pending',
        dueDate: threeDaysLater,
    }).populate('student');
    for (const inst of upcoming) {
        const student = inst.student;
        if (!student || student.status !== 'active')
            continue;
        const dateStr = inst.dueDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        notification_service_1.NotificationService.sendFeeReminder({
            studentName: student.name,
            parentName: student.parentName,
            parentMobile: student.parentMobile,
            parentEmail: student.parentEmail,
            studentId: student._id.toString(),
            installmentId: inst._id.toString(),
            amount: inst.amount,
            dueDateStr: dateStr,
            installmentNumber: inst.installmentNumber,
            reminderType: 'upcoming',
        }).catch((err) => console.error('Failed to send upcoming reminder:', err));
    }
    // 3. Overdue Reminders (weekly alert)
    const overdue = await installment_model_1.Installment.find({
        status: 'overdue',
    }).populate('student');
    for (const inst of overdue) {
        const student = inst.student;
        if (!student || student.status !== 'active')
            continue;
        const diffTime = Math.abs(today.getTime() - inst.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dateStr = inst.dueDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        notification_service_1.NotificationService.sendFeeReminder({
            studentName: student.name,
            parentName: student.parentName,
            parentMobile: student.parentMobile,
            parentEmail: student.parentEmail,
            studentId: student._id.toString(),
            installmentId: inst._id.toString(),
            amount: inst.amount,
            dueDateStr: dateStr,
            installmentNumber: inst.installmentNumber,
            reminderType: 'overdue',
            daysOverdue: diffDays,
        }).catch((err) => console.error('Failed to send overdue reminder:', err));
    }
};
/**
 * Generates collections reports for fee dashboard
 */
FeeService.getFeeReport = async (filters) => {
    // Build query filter
    const matchStage = {};
    if (filters.status) {
        matchStage.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
        matchStage.dueDate = {};
        if (filters.startDate) {
            matchStage.dueDate.$gte = attendance_service_1.AttendanceService.normalizeDate(filters.startDate);
        }
        if (filters.endDate) {
            matchStage.dueDate.$lte = attendance_service_1.AttendanceService.normalizeDate(filters.endDate);
        }
    }
    // Pipeline to aggregate totals
    const summaryPipeline = [{ $match: matchStage }];
    // If filtering by class/section, we must join student details first
    if (filters.class || filters.section) {
        summaryPipeline.push({
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'studentInfo',
            },
        }, { $unwind: '$studentInfo' });
        if (filters.class) {
            summaryPipeline.push({ $match: { 'studentInfo.class': filters.class } });
        }
        if (filters.section) {
            summaryPipeline.push({
                $match: { 'studentInfo.section': filters.section.toUpperCase() },
            });
        }
    }
    summaryPipeline.push({
        $group: {
            _id: null,
            totalExpected: { $sum: '$amount' },
            collected: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
            overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0] } },
        },
    });
    const summaryResult = await installment_model_1.Installment.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
        totalExpected: 0,
        collected: 0,
        pending: 0,
        overdue: 0,
    };
    // Class wise collection details
    const classWisePipeline = [
        { $match: { status: 'paid' } },
        {
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'studentInfo',
            },
        },
        { $unwind: '$studentInfo' },
        {
            $group: {
                _id: '$studentInfo.class',
                collected: { $sum: '$amount' },
            },
        },
        { $sort: { _id: 1 } },
    ];
    const classWiseResult = await installment_model_1.Installment.aggregate(classWisePipeline);
    return {
        summary,
        classWise: classWiseResult.map((item) => ({
            class: item._id,
            collected: item.collected,
        })),
    };
};
/**
 * List all overdue installments
 */
FeeService.getOverdueInstallments = async () => {
    return installment_model_1.Installment.find({ status: 'overdue' })
        .populate('student', 'name class section admissionNumber parentName parentMobile')
        .sort({ dueDate: 1 });
};
/**
 * Get ALL active students with their aggregated fee status for the fee board
 */
FeeService.getAllStudentsWithFeeStatus = async (filters) => {
    // Build student filter
    const studentFilter = { status: 'active' };
    if (filters.class)
        studentFilter.class = filters.class;
    if (filters.section)
        studentFilter.section = filters.section.toUpperCase();
    if (filters.search) {
        studentFilter.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { admissionNumber: { $regex: filters.search, $options: 'i' } },
        ];
    }
    const students = await student_model_1.Student.find(studentFilter)
        .sort({ class: 1, section: 1, name: 1 })
        .select('name admissionNumber class section totalFee numberOfInstallments feeEndDate parentName parentMobile joiningDate');
    // Fetch all installments for these students in bulk
    const studentIds = students.map((s) => s._id);
    const allInstallments = await installment_model_1.Installment.find({
        student: { $in: studentIds },
    }).sort({ installmentNumber: 1 });
    // Group installments by student
    const installmentMap = new Map();
    allInstallments.forEach((inst) => {
        const sid = inst.student.toString();
        if (!installmentMap.has(sid))
            installmentMap.set(sid, []);
        installmentMap.get(sid).push(inst);
    });
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const result = students.map((student) => {
        const installments = installmentMap.get(student._id.toString()) || [];
        const paidAmount = installments
            .filter((i) => i.status === 'paid')
            .reduce((sum, i) => sum + i.amount, 0);
        const pendingAmount = installments
            .filter((i) => i.status === 'pending')
            .reduce((sum, i) => sum + i.amount, 0);
        const overdueAmount = installments
            .filter((i) => i.status === 'overdue')
            .reduce((sum, i) => sum + i.amount, 0);
        // Find next upcoming installment (first pending/overdue)
        const nextInstallment = installments.find((i) => i.status === 'pending' || i.status === 'overdue');
        // Determine overall status
        let feeStatus = 'unpaid';
        if (paidAmount >= student.totalFee) {
            feeStatus = 'fully_paid';
        }
        else if (overdueAmount > 0) {
            feeStatus = 'overdue';
        }
        else if (paidAmount > 0) {
            feeStatus = 'partial';
        }
        return {
            _id: student._id,
            name: student.name,
            admissionNumber: student.admissionNumber,
            class: student.class,
            section: student.section,
            totalFee: student.totalFee,
            numberOfInstallments: student.numberOfInstallments,
            parentName: student.parentName,
            parentMobile: student.parentMobile,
            paidAmount,
            pendingAmount,
            overdueAmount,
            feeStatus,
            nextInstallment: nextInstallment
                ? {
                    installmentNumber: nextInstallment.installmentNumber,
                    amount: nextInstallment.amount,
                    dueDate: nextInstallment.dueDate,
                    status: nextInstallment.status,
                }
                : null,
            paidCount: installments.filter((i) => i.status === 'paid').length,
            totalInstallments: installments.length,
        };
    });
    return result;
};
/**
 * Send a manual SMS fee reminder for a specific installment
 */
FeeService.sendManualFeeReminder = async (installmentId) => {
    const installment = await installment_model_1.Installment.findById(installmentId).populate('student');
    if (!installment) {
        throw new Error('Installment not found');
    }
    const student = installment.student;
    if (!student || student.status !== 'active') {
        throw new Error('Student not found or inactive');
    }
    if (installment.status === 'paid') {
        throw new Error('This installment is already paid');
    }
    const dateStr = installment.dueDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const reminderType = installment.status === 'overdue' ? 'overdue' : 'due_today';
    const daysOverdue = installment.status === 'overdue'
        ? Math.ceil(Math.abs(new Date().getTime() - installment.dueDate.getTime()) /
            (1000 * 60 * 60 * 24))
        : undefined;
    await notification_service_1.NotificationService.sendFeeReminder({
        studentName: student.name,
        parentName: student.parentName,
        parentMobile: student.parentMobile,
        parentEmail: student.parentEmail,
        studentId: student._id.toString(),
        installmentId: installment._id.toString(),
        amount: installment.amount,
        dueDateStr: dateStr,
        installmentNumber: installment.installmentNumber,
        reminderType,
        daysOverdue,
    });
    const channelName = student.parentEmail ? 'Email' : 'SMS';
    return { success: true, message: `${channelName} reminder sent to ${student.parentName} (${student.parentEmail || student.parentMobile})` };
};
//# sourceMappingURL=fee.service.js.map