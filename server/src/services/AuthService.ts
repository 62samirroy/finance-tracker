import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import emailService from "./EmailService";

class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(data: any) {
    const { email, password, name } = data;
    
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name
    });

    await this.userRepository.save(user);
    
    return this.generateToken(user);
  }

  async login(data: any) {
    const { email, password } = data;
    
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d"
    });

    return { token, user: payload };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepository.save(user);

    await emailService.sendResetPasswordEmail(user.email, resetToken);

    return { message: "Password reset link sent to your email" };
  }

  async resetPassword(token: string, newPassword: any) {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
      }
    });

    if (!user || (user.resetPasswordExpires && user.resetPasswordExpires < new Date())) {
      throw new Error("Token is invalid or has expired");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = new Date(0);
    await this.userRepository.save(user);

    return { message: "Password has been reset" };
  }
}

export default new AuthService();
