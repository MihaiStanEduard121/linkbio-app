import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { linksTable } from "./links";

export const profileViewsTable = pgTable("profile_views", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const linkClicksTable = pgTable("link_clicks", {
  id: serial("id").primaryKey(),
  linkId: text("link_id")
    .notNull()
    .references(() => linksTable.id, { onDelete: "cascade" }),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});
