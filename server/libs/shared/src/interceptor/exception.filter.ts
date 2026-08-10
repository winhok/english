import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiResponse } from '@en/common/http';

@Catch(HttpException)
export class InterceptorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const body = {
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      code: exception.getStatus(),
      success: false,
      data: null,
    } satisfies ApiResponse<null>;

    response.status(exception.getStatus()).json(body);
  }
}
