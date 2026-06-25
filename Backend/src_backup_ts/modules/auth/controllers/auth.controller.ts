import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { BaseController } from '../../../shared/base/base.controller';

export class AuthController extends BaseController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req);
      const user = await this.authService.register(validatedData.body);
      return this.sendSuccess(res, user, 'Registration successful', 201);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Validation Failed', errors: error.errors });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req);
      const result = await this.authService.login(validatedData.body.email, validatedData.body.password);
      return this.sendSuccess(res, result, 'Login successful', 200);
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
    }
  };
}
