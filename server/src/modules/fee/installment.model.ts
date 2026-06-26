import mongoose, { Schema, Document } from 'mongoose';

export interface IInstallmentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  markedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const installmentSchema = new Schema<IInstallmentDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    installmentNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
installmentSchema.index({ student: 1, installmentNumber: 1 }, { unique: true });
installmentSchema.index({ status: 1, dueDate: 1 });

export const Installment = mongoose.model<IInstallmentDocument>('Installment', installmentSchema);
