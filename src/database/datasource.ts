import ChatAppConfig from '../etc/config';
import { DataSource } from 'typeorm';
import * as path from 'path';

const ChatAppDataSource = new DataSource({
  type: 'mysql',
  port: ChatAppConfig.DB_PORT,
  host: ChatAppConfig.DB_HOST,
  username: ChatAppConfig.DB_USERNAME,
  password: ChatAppConfig.DB_PASSWORD,
  database: ChatAppConfig.DATABASE,
  entities: [path.resolve(__dirname + '/../**/*.entity.{js,ts}')],
  migrations: [path.resolve(__dirname + '/../migrations/*.{js,ts}')],
  logger: 'advanced-console',
  logging: 'all',
});
export default ChatAppDataSource;
