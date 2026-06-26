import { Request, Response } from 'express';
import { ConfigService } from './config.service';
import { sendSuccess } from '../../shared/utils/apiResponse';

export class ConfigController {
  static get = async (req: Request, res: Response) => {
    const config = await ConfigService.getConfig();
    return sendSuccess(res, config, 'School configuration fetched successfully');
  };

  static update = async (req: Request, res: Response) => {
    const config = await ConfigService.updateConfig(req.body);
    return sendSuccess(res, config, 'School configuration updated successfully');
  };
}
