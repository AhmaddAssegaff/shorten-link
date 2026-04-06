jest.mock('@kubiks/otel-drizzle', () => ({
  instrumentDrizzleClient: jest.fn(),
}));
