import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './config.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigurationModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
