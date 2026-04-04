import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateLinkDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/links')
  getLinks() {
    return this.appService.retrieveLinks();
  }

  @Post('/links')
  postLinks(@Body() createLink: CreateLinkDto) {
    return this.appService.createLinks(createLink);
  }
}
