import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 4200);
}
bootstrap()
  .then(() => console.log(`Application started successfully on PORT:${process.env.PORT}`))
  .catch((err) => console.error('Application failed to start', err));
