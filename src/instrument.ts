import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';

// Instrumentations
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

// Exporters
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
// import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const traceExporter = new OTLPTraceExporter({
  url: 'http://alloy:4318/v1/traces',
});

const metricExporter = new OTLPMetricExporter({
  url: 'http://alloy:4318/v1/metrics',
});

const otel = new NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Matikan yang tidak perlu agar tidak overhead
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new NestInstrumentation(),
    new PrismaInstrumentation(),
    new PinoInstrumentation({
      logKeys: {
        traceId: 'trace_id',
        spanId: 'span_id',
        traceFlags: 'trace_flags',
      },
    }),
  ],
});

export default otel;
