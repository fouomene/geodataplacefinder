import { Wand2, Search, RefreshCw, MapPin, Building2, Heart, ExternalLink } from "lucide-react";

const endpoints = [
  {
    icon: <Search className="h-5 w-5 text-primary" />,
    method: "GET",
    path: "/api/search",
    label: "Place Search (Geocoding)",
    when: "The user wants to find a place by name, address, city, or category.",
    params: [
      { name: "q", required: false, desc: "Free-form search (name + city + category)" },
      { name: "name", required: false, desc: "Place or business name" },
      { name: "city", required: false, desc: "City or locality" },
      { name: "postcode", required: false, desc: "Postal or ZIP code" },
      { name: "type", required: false, desc: "Category (cafe, hotel, restaurant, etc.)" },
      { name: "limit", required: false, desc: "Number of results (1–20, default: 5)" },
    ],
    examples: [
      `curl "https://geodataplacefinder.org/api/search?q=Hilton+Hotel+Paris&limit=5"`,
      `curl "https://geodataplacefinder.org/api/search?name=Eiffel+Tower&city=Paris"`,
    ],
  },
  {
    icon: <RefreshCw className="h-5 w-5 text-primary" />,
    method: "GET",
    path: "/api/reverse",
    label: "Reverse Geocoding",
    when: "The user provides GPS coordinates and wants to know what place is there.",
    params: [
      { name: "lat", required: true, desc: "Latitude (WGS84)" },
      { name: "lon", required: true, desc: "Longitude (WGS84)" },
    ],
    examples: [
      `curl "https://geodataplacefinder.org/api/reverse?lat=48.8584&lon=2.2945"`,
    ],
  },
  {
    icon: <MapPin className="h-5 w-5 text-primary" />,
    method: "GET",
    path: "/api/places/nearest",
    label: "Nearest Place",
    when: "The user wants the closest place to a position, optionally filtered by name.",
    params: [
      { name: "lat", required: true, desc: "Latitude (WGS84)" },
      { name: "lon", required: true, desc: "Longitude (WGS84)" },
      { name: "max_distance_m", required: false, desc: "Search radius in metres (default: 5000)" },
      { name: "name", required: false, desc: "Name filter (e.g. McDonald)" },
    ],
    examples: [
      `curl "https://geodataplacefinder.org/api/places/nearest?lat=48.8584&lon=2.2945&max_distance_m=1000&name=cafe"`,
    ],
  },
  {
    icon: <Building2 className="h-5 w-5 text-primary" />,
    method: "GET",
    path: "/api/places/:id",
    label: "Full Place Details",
    when: "The user wants all details for a place whose Overture ID is known.",
    params: [
      { name: "id", required: true, desc: "Overture identifier in the format overture:place:<uuid>" },
    ],
    examples: [
      `curl "https://geodataplacefinder.org/api/places/overture:place:ac0aed88-e6cb-4224-9520-441339447760"`,
    ],
  },
  {
    icon: <Heart className="h-5 w-5 text-primary" />,
    method: "GET",
    path: "/api/health",
    label: "API Status",
    when: "The user asks if the API is available, or after repeated errors.",
    params: [],
    examples: [
      `curl "https://geodataplacefinder.org/api/health"`,
    ],
  },
];

const intentTable = [
  { intent: "Find GPS coordinates of a named place", endpoint: "/api/search" },
  { intent: "Search a place by name, city, type, postcode", endpoint: "/api/search" },
  { intent: "Find what is located at given GPS coordinates", endpoint: "/api/reverse" },
  { intent: "Find the nearest place to the user", endpoint: "/api/places/nearest" },
  { intent: "Get full details of a place via its ID", endpoint: "/api/places/:id" },
  { intent: "Check if the API is available", endpoint: "/api/health" },
];

const exampleQuestions = [
  { question: "What are the GPS coordinates of the Eiffel Tower?", endpoint: "/api/search?q=Eiffel+Tower+Paris" },
  { question: "Find a cafe near me", endpoint: "/api/places/nearest?lat=...&lon=...&name=cafe" },
  { question: "What is at coordinates 48.8584, 2.2945?", endpoint: "/api/reverse?lat=48.8584&lon=2.2945" },
  { question: "Show me hotels in London", endpoint: "/api/search?type=hotel&city=London" },
  { question: "Give me full details for overture:place:abc123", endpoint: "/api/places/overture:place:abc123" },
  { question: "Convert Hilton Hotel into geographic coordinates", endpoint: "/api/search?q=Hilton+Hotel&limit=5" },
  { question: "Give places nearby me", endpoint: "/api/places/nearest?lat=...&lon=..." },
];

const errorTable = [
  { situation: "No results returned", action: 'Inform the user and suggest a broader search ("Try a broader search term")' },
  { situation: "Network error / timeout", action: "Call /api/health to check status, inform the user" },
  { situation: 'Missing coordinates for "near me"', action: "Ask for the city name or GPS coordinates" },
  { situation: "Invalid place ID", action: "Remind the user the ID must follow the format overture:place:<uuid>" },
];

export default function Skill() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-16">

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Wand2 className="h-5 w-5" />
            </div>
            <h1 className="text-4xl font-bold font-mono tracking-tight">Skill</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A reusable AI skill that answers geographic questions by querying the GeoData Placefinder API.
            Supports place search, geocoding, reverse geocoding, nearest place lookup, and full place details.
            Works in English and French.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://github.com/fouomene/geodataplacefinder/blob/main/skills/geo-data-placefinder-skill/SKILL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm font-mono text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View SKILL.md on GitHub
            </a>
          </div>
        </div>

        {/* Base URL */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold font-mono">Base URL</h2>
          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-green-400">
            https://geodataplacefinder.org
          </pre>
        </div>

        {/* Intent routing */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-mono">Intent routing</h2>
          <p className="text-muted-foreground">Select the right endpoint based on what the user is asking:</p>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-foreground">Detected intent</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Endpoint</th>
                </tr>
              </thead>
              <tbody>
                {intentTable.map((row, i) => (
                  <tr key={i} className={i < intentTable.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 text-muted-foreground">{row.intent}</td>
                    <td className="px-4 py-3 font-mono text-primary text-xs">{row.endpoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-mono">Endpoints</h2>
          <div className="space-y-6">
            {endpoints.map((ep) => (
              <div key={ep.path} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                  {ep.icon}
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {ep.method}
                  </span>
                  <code className="font-mono font-bold text-base text-primary">{ep.path}</code>
                  <span className="text-sm text-muted-foreground hidden sm:block">— {ep.label}</span>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Use when:</span> {ep.when}
                  </p>

                  {ep.params.length > 0 && (
                    <div className="rounded border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-3 py-2 font-medium text-foreground">Parameter</th>
                            <th className="text-left px-3 py-2 font-medium text-foreground">Required</th>
                            <th className="text-left px-3 py-2 font-medium text-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((p, i) => (
                            <tr key={p.name} className={i < ep.params.length - 1 ? "border-b border-border" : ""}>
                              <td className="px-3 py-2 font-mono text-primary text-xs">{p.name}</td>
                              <td className="px-3 py-2">
                                {p.required
                                  ? <span className="text-destructive font-bold text-xs">required</span>
                                  : <span className="text-muted-foreground text-xs">optional</span>}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground text-xs">{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="space-y-2">
                    {ep.examples.map((ex, i) => (
                      <pre key={i} className="bg-slate-950 border border-slate-800 rounded p-3 font-mono text-xs text-green-400 overflow-x-auto">
                        {ex}
                      </pre>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Presenting results */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-mono">Presenting results</h2>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex gap-2"><span className="text-primary font-bold shrink-0">—</span> Always show: place name, address, GPS coordinates (lat/lon)</li>
            <li className="flex gap-2"><span className="text-primary font-bold shrink-0">—</span> If available: category, phone, website, confidence score</li>
            <li className="flex gap-2"><span className="text-primary font-bold shrink-0">—</span> For lists: use a numbered list or table</li>
            <li className="flex gap-2"><span className="text-primary font-bold shrink-0">—</span> GPS coordinates: display with 4 decimal places (e.g. 48.8584, 2.2945)</li>
            <li className="flex gap-2"><span className="text-primary font-bold shrink-0">—</span> Use <code className="font-mono text-primary">places_map_display_v0</code> to display results on a map when multiple places are returned</li>
          </ul>
        </div>

        {/* Error handling */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-mono">Error handling</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-foreground">Situation</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {errorTable.map((row, i) => (
                  <tr key={i} className={i < errorTable.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 text-muted-foreground">{row.situation}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Example questions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-mono">Example questions</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-foreground">User question</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Endpoint</th>
                </tr>
              </thead>
              <tbody>
                {exampleQuestions.map((row, i) => (
                  <tr key={i} className={i < exampleQuestions.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 text-muted-foreground italic">"{row.question}"</td>
                    <td className="px-4 py-3 font-mono text-primary text-xs">{row.endpoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
