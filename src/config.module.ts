import { configs, validationSchema } from './configs/index';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
      validationSchema: validationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
        convert: true,
      },
    }),
  ],
})
export class ConfigurationModule {}
