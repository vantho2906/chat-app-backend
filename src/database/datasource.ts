import TestNestjsConfig from '../etc/config';
import { DataSource } from 'typeorm';
import * as path from 'path';

const TestNestjsDataSource = new DataSource({
  type: 'mysql',
  port: TestNestjsConfig.PORT,
  host: TestNestjsConfig.HOST,
  username: TestNestjsConfig.USERNAME,
  password: TestNestjsConfig.PASSWORD,
  database: TestNestjsConfig.DATABASE,
  entities: [path.resolve(__dirname + '/../**/*.entity.{js,ts}')],
  migrations: [path.resolve(__dirname + '/../migrations/*.{js,ts}')],
  logger: 'advanced-console',
  logging: 'all',
});
export default TestNestjsDataSource;
