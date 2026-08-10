import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { Request } from 'express';
import type { ApiResponse } from '@en/common/http';

// 将bigint转换为字符串，并保留日期类型不变
const transformBigInt = (obj: unknown): unknown => {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(transformBigInt);
  }
  if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj;
    }
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, transformBigInt(value)]),
    );
  }
  return obj;
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor<
  unknown,
  ApiResponse<unknown>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ApiResponse<unknown>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    function isRecord(value: unknown): value is Record<string, unknown> {
      return value !== null && typeof value === 'object';
    }
    return next.handle().pipe(
      map((data): ApiResponse<unknown> => {
        const payload = isRecord(data) ? data : {};

        return {
          timestamp: new Date().toISOString(),
          path: request.url,
          message:
            typeof payload.message === 'string' ? payload.message : '请求成功',
          code: typeof payload.code === 'number' ? payload.code : 200,
          success: true,
          data: transformBigInt(payload.data) ?? null,
        };
      }),
    );
  }
}
