import mongoose from 'mongoose';
import { Event, IEventDocument } from './event.model';
import { Student } from '../student/student.model';
import { NotificationService } from '../notification/notification.service';
import { parsePagination, buildPaginationResult } from '../../shared/utils/pagination';
import { PaginationQuery } from '../../shared/types/common.types';

export class EventService {
  static createEvent = async (eventData: any, creatorId: string): Promise<IEventDocument> => {
    const event = new Event({
      ...eventData,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    });
    await event.save();
    return event;
  };

  static updateEvent = async (id: string, updateData: any): Promise<IEventDocument | null> => {
    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return event;
  };

  static deleteEvent = async (id: string): Promise<boolean> => {
    const result = await Event.deleteOne({ _id: id });
    return result.deletedCount > 0;
  };

  static getEventById = async (id: string): Promise<IEventDocument | null> => {
    return Event.findById(id).populate('createdBy', 'name email');
  };

  /**
   * Publishes an event and broadcasts notifications to parents of the target audience
   */
  static publishEvent = async (id: string): Promise<IEventDocument | null> => {
    const event = await Event.findById(id);
    if (!event) return null;

    if (event.isPublished) {
      throw new Error('Event is already published.');
    }

    event.isPublished = true;
    event.publishedAt = new Date();
    await event.save();

    // Trigger async audience broadcast
    this.broadcastEventToAudience(event).catch((err) =>
      console.error(`Error broadcasting event [${event.title}]:`, err)
    );

    return event;
  };

  /**
   * Resolves target students and broadcasts WhatsApp event messages to unique parents
   */
  private static broadcastEventToAudience = async (event: IEventDocument) => {
    const audType = event.targetAudience.type;
    const classes = event.targetAudience.classes || [];
    const sections = event.targetAudience.sections || [];

    const studentFilter: any = { status: 'active' };

    if (audType === 'classes' && classes.length > 0) {
      studentFilter.class = { $in: classes };
    } else if (audType === 'sections' && classes.length > 0 && sections.length > 0) {
      studentFilter.class = { $in: classes };
      studentFilter.section = { $in: sections };
    }

    const students = await Student.find(studentFilter);
    if (students.length === 0) return;

    // Track unique parent mobile numbers to prevent spamming parents with multiple kids
    const uniqueParentMobiles = new Set<string>();

    // First image/video media url to include in message
    const mediaUrl = event.media.length > 0 ? event.media[0].url : undefined;

    for (const student of students) {
      const parentMobile = student.parentMobile;
      if (!parentMobile || uniqueParentMobiles.has(parentMobile)) continue;

      uniqueParentMobiles.add(parentMobile);

      NotificationService.sendEventBroadcast({
        eventTitle: event.title,
        description: event.description || '',
        parentName: student.parentName,
        parentMobile: student.parentMobile,
        studentId: student._id.toString(),
        eventId: event._id.toString(),
        mediaUrl,
      }).catch((err) =>
        console.error(`Failed to send event broadcast to parent of ${student.name}:`, err)
      );
    }
  };

  static queryEvents = async (query: PaginationQuery & { isPublished?: string }) => {
    const { page, limit, skip, sortBy, order } = parsePagination(query, {
      sortBy: 'eventDate',
      limit: 20,
    });

    const filterObj: any = {};

    if (query.isPublished !== undefined) {
      filterObj.isPublished = query.isPublished === 'true';
    }

    const total = await Event.countDocuments(filterObj);
    const events = await Event.find(filterObj)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const paginationResult = buildPaginationResult(page, limit, total);

    return { events, pagination: paginationResult };
  };
}
