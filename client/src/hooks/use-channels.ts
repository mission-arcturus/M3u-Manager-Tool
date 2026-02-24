import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// We extract the types inferred from the api object or use fallback types if unavailable directly
type InsertChannel = z.infer<typeof api.channels.create.input>;
type Channel = z.infer<typeof api.channels.get.responses[200]>;

export function useChannels() {
  return useQuery({
    queryKey: [api.channels.list.path],
    queryFn: async () => {
      const res = await fetch(api.channels.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch channels");
      const data = await res.json();
      return api.channels.list.responses[200].parse(data);
    },
  });
}

export function useChannel(id: number) {
  return useQuery({
    queryKey: [api.channels.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.channels.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch channel");
      const data = await res.json();
      return api.channels.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertChannel) => {
      // Validate before sending
      const validated = api.channels.create.input.parse(data);
      
      const res = await fetch(api.channels.create.path, {
        method: api.channels.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.channels.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create channel");
      }
      
      return api.channels.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.channels.list.path] });
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertChannel>) => {
      const validated = api.channels.update.input.parse(updates);
      const url = buildUrl(api.channels.update.path, { id });
      
      const res = await fetch(url, {
        method: api.channels.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.channels.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Channel not found");
        throw new Error("Failed to update channel");
      }
      
      return api.channels.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.channels.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.channels.get.path, variables.id] });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.channels.delete.path, { id });
      const res = await fetch(url, { 
        method: api.channels.delete.method, 
        credentials: "include" 
      });
      
      if (res.status === 404) throw new Error("Channel not found");
      if (!res.ok) throw new Error("Failed to delete channel");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.channels.list.path] });
    },
  });
}
