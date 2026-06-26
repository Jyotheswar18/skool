import { PaginationQuery, PaginationResult } from '../types/common.types';
export interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    order: 1 | -1;
}
export declare const parsePagination: (query: PaginationQuery, defaults?: {
    sortBy?: string;
    limit?: number;
}) => PaginationOptions;
export declare const buildPaginationResult: (page: number, limit: number, total: number) => PaginationResult;
//# sourceMappingURL=pagination.d.ts.map