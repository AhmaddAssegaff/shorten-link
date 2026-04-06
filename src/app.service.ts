import { Body, Inject, Injectable } from '@nestjs/common';
import { CreateLinkDto } from './app.dto';
import { DrizzleAsyncProvider } from './database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './database/schema';

@Injectable()
export class AppService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private drizzel: NodePgDatabase<typeof schema>,
  ) {}

  getHello(): string {
    return 'Hello World!!!!!';
  }

  retrieveLinks() {
    return this.drizzel.select().from(schema.links);
  }

  createLinks(@Body() createLink: CreateLinkDto) {
    return this.drizzel.insert(schema.links).values(createLink).returning();
  }
}
