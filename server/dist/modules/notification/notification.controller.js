"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_model_1 = require("./notification.model");
const pagination_1 = require("../../shared/utils/pagination");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class NotificationController {
}
exports.NotificationController = NotificationController;
_a = NotificationController;
NotificationController.list = async (req, res) => {
    const query = { ...req.query };
    const { page, limit, skip, sortBy, order } = (0, pagination_1.parsePagination)(query, {
        sortBy: 'createdAt',
        limit: 20,
    });
    const filterObj = {};
    if (query.type) {
        filterObj.type = query.type;
    }
    if (query.status) {
        filterObj.status = query.status;
    }
    if (query.search) {
        filterObj.$or = [
            { 'recipient.name': { $regex: query.search, $options: 'i' } },
            { 'recipient.phone': { $regex: query.search, $options: 'i' } },
            { message: { $regex: query.search, $options: 'i' } },
        ];
    }
    const total = await notification_model_1.Notification.countDocuments(filterObj);
    const notifications = await notification_model_1.Notification.find(filterObj)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate('recipient.studentId', 'name class section');
    const paginationResult = (0, pagination_1.buildPaginationResult)(page, limit, total);
    return (0, apiResponse_1.sendSuccess)(res, notifications, 'Notifications list fetched successfully', 200, paginationResult);
};
NotificationController.getStats = async (req, res) => {
    const stats = await notification_model_1.Notification.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const formattedStats = stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, { queued: 0, sent: 0, delivered: 0, failed: 0 });
    return (0, apiResponse_1.sendSuccess)(res, formattedStats, 'Notification statistics fetched successfully');
};
//# sourceMappingURL=notification.controller.js.map