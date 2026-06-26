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
exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const studentSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true,
        maxlength: 100,
    },
    admissionNumber: {
        type: String,
        required: [true, 'Admission number is required'],
        unique: true,
        trim: true,
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
    parentName: {
        type: String,
        required: [true, 'Parent name is required'],
        trim: true,
        maxlength: 100,
    },
    parentMobile: {
        type: String,
        required: [true, 'Parent mobile number is required'],
        trim: true,
    },
    alternateMobile: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
    },
    totalFee: {
        type: Number,
        required: [true, 'Total fee is required'],
        min: [0, 'Total fee cannot be negative'],
    },
    numberOfInstallments: {
        type: Number,
        required: [true, 'Number of installments is required'],
        min: [1, 'Minimum 1 installment required'],
        max: [12, 'Maximum 12 installments allowed'],
    },
    feeEndDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ name: 'text', admissionNumber: 'text', parentName: 'text' });
exports.Student = mongoose_1.default.model('Student', studentSchema);
//# sourceMappingURL=student.model.js.map