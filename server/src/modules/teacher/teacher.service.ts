import { User } from '../auth/user.model';
import { parsePagination, buildPaginationResult } from '../../shared/utils/pagination';
import { PaginationQuery } from '../../shared/types/common.types';

export class TeacherService {
  static createTeacher = async (teacherData: any) => {
    const teacher = new User({
      ...teacherData,
      role: 'teacher',
    });
    await teacher.save();
    return teacher;
  };

  static updateTeacher = async (id: string, updateData: any) => {
    const teacher = await User.findOneAndUpdate(
      { _id: id, role: 'teacher' },
      updateData,
      { new: true, runValidators: true }
    );
    return teacher;
  };

  static resetPassword = async (id: string, newPassword: string) => {
    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    if (!teacher) return null;

    teacher.password = newPassword; // Pre-save hook will hash this automatically!
    await teacher.save();
    return teacher;
  };

  static getTeacherById = async (id: string) => {
    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    return teacher;
  };

  static deleteTeacher = async (id: string): Promise<boolean> => {
    const result = await User.deleteOne({ _id: id, role: 'teacher' });
    return result.deletedCount > 0;
  };

  static queryTeachers = async (query: PaginationQuery & { search?: string; status?: string }) => {
    const { page, limit, skip, sortBy, order } = parsePagination(query, { sortBy: 'name', limit: 20 });

    const filter: any = { role: 'teacher' };

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

    const total = await User.countDocuments(filter);
    const teachers = await User.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const paginationResult = buildPaginationResult(page, limit, total);

    return { teachers, pagination: paginationResult };
  };
}
