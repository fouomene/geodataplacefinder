import { useState } from "react";
import { Search, MapPin, Target, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSearchPlaces,
  useReversePlaces,
  useNearestPlaces,
  getSearchPlacesQueryKey,
  getReversePlacesQueryKey,
  getNearestPlacesQueryKey,
} from "@workspace/api-client-react";

export function ApiDemo() {
  const [activeTab, setActiveTab] = useState("search");

  // Search state
  const [searchQuery, setSearchQuery] = useState("Hilton Hotel");
  const [activeSearch, setActiveSearch] = useState("");

  // Reverse state — Wilmington, DE (Hotel du Pont area)
  const [lat, setLat] = useState("39.7460");
  const [lon, setLon] = useState("-75.5480");
  const [activeReverse, setActiveReverse] = useState({ lat: "", lon: "" });

  // Nearest state — same area
  const [nearLat, setNearLat] = useState("39.7460");
  const [nearLon, setNearLon] = useState("-75.5480");
  const [nearName, setNearName] = useState("");
  const [activeNearest, setActiveNearest] = useState({ lat: "", lon: "", name: "" });

  const searchParams = { q: activeSearch, limit: 5 };
  const { data: searchData, isLoading: searchLoading, error: searchError } = useSearchPlaces(
    searchParams,
    { query: { enabled: !!activeSearch, queryKey: getSearchPlacesQueryKey(searchParams) } }
  );

  const reverseParams = { lat: Number(activeReverse.lat), lon: Number(activeReverse.lon), limit: 5 };
  const { data: reverseData, isLoading: reverseLoading, error: reverseError } = useReversePlaces(
    reverseParams,
    { query: { enabled: !!activeReverse.lat && !!activeReverse.lon, queryKey: getReversePlacesQueryKey(reverseParams) } }
  );

  const nearestParams = { lat: Number(activeNearest.lat), lon: Number(activeNearest.lon), name: activeNearest.name, max_distance_m: 5000 };
  const { data: nearestData, isLoading: nearestLoading, error: nearestError } = useNearestPlaces(
    nearestParams,
    { query: { enabled: !!activeNearest.lat && !!activeNearest.lon, queryKey: getNearestPlacesQueryKey(nearestParams) } }
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleReverseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveReverse({ lat, lon });
  };

  const handleNearestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveNearest({ lat: nearLat, lon: nearLon, name: nearName });
  };

  const renderResponse = (data: any, isLoading: boolean, error: any) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-48 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-4 text-destructive bg-destructive/10 rounded font-mono text-sm">
          Error: {error?.error || "Failed to fetch data"}
        </div>
      );
    }
    if (!data) {
      return (
        <div className="flex items-center justify-center h-48 text-muted-foreground/50 font-mono text-sm">
          // Awaiting query...
        </div>
      );
    }

    return (
      <pre className="p-4 rounded bg-black/50 overflow-x-auto border border-border/50 text-sm font-mono text-green-400">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
      <div className="border-b border-border bg-muted/30 p-2 flex gap-2 items-center">
        <div className="flex gap-1.5 px-2">
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-primary/80" />
        </div>
        <div className="text-xs font-mono text-muted-foreground ml-2">interactive-demo.sh</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
        {/* Input Panel */}
        <div className="p-6 border-r border-border bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-background">
              <TabsTrigger value="search" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary" data-testid="tab-search">Search</TabsTrigger>
              <TabsTrigger value="reverse" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary" data-testid="tab-reverse">Reverse</TabsTrigger>
              <TabsTrigger value="nearest" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary" data-testid="tab-nearest">Nearest</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4 font-mono">GET /api/search</div>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="q">Query</Label>
                  <div className="flex gap-2">
                    <Input
                      id="q"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='e.g. "Hilton Hotel" or "cafe"'
                      className="font-mono"
                      data-testid="input-search-q"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" data-testid="btn-search-submit">
                  <Send className="w-4 h-4 mr-2" /> Execute Request
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reverse" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4 font-mono">GET /api/reverse</div>
              <form onSubmit={handleReverseSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} className="font-mono" data-testid="input-reverse-lat" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lon">Longitude</Label>
                    <Input id="lon" value={lon} onChange={(e) => setLon(e.target.value)} className="font-mono" data-testid="input-reverse-lon" />
                  </div>
                </div>
                <Button type="submit" className="w-full" data-testid="btn-reverse-submit">
                  <Send className="w-4 h-4 mr-2" /> Execute Request
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="nearest" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4 font-mono">GET /api/places/nearest</div>
              <form onSubmit={handleNearestSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nearLat">Latitude</Label>
                    <Input id="nearLat" value={nearLat} onChange={(e) => setNearLat(e.target.value)} className="font-mono" data-testid="input-nearest-lat" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nearLon">Longitude</Label>
                    <Input id="nearLon" value={nearLon} onChange={(e) => setNearLon(e.target.value)} className="font-mono" data-testid="input-nearest-lon" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nearName">Name Filter (Optional)</Label>
                  <Input id="nearName" value={nearName} onChange={(e) => setNearName(e.target.value)} className="font-mono" data-testid="input-nearest-name" />
                </div>
                <Button type="submit" className="w-full" data-testid="btn-nearest-submit">
                  <Send className="w-4 h-4 mr-2" /> Execute Request
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Output Panel */}
        <div className="p-6 bg-[#0c1017] flex flex-col">
          <div className="text-xs font-mono text-muted-foreground mb-4 flex justify-between">
            <span>Response</span>
            {activeTab === 'search' && searchData && <span className="text-primary">{searchData.length} results</span>}
            {activeTab === 'reverse' && reverseData && <span className="text-primary">{reverseData.length} results</span>}
            {activeTab === 'nearest' && nearestData && <span className="text-primary">Found match</span>}
          </div>
          <div className="flex-1 overflow-auto rounded border border-white/5 bg-black/40">
            {activeTab === "search" && renderResponse(searchData, searchLoading, searchError)}
            {activeTab === "reverse" && renderResponse(reverseData, reverseLoading, reverseError)}
            {activeTab === "nearest" && renderResponse(nearestData, nearestLoading, nearestError)}
          </div>
        </div>
      </div>
    </div>
  );
}
