"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const notificationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['onboarding', 'fee_reminder', 'fee_overdue', 'attendance_alert', 'event_broadcast'],
        required: true,
    },
    recipient: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student' },
    },
    message: {
        type: String,
        required: true,
    },
    mediaUrls: {
        type: [String],
        default: [],
    },
    channel: {
        type: String,
        enum: ['whatsapp'],
        default: 'whatsapp',
    },
    status: {
        type: String,
        enum: ['queued', 'sent', 'delivered', 'failed'],
        default: 'queued',
    },
    errorMessage: {
        type: String,
    },
    relatedEntity: {
        type: {
            type: String,
            enum: ['student', 'installment', 'attendance', 'event'],
        },
        id: { type: mongoose_1.Schema.Types.ObjectId },
    },
    sentAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ 'recipient.studentId': 1 });
notificationSchema.index({ createdAt: -1 });
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
//# sourceMappingURL=notification.model.js.map