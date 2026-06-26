import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
import { EventService } from './event.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';
import { MediaService } from '../../integrations/media/media.service';

export class EventController {
  static create = async (req: AuthRequest, res: Response) => {
    const creatorId = req.user?._id;
    if (!creatorId) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const event = await EventService.createEvent(req.body, creatorId);
    return sendSuccess(res, event, 'Event created successfully', 201);
  };

  static update = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const event = await EventService.updateEvent(id, req.body);

    if (!event) {
      return sendError(res, 'Event not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, event, 'Event details updated successfully');
  };

  static delete = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const deleted = await EventService.deleteEvent(id);

    if (!deleted) {
      return sendError(res, 'Event not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, null, 'Event deleted successfully');
  };

  static getDetails = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const event = await EventService.getEventById(id);

    if (!event) {
      return sendError(res, 'Event not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, event, 'Event details fetched successfully');
  };

  static publish = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    try {
      const event = await EventService.publishEvent(id);
      if (!event) {
        return sendError(res, 'Event not found', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, event, 'Event published and broadcast successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to publish event', 400);
    }
  };

  static uploadMedia = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return sendError(res, 'No files uploaded', 400, 'NO_FILES');
    }

    const event = await EventService.getEventById(id);
    if (!event) {
      return sendError(res, 'Event not found', 404, 'NOT_FOUND');
    }

    try {
      const uploadPromises = files.map((file) => MediaService.uploadFile(file, `events/${id}`));
      const uploadedFiles = await Promise.all(uploadPromises);

      event.media.push(...uploadedFiles);
      await event.save();

      return sendSuccess(res, event, 'Media files uploaded successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Media upload failed', 400);
    }
  };

  static deleteMedia = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const mediaId = req.params.mediaId as string;

    const event = await EventService.getEventById(id);
    if (!event) {
      return sendError(res, 'Event not found', 404, 'NOT_FOUND');
    }

    try {
      const mediaItem = event.media.find((item: any) => item._id?.toString() === mediaId);
      if (!mediaItem) {
        return sendError(res, 'Media file not found in event', 404, 'NOT_FOUND');
      }

      // Delete from Cloudinary or local disk
      if (mediaItem.publicId) {
        await MediaService.deleteFile(mediaItem.publicId);
      }

      // Remove from event.media array
      event.media = event.media.filter((item: any) => item._id?.toString() !== mediaId);
      await event.save();

      return sendSuccess(res, event, 'Media file removed successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete media', 400);
    }
  };

  static list = async (req: AuthRequest, res: Response) => {
    const { events, pagination } = await EventService.queryEvents(req.query);
    return sendSuccess(res, events, 'Events list fetched successfully', 200, pagination);
  };
}
