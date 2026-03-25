import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('shorten-link-app');

export const httpRequestCounter = meter.createCounter(
  'app_http_requests_total',
  {
    description: 'Total HTTP requests',
  },
);

export const httpErrorCounter = meter.createCounter('app_http_errors_total', {
  description: 'Total HTTP errors',
});

export const httpDurationHistogram = meter.createHistogram(
  'app_http_duration_ms',
  {
    description: 'HTTP request duration',
  },
);
