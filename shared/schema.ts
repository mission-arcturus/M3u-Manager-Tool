import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  serialNumber: integer("serial_number").notNull().default(0),
  name: text("name").notNull(),
  url: text("url").notNull(),
  tvgId: text("tvg_id"),
  tvgLogo: text("tvg_logo"),
  tvgGroup: text("tvg_group"),
});

export const insertChannelSchema = createInsertSchema(channels).omit({ id: true });

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

export type CreateChannelRequest = InsertChannel;
export type UpdateChannelRequest = Partial<InsertChannel>;
export type ChannelResponse = Channel;
export type ChannelsListResponse = Channel[];