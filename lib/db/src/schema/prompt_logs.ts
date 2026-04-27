import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const promptLogs = pgTable("prompt_logs", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id"),
  content: text("content").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertPromptLogSchema = createInsertSchema(promptLogs).omit({
  id: true,
  createdAt: true,
});

export type PromptLog = typeof promptLogs.$inferSelect;
export type InsertPromptLog = z.infer<typeof insertPromptLogSchema>;
