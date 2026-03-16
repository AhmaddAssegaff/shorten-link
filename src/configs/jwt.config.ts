import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_NAME = 'jwt' as const;

export const jwtConfig = registerAs(CONFIG_NAME, () => ({
  AUTH_JWT_ACCESS_TOKEN_SECRET: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET,
  AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN:
    process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN,
  AUTH_JWT_REFRESH_TOKEN_SECRET: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET,
  AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN:
    process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
}));

type JwtConfig = ReturnType<typeof jwtConfig>;
type JwtKey = keyof JwtConfig;

export const jwtValidationSchema = {
  AUTH_JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
  AUTH_JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
};

export const CONSTANTS_JWT_KEYS: {
  JWT: {
    [K in JwtKey]: `${typeof CONFIG_NAME}.${K}`;
  };
} = {
  JWT: {
    AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: 'jwt.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN',
    AUTH_JWT_ACCESS_TOKEN_SECRET: 'jwt.AUTH_JWT_ACCESS_TOKEN_SECRET',
    AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: 'jwt.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN',
    AUTH_JWT_REFRESH_TOKEN_SECRET: 'jwt.AUTH_JWT_REFRESH_TOKEN_SECRET',
  },
} as const;

export default jwtConfig;
