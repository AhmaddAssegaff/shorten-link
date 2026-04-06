import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { instrumentDrizzleClient } from '@kubiks/otel-drizzle';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const connectionString = configService.get<string>('DATABASE_URL');

      const pool = new Pool({
        connectionString,
      });

      const db = drizzle(pool, {
        schema,
      });

      instrumentDrizzleClient(db, {
        dbSystem: 'postgresql',
        captureQueryText: true,
      });

      return db as NodePgDatabase<typeof schema>;
    },
  },
];
