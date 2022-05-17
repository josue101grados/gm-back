import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (app.get('ConfigService').get('SENTRY_DSN')) {
    // Initialize Sentry
    Sentry.init({
      dsn: app.get('ConfigService').get('SENTRY_DSN'),
      environment: app.get('ConfigService').get('NODE_ENV'),
    });
  }

  const options = new DocumentBuilder()
    .setTitle(
      `GMInfoleads ${app.get('ConfigService').get('GM_INSTANCE_NAME')} API`,
    )
    .setDescription(
      `GMInfoleads ${app
        .get('ConfigService')
        .get('GM_INSTANCE_NAME')} API Documentation`,
    )
    .setVersion('1.0')
    .addTag('gminfoleads')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(app.get('ConfigService').get('PORT'));
}
bootstrap();
