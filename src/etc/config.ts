import { config } from 'dotenv';

config();

export default class TestNestjsConfig {
  static readonly PORT = parseInt(process.env.PORT || '3306');
  static readonly HOST = process.env.HOST || 'localhost';
  static readonly USERNAME = process.env.DB_USERNAME || 'root';
  static readonly PASSWORD = process.env.PASSWORD || 'Tho2003@';
  static readonly DATABASE = process.env.DATABASE || 'test_nestjs';
  static readonly JWT_SECRET = process.env.JWT_SECRET || 'graww';
  static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  static readonly GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID ||
    '821968596288-3ju98qo0kd1qpnrf7jitds6r2k7v5ih8.apps.googleusercontent.com';
  static readonly NODE_MAILER_EMAIL_USERNAME =
    process.env.NODE_MAILER_EMAIL_USERNAME || 'chatapp.js.vn@gmail.com';
  static readonly NODE_MAILER_EMAIL_PASSWORD =
    process.env.NODE_MAILER_EMAIL_PASSWORD || 'khwqkhaqtdgugecg';
}
