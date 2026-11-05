import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

/** Shared app setup used by main.ts and e2e tests. */
export function configureApp(app: INestApplication): INestApplication {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Encrypt / Decrypt API')
    .setDescription('Hybrid AES + RSA encryption service')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, config));
  return app;
}
