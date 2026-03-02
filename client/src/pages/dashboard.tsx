import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Tv, 
  Link as LinkIcon, 
  Copy,
  ArrowUpDown,
  GripHorizontal
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChannelForm } from "@/components/channel-form";
import { useChannels, useCreateChannel, useUpdateChannel, useDeleteChannel } from "@/hooks/use-channels";

function DraggableDialogContent({ children, className, ...props }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <DialogContent 
      className={className} 
      style={{ 
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        transition: isDragging ? 'none' : 'transform 0.2s'
      }} 
      {...props}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-10 cursor-move flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-muted/20"
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>
      {children}
    </DialogContent>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { data: channels = [], isLoading } = useChannels();
  const createMutation = useCreateChannel();
  const updateMutation = useUpdateChannel();
  const deleteMutation = useDeleteChannel();

  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Sorting state: true for ascending (0 -> 999), false for descending
  const [sortAsc, setSortAsc] = useState(true);

  // Filter and sort locally to match prompt requirements ("Handle table sorting locally")
  const filteredChannels = channels
    .filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.tvgGroup && c.tvgGroup.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortAsc) return (a.serialNumber || 0) - (b.serialNumber || 0);
      return (b.serialNumber || 0) - (a.serialNumber || 0);
    });

  const handleCopyPlaylist = () => {
    const url = `${window.location.origin}/api/playlist.m3u`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Playlist URL is ready to be pasted into your IPTV player.",
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Stream URL Copied",
      description: "Copied to clipboard.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Channels</h1>
          <p className="text-muted-foreground mt-1">Manage your IPTV streams and generate M3U files.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2 bg-secondary/50" 
            onClick={handleCopyPlaylist}
          >
            <LinkIcon className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Copy M3U Link</span>
            <span className="sm:hidden">M3U Link</span>
          </Button>
          <Button 
            className="w-full sm:w-auto gap-2 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all" 
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Channel
          </Button>
        </div>
      </div>

      <div className="minimal-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 bg-secondary/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search channels or groups..." 
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground gap-2"
            onClick={() => setSortAsc(!sortAsc)}
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort by Serial
          </Button>
        </div>

        {/* List Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/50 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Channel</div>
          <div className="col-span-2">Group</div>
          <div className="col-span-4">Stream URL</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            Loading channels...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredChannels.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Tv className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No channels found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {search 
                ? "No channels match your search criteria. Try a different term." 
                : "You haven't added any channels to your playlist yet."}
            </p>
            {!search && (
              <Button onClick={() => setIsAddOpen(true)} variant="outline">
                Add your first channel
              </Button>
            )}
          </div>
        )}

        {/* List Content */}
        <div className="divide-y divide-border/40">
          <AnimatePresence initial={false}>
            {filteredChannels.map((channel, index) => (
              <motion.div 
                key={channel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 items-center group hover:bg-muted/20 transition-colors"
              >
                {/* Serial (Mobile: Badge, Desktop: Text) */}
                <div className="col-span-1 hidden md:block text-muted-foreground font-mono text-sm">
                  {String(channel.serialNumber).padStart(3, '0')}
                </div>

                {/* Channel Info */}
                <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                  <div className="md:hidden">
                    <Badge variant="outline" className="font-mono">
                      #{String(channel.serialNumber).padStart(3, '0')}
                    </Badge>
                  </div>
                  {channel.tvgLogo ? (
                    <div className="w-10 h-10 rounded-md bg-secondary flex-shrink-0 overflow-hidden border border-border/50">
                      <img src={channel.tvgLogo} alt={channel.name} className="w-full h-full object-contain p-1" onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS10diI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiB4PSIyIiB5PSI3IiByeD0iMiIgcnk9IjIiLz48cG9seWxpbmUgcG9pbnRzPSIxNyAyIDEyIDcgNyAyIi8+PC9zdmc+';
                      }}/>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0 border border-border/50">
                      <Tv className="w-5 h-5 opacity-50" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-foreground">{channel.name}</div>
                    {channel.tvgId && (
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">id: {channel.tvgId}</div>
                    )}
                  </div>
                </div>

                {/* Group */}
                <div className="col-span-12 md:col-span-2 hidden sm:block">
                  {channel.tvgGroup ? (
                    <Badge variant="secondary" className="font-normal text-xs bg-secondary/80">
                      {channel.tvgGroup}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">Ungrouped</span>
                  )}
                </div>

                {/* URL */}
                <div className="col-span-12 md:col-span-4 flex items-center gap-2">
                  <div className="truncate text-sm font-mono text-muted-foreground max-w-[200px] sm:max-w-full">
                    {channel.urls?.join(', ') || channel.url}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-auto md:ml-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopyUrl(channel.urls?.[0] || channel.url)}
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => setEditingChannel(channel)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Channel
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => setDeletingId(channel.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DraggableDialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Channel</DialogTitle>
            <DialogDescription>Create a new stream entry for your playlist.</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ChannelForm 
              isPending={createMutation.isPending}
              submitLabel="Create Channel"
              onSubmit={(data) => {
                createMutation.mutate(data, {
                  onSuccess: () => {
                    setIsAddOpen(false);
                    toast({ title: "Channel added successfully" });
                  }
                });
              }} 
            />
          </div>
        </DraggableDialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingChannel} onOpenChange={(open) => !open && setEditingChannel(null)}>
        <DraggableDialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>Update stream details for {editingChannel?.name}.</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {editingChannel && (
              <ChannelForm 
                initialData={editingChannel}
                isPending={updateMutation.isPending}
                submitLabel="Save Changes"
                onSubmit={(data) => {
                  updateMutation.mutate({ id: editingChannel.id, ...data }, {
                    onSuccess: () => {
                      setEditingChannel(null);
                      toast({ title: "Channel updated successfully" });
                    }
                  });
                }} 
              />
            )}
          </div>
        </DraggableDialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the channel from your playlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deletingId) {
                  deleteMutation.mutate(deletingId, {
                    onSuccess: () => {
                      setDeletingId(null);
                      toast({ title: "Channel deleted" });
                    }
                  });
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Layout>
  );
}
