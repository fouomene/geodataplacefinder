# mcp-server-geodata-placefinder

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that gives AI assistants (Claude, Cursor, Zed, etc.) direct access to the [GeoData Placefinder](https://geodataplacefinder.org) geocoding API, powered by [Overture Maps](https://overturemaps.org) data and DuckDB.

## Tools

| Tool | Description |
|------|-------------|
| `health_check` | Check API status, version, and cache size |
| `search_places` | Geocode by name, address, city, postcode, or category |
| `reverse_geocode` | Convert coordinates → nearest place names and addresses |
| `find_nearest_place` | Single closest place within a configurable radius |
| `get_place_by_id` | Full Overture Maps record for a place by ID |

## Quick start

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "npx",
      "args": ["-y", "mcp-server-geodata-placefinder"]
    }
  }
}
```

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Cursor

Add to your Cursor MCP settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "geodata-placefinder": {
      "command": "npx",
      "args": ["-y", "mcp-server-geodata-placefinder"]
    }
  }
}
```

### Other MCP clients

Any MCP-compatible client can run the server via:

```bash
npx mcp-server-geodata-placefinder
```

## Example queries

Once connected, you can ask your AI assistant:

- *"Find coffee shops near the Eiffel Tower"*
- *"What's at coordinates 48.8584, 2.2945?"*
- *"Find the nearest hospital to 40.7128, -74.0060 within 2km"*
- *"Get full details for overture:place:ac0aed88-e6cb-4224-9520-441339447760"*

## Development

```bash
# Clone the repository
git clone https://github.com/fouomene/geodataplacefinder.git
cd geodataplacefinder/mcp-server

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Type-check
pnpm typecheck
```

## License

GPL-3.0 — see [LICENSE](../LICENSE).

## Links

- [GeoData Placefinder API](https://geodataplacefinder.org/docs)
- [Overture Maps Foundation](https://overturemaps.org)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/fouomene/geodataplacefinder)
