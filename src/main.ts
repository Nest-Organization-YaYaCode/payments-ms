import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

 async function bootstrap() {
  const app = await NestFactory.create(AppModule, {rawBody: true});

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(envs.PORT);
  Logger.log(`Payments service is running on: ${envs.PORT}`, bootstrap.name)
}
bootstrap();
