import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@libs/shared/interceptor/response.interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exception.filter';
import { Config } from '@en/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  await app.listen(process.env.PORT ?? Config.ports.server);
}
bootstrap();
