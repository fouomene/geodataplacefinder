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
    health: `curl "http://localhost:8080/api/health"`,
    search: `curl "http://localhost:8080/api/search?q=Hilton+Hotel&limit=5"`,
    reverse: `curl "http://localhost:8080/api/reverse?lat=39.7460&lon=-75.5480&limit=5"`,
    nearest: `curl "http://localhost:8080/api/places/nearest?lat=39.7460&lon=-75.5480&max_distance_m=5000"`
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

          {/* Health */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded font-mono font-bold text-sm">GET</span>
              <h3 className="text-xl font-mono m-0 text-foreground">/api/health</h3>
            </div>
            <p className="text-muted-foreground">
              Returns the current server status, API version, uptime, and the number of places loaded in the local cache.
              Useful for readiness checks and monitoring. Also available at <code className="text-primary font-mono text-sm">/api/healthz</code> for backwards compatibility.
            </p>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Response fields</h4>
              <ul className="space-y-3 font-mono text-sm list-none p-0 m-0">
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-28 shrink-0">status</span>
                  <span className="text-muted-foreground flex-1">Always <span className="text-foreground">"ok"</span> when the server is running</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-28 shrink-0">version</span>
                  <span className="text-muted-foreground flex-1">API version string</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-28 shrink-0">uptime_s</span>
                  <span className="text-muted-foreground flex-1">Seconds elapsed since the server started</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-accent w-28 shrink-0">cache_rows</span>
                  <span className="text-muted-foreground flex-1">Number of place records loaded in the local DuckDB cache (0 if still warming up)</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => copyToClipboard(codeSnippets.health, 'health')}
                >
                  {copiedId === 'health' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-[#0c1017] p-4 rounded-lg border border-white/10 font-mono text-sm mt-4 overflow-x-auto text-green-400">
                <code>{codeSnippets.health}</code>
              </pre>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded font-mono font-bold text-sm">GET</span>
              <h3 className="text-xl font-mono m-0 text-foreground">/api/search</h3>
            </div>
            <p className="text-muted-foreground">
              Free-form or structured text search against{" "}
              <a href="https://overturemaps.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Overture Maps</a>{" "}
              Places data. Converts place names or addresses into geographic coordinates without relying on Google Maps or Nominatim.
            </p>

            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Free-form query</h4>
                <ul className="space-y-3 font-mono text-sm list-none p-0 m-0">
                  <li className="flex gap-4 items-start">
                    <span className="text-accent w-28 shrink-0">q</span>
                    <span className="text-muted-foreground flex-1">
                      Free-form search string. Can include any combination of name, address, city, or category
                      (e.g. <span className="text-foreground">"Cafe Paris New York"</span>,{" "}
                      <span className="text-foreground">"123 Main St London"</span>).
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Structured query</h4>
                <p className="text-xs text-muted-foreground/70 mb-4 font-mono">Use individual fields for precision. Filters are combined with AND.</p>
                <ul className="space-y-3 font-mono text-sm list-none p-0 m-0">
                  <li className="flex gap-4 items-start">
                    <span className="text-accent w-28 shrink-0">name</span>
                    <span className="text-muted-foreground flex-1">Place or business name (e.g. <span className="text-foreground">"Eiffel Tower"</span>)</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="text-accent w-28 shrink-0">city</span>
                    <span className="text-muted-foreground flex-1">City or locality (e.g. <span className="text-foreground">"London"</span>)</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="text-accent w-28 shrink-0">postcode</span>
                    <span className="text-muted-foreground flex-1">Postal or ZIP code (e.g. <span className="text-foreground">"75001"</span>, <span className="text-foreground">"SW1A 1AA"</span>)</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="text-accent w-28 shrink-0">type</span>
                    <span className="text-muted-foreground flex-1">Place category (e.g. <span className="text-foreground">"cafe"</span>, <span className="text-foreground">"restaurant"</span>, <span className="text-foreground">"hotel"</span>)</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="text-accent w-28 shrink-0">limit</span>
                    <span className="text-muted-foreground flex-1">Maximum number of results (1–20). Default: 5</span>
                  </li>
                </ul>
              </div>
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
