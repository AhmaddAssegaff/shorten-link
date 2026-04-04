import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './config.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from 'nestjs-pino';
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

          const ctx = span.spanContext();
          return {
            trace_id: ctx.traceId,
            span_id: ctx.spanId,
          };
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
