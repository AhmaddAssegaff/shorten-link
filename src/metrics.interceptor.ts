import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

import {
  httpRequestCounter,
  httpErrorCounter,
  httpDurationHistogram,
} from './metrics';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();

    const http = context.switchToHttp();

    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const method = request.method;
    const route = request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          const status = response.statusCode;

          httpRequestCounter.add(1, {
            method,
            route,
            status,
          });

          httpDurationHistogram.record(duration, {
            method,
            route,
            status,
          });
        },
        error: () => {
          const duration = Date.now() - now;

          httpErrorCounter.add(1, {
            method,
            route,
          });

          httpDurationHistogram.record(duration, {
            method,
            route,
            status: 500,
          });
        },
      }),
    );
  }
}
