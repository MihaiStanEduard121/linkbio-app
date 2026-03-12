import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  username: text("username").notNull().unique(),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url").default(""),
  theme: text("theme").default("dark"),
  bgColor: text("bg_color").default(""),
  bgGradientFrom: text("bg_gradient_from").default(""),
  bgGradientTo: text("bg_gradient_to").default(""),
  bgGradientAngle: integer("bg_gradient_angle").default(135),
  textColor: text("text_color").default(""),
  btnStyle: text("btn_style").default("solid"),
  btnRadius: integer("btn_radius").default(12),
  btnShadow: boolean("btn_shadow").default(true),
  fontStyle: text("font_style").default("inter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
