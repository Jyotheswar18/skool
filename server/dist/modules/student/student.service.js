"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const student_model_1 = require("./student.model");
const installment_model_1 = require("../fee/installment.model");
const notification_service_1 = require("../notification/notification.service");
const pagination_1 = require("../../shared/utils/pagination");
class StudentService {
}
exports.StudentService = StudentService;
_a = StudentService;
/**
 * Create a new student, auto-generate installments, and send onboarding WhatsApp message
 */
StudentService.createStudent = async (studentData, creatorId) => {
    // 1. Save student record
    const student = new student_model_1.Student({
        ...studentData,
        createdBy: new mongoose_1.default.Types.ObjectId(creatorId),
    });
    await student.save();
    try {
        // 2. Generate installment schedule
        const { totalFee, numberOfInstallments, joiningDate, feeEndDate } = student;
        const baseAmount = Math.floor(totalFee / numberOfInstallments);
        const remainder = totalFee % numberOfInstallments; // Add remainder to first installment
        const installmentsToCreate = [];
        const startDate = new Date(joiningDate);
        // Calculate interval between installments
        let intervalMs;
        if (feeEndDate) {
            const endDate = new Date(feeEndDate);
            const totalDuration = endDate.getTime() - startDate.getTime();
            intervalMs = numberOfInstallments > 1 ? totalDuration / (numberOfInstallments - 1) : 0;
        }
        else {
            // Default: monthly intervals (30 days)
            intervalMs = 30 * 24 * 60 * 60 * 1000;
        }
        for (let i = 0; i < numberOfInstallments; i++) {
            let dueDate;
            if (feeEndDate && numberOfInstallments > 1) {
                // Evenly distribute between joiningDate and feeEndDate
                dueDate = new Date(startDate.getTime() + intervalMs * i);
            }
            else if (feeEndDate && numberOfInstallments === 1) {
                dueDate = new Date(startDate);
            }
            else {
                // Monthly spacing fallback
                dueDate = new Date(startDate);
                dueDate.setMonth(startDate.getMonth() + i);
            }
            // Adjust amount to clear remainders
            const amount = i === 0 ? baseAmount + remainder : baseAmount;
            installmentsToCreate.push({
                student: student._id,
                installmentNumber: i + 1,
                amount,
                dueDate,
                status: 'pending',
            });
        }
        await installment_model_1.Installment.insertMany(installmentsToCreate);
        // 3. Send Onboarding WhatsApp welcome message to parent (Non-blocking async)
        notification_service_1.NotificationService.sendWelcomeMessage(student.name, student.class, student.section, student.totalFee, student.numberOfInstallments, student.parentName, student.parentMobile, student._id.toString()).catch((err) => console.error('Onboarding Welcome SMS failed:', err));
        return student;
    }
    catch (error) {
        // Rollback: remove the student if installment creation failed
        await student_model_1.Student.findByIdAndDelete(student._id);
        throw error;
    }
};
/**
 * Update student details
 */
StudentService.updateStudent = async (id, updateData) => {
    const student = await student_model_1.Student.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    return student;
};
/**
 * Delete student (soft delete by marking as inactive or fully deleting depending on requirements)
 * For safety, we will soft delete (status -> inactive) and delete unpaid pending installments
 */
StudentService.deleteStudent = async (id) => {
    const student = await student_model_1.Student.findById(id);
    if (!student)
        return false;
    // Change status to inactive
    student.status = 'inactive';
    await student.save();
    // Clean up pending and overdue installments
    await installment_model_1.Installment.deleteMany({
        student: student._id,
        status: { $in: ['pending', 'overdue'] },
    });
    return true;
};
/**
 * Get student profile by ID along with installment schedule and attendance summary
 */
StudentService.getStudentProfile = async (id) => {
    const student = await student_model_1.Student.findById(id).populate('createdBy', 'name email');
    if (!student)
        return null;
    const installments = await installment_model_1.Installment.find({ student: student._id }).sort({ installmentNumber: 1 });
    // Fetch attendance summary using mongo aggregation
    const attendanceStats = await mongoose_1.default.model('Attendance').aggregate([
        { $match: { student: student._id } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
            },
        },
    ]);
    const attendanceSummary = attendanceStats[0] || {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
    };
    const attendancePercentage = attendanceSummary.total > 0
        ? Math.round(((attendanceSummary.present + attendanceSummary.late) / attendanceSummary.total) * 100)
        : 100;
    return {
        student,
        installments,
        attendanceSummary: {
            ...attendanceSummary,
            percentage: attendancePercentage,
        },
    };
};
/**
 * Search, filter, and paginate students
 */
StudentService.queryStudents = async (query) => {
    const { page, limit, skip, sortBy, order } = (0, pagination_1.parsePagination)(query, { sortBy: 'name', limit: 20 });
    const filter = {};
    if (query.status) {
        filter.status = query.status;
    }
    if (query.class) {
        filter.class = query.class;
    }
    if (query.section) {
        filter.section = query.section.toUpperCase();
    }
    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { admissionNumber: { $regex: query.search, $options: 'i' } },
            { parentName: { $regex: query.search, $options: 'i' } },
        ];
    }
    const total = await student_model_1.Student.countDocuments(filter);
    const students = await student_model_1.Student.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');
    const paginationResult = (0, pagination_1.buildPaginationResult)(page, limit, total);
    return { students, pagination: paginationResult };
};
//# sourceMappingURL=student.service.js.map