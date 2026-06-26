import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  admissionNumber: string;
  class: string;
  section: string;
  parentName: string;
  parentMobile: string;
  alternateMobile?: string;
  parentEmail?: string;
  address?: string;
  joiningDate: Date;
  totalFee: number;
  numberOfInstallments: number;
  feeEndDate?: Date;
  status: 'active' | 'inactive';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudentDocument>(
  {
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
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ name: 'text', admissionNumber: 'text', parentName: 'text' });

export const Student = mongoose.model<IStudentDocument>('Student', studentSchema);
