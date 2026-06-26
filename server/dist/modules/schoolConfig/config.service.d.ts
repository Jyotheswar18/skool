import { ISchoolConfigDocument } from './schoolConfig.model';
export declare class ConfigService {
    /**
     * Fetch school config (singleton, creates one if none exists)
     */
    static getConfig: () => Promise<ISchoolConfigDocument>;
    /**
     * Update school config
     */
    static updateConfig: (updateData: any) => Promise<ISchoolConfigDocument>;
}
//# sourceMappingURL=config.service.d.ts.map