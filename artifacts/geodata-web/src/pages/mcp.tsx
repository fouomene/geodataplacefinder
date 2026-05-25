import { useState } from "react";
import { Copy, Check, Bot, Terminal, Zap, Package, AlertCircle } from "lucide-react";
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

const publishSteps = `# 1. Clone the repository
git clone https://github.com/fouomene/geodataplacefinder.git
cd geodataplacefinder/mcp-server

# 2. Install dependencies and build
npm install
npm run build

# 3. Log in to npm (one-time setup)
npm login

# 4. Publish to npm
npm publish`;

const claudeConfigNpx = `{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "npx",
      "args": ["-y", "mcp-server-geodata-placefinder"]
    }
  }
}`;

const claudeConfigLocal = `{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "node",
      "args": ["C:\\\\path\\\\to\\\\geodataplacefinder\\\\mcp-server\\\\dist\\\\index.js"]
    }
  }
}`;

const claudeConfigLocalMac = `{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "node",
      "args": ["/path/to/geodataplacefinder/mcp-server/dist/index.js"]
    }
  }
}`;

const cursorConfigNpx = `{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "npx",
      "args": ["-y", "mcp-server-geodata-placefinder"]
    }
  }
}`;

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
              href="https://github.com/fouomene/geodataplacefinder/tree/main/mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm font-mono text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            >
              <Package className="h-4 w-4" />
              View Source on GitHub
            </a>
          </div>
        </div>

        {/* Status notice */}
        <div className="flex gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800">Not yet published to npm</p>
            <p className="text-sm text-amber-700">
              The package must be published to npm before <code className="font-mono bg-amber-100 px-1 rounded">npx mcp-server-geodata-placefinder</code> works.
              You can run it right now from the cloned source (see below), or publish it yourself using the steps in the Publishing section.
            </p>
          </div>
        </div>

        {/* Run from source — works now */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-mono">Run from source (works now)</h2>
          </div>
          <p className="text-muted-foreground">
            Clone the repository, build, and point your MCP client directly at the compiled file:
          </p>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="text-sm font-medium text-foreground">Claude Desktop — macOS/Linux</p>
            <CopyBlock id="claude-local-mac" code={claudeConfigLocalMac} copiedId={copiedId} onCopy={copyToClipboard} />
            <p className="text-xs text-muted-foreground mt-1">
              Replace <code className="font-mono text-primary">/path/to/geodataplacefinder</code> with your actual clone path.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="text-sm font-medium text-foreground">Claude Desktop — Windows</p>
            <CopyBlock id="claude-local-win" code={claudeConfigLocal} copiedId={copiedId} onCopy={copyToClipboard} />
            <p className="text-xs text-muted-foreground mt-1">
              Replace the path with your actual clone location. Use double backslashes in JSON.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Config file location:{" "}
            <span className="font-mono text-foreground">~/Library/Application Support/Claude/claude_desktop_config.json</span> (macOS),{" "}
            <span className="font-mono text-foreground">%APPDATA%\Claude\claude_desktop_config.json</span> (Windows).
          </p>
        </div>

        {/* After npm publish */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-mono">After npm publish</h2>
          </div>
          <p className="text-muted-foreground">
            Once the package is published to npm, any MCP client can run it without cloning the repo:
          </p>
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="text-sm font-medium text-foreground">Claude Desktop</p>
            <CopyBlock id="claude-npx" code={claudeConfigNpx} copiedId={copiedId} onCopy={copyToClipboard} />
          </div>
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="text-sm font-medium text-foreground">Cursor</p>
            <CopyBlock id="cursor-npx" code={cursorConfigNpx} copiedId={copiedId} onCopy={copyToClipboard} />
            <p className="text-xs text-muted-foreground">Config file: <span className="font-mono text-foreground">~/.cursor/mcp.json</span></p>
          </div>
        </div>

        {/* Publishing to npm */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-mono">Publishing to npm</h2>
          </div>
          <p className="text-muted-foreground">
            You need an <a href="https://www.npmjs.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">npm account</a> to publish. Run these commands from your local clone:
          </p>
          <CopyBlock id="publish" code={publishSteps} copiedId={copiedId} onCopy={copyToClipboard} />
          <p className="text-sm text-muted-foreground">
            After publishing, the <code className="font-mono text-primary">npx</code> command and "After npm publish" configs above will work for everyone.
          </p>
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
