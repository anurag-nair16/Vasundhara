# Smart Route Optimizer (TomTom Integration)

## Overview

The **Smart Route Optimizer** is a sophisticated web application that provides intelligent route planning with real-time hazard avoidance. It integrates the TomTom Routing API to calculate optimal routes while automatically avoiding predefined hazard zones such as construction areas, accidents, weather events, and traffic congestion.

## Key Features

- 🗺️ **Interactive Map Visualization**: Real-time Leaflet-based map rendering with OSM tiles
- 🚗 **Route Calculation**: TomTom server-side routing with automatic hazard area avoidance
- ⚠️ **Hazard Management**: Visual representation of hazard zones with severity levels
- 🔄 **Toggle Avoidance**: Switch between standard routing and hazard-aware routing
- 📍 **Location Presets**: 7 predefined source and 7 predefined destination locations in Mumbai
- 🎯 **Custom Coordinates**: Manual entry of latitude/longitude for any location
- 📊 **Trip Summary**: Real-time distance and duration calculations
- 🎨 **Responsive UI**: Mobile-friendly design with Tailwind CSS and Shadcn UI components

## Architecture

### Component Hierarchy

```
RouteOptimization (Main Component)
├── Navigation (Header)
├── Configuration Panel (Left Sidebar)
│   ├── Avoid Hazards Toggle
│   ├── Location Presets / Manual Entry
│   └── Trip Summary Card
└── RoutingMap Component (Right - 70% width)
    ├── Map Container
    ├── Markers (Source, Destination, Hazards)
    ├── Route Layer (GeoJSON LineString)
    └── Legend Overlay
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 with TypeScript |
| **Mapping Library** | Leaflet 1.7.1 with OSM tiles |
| **Routing API** | TomTom Routing v1 |
| **UI Components** | Shadcn UI (built on Radix UI) |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Fetch API |
| **Icons** | Lucide React |

## Data Structures

### Coordinates Interface
```typescript
export interface Coordinates {
  lat: number;        // Latitude (-90 to 90)
  lng: number;        // Longitude (-180 to 180)
  name?: string;      // Optional location name
}
```

### Issue (Hazard) Interface
```typescript
export interface Issue {
  id: string;                          // Unique identifier
  coords: Coordinates;                 // Center point of hazard
  radius: number;                      // Radius in meters
  description: string;                 // Hazard description
  severity: 'high' | 'medium';        // Severity level for UI styling
}
```

### Route Statistics
```typescript
{
  distance: number;    // Distance in kilometers
  duration: number;    // Duration in seconds
}
```

## Routing Algorithm

### 1. **Basic Route Request**

When the user selects source and destination points, a request is made to the TomTom API:

```
POST https://api.tomtom.com/routing/1/calculateRoute/{lat1},{lng1}:{lat2},{lng2}/json?key={API_KEY}
```

**Request Body:**
```json
{
  "avoidAreas": {
    "rectangles": [
      {
        "northEastCorner": { "latitude": xx, "longitude": yy },
        "southWestCorner": { "latitude": xx, "longitude": yy }
      }
    ]
  }
}
```

### 2. **Hazard Zone Conversion**

Circular hazard zones are converted to rectangular bounding boxes because TomTom's API accepts rectangular avoid areas:

**Algorithm: Circle to Bounding Box Conversion**

```typescript
const createBoundingBoxFromCircle = (center: Coordinates, radiusMeters: number) => {
  const R = 6378.137;                    // Earth radius in kilometers
  
  // Convert radius to angular distance (degrees)
  const dy = (radiusMeters / 1000) / R * (180 / Math.PI);
  
  // Adjust for latitude curvature
  const dx = dy / Math.cos(center.lat * (Math.PI / 180));
  
  return {
    northEastCorner: {
      latitude: center.lat + dy,
      longitude: center.lng + dx
    },
    southWestCorner: {
      latitude: center.lat - dy,
      longitude: center.lng - dx
    }
  };
};
```

**Mathematical Explanation:**
- **dy (Latitude difference)**: Uses the haversine formula simplified for small distances
  - `dy = (distance_km / Earth_radius) × (180/π)`
  - This gives the angular distance in degrees
  
- **dx (Longitude difference)**: Adjusted for latitude curvature
  - At the equator: `dx ≈ dy`
  - At higher latitudes: `dx = dy / cos(latitude)`
  - This accounts for longitude lines converging toward the poles

### 3. **Route Response Processing**

TomTom returns route data with:
- **coordinates**: Array of latitude/longitude points
- **distance**: Total distance in meters
- **duration**: Total travel time in seconds
- **route legs**: Segmented route information

**Processing Steps:**
```typescript
// Extract coordinates from response
const coordinates = route.legs[0].points.map(pt => [pt.longitude, pt.latitude]);

// Convert to GeoJSON LineString format
const geoJson = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: coordinates  // [lng, lat] pairs
  }
};

// Render on map
routeLayer.current = L.geoJSON(geoJson, {
  style: {
    color: avoidIssues ? '#22c55e' : '#3b82f6',  // Green if avoiding, Blue otherwise
    weight: 5,
    opacity: 0.8
  }
}).addTo(map);
```

## Component Breakdown

### RouteOptimization (Main Component)

**State Management:**
```typescript
const [source, setSource] = useState<Coordinates>(PREDEFINED_LOCATIONS.sources[0]);
const [destination, setDestination] = useState<Coordinates>(PREDEFINED_LOCATIONS.destinations[0]);
const [sourceInput, setSourceInput] = useState('');
const [destInput, setDestInput] = useState('');
const [routeStats, setRouteStats] = useState<{ distance: number, duration: number } | null>(null);
const [avoidIssues, setAvoidIssues] = useState(false);
```

**Key Functions:**
- `handleSourceChange()`: Updates source location
- `handleDestinationChange()`: Updates destination location
- `handleCustomSource()`: Parses comma-separated coordinates
- `handleCustomDestination()`: Parses comma-separated coordinates
- `formatDuration()`: Converts seconds to human-readable format (e.g., "1h 30m")

### RoutingMap Component

**Purpose:** Handles all map rendering, marker placement, and TomTom API communication

**State:**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Refs for DOM elements
const mapContainer = useRef<HTMLDivElement>(null);
const map = useRef<L.Map | null>(null);
const routeLayer = useRef<L.GeoJSON | null>(null);
const markerLayer = useRef<L.LayerGroup | null>(null);
```

**Three Main useEffect Hooks:**

#### 1. Map Initialization (Runs once)
```typescript
useEffect(() => {
  // Initialize Leaflet map
  // Set view to source location with zoom level 13
  // Add OSM tile layer
  // Fix Leaflet default icons
}, []);
```

#### 2. Marker Updates (Runs when source/destination/issues change)
```typescript
useEffect(() => {
  // Clear existing layers
  // Add source marker (blue)
  // Add destination marker (red)
  // Add hazard markers (red warning icon)
  // Add hazard visualization:
  //   - If avoidIssues ON: Rectangular bounding box (red dashed)
  //   - If avoidIssues OFF: Circular zone (amber)
}, [source, destination, issues, avoidIssues]);
```

#### 3. Route Fetching (Runs when any routing parameter changes)
```typescript
useEffect(() => {
  const fetchRoute = async () => {
    // Validate API key
    // Prepare avoid areas (only if avoidIssues enabled)
    // Call TomTom API
    // Process response
    // Render route on map
    // Calculate trip summary
  };
  
  // Debounce with 500ms timeout
  const timer = setTimeout(fetchRoute, 500);
  return () => clearTimeout(timer);
}, [source, destination, issues, avoidIssues]);
```

## Visual Elements

### Marker Icons (SVG Data URIs)

**Source Marker:**
- Blue circle with white center
- Indicates starting point

**Destination Marker:**
- Red pin/teardrop shape
- Indicates ending point

**Hazard Marker:**
- Red warning circle with exclamation mark
- Indicates hazard zone center

### Route Line Colors

| Scenario | Color | Hex |
|----------|-------|-----|
| Standard Routing | Blue | #3b82f6 |
| Hazard Avoidance | Green | #22c55e |

### Hazard Visualization

**When Avoidance OFF:**
- Circular zone with amber border
- Light amber fill (opacity 0.1)
- Indicates informational zone only

**When Avoidance ON:**
- Rectangular bounding box with red dashed border
- Light red fill (opacity 0.1)
- Shows actual area TomTom will avoid

## Predefined Locations

### Sources (Mumbai)
1. Mumbai Airport (T2) - 19.0896, 72.8656
2. Gateway of India - 18.9220, 72.8347
3. Navi Mumbai (Vashi) - 19.0330, 73.0297
4. Dadar Station (Central) - 19.0178, 72.8478
5. Thane West - 19.2183, 72.9781
6. Juhu Beach - 19.1031, 72.8267
7. Borivali West - 19.2310, 72.8560

### Destinations (Mumbai)
1. BKC (Business District) - 19.0760, 72.8777
2. Andheri Station - 19.1136, 72.8697
3. Haji Ali Dargah - 18.9750, 72.8258
4. Powai (Hiranandani) - 19.1180, 72.9100
5. Colaba Causeway - 18.9100, 72.8090
6. Mindspace (Malad) - 19.1860, 72.8360
7. Vidyavihar (Phoenix) - 19.0726, 72.9002

## Mock Hazard Data

```typescript
const MOCK_ISSUES: Issue[] = [
  {
    id: 'weh-block',
    coords: { lat: 19.0950, lng: 72.8530 },
    radius: 700,
    description: 'WEH: Flyover Maintenance',
    severity: 'high'
  },
  // ... 6 more hazard zones
];
```

**Hazard Zones Include:**
- WEH Flyover (Maintenance work)
- Sea Link (Weather/winds)
- JVLR (Pipeline work)
- Saki Naka (Congestion)
- Sion Circle (Water logging)
- EEH (Metro work)
- SV Road (Market traffic)

## API Integration

### TomTom Routing API

**Endpoint:** `https://api.tomtom.com/routing/1/calculateRoute/{coordinates}/json`

**Method:** POST

**Required Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `coordinates`: Format `{lat1},{lng1}:{lat2},{lng2}`
- `key`: TomTom API key

**Request Body:**
```json
{
  "avoidAreas": {
    "rectangles": [
      {
        "northEastCorner": { "latitude": number, "longitude": number },
        "southWestCorner": { "latitude": number, "longitude": number }
      }
    ]
  }
}
```

**Response Structure:**
```json
{
  "routes": [
    {
      "summary": {
        "lengthInMeters": 12500,
        "travelTimeInSeconds": 1200
      },
      "legs": [
        {
          "points": [
            { "latitude": 19.0760, "longitude": 72.8777 },
            // ... more points
          ]
        }
      ]
    }
  ]
}
```

### Error Handling

```typescript
if (data.error || !data.routes || data.routes.length === 0) {
  throw new Error(data.error?.description || 'No route found');
}
```

**Common Errors:**
- Missing/invalid API key
- No route possible (source/destination too close or unreachable)
- API rate limit exceeded
- Invalid coordinates

## Performance Optimization

### 1. **Debouncing**
Route calculations are debounced by 500ms to avoid excessive API calls:
```typescript
const timer = setTimeout(fetchRoute, 500);
return () => clearTimeout(timer);
```

### 2. **Reference Memoization**
Using `useRef` for callbacks to prevent unnecessary re-renders:
```typescript
const onRouteCalculatedRef = useRef(onRouteCalculated);
useEffect(() => { onRouteCalculatedRef.current = onRouteCalculated; }, [onRouteCalculated]);
```

### 3. **Layer Reuse**
Clearing and reusing layer groups instead of destroying/recreating:
```typescript
if (routeLayer.current) map.current.removeLayer(routeLayer.current);
routeLayer.current = L.geoJSON(geoJson, {...}).addTo(map.current);
```

## UI/UX Features

### Configuration Panel (Left Sidebar)
- **Width**: 33% on desktop, 100% on mobile
- **Sticky**: Stays visible while scrolling
- **Sections**:
  1. Avoid Hazards Toggle (with visual feedback)
  2. Location Presets (scrollable)
  3. Manual Coordinate Entry (Tabs)
  4. Trip Summary (conditional rendering)

### Map Display (Right Sidebar)
- **Width**: 67% on desktop, full on mobile
- **Min Height**: 600px
- **Features**:
  - Zoom/pan controls
  - Attribution
  - Legend overlay (bottom-right)
  - Loading spinner
  - Error messages

### Navigation Bar
- Top-level navigation component
- Consistent styling with the app theme
- Supports user authentication and menu options

## Responsive Design Breakpoints

| Screen Size | Layout |
|------------|--------|
| < 1024px (lg) | Single column (stacked) |
| >= 1024px | Two-column grid (33/67 split) |
| < 640px (sm) | Full-width optimized |

## Typography & Spacing

- **Heading**: 4xl (text-4xl) bold with letter tracking
- **Subtext**: Gray-500 with margin-top-2
- **Cards**: Shadow-sm with slate-200 borders
- **Gap**: Consistent 6 spacing (gap-6) between sections

## User Workflow

1. **Select Source Location**
   - Choose from presets or enter custom coordinates
   - Source marker updates on map

2. **Select Destination Location**
   - Choose from presets or enter custom coordinates
   - Destination marker updates on map

3. **Toggle Hazard Avoidance (Optional)**
   - Switch "Avoid Hazards" toggle
   - Route recalculates using TomTom API

4. **View Results**
   - Route drawn on map (blue or green)
   - Hazard zones displayed with rectangles or circles
   - Trip summary shows distance and duration

5. **Refine Route**
   - Change source/destination to try different routes
   - Toggle avoidance to see impact on route

## Dependencies

```json
{
  "react": "^18.x",
  "typescript": "^5.x",
  "leaflet": "^1.7.1",
  "shadcn/ui": "*",
  "tailwindcss": "^3.x",
  "lucide-react": "^latest"
}
```

## API Key Configuration

**Important:** Replace the placeholder API key before deployment:

```typescript
const TOMTOM_API_KEY = '9AQLCrdW8uX57RaLauRBG8gI8z8o3ICv';
```

Get your key from: https://developer.tomtom.com/

**Validation:**
- Empty string: Shows error message
- Placeholder: Shows error message
- Valid key: Proceeds with routing

## Limitations & Future Improvements

### Current Limitations
- Single avoid-rectangle per hazard (not multi-polygon)
- No real-time hazard data integration
- No user authentication
- Hardcoded Mumbai locations
- No route history or bookmarks

### Potential Enhancements
- Real-time traffic data integration
- Dynamic hazard zone creation/deletion
- Multiple route alternatives display
- ETA vs. actual arrival time comparison
- Route sharing and bookmarking
- Mobile app version
- Voice turn-by-turn navigation
- Integration with ride-sharing services
- Historical route analytics

## Security Considerations

1. **API Key Protection**: Currently hardcoded (move to environment variables)
2. **Input Validation**: Basic coordinate parsing with isNaN checks
3. **CORS**: TomTom API handles cross-origin requests
4. **Error Handling**: User-friendly error messages without exposing internals

## Browser Compatibility

- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- IE 11: ❌ Not supported (uses modern JS features)

## Testing Recommendations

### Unit Tests
- Coordinate parsing functions
- Bounding box calculations
- Duration formatting

### Integration Tests
- TomTom API calls
- Route rendering
- Hazard zone visualization

### E2E Tests
- Complete user workflow
- Multiple route scenarios
- Error handling paths

## Deployment Checklist

- [ ] Replace TomTom API key with production key
- [ ] Move API key to environment variables
- [ ] Test with various coordinate ranges
- [ ] Verify map tile loading in production
- [ ] Check responsive design on actual devices
- [ ] Monitor API quota usage
- [ ] Setup error tracking (Sentry)
- [ ] Configure CDN for static assets

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not loading | Check OSM tile URL accessibility |
| Routes not calculating | Verify TomTom API key is valid |
| Markers not showing | Ensure Leaflet icons are loaded correctly |
| Slow performance | Increase debounce timeout |
| CORS errors | Verify TomTom API allows your domain |

## References

- [Leaflet Documentation](https://leafletjs.com/)
- [TomTom Routing API](https://developer.tomtom.com/routing-api/)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)

---

**Last Updated:** December 2025
**Version:** 1.0
**Author:** Vasundhara Development Team
