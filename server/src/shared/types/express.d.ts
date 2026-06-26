import { IUser } from './common.types';

declare global {
  namespace Express {
    // Extend standard Express User interface
    interface User {
      _id: string;
      name: string;
      email: string;
      role: 'admin' | 'teacher';
      mobile?: string;
      assignedClasses: string[];
      assignedSections: string[];
      status: 'active' | 'inactive';
    }

    interface Request {
      user?: User;
    }
  }
}
