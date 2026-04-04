import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDocument } from './swagger/swagger';
import { CONSTANTS } from './configs';
import otel from './instrument';

async function bootstrap() {
  otel.start();

  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const appMode = config.getOrThrow<string>(CONSTANTS.APP.NODE_ENV);

  const port = config.getOrThrow<string>(CONSTANTS.APP.APP_PORT);

  const defaultVersion = config.getOrThrow<string>(
    CONSTANTS.APP.DEFAULT_VERSION,
  );
  const enableVersion = config.getOrThrow<string>(CONSTANTS.APP.ENABLE_VERSION);

  const globalPrefix = config.getOrThrow<string>(
    CONSTANTS.APP.API_GLOBAL_PREFIX,
  );
  const versionPrefix = config.getOrThrow<string>(CONSTANTS.APP.VERSION_PREFIX);

  app.setGlobalPrefix(globalPrefix);

  if (enableVersion) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion,
      prefix: versionPrefix,
    });
  }

  if (appMode === 'development') {
    createDocument(app);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);

  Logger.log(`Running in ${appMode} mode`, 'Bootstrap');
  Logger.log(`Application listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
