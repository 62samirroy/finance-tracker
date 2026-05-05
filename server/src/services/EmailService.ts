import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    let config: any = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log('📝 No SMTP credentials found. Generating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      config = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };
    }

    this.transporter = nodemailer.createTransport(config);
    return this.transporter;
  }

  async sendResetPasswordEmail(email: string, resetToken: string) {
    const transporter = await this.getTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Finance Tracker" <${process.env.SMTP_USER || 'noreply@financetracker.com'}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #18181b; margin-bottom: 16px;">Password Reset</h2>
          <p style="color: #52525b; line-height: 1.5; margin-bottom: 24px;">
            You requested a password reset for your Finance Tracker account. Click the button below to set a new password. This link will expire in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send reset email');
    }
  }
}

export default new EmailService();
