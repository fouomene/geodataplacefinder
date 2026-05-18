import { useState } from "react";
import { Link } from "wouter";
import { Terminal, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Docs() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const codeSnippets = {
    search: `curl "http://localhost:3000/api/search?q=Cafe+Paris&limit=5"`,
    reverse: `curl "http://localhost:3000/api/reverse?lat=48.8566&lon=2.3522"`,
    nearest: `curl "http://localhost:3000/api/places/nearest?lat=48.8566&lon=2.3522&name=cafe"`
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-bold font-mono mb-4 tracking-tight">API Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Complete reference for the GeoDataPlacefinder REST endpoints.
          </p>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <h2 className="font-mono text-2xl border-b border-border pb-2 text-foreground">Base URL</h2>
          <pre className="bg-card p-4 rounded-lg border border-border text-primary font-mono text-sm">
            <code>http://localhost:3000</code>
          </pre>

          <h2 className="font-mono text-2xl border-b border-border pb-2 text-foreground mt-12">Endpoints</h2>

          {/* Search */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded font-mono font-bold text-sm">GET</span>
              <h3 className="text-xl font-mono m-0 text-foreground">/api/search</h3>
            </div>
            <p className="text-muted-foreground">Free-form or structured text search against Overture Maps Places dataset. Converts place names or addresses into geographic coordinates.</p>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Query Parameters</h4>
              <ul className="space-y-3 font-mono text-sm list-none p-0 m-0">
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-24">q</span>
                  <span className="text-muted-foreground flex-1">Free-form search query (e.g. "Cafe Paris New York")</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-24">limit</span>
                  <span className="text-muted-foreground flex-1">Maximum results (1-20). Default: 10</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-24">city</span>
                  <span className="text-muted-foreground flex-1">City filter for structured queries</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => copyToClipboard(codeSnippets.search, 'search')}
                >
                  {copiedId === 'search' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-[#0c1017] p-4 rounded-lg border border-white/10 font-mono text-sm mt-4 overflow-x-auto text-green-400">
                <code>{codeSnippets.search}</code>
              </pre>
            </div>
          </div>

          {/* Reverse */}
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded font-mono font-bold text-sm">GET</span>
              <h3 className="text-xl font-mono m-0 text-foreground">/api/reverse</h3>
            </div>
            <p className="text-muted-foreground">Converts geographic coordinates (latitude/longitude) into the nearest human-readable place name and address.</p>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Query Parameters</h4>
              <ul className="space-y-3 font-mono text-sm list-none p-0 m-0">
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-24">lat <span className="text-destructive">*</span></span>
                  <span className="text-muted-foreground flex-1">Latitude (WGS84)</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-24">lon <span className="text-destructive">*</span></span>
                  <span className="text-muted-foreground flex-1">Longitude (WGS84)</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => copyToClipboard(codeSnippets.reverse, 'reverse')}
                >
                  {copiedId === 'reverse' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-[#0c1017] p-4 rounded-lg border border-white/10 font-mono text-sm mt-4 overflow-x-auto text-green-400">
                <code>{codeSnippets.reverse}</code>
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
