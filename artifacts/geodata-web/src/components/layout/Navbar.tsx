import { Link, useLocation } from "wouter";
import { MapPinned, Book, Github, Bot } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const { data: health } = useHealthCheck({ query: { queryKey: ["healthCheck"] } });

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <MapPinned className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
          <span className="font-mono font-bold tracking-tight text-foreground">
            GeoData<span className="text-primary">Placefinder</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/docs"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
              location === "/docs" ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="link-nav-docs"
          >
            <Book className="h-4 w-4" />
            Docs
          </Link>
          <Link
            href="/mcp"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
              location === "/mcp" ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="link-nav-mcp"
          >
            <Bot className="h-4 w-4" />
            MCP
          </Link>
          <a
            href="https://github.com/fouomene/geodataplacefinder"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2"
            data-testid="link-nav-github"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded border border-border">
            <div className={cn("w-2 h-2 rounded-full", health?.status === "ok" ? "bg-primary" : "bg-destructive animate-pulse")} />
            API {health?.status === "ok" ? "ONLINE" : "OFFLINE"}
          </div>
        </nav>
      </div>
    </header>
  );
}
