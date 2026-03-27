import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './config.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from 'nestjs-pino';
import { OpenTelemetryModule } from 'nestjs-otel';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from './metrics.interceptor';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
    ConfigurationModule,
    PrismaModule,
    LoggerModule.forRoot({
      pinoHttp: {
        mixin() {
          const span = trace.getSpan(context.active());
          if (!span) return {};

          const spanContext = span.spanContext();
          return {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          };
        },
      },
    }),
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
