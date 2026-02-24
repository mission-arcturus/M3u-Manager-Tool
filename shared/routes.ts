import { z } from 'zod';
import { insertChannelSchema, channels } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  channels: {
    list: {
      method: 'GET' as const,
      path: '/api/channels' as const,
      responses: {
        200: z.array(z.custom<typeof channels.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/channels/:id' as const,
      responses: {
        200: z.custom<typeof channels.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/channels' as const,
      input: insertChannelSchema,
      responses: {
        201: z.custom<typeof channels.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/channels/:id' as const,
      input: insertChannelSchema.partial(),
      responses: {
        200: z.custom<typeof channels.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/channels/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ChannelInput = z.infer<typeof api.channels.create.input>;
export type ChannelResponse = z.infer<typeof api.channels.create.responses[201]>;
export type ChannelUpdateInput = z.infer<typeof api.channels.update.input>;
export type ChannelsListResponse = z.infer<typeof api.channels.list.responses[200]>;