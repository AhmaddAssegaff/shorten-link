import { ConfigFactory } from '@nestjs/config';
import * as Joi from 'joi';

import * as app from './app.config';
import * as swg from './swagger.config';
import * as jwt from './jwt.config';

export const configs = [
  app.default,
  swg.default,
  jwt.default,
] satisfies ConfigFactory[];

export const validationSchema = Joi.object({
  ...app.appValidationSchema,
  ...swg.swaggerValidationSchema,
  ...jwt.jwtValidationSchema,
});

export const CONSTANTS = {
  ...app.CONSTANTS_APP_KEYS,
  ...jwt.CONSTANTS_JWT_KEYS,
  ...swg.CONSTANTS_SWAGGER_KEYS,
} as const;

export default configs;
