import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'app' as const;

const appConfig = registerAs(CONFIG_NAME, () => ({
  APP_PORT: process.env.APP_PORT,
  NODE_ENV: process.env.NODE_ENV,
  API_GLOBAL_PREFIX: process.env.API_GLOBAL_PREFIX,
  ENABLE_VERSION: process.env.ENABLE_VERSION,
  VERSION_PREFIX: process.env.VERSION_PREFIX,
  DEFAULT_VERSION: process.env.DEFAULT_VERSION,
}));

type AppConfig = ReturnType<typeof appConfig>;
type AppKey = keyof AppConfig;

export const appValidationSchema = {
  APP_PORT: Joi.number().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .required(),
  API_GLOBAL_PREFIX: Joi.string().required(),
  ENABLE_VERSION: Joi.boolean().required(),
  VERSION_PREFIX: Joi.string().required(),
  DEFAULT_VERSION: Joi.string().required(),
};

export const CONSTANTS_APP_KEYS: {
  APP: {
    [K in AppKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  APP: {
    APP_PORT: 'app.APP_PORT',
    NODE_ENV: 'app.NODE_ENV',
    API_GLOBAL_PREFIX: 'app.API_GLOBAL_PREFIX',
    ENABLE_VERSION: 'app.ENABLE_VERSION',
    VERSION_PREFIX: 'app.VERSION_PREFIX',
    DEFAULT_VERSION: 'app.DEFAULT_VERSION',
  },
} as const;

export default appConfig;
