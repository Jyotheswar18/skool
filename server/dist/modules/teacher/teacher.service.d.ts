import { PaginationQuery } from '../../shared/types/common.types';
export declare class TeacherService {
    static createTeacher: (teacherData: any) => Promise<import("mongoose").Document<unknown, {}, import("../auth/user.model").IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/user.model").IUserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static updateTeacher: (id: string, updateData: any) => Promise<(import("mongoose").Document<unknown, {}, import("../auth/user.model").IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/user.model").IUserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    static resetPassword: (id: string, newPassword: string) => Promise<(import("mongoose").Document<unknown, {}, import("../auth/user.model").IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/user.model").IUserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    static getTeacherById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../auth/user.model").IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/user.model").IUserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    static deleteTeacher: (id: string) => Promise<boolean>;
    static queryTeachers: (query: PaginationQuery & {
        search?: string;
        status?: string;
    }) => Promise<{
        teachers: (import("mongoose").Document<unknown, {}, import("../auth/user.model").IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/user.model").IUserDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: import("../../shared/types/common.types").PaginationResult;
    }>;
}
//# sourceMappingURL=teacher.service.d.ts.map