import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const traceExporter = new OTLPTraceExporter();
const metricsExporter = new OTLPMetricExporter();

const otel = new NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricsExporter,
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new NestInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

export default otel;

process.on('SIGTERM', () => {
  otel
    .shutdown()
    .then(
      () => console.log('OTel shut down successfully'),
      (err) => console.log('Error shutting down OTel', err),
    )
    .finally(() => process.exit(0));
});
