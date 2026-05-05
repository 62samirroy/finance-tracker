import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import emailService from "./EmailService";

class AuthService {
  private get repo() {
    return AppDataSource.getRepository(User);
  }

  private generateToken(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d"
    });
  }

  async register(data: any) {
    const { email, password, name } = data;
    
    const existingUser = await this.repo.findOneBy({ email });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.repo.create({
      email,
      password: hashedPassword,
      name
    });

    const savedUser = await this.repo.save(user);
    const token = this.generateToken(savedUser);

    return {
      token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name
      }
    };
  }

  async login(data: any) {
    const { email, password } = data;
    
    const user = await this.repo.findOneBy({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async forgotPassword(email: string) {
    const user = await this.repo.findOneBy({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: "If an account with that email exists, we sent a reset link." };
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: '1h' });
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.repo.save(user);

    await emailService.sendResetPasswordEmail(user.email, resetToken);

    return { message: "If an account with that email exists, we sent a reset link." };
  }

  async resetPassword(token: string, newPassword: any) {
    const user = await this.repo.findOne({
      where: {
        resetPasswordToken: token
      }
    });

    if (!user || (user.resetPasswordExpires && user.resetPasswordExpires < new Date())) {
      throw new Error("Invalid or expired reset token");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = new Date(0);
    
    await this.repo.save(user);

    return { message: "Password reset successful" };
  }
}

export default new AuthService();
