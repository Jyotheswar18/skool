import mongoose from 'mongoose';
import { IEventDocument } from './event.model';
import { PaginationQuery } from '../../shared/types/common.types';
export declare class EventService {
    static createEvent: (eventData: any, creatorId: string) => Promise<IEventDocument>;
    static updateEvent: (id: string, updateData: any) => Promise<IEventDocument | null>;
    static deleteEvent: (id: string) => Promise<boolean>;
    static getEventById: (id: string) => Promise<IEventDocument | null>;
    /**
     * Publishes an event and broadcasts notifications to parents of the target audience
     */
    static publishEvent: (id: string) => Promise<IEventDocument | null>;
    /**
     * Resolves target students and broadcasts SMS event messages to unique parents
     */
    private static broadcastEventToAudience;
    static queryEvents: (query: PaginationQuery & {
        isPublished?: string;
    }) => Promise<{
        events: (mongoose.Document<unknown, {}, IEventDocument, {}, mongoose.DefaultSchemaOptions> & IEventDocument & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: import("../../shared/types/common.types").PaginationResult;
    }>;
}
//# sourceMappingURL=event.service.d.ts.map