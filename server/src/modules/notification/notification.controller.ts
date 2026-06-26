import { Request, Response } from 'express';
import { Notification } from './notification.model';
import { parsePagination, buildPaginationResult } from '../../shared/utils/pagination';
import { sendSuccess } from '../../shared/utils/apiResponse';

export class NotificationController {
  static list = async (req: Request, res: Response) => {
    const query: any = { ...req.query };
    const { page, limit, skip, sortBy, order } = parsePagination(query, {
      sortBy: 'createdAt',
      limit: 20,
    });

    const filterObj: any = {};

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

    const total = await Notification.countDocuments(filterObj);
    const notifications = await Notification.find(filterObj)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .populate('recipient.studentId', 'name class section');

    const paginationResult = buildPaginationResult(page, limit, total);

    return sendSuccess(res, notifications, 'Notifications list fetched successfully', 200, paginationResult);
  };

  static getStats = async (req: Request, res: Response) => {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = stats.reduce(
      (acc: Record<string, number>, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      { queued: 0, sent: 0, delivered: 0, failed: 0 }
    );

    return sendSuccess(res, formattedStats, 'Notification statistics fetched successfully');
  };
}
