import { PaginationQuery, PaginationResult } from '../types/common.types';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  order: 1 | -1;
}

export const parsePagination = (
  query: PaginationQuery,
  defaults: { sortBy?: string; limit?: number } = {}
): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || String(defaults.limit || 20), 10)));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || defaults.sortBy || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;

  return { page, limit, skip, sortBy, order };
};

export const buildPaginationResult = (
  page: number,
  limit: number,
  total: number
): PaginationResult => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
