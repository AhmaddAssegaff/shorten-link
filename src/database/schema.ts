import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  is_deleted: boolean('is_deleted').default(false).notNull(),
});

export const links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),

  shortCode: text('short_code').notNull().unique(),
  url: text('url').notNull(),

  user_id: uuid('user_id').references(() => users.id, {
    onDelete: 'set null',
  }),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  is_deleted: boolean('is_deleted').default(false).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, {
    fields: [links.user_id],
    references: [users.id],
  }),
}));
