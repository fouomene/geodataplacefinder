#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = "https://geodataplacefinder.org";

const TOOLS: Tool[] = [
  {
    name: "health_check",
    description:
      "Check the GeoData Placefinder API status. Returns server status, version, uptime in seconds, and the number of place records loaded in the local cache.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_places",
    description:
      "Search for places by name, address, city, postcode, or category. Returns geographic coordinates and place details from the Overture Maps dataset. Use the free-form 'q' parameter for natural language queries, or combine structured fields (name, city, postcode, type) for precise filtering.",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description:
            'Free-form search string — any combination of name, address, city, or category (e.g. "Eiffel Tower Paris", "cafe New York", "123 Main St London").',
        },
        name: {
          type: "string",
          description: "Place or business name (e.g. \"Hilton\", \"McDonald's\").",
        },
        city: {
          type: "string",
          description: 'City or locality (e.g. "London", "New York").',
        },
        postcode: {
          type: "string",
          description: 'Postal or ZIP code (e.g. "75001", "SW1A 1AA").',
        },
        type: {
          type: "string",
          description:
            'Place category (e.g. "cafe", "restaurant", "hotel", "museum", "hospital").',
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (1–20). Default: 5.",
        },
      },
    },
  },
  {
    name: "reverse_geocode",
    description:
      "Convert geographic coordinates (latitude/longitude) into the nearest human-readable place names and addresses. Useful for answering 'what is near this location?' or 'what is the address of these coordinates?'",
    inputSchema: {
      type: "object",
      properties: {
        lat: {
          type: "number",
          description: "Latitude in decimal degrees (WGS84), e.g. 48.8584.",
        },
        lon: {
          type: "number",
          description: "Longitude in decimal degrees (WGS84), e.g. 2.2945.",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return. Default: 5.",
        },
      },
      required: ["lat", "lon"],
    },
  },
  {
    name: "find_nearest_place",
    description:
      "Find the single closest place to a given coordinate within a configurable radius. Optionally filter by name to find the nearest matching business or landmark.",
    inputSchema: {
      type: "object",
      properties: {
        lat: {
          type: "number",
          description: "Latitude in decimal degrees (WGS84).",
        },
        lon: {
          type: "number",
          description: "Longitude in decimal degrees (WGS84).",
        },
        max_distance_m: {
          type: "number",
          description: "Search radius in metres. Default: 5000.",
        },
        name: {
          type: "string",
          description:
            "Optional name filter — only return a place whose name contains this string.",
        },
      },
      required: ["lat", "lon"],
    },
  },
  {
    name: "get_place_by_id",
    description:
      "Get the full Overture Maps record for a single place by its ID. Returns all available fields: names, addresses, coordinates, confidence score, categories, websites, phones, social profiles, emails, and brand. Place IDs are returned by the search_places, reverse_geocode, and find_nearest_place tools.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            'Overture place identifier (format: "overture:place:<uuid>"), returned in the id field of any search result.',
        },
      },
      required: ["id"],
    },
  },
];

async function callApi(url: string): Promise<TextContent> {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  const data: unknown = await response.json();
  return {
    type: "text",
    text: JSON.stringify(data, null, 2),
  };
}

const server = new Server(
  { name: "mcp-server-geodata-placefinder", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let content: TextContent;

    switch (name) {
      case "health_check": {
        content = await callApi(`${BASE_URL}/api/health`);
        break;
      }

      case "search_places": {
        const params = new URLSearchParams();
        if (args.q) params.set("q", String(args.q));
        if (args.name) params.set("name", String(args.name));
        if (args.city) params.set("city", String(args.city));
        if (args.postcode) params.set("postcode", String(args.postcode));
        if (args.type) params.set("type", String(args.type));
        if (args.limit) params.set("limit", String(args.limit));
        content = await callApi(`${BASE_URL}/api/search?${params}`);
        break;
      }

      case "reverse_geocode": {
        const params = new URLSearchParams();
        params.set("lat", String(args.lat));
        params.set("lon", String(args.lon));
        if (args.limit) params.set("limit", String(args.limit));
        content = await callApi(`${BASE_URL}/api/reverse?${params}`);
        break;
      }

      case "find_nearest_place": {
        const params = new URLSearchParams();
        params.set("lat", String(args.lat));
        params.set("lon", String(args.lon));
        if (args.max_distance_m)
          params.set("max_distance_m", String(args.max_distance_m));
        if (args.name) params.set("name", String(args.name));
        content = await callApi(`${BASE_URL}/api/places/nearest?${params}`);
        break;
      }

      case "get_place_by_id": {
        const id = String(args.id);
        content = await callApi(`${BASE_URL}/api/places/${encodeURIComponent(id)}`);
        break;
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return { content: [content] };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err}\n`);
  process.exit(1);
});
