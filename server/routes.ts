import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.channels.list.path, async (req, res) => {
    const channels = await storage.getChannels();
    res.json(channels);
  });

  app.get(api.channels.get.path, async (req, res) => {
    const channel = await storage.getChannel(Number(req.params.id));
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.json(channel);
  });

  app.post(api.channels.create.path, async (req, res) => {
    try {
      const input = api.channels.create.input.parse(req.body);
      
      // Automatic re-ordering: if serial exists, shift everything else up
      await storage.reorderChannels(input.serialNumber);

      const channel = await storage.createChannel(input);
      res.status(201).json(channel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.channels.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.channels.update.input.parse(req.body);

      if (input.serialNumber !== undefined) {
        await storage.reorderChannels(input.serialNumber, id);
      }

      const channel = await storage.updateChannel(id, input);
      res.json(channel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.channels.delete.path, async (req, res) => {
    await storage.deleteChannel(Number(req.params.id));
    res.status(204).end();
  });

  app.get('/api/playlist.m3u', async (req, res) => {
    const channels = await storage.getChannels();
    
    let m3u = "#EXTM3U\n";
    for (const channel of channels) {
      for (const url of channel.urls) {
        m3u += `#EXTINF:-1`;
        if (channel.tvgId) m3u += ` tvg-id="${channel.tvgId}"`;
        if (channel.tvgLogo) m3u += ` tvg-logo="${channel.tvgLogo}"`;
        if (channel.tvgGroup) m3u += ` tvg-group="${channel.tvgGroup}"`;
        m3u += `,${channel.name}\n${url}\n`;
      }
    }

    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u"');
    res.send(m3u);
  });

  await seedDatabase();

  return httpServer;
}

export async function seedDatabase() {
  const existing = await storage.getChannels();
  if (existing.length === 0) {
    await storage.createChannel({
      serialNumber: 1,
      name: "Example TV 1",
      url: "http://example.com/stream1.m3u8",
      tvgId: "extv1",
      tvgLogo: "https://example.com/logo1.png",
      tvgGroup: "Entertainment"
    });
    await storage.createChannel({
      serialNumber: 2,
      name: "Example News",
      url: "http://example.com/news.m3u8",
      tvgId: "exnews",
      tvgLogo: "https://example.com/news.png",
      tvgGroup: "News"
    });
    await storage.createChannel({
      serialNumber: 3,
      name: "Example Sports",
      url: "http://example.com/sports.m3u8",
      tvgId: "exsports",
      tvgLogo: "https://example.com/sports.png",
      tvgGroup: "Sports"
    });
  }
}