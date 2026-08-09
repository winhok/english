import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import { ResponseInterceptor } from '@libs/shared/interceptor/response.interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exception.filter';
import { Config } from '@en/config';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  await app.listen(Config.ports.ai);
}
bootstrap();
