import { ReactNode } from "react";
import { ListVideo, Link as LinkIcon, Settings2, Github } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="glass-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ListVideo className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">StreamBase</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              Channels
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => {
              const url = `${window.location.origin}/api/playlist.m3u`;
              navigator.clipboard.writeText(url);
            }} className="gap-2 font-mono text-xs hidden sm:flex">
              <LinkIcon className="w-3.5 h-3.5" />
              /api/playlist.m3u
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      
      <footer className="border-t border-border/40 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            StreamBase M3U Manager &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Settings2 className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
            <Github className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
