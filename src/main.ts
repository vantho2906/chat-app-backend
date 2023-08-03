import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import ChatAppConfig from 'etc/config';
import helmet from 'helmet';
import { SocketIoAdapter } from './sockets/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = ChatAppConfig.PORT;
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('TEST APP API')
    .setDescription('TEST APP API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  // app.use(helmet());
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  await app.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`);
  });
}
bootstrap();
