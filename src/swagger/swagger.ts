import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from 'src/configs';
import { SWAGGER_CONFIG } from 'src/configs/swagger.config';

export function createDocument(app: INestApplication) {
  const config = app.get(ConfigService);
  const SWAGGER_PATH = config.getOrThrow<string>(
    CONSTANTS.SWAGGER.SWAGGER_DOCS_URL,
  );

  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'refresh-token',
    );
  SWAGGER_CONFIG.tags.forEach((tag) => {
    builder.addTag(tag);
  });

  const options = builder.build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      deepScanRoutes: true,
      showRequestDuration: true,
    },
  });
}
