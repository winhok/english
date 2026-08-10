import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import { ResponseInterceptor } from '@libs/shared/interceptor/response.interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exception.filter';
import { Config } from '@en/config';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  app.setGlobalPrefix('ai');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  await app.listen(Config.ports.ai);
}
bootstrap();
