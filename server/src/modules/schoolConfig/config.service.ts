import { SchoolConfig, ISchoolConfigDocument } from './schoolConfig.model';
import { DEFAULT_CLASSES, DEFAULT_SECTIONS } from '../../shared/constants';

export class ConfigService {
  /**
   * Fetch school config (singleton, creates one if none exists)
   */
  static getConfig = async (): Promise<ISchoolConfigDocument> => {
    let config = await SchoolConfig.findOne();

    if (!config) {
      config = await SchoolConfig.create({
        schoolName: 'EduNest School',
        academicYear: '2026-27',
        classes: DEFAULT_CLASSES,
        sections: DEFAULT_SECTIONS,

        sms: {
          provider: 'mock',
          enabled: true,
        },
        feeReminder: {
          daysBeforeDue: 3,
          sendOnDueDate: true,
          overdueFrequency: 'weekly',
        },
        attendanceAlert: {
          enabled: false,
          sendTime: '10:00',
        },
      });
    }

    return config;
  };

  /**
   * Update school config
   */
  static updateConfig = async (updateData: any): Promise<ISchoolConfigDocument> => {
    let config = await SchoolConfig.findOne();

    if (!config) {
      config = new SchoolConfig(updateData);
    } else {
      config.set(updateData);
    }

    await config.save();
    return config;
  };
}
