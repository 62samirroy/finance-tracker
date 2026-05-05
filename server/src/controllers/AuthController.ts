import { Request, Response } from "express";
import authService from "../services/AuthService";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new AuthController();
