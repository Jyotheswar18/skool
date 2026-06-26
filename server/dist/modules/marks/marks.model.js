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
exports.Marks = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const marksSchema = new mongoose_1.Schema({
    student: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student reference is required'],
    },
    class: {
        type: String,
        required: [true, 'Class is required'],
        trim: true,
    },
    section: {
        type: String,
        required: [true, 'Section is required'],
        trim: true,
        uppercase: true,
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
    },
    examName: {
        type: String,
        required: [true, 'Exam name is required'],
        trim: true,
    },
    marksObtained: {
        type: Number,
        required: [true, 'Marks obtained is required'],
        min: [0, 'Marks obtained cannot be negative'],
    },
    maxMarks: {
        type: Number,
        required: [true, 'Maximum marks is required'],
        default: 100,
        min: [1, 'Maximum marks must be at least 1'],
    },
    comments: {
        type: String,
        trim: true,
    },
    uploadedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes to speed up queries and ensure uniqueness
marksSchema.index({ class: 1, section: 1, subject: 1, examName: 1 });
marksSchema.index({ student: 1, examName: 1, subject: 1 }, { unique: true });
exports.Marks = mongoose_1.default.model('Marks', marksSchema);
//# sourceMappingURL=marks.model.js.map