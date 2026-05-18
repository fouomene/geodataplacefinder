import { Link } from "wouter";
import { ArrowRight, MapPin, Database, Zap, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiDemo } from "@/components/ApiDemo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-mono mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v0.1.0 Open Source
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
              GeoData Placefinder
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              An open-source geocoding API that converts addresses into geographic coordinates
              and performs reverse geocoding, using{" "}
              <a href="https://overturemaps.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Overture Maps</a>{" "}
              data queried through DuckDB.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-12 px-8 font-mono text-background">
                <Link href="/docs">
                  Read the Docs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 font-mono">
                <a href="#demo">Try the API</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-border/50 bg-background/50 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-mono">DuckDB Powered</h3>
              <p className="text-muted-foreground">In-memory analytical database running spatial queries at incredible speeds without heavy infrastructure.</p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-background/50 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-mono">Overture Maps</h3>
              <p className="text-muted-foreground">Built on top of the open map dataset. Millions of POIs and addresses queryable instantly.</p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-background/50 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-mono">Developer First</h3>
              <p className="text-muted-foreground">Simple REST API, strongly typed schemas, and no API keys or rate limits to manage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold font-mono mb-4">Interactive Demo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test the API endpoints directly from the browser. The underlying endpoints return clean JSON matching the Place schema.
            </p>
          </div>
          
          <ApiDemo />
        </div>
      </section>

    </div>
  );
}
