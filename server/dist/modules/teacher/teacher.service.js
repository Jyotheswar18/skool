"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherService = void 0;
const user_model_1 = require("../auth/user.model");
const pagination_1 = require("../../shared/utils/pagination");
class TeacherService {
}
exports.TeacherService = TeacherService;
_a = TeacherService;
TeacherService.createTeacher = async (teacherData) => {
    const teacher = new user_model_1.User({
        ...teacherData,
        role: 'teacher',
    });
    await teacher.save();
    return teacher;
};
TeacherService.updateTeacher = async (id, updateData) => {
    const teacher = await user_model_1.User.findOneAndUpdate({ _id: id, role: 'teacher' }, updateData, { new: true, runValidators: true });
    return teacher;
};
TeacherService.resetPassword = async (id, newPassword) => {
    const teacher = await user_model_1.User.findOne({ _id: id, role: 'teacher' });
    if (!teacher)
        return null;
    teacher.password = newPassword; // Pre-save hook will hash this automatically!
    await teacher.save();
    return teacher;
};
TeacherService.getTeacherById = async (id) => {
    const teacher = await user_model_1.User.findOne({ _id: id, role: 'teacher' });
    return teacher;
};
TeacherService.deleteTeacher = async (id) => {
    const result = await user_model_1.User.deleteOne({ _id: id, role: 'teacher' });
    return result.deletedCount > 0;
};
TeacherService.queryTeachers = async (query) => {
    const { page, limit, skip, sortBy, order } = (0, pagination_1.parsePagination)(query, { sortBy: 'name', limit: 20 });
    const filter = { role: 'teacher' };
    if (query.status) {
        filter.status = query.status;
    }
    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
            { mobile: { $regex: query.search, $options: 'i' } },
        ];
    }
    const total = await user_model_1.User.countDocuments(filter);
    const teachers = await user_model_1.User.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);
    const paginationResult = (0, pagination_1.buildPaginationResult)(page, limit, total);
    return { teachers, pagination: paginationResult };
};
//# sourceMappingURL=teacher.service.js.map