import { Body, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateLinkDto } from './app.dto';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!!!!!';
  }

  retrieveLinks() {
    return this.prisma.link.findMany();
  }

  createLinks(@Body() createLink: CreateLinkDto) {
    return this.prisma.link.create({
      data: {
        shortCode: createLink.shortCode,
        url: createLink.url,
      },
    });
  }
}
