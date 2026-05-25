import { useState } from "react";
import { Copy, Check, Bot, Terminal, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

function CopyBlock({ id, code, copiedId, onCopy }: {
  id: string;
  code: string;
  copiedId: string | null;
  onCopy: (code: string, id: string) => void;
}) {
  return (
    <div className="relative mt-4">
      <div className="absolute top-3 right-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-slate-400 hover:text-white"
          onClick={() => onCopy(code, id)}
        >
          {copiedId === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const TOOLS = [
  {
    name: "health_check",
    description: "Check the API status, version, uptime, and number of place records loaded in the local cache.",
    params: "None",
    example: "Is the GeoData Placefinder API online?",
  },
  {
    name: "search_places",
    description: "Geocode by free-form text or structured fields. Accepts any combination of name, address, city, postcode, or category type.",
    params: "q, name, city, postcode, type, limit",
    example: "Find hotels near the Eiffel Tower in Paris",
  },
  {
    name: "reverse_geocode",
    description: "Convert geographic coordinates into the nearest human-readable place names and addresses.",
    params: "lat*, lon*, limit",
    example: "What places are at 48.8584, 2.2945?",
  },
  {
    name: "find_nearest_place",
    description: "Return the single closest place to a coordinate within a configurable radius. Optionally filter by name.",
    params: "lat*, lon*, max_distance_m, name",
    example: "Find the nearest pharmacy to 40.7128, -74.0060 within 1km",
  },
  {
    name: "get_place_by_id",
    description: "Retrieve the full Overture Maps record for a place — names, addresses, coordinates, websites, phones, socials, brand, and more.",
    params: "id*",
    example: "Get full details for overture:place:ac0aed88-e6cb-4224-9520-441339447760",
  },
];

const claudeConfig = `{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "npx",
      "args": ["-y", "mcp-server-geodata-placefinder"]
    }
  }
}`;

const cursorConfig = `{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "npx",
      "args": ["-y", "mcp-server-geodata-placefinder"]
    }
  }
}`;

const npxCommand = `npx mcp-server-geodata-placefinder`;
const npmInstall = `npm install -g mcp-server-geodata-placefinder`;

export default function Mcp() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-16">

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <h1 className="text-4xl font-bold font-mono tracking-tight">MCP Server</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The GeoData Placefinder MCP server gives AI assistants — Claude, Cursor, Zed, and any
            MCP-compatible client — direct access to the geocoding API during a conversation.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://www.npmjs.com/package/mcp-server-geodata-placefinder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm font-mono text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            >
              <Package className="h-4 w-4" />
              npm
            </a>
            <a
              href="https://github.com/fouomene/geodataplacefinder/tree/main/mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm font-mono text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            >
              <Package className="h-4 w-4" />
              GitHub Source
            </a>
          </div>
        </div>

        {/* Quick install */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-mono">Quick start</h2>
          </div>
          <p className="text-muted-foreground">No installation required — run it on-demand with npx:</p>
          <CopyBlock id="npx" code={npxCommand} copiedId={copiedId} onCopy={copyToClipboard} />
          <p className="text-muted-foreground text-sm">Or install globally:</p>
          <CopyBlock id="npm" code={npmInstall} copiedId={copiedId} onCopy={copyToClipboard} />
        </div>

        {/* Claude Desktop */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-mono">Claude Desktop</h2>
          </div>
          <p className="text-muted-foreground">
            Add the following to your{" "}
            <code className="text-primary font-mono text-sm">claude_desktop_config.json</code>:
          </p>
          <CopyBlock id="claude" code={claudeConfig} copiedId={copiedId} onCopy={copyToClipboard} />
          <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-sm font-mono">
            <p className="text-muted-foreground font-sans text-sm font-medium">Config file location</p>
            <p className="text-foreground">macOS: <span className="text-primary">~/Library/Application Support/Claude/claude_desktop_config.json</span></p>
            <p className="text-foreground">Windows: <span className="text-primary">%APPDATA%\Claude\claude_desktop_config.json</span></p>
          </div>
        </div>

        {/* Cursor */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-mono">Cursor</h2>
          </div>
          <p className="text-muted-foreground">
            Add to your Cursor MCP settings at{" "}
            <code className="text-primary font-mono text-sm">~/.cursor/mcp.json</code>:
          </p>
          <CopyBlock id="cursor" code={cursorConfig} copiedId={copiedId} onCopy={copyToClipboard} />
        </div>

        {/* Tools */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-mono">Available tools</h2>
          </div>
          <p className="text-muted-foreground">
            The server exposes five tools. Parameters marked with <span className="text-destructive">*</span> are required.
          </p>
          <div className="space-y-4">
            {TOOLS.map((tool) => (
              <div key={tool.name} className="bg-card border border-border rounded-lg p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <code className="text-primary font-mono font-bold text-base">{tool.name}</code>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
                    {tool.params}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{tool.description}</p>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground shrink-0">Example:</span>
                  <span className="text-foreground italic">"{tool.example}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source */}
        <div className="border-t border-border pt-8 space-y-3">
          <h2 className="text-xl font-bold font-mono">Source code</h2>
          <p className="text-muted-foreground">
            Full source is in the{" "}
            <a
              href="https://github.com/fouomene/geodataplacefinder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GeoData Placefinder GitHub repository
            </a>{" "}
            under <code className="text-primary font-mono text-sm">mcp-server/</code>.
            Contributions welcome — see{" "}
            <a
              href="https://github.com/fouomene/geodataplacefinder?tab=contributing-ov-file"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CONTRIBUTING.md
            </a>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
