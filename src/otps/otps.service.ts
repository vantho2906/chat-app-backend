import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import TestNestjsConfig from 'etc/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OtpsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  sendEmail(email: string, text: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: TestNestjsConfig.NODE_MAILER_EMAIL_USERNAME,
        pass: TestNestjsConfig.NODE_MAILER_EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: TestNestjsConfig.NODE_MAILER_EMAIL_USERNAME,
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
    this.cacheManager.set(email, otp, 120 * 1000);

    const text = `Your OTP is ${otp}. OTP is only valid in 2 minutes`;
    if (!this.sendEmail(email, text)) return [null, 'Send OTP failed'];
    return [true, null];
  }

  async confirmOTP(userOTP: string, email: string) {
    console.log(email);
    const otp = await this.cacheManager.get(email);
    console.log(otp);
    if (!otp || otp != userOTP.trim()) return false;
    return true;
  }
}
