"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationResult = exports.parsePagination = void 0;
const parsePagination = (query, defaults = {}) => {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || String(defaults.limit || 20), 10)));
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || defaults.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 1 : -1;
    return { page, limit, skip, sortBy, order };
};
exports.parsePagination = parsePagination;
const buildPaginationResult = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
});
exports.buildPaginationResult = buildPaginationResult;
//# sourceMappingURL=pagination.js.map