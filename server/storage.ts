import { db } from "./db";
import {
  channels,
  type InsertChannel,
  type CreateChannelRequest,
  type UpdateChannelRequest,
  type ChannelResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getChannels(): Promise<ChannelResponse[]>;
  getChannel(id: number): Promise<ChannelResponse | undefined>;
  createChannel(channel: CreateChannelRequest): Promise<ChannelResponse>;
  updateChannel(id: number, updates: UpdateChannelRequest): Promise<ChannelResponse>;
  deleteChannel(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getChannels(): Promise<ChannelResponse[]> {
    return await db.select().from(channels).orderBy(channels.serialNumber);
  }

  async getChannel(id: number): Promise<ChannelResponse | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async createChannel(channel: CreateChannelRequest): Promise<ChannelResponse> {
    const [created] = await db.insert(channels).values(channel).returning();
    return created;
  }

  async updateChannel(id: number, updates: UpdateChannelRequest): Promise<ChannelResponse> {
    const [updated] = await db.update(channels)
      .set(updates)
      .where(eq(channels.id, id))
      .returning();
    return updated;
  }

  async deleteChannel(id: number): Promise<void> {
    await db.delete(channels).where(eq(channels.id, id));
  }
}

export const storage = new DatabaseStorage();