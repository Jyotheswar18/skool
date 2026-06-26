"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const student_model_1 = require("../student/student.model");
const user_model_1 = require("../auth/user.model");
const installment_model_1 = require("../fee/installment.model");
const attendance_model_1 = require("../attendance/attendance.model");
const event_model_1 = require("../event/event.model");
const notification_model_1 = require("../notification/notification.model");
const attendance_service_1 = require("../attendance/attendance.service");
class DashboardService {
}
exports.DashboardService = DashboardService;
_a = DashboardService;
/**
 * Get KPI statistics for Admin Dashboard
 */
DashboardService.getAdminKpis = async () => {
    const todayMidnight = attendance_service_1.AttendanceService.normalizeDate(new Date());
    // 1. Student counts
    const totalStudents = await student_model_1.Student.countDocuments({ status: 'active' });
    // 2. Teacher counts
    const totalTeachers = await user_model_1.User.countDocuments({ role: 'teacher', status: 'active' });
    // 3. Fee metrics
    const feeMetrics = await installment_model_1.Installment.aggregate([
        {
            $group: {
                _id: '$status',
                total: { $sum: '$amount' },
            },
        },
    ]);
    const fees = { collected: 0, pending: 0, overdue: 0 };
    feeMetrics.forEach((metric) => {
        if (metric._id === 'paid')
            fees.collected = metric.total;
        if (metric._id === 'pending')
            fees.pending = metric.total;
        if (metric._id === 'overdue')
            fees.overdue = metric.total;
    });
    // 4. Today's attendance summary
    const todayAttendance = await attendance_model_1.Attendance.aggregate([
        { $match: { date: todayMidnight } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const attendanceSummary = { present: 0, absent: 0, late: 0, total: 0 };
    todayAttendance.forEach((item) => {
        if (item._id === 'present')
            attendanceSummary.present = item.count;
        if (item._id === 'absent')
            attendanceSummary.absent = item.count;
        if (item._id === 'late')
            attendanceSummary.late = item.count;
        attendanceSummary.total += item.count;
    });
    // 5. Recent events
    const recentEvents = await event_model_1.Event.find().sort({ eventDate: -1 }).limit(5);
    // 6. Recent notifications
    const recentNotifications = await notification_model_1.Notification.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('recipient.studentId', 'name class section');
    return {
        stats: {
            totalStudents,
            totalTeachers,
            totalFeesExpected: fees.collected + fees.pending + fees.overdue,
            totalFeesCollected: fees.collected,
            totalFeesPending: fees.pending,
            totalFeesOverdue: fees.overdue,
            todayAttendance: attendanceSummary,
        },
        recentEvents,
        recentNotifications,
    };
};
/**
 * Get KPI statistics for Teacher Dashboard
 */
DashboardService.getTeacherKpis = async (teacherId) => {
    const todayMidnight = attendance_service_1.AttendanceService.normalizeDate(new Date());
    const teacher = await user_model_1.User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
        throw new Error('Teacher record not found');
    }
    const { assignedClasses, assignedSections: rawSections } = teacher;
    const assignedSections = rawSections.map((s) => s.trim().toUpperCase());
    if (assignedClasses.length === 0 || assignedSections.length === 0) {
        return {
            stats: {
                assignedClassesCount: 0,
                totalStudents: 0,
                todayAttendance: { present: 0, absent: 0, late: 0, total: 0 },
            },
            classCompletion: [],
        };
    }
    // 1. Total students under teacher's scope
    const totalStudents = await student_model_1.Student.countDocuments({
        class: { $in: assignedClasses },
        section: { $in: assignedSections },
        status: 'active',
    });
    // 2. Today's attendance counts under teacher's scope
    const todayAttendance = await attendance_model_1.Attendance.aggregate([
        {
            $match: {
                date: todayMidnight,
                class: { $in: assignedClasses },
                section: { $in: assignedSections },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const attendanceSummary = { present: 0, absent: 0, late: 0, total: 0 };
    todayAttendance.forEach((item) => {
        if (item._id === 'present')
            attendanceSummary.present = item.count;
        if (item._id === 'absent')
            attendanceSummary.absent = item.count;
        if (item._id === 'late')
            attendanceSummary.late = item.count;
        attendanceSummary.total += item.count;
    });
    // 3. Class-wise attendance marking status (Completed / Not Marked)
    // We check if at least one attendance log exists for each combination
    const classCompletion = [];
    for (const cls of assignedClasses) {
        for (const sec of assignedSections) {
            // First verify if there are any students in this class/section
            const studentCount = await student_model_1.Student.countDocuments({
                class: cls,
                section: sec,
                status: 'active',
            });
            if (studentCount === 0)
                continue;
            const countMarked = await attendance_model_1.Attendance.countDocuments({
                class: cls,
                section: sec,
                date: todayMidnight,
            });
            // Get details of present students today
            const attendanceLogs = await attendance_model_1.Attendance.find({
                class: cls,
                section: sec,
                date: todayMidnight,
                status: { $in: ['present', 'late'] },
            }).populate('student', 'name admissionNumber');
            const presentStudents = attendanceLogs
                .map((log) => log.student)
                .filter(Boolean);
            // Subject & Timing helper
            const getSubjectAndTiming = (c, s) => {
                const clsNum = parseInt(c);
                let subject = 'General Studies';
                let timing = '09:00 AM - 09:45 AM';
                if (clsNum === 5) {
                    if (s === 'A') {
                        subject = 'Mathematics';
                        timing = '09:00 AM - 09:45 AM';
                    }
                    else if (s === 'B') {
                        subject = 'General Science';
                        timing = '10:00 AM - 10:45 AM';
                    }
                    else {
                        subject = 'English';
                        timing = '11:00 AM - 11:45 AM';
                    }
                }
                else if (clsNum === 6) {
                    if (s === 'A') {
                        subject = 'Social Science';
                        timing = '09:00 AM - 09:45 AM';
                    }
                    else if (s === 'B') {
                        subject = 'Mathematics';
                        timing = '10:00 AM - 10:45 AM';
                    }
                    else {
                        subject = 'Hindi';
                        timing = '11:00 AM - 11:45 AM';
                    }
                }
                else if (clsNum === 7) {
                    if (s === 'A') {
                        subject = 'General Science';
                        timing = '11:00 AM - 11:45 AM';
                    }
                    else if (s === 'B') {
                        subject = 'English Grammar';
                        timing = '12:00 PM - 12:45 PM';
                    }
                    else {
                        subject = 'Mathematics';
                        timing = '01:30 PM - 02:15 PM';
                    }
                }
                else if (clsNum === 8) {
                    if (s === 'A') {
                        subject = 'History & Civics';
                        timing = '01:30 PM - 02:15 PM';
                    }
                    else if (s === 'B') {
                        subject = 'Geography';
                        timing = '02:15 PM - 03:00 PM';
                    }
                    else {
                        subject = 'Sanskrit';
                        timing = '03:00 PM - 03:45 PM';
                    }
                }
                else if (clsNum === 9) {
                    if (s === 'A') {
                        subject = 'Physics';
                        timing = '02:15 PM - 03:00 PM';
                    }
                    else if (s === 'B') {
                        subject = 'Chemistry';
                        timing = '03:00 PM - 03:45 PM';
                    }
                    else {
                        subject = 'Biology';
                        timing = '03:45 PM - 04:30 PM';
                    }
                }
                else if (clsNum === 10) {
                    if (s === 'A') {
                        subject = 'Computer Science';
                        timing = '09:00 AM - 09:45 AM';
                    }
                    else if (s === 'B') {
                        subject = 'Mathematics';
                        timing = '10:00 AM - 10:45 AM';
                    }
                    else {
                        subject = 'English Literature';
                        timing = '11:00 AM - 11:45 AM';
                    }
                }
                else {
                    const subjects = ['Mathematics', 'Environmental Studies', 'English', 'Hindi', 'Art & Craft', 'Music'];
                    const timings = ['09:00 AM - 09:45 AM', '10:00 AM - 10:45 AM', '11:00 AM - 11:45 AM', '12:00 PM - 12:45 PM', '01:30 PM - 02:15 PM', '02:15 PM - 03:00 PM'];
                    const hash = (c.charCodeAt(0) || 0) + (s.charCodeAt(0) || 0);
                    subject = subjects[hash % subjects.length];
                    timing = timings[hash % timings.length];
                }
                return { subject, timing };
            };
            const { subject, timing } = getSubjectAndTiming(cls, sec);
            classCompletion.push({
                class: cls,
                section: sec,
                studentCount,
                isMarked: countMarked > 0,
                subject,
                timing,
                presentStudentsCount: presentStudents.length,
                presentStudents,
            });
        }
    }
    return {
        stats: {
            assignedClassesCount: assignedClasses.length,
            assignedSectionsCount: assignedSections.length,
            totalStudents,
            todayAttendance: attendanceSummary,
        },
        classCompletion,
    };
};
//# sourceMappingURL=dashboard.service.js.map