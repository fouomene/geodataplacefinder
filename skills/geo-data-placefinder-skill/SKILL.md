---
name: geo-data-placefinder-skill
description: >
  Answers geographic questions by querying the geodataplacefinder.org API (Overture Maps data).
  Trigger this skill whenever the user asks about: the location or GPS coordinates of a place
  ("where is", "coordinates of", "find the location of"), searching for a place by name, address
  or category ("find a hotel near", "search for a cafe in"), reverse geocoding ("what is at these
  coordinates"), finding the nearest place ("nearest X", "closest", "near me"), or retrieving
  full details of a place via its Overture ID. Works in French and English — always respond in
  the user's language.
---

# Skill: Geo Data PlaceFinder

## Objective

Query the **geodataplacefinder.org** REST API (Overture Maps data) to answer geographic questions:
place search, geocoding, reverse geocoding, nearest place lookup, and full place details.

---

## Base URL

```
https://geodataplacefinder.org
```

---

## Steps to Follow

### 1. Detect the language
Always respond in the **same language as the user** (English or French).

### 2. Identify the intent and select the right endpoint

| Detected intent | Endpoint to call |
|-----------------|-----------------|
| Find GPS coordinates of a named place | `/api/search` |
| Search a place by name, city, type, postcode | `/api/search` |
| Find what is located at given GPS coordinates | `/api/reverse` |
| Find the nearest place to the user | `/api/places/nearest` |
| Get full details of a place (via its ID) | `/api/places/:id` |
| Check if the API is available | `/api/health` |

### 3. Retrieve the user's coordinates when needed

If the user says "near me", "nearby", "around me" or similar:
- Use the **location available in the user context** if provided.
- Otherwise, ask explicitly: "What is your location? (city name or GPS coordinates)"
- If a city name is given, call `/api/search?q=<city>&limit=1` first to get its coordinates, then chain to the target endpoint.

---

## Available Endpoints

---

### 🔍 `/api/search` — Place Search (Geocoding)

**Use when:** the user wants to find a place by name, address, city or category.

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `q` | Free-form search (name + city + category) |
| `name` | Place or business name |
| `city` | City or locality |
| `postcode` | Postal or ZIP code |
| `type` | Category (`cafe`, `hotel`, `restaurant`, etc.) |
| `limit` | Number of results (1–20, default: 5) |

**Example calls:**
```bash
curl "https://geodataplacefinder.org/api/search?q=Hilton+Hotel+Paris&limit=5"
curl "https://geodataplacefinder.org/api/search?name=Eiffel+Tower&city=Paris"
```

**JavaScript:**
```javascript
const params = new URLSearchParams({ q: "<query>", limit: 5 });
const res = await fetch(`https://geodataplacefinder.org/api/search?${params}`);
const data = await res.json();
```

---

### 🔄 `/api/reverse` — Reverse Geocoding

**Use when:** the user provides GPS coordinates and wants to know what place is there.

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lat` | ✅ | Latitude (WGS84) |
| `lon` | ✅ | Longitude (WGS84) |

**Example call:**
```bash
curl "https://geodataplacefinder.org/api/reverse?lat=48.8584&lon=2.2945"
```

**JavaScript:**
```javascript
const res = await fetch(`https://geodataplacefinder.org/api/reverse?lat=${lat}&lon=${lon}`);
const data = await res.json();
```

---

### 📍 `/api/places/nearest` — Nearest Place

**Use when:** the user wants the closest place to a position, optionally filtered by name.

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lat` | ✅ | Latitude (WGS84) |
| `lon` | ✅ | Longitude (WGS84) |
| `max_distance_m` | ❌ | Search radius in metres (default: 5000) |
| `name` | ❌ | Name filter (e.g. "McDonald") |

**Example call:**
```bash
curl "https://geodataplacefinder.org/api/places/nearest?lat=48.8584&lon=2.2945&max_distance_m=1000&name=cafe"
```

**JavaScript:**
```javascript
const params = new URLSearchParams({ lat, lon, max_distance_m: 1000 });
const res = await fetch(`https://geodataplacefinder.org/api/places/nearest?${params}`);
const data = await res.json();
```

---

### 🏢 `/api/places/:id` — Full Place Details

**Use when:** the user wants all details for a place whose Overture ID is known (obtained from a previous search result).

**Parameter:**

| Parameter | Description |
|-----------|-------------|
| `id` | Overture identifier in the format `overture:place:<uuid>` |

**Example call:**
```bash
curl "https://geodataplacefinder.org/api/places/overture:place:ac0aed88-e6cb-4224-9520-441339447760"
```

**Notable response fields:** `names`, `addresses`, `location`, `categories`, `websites`, `phones`, `socials`, `emails`, `brand`, `confidence`

---

### ❤️ `/api/health` — API Status

**Use when:** the user asks if the API is available, or after repeated errors.

```bash
curl "https://geodataplacefinder.org/api/health"
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| No results returned | Inform the user and suggest a broader search ("Try a broader search term") |
| Network error / timeout | Call `/api/health` to check status, inform the user |
| Missing coordinates for "near me" | Ask for the city name or GPS coordinates |
| Invalid place ID | Remind the user the ID must follow the format `overture:place:<uuid>` |

---

## Presenting Results

- **Always show:** place name, address, GPS coordinates (lat/lon)
- **If available:** category, phone, website, confidence score
- **For lists:** use a numbered list or table
- **GPS coordinates:** display with 4 decimal places (e.g. `48.8584, 2.2945`)
- **Use `places_map_display_v0`** to display results on a map when multiple places are returned

---

## Example Questions and Matching Endpoints

| User question | Endpoint |
|---------------|----------|
| "What are the GPS coordinates of the Eiffel Tower?" | `/api/search?q=Eiffel+Tower+Paris` |
| "Find a cafe near me" | `/api/places/nearest?lat=...&lon=...&name=cafe` |
| "What is at coordinates 48.8584, 2.2945?" | `/api/reverse?lat=48.8584&lon=2.2945` |
| "Show me hotels in London" | `/api/search?type=hotel&city=London` |
| "Give me full details for overture:place:abc123" | `/api/places/overture:place:abc123` |
| "Convert Hilton Hotel into geographic coordinates" | `/api/search?q=Hilton+Hotel&limit=5` |
| "Give places nearby me" | `/api/places/nearest?lat=...&lon=...` |
