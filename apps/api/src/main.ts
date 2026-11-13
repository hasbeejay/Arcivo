import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend and browser extension
  app.enableCors({
    origin: [
      process.env.CLIENT_URL ?? 'http://localhost:5173',
      /^chrome-extension:\/\/.*/,
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Arcivo API server running on: http://localhost:${port}/api/v1`);
}

await bootstrap();
