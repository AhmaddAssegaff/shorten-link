import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';

import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// Instrumentations
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

// Exporters & Log SDK
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

// import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';

// import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
// import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

// const collectorUrl =
//   process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317';

const traceExporter =
  process.env.NODE_ENV === 'development'
    ? new ConsoleSpanExporter()
    : new OTLPTraceExporter({
        url: 'otel-collector:4317',
      });

const metricExporter = new OTLPMetricExporter({
  url: 'otel-collector:4317',
});

// const logExporter = new OTLPLogExporter({
//   url: `${collectorUrl}/v1/logs`,
// });

const otel = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'shorten-link-app',
  }),

  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  // logRecordProcessor: new SimpleLogRecordProcessor(logExporter),
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new NestInstrumentation(),
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
