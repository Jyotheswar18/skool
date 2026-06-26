"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const event_model_1 = require("./event.model");
const student_model_1 = require("../student/student.model");
const notification_service_1 = require("../notification/notification.service");
const pagination_1 = require("../../shared/utils/pagination");
class EventService {
}
exports.EventService = EventService;
_a = EventService;
EventService.createEvent = async (eventData, creatorId) => {
    const event = new event_model_1.Event({
        ...eventData,
        createdBy: new mongoose_1.default.Types.ObjectId(creatorId),
    });
    await event.save();
    return event;
};
EventService.updateEvent = async (id, updateData) => {
    const event = await event_model_1.Event.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    return event;
};
EventService.deleteEvent = async (id) => {
    const result = await event_model_1.Event.deleteOne({ _id: id });
    return result.deletedCount > 0;
};
EventService.getEventById = async (id) => {
    return event_model_1.Event.findById(id).populate('createdBy', 'name email');
};
/**
 * Publishes an event and broadcasts notifications to parents of the target audience
 */
EventService.publishEvent = async (id) => {
    const event = await event_model_1.Event.findById(id);
    if (!event)
        return null;
    if (event.isPublished) {
        throw new Error('Event is already published.');
    }
    event.isPublished = true;
    event.publishedAt = new Date();
    await event.save();
    // Trigger async audience broadcast
    _a.broadcastEventToAudience(event).catch((err) => console.error(`Error broadcasting event [${event.title}]:`, err));
    return event;
};
/**
 * Resolves target students and broadcasts SMS event messages to unique parents
 */
EventService.broadcastEventToAudience = async (event) => {
    const audType = event.targetAudience.type;
    const classes = event.targetAudience.classes || [];
    const sections = event.targetAudience.sections || [];
    const studentFilter = { status: 'active' };
    if (audType === 'classes' && classes.length > 0) {
        studentFilter.class = { $in: classes };
    }
    else if (audType === 'sections' && classes.length > 0 && sections.length > 0) {
        studentFilter.class = { $in: classes };
        studentFilter.section = { $in: sections };
    }
    const students = await student_model_1.Student.find(studentFilter);
    if (students.length === 0)
        return;
    // Track unique parent mobile numbers to prevent spamming parents with multiple kids
    const uniqueParentMobiles = new Set();
    const mediaUrls = event.media.map((m) => m.url);
    for (const student of students) {
        const parentMobile = student.parentMobile;
        if (!parentMobile || uniqueParentMobiles.has(parentMobile))
            continue;
        uniqueParentMobiles.add(parentMobile);
        notification_service_1.NotificationService.sendEventBroadcast({
            eventTitle: event.title,
            description: event.description || '',
            parentName: student.parentName,
            parentMobile: student.parentMobile,
            parentEmail: student.parentEmail,
            studentId: student._id.toString(),
            eventId: event._id.toString(),
            mediaUrls,
        }).catch((err) => console.error(`Failed to send event broadcast to parent of ${student.name}:`, err));
    }
};
EventService.queryEvents = async (query) => {
    const { page, limit, skip, sortBy, order } = (0, pagination_1.parsePagination)(query, {
        sortBy: 'eventDate',
        limit: 20,
    });
    const filterObj = {};
    if (query.isPublished !== undefined) {
        filterObj.isPublished = query.isPublished === 'true';
    }
    const total = await event_model_1.Event.countDocuments(filterObj);
    const events = await event_model_1.Event.find(filterObj)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');
    const paginationResult = (0, pagination_1.buildPaginationResult)(page, limit, total);
    return { events, pagination: paginationResult };
};
//# sourceMappingURL=event.service.js.map