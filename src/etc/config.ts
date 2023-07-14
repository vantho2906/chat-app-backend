import { config } from 'dotenv';

config();

export default class ChatAppConfig {
  static readonly PORT = parseInt(process.env.PORT || '10001');
  static readonly DB_PORT = parseInt(process.env.DB_PORT || '3306');
  static readonly DB_HOST = process.env.DB_HOST || 'localhost';
  static readonly DB_USERNAME = process.env.DB_USERNAME || 'root';
  static readonly DB_PASSWORD = process.env.DB_PASSWORD || 'Tho2003@';
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
  static readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  static readonly REDIRECT_URL = process.env.REDIRECT_URL;
  static readonly REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  static readonly FOLDER_ID = process.env.FOLDER_ID;
}
