import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const linksTable = pgTable("links", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  icon: text("icon").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLinkSchema = createInsertSchema(linksTable).omit({
  createdAt: true,
});

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof linksTable.$inferSelect;
