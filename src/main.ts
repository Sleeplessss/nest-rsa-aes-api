import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './setup';

async function bootstrap(): Promise<void> {
  const app = configureApp(await NestFactory.create(AppModule));
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  Logger.log(`Server: http://localhost:${port}  |  Swagger: http://localhost:${port}/api-docs`, 'Bootstrap');
}
bootstrap();
