import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import ChatAppConfig from 'etc/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OtpsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  sendEmail(email: string, text: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ChatAppConfig.NODE_MAILER_EMAIL_USERNAME,
        pass: ChatAppConfig.NODE_MAILER_EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: ChatAppConfig.NODE_MAILER_EMAIL_USERNAME,
      to: email,
      subject: 'Sending OTP',
      text: text,
    };
    try {
      transporter.sendMail(mailOptions);
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }
  generateOTP() {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  async sendOtp(email: string) {
    const otp = this.generateOTP();
    this.cacheManager.set(email, otp, 5 * 60 * 1000);

    const text = `Your OTP is ${otp}. OTP is only valid in 5 minutes`;
    if (!this.sendEmail(email, text)) return [null, 'Send OTP failed'];
    return [true, null];
  }

  async confirmOTP(userOTP: string, email: string) {
    const otp = await this.cacheManager.get(email);
    if (!otp || otp != userOTP.trim()) return false;
    return true;
  }
}
