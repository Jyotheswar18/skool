"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = require("./event.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
const media_service_1 = require("../../integrations/media/media.service");
class EventController {
}
exports.EventController = EventController;
_a = EventController;
EventController.create = async (req, res) => {
    const creatorId = req.user?._id;
    if (!creatorId) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    const event = await event_service_1.EventService.createEvent(req.body, creatorId);
    return (0, apiResponse_1.sendSuccess)(res, event, 'Event created successfully', 201);
};
EventController.update = async (req, res) => {
    const id = req.params.id;
    const event = await event_service_1.EventService.updateEvent(id, req.body);
    if (!event) {
        return (0, apiResponse_1.sendError)(res, 'Event not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, event, 'Event details updated successfully');
};
EventController.delete = async (req, res) => {
    const id = req.params.id;
    const deleted = await event_service_1.EventService.deleteEvent(id);
    if (!deleted) {
        return (0, apiResponse_1.sendError)(res, 'Event not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, null, 'Event deleted successfully');
};
EventController.getDetails = async (req, res) => {
    const id = req.params.id;
    const event = await event_service_1.EventService.getEventById(id);
    if (!event) {
        return (0, apiResponse_1.sendError)(res, 'Event not found', 404, 'NOT_FOUND');
    }
    return (0, apiResponse_1.sendSuccess)(res, event, 'Event details fetched successfully');
};
EventController.publish = async (req, res) => {
    const id = req.params.id;
    try {
        const event = await event_service_1.EventService.publishEvent(id);
        if (!event) {
            return (0, apiResponse_1.sendError)(res, 'Event not found', 404, 'NOT_FOUND');
        }
        return (0, apiResponse_1.sendSuccess)(res, event, 'Event published and broadcast successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Failed to publish event', 400);
    }
};
EventController.uploadMedia = async (req, res) => {
    const id = req.params.id;
    const files = req.files;
    if (!files || files.length === 0) {
        return (0, apiResponse_1.sendError)(res, 'No files uploaded', 400, 'NO_FILES');
    }
    const event = await event_service_1.EventService.getEventById(id);
    if (!event) {
        return (0, apiResponse_1.sendError)(res, 'Event not found', 404, 'NOT_FOUND');
    }
    try {
        const uploadPromises = files.map((file) => media_service_1.MediaService.uploadFile(file, `events/${id}`));
        const uploadedFiles = await Promise.all(uploadPromises);
        event.media.push(...uploadedFiles);
        await event.save();
        return (0, apiResponse_1.sendSuccess)(res, event, 'Media files uploaded successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Media upload failed', 400);
    }
};
EventController.deleteMedia = async (req, res) => {
    const id = req.params.id;
    const mediaId = req.params.mediaId;
    const event = await event_service_1.EventService.getEventById(id);
    if (!event) {
        return (0, apiResponse_1.sendError)(res, 'Event not found', 404, 'NOT_FOUND');
    }
    try {
        const mediaItem = event.media.find((item) => item._id?.toString() === mediaId);
        if (!mediaItem) {
            return (0, apiResponse_1.sendError)(res, 'Media file not found in event', 404, 'NOT_FOUND');
        }
        // Delete from Cloudinary or local disk
        if (mediaItem.publicId) {
            await media_service_1.MediaService.deleteFile(mediaItem.publicId);
        }
        // Remove from event.media array
        event.media = event.media.filter((item) => item._id?.toString() !== mediaId);
        await event.save();
        return (0, apiResponse_1.sendSuccess)(res, event, 'Media file removed successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Failed to delete media', 400);
    }
};
EventController.list = async (req, res) => {
    const { events, pagination } = await event_service_1.EventService.queryEvents(req.query);
    return (0, apiResponse_1.sendSuccess)(res, events, 'Events list fetched successfully', 200, pagination);
};
//# sourceMappingURL=event.controller.js.map