import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { MetricService } from 'nestjs-otel';
import { Counter, Histogram } from '@opentelemetry/api';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private httpRequestCounter: Counter;
  private httpErrorCounter: Counter;
  private httpDurationHistogram: Histogram;

  constructor(private readonly metricService: MetricService) {
    this.httpRequestCounter = this.metricService.getCounter(
      'app_http_requests_total',
      {
        description: 'Total HTTP requests',
      },
    );

    this.httpErrorCounter = this.metricService.getCounter(
      'app_http_errors_total',
      {
        description: 'Total HTTP errors',
      },
    );

    this.httpDurationHistogram = this.metricService.getHistogram(
      'app_http_duration_ms',
      {
        description: 'HTTP request duration',
      },
    );
  }

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

          this.httpRequestCounter.add(1, { method, route, status });
          this.httpDurationHistogram.record(duration, {
            method,
            route,
            status,
          });
        },
        error: (err: unknown) => {
          const duration = Date.now() - now;
          let status: number;

          if (err instanceof HttpException) {
            status = err.getStatus();
          } else {
            status = 500;
          }

          this.httpErrorCounter.add(1, { method, route });
          this.httpDurationHistogram.record(duration, {
            method,
            route,
            status,
          });
        },
      }),
    );
  }
}
