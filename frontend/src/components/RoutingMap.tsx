import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

// --- Types ---

export interface Coordinates {
  lat: number;
  lng: number;
  name?: string;
}

export interface Issue {
  id: string;
  coords: Coordinates;
  radius: number;
  description: string;
  severity: 'high' | 'medium';
}

interface RoutingMapProps {
  source: Coordinates;
  destination: Coordinates;
  issues: Issue[];
  avoidIssues: boolean;
  onRouteCalculated?: (route: Coordinates[]) => void;
}

interface RouteData {
  coordinates: Coordinates[];
  distance?: number;
  time?: string;
}

// --- Icons (SVG Data URIs) ---

const sourceIconSvg =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233B82F6"><circle cx="12" cy="12" r="8" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="white"/></svg>';

const destIconSvg =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EF4444"><path d="M12 2C6.5 2 2 6.5 2 12c0 8 10 18 10 18s10-10 10-18c0-5.5-4.5-10-10-10z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>';

const hazardIconSvg = 
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>';

// --- Helper: Fix Leaflet default icons in React ---
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// --- Component: RoutingMap ---

function RoutingMap({
  source,
  destination,
  issues,
  avoidIssues,
  onRouteCalculated,
}: RoutingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routingControl = useRef<any>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  const isReroutingRef = useRef(false);
  const onRouteCalculatedRef = useRef(onRouteCalculated);

  useEffect(() => { onRouteCalculatedRef.current = onRouteCalculated; }, [onRouteCalculated]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    map.current = L.map(mapContainer.current).setView([source.lat, source.lng], 13);
    layerGroup.current = L.layerGroup().addTo(map.current);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map.current);
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (!map.current || !layerGroup.current) return;
    
    layerGroup.current.clearLayers();

    // Render Hazards
    issues.forEach(issue => {
      const marker = L.marker([issue.coords.lat, issue.coords.lng], {
        icon: L.icon({
          iconUrl: hazardIconSvg,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      });
      // Visual Circle
      const circle = L.circle([issue.coords.lat, issue.coords.lng], {
        radius: issue.radius,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 5'
      });
      marker.bindPopup(`<b>${issue.description}</b><br>Severity: ${issue.severity}`);
      layerGroup.current?.addLayer(marker);
      layerGroup.current?.addLayer(circle);
    });

    const currentMap = map.current;
    if (routingControl.current) {
      currentMap.removeControl(routingControl.current);
      routingControl.current = null;
    }

    isReroutingRef.current = false;

    let waypoints = [
      L.latLng(source.lat, source.lng),
      L.latLng(destination.lat, destination.lng)
    ];

    const plan = (L.Routing as any).plan(waypoints, {
      createMarker: (i: number, wp: any) => {
        if (i === 0) return L.marker(wp.latLng, { icon: L.icon({ iconUrl: sourceIconSvg, iconSize: [32, 32], iconAnchor: [16, 16] }), draggable: false }).bindPopup('Source');
        if (i === waypoints.length - 1) return L.marker(wp.latLng, { icon: L.icon({ iconUrl: destIconSvg, iconSize: [32, 32], iconAnchor: [16, 32] }), draggable: false }).bindPopup('Destination');
        // Intermediate perimeter points
        return L.marker(wp.latLng, {
           icon: L.divIcon({ className: 'bg-transparent border-none', html: '<div style="width:6px;height:6px;background:#22c55e;border-radius:50%;"></div>' }),
           draggable: false
        });
      }
    });

    routingControl.current = (L.Routing as any).control({
      plan: plan,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false, 
      lineOptions: {
        styles: [{ color: avoidIssues ? '#22c55e' : '#3b82f6', opacity: 0.8, weight: 6 }],
      },
    })
    .on('routesfound', (e: any) => {
      const routes = e.routes;
      if (!routes || routes.length === 0) return;

      const primaryRoute = routes[0];
      const routeCoordinates = primaryRoute.coordinates;

      if (onRouteCalculatedRef.current) {
        onRouteCalculatedRef.current(routeCoordinates.map((c: any) => ({ lat: c.lat, lng: c.lng })));
      }

      // --- PERIMETER REROUTING LOGIC ---
      if (avoidIssues && !isReroutingRef.current) {
        
        // Start with the source
        let newWaypoints: L.LatLng[] = [L.latLng(source.lat, source.lng)];
        let collisionFound = false;

        // 1. Find all hazards the route actually touches
        const hitHazards = issues.filter(issue => {
          return routeCoordinates.some((coord: L.LatLng) => {
             return L.latLng(issue.coords.lat, issue.coords.lng).distanceTo(coord) < (issue.radius * 0.95);
          });
        });

        if (hitHazards.length > 0) {
          // Sort hazards by distance from source (handle them in order of encounter)
          hitHazards.sort((a, b) => {
            const distA = L.latLng(source.lat, source.lng).distanceTo(L.latLng(a.coords.lat, a.coords.lng));
            const distB = L.latLng(source.lat, source.lng).distanceTo(L.latLng(b.coords.lat, b.coords.lng));
            return distA - distB;
          });

          hitHazards.forEach(issue => {
            const hazardCenter = L.latLng(issue.coords.lat, issue.coords.lng);
            
            // Find closest point on route to the hazard center
            let closestPoint: L.LatLng | null = null;
            let minDistance = Infinity;

            routeCoordinates.forEach((coord: L.LatLng) => {
              const d = coord.distanceTo(hazardCenter);
              if (d < minDistance) {
                minDistance = d;
                closestPoint = coord;
              }
            });

            if (closestPoint) {
              // --- THE MATH: CALCULATE AN ARC ---
              
              // 1. Calculate the angle from Center -> Closest Point
              const dy = (closestPoint as L.LatLng).lat - hazardCenter.lat;
              const dx = (closestPoint as L.LatLng).lng - hazardCenter.lng;
              const baseAngle = Math.atan2(dy, dx); // Radians

              // 2. Define our buffer radius (Radius + 20%)
              // Convert meters to approximate degrees
              const bufferMeters = issue.radius * 1.2;
              const rDegLat = bufferMeters / 111139; // 1 deg lat ~ 111km
              // Adjust longitude for latitude (fudge factor for curvature)
              const rDegLng = rDegLat / Math.cos(hazardCenter.lat * (Math.PI / 180));

              // 3. Generate 3 points: -60deg, 0deg, +60deg relative to the base angle
              // This creates a "V" or Arc shape around the hazard
              const angles = [baseAngle - 1.0, baseAngle, baseAngle + 1.0]; // 1.0 radian is approx 57 degrees

              angles.forEach(angle => {
                const pLat = hazardCenter.lat + (Math.sin(angle) * rDegLat);
                const pLng = hazardCenter.lng + (Math.cos(angle) * rDegLng);
                newWaypoints.push(L.latLng(pLat, pLng));
              });

              collisionFound = true;
            }
          });

          if (collisionFound) {
            // Add destination at the end
            newWaypoints.push(L.latLng(destination.lat, destination.lng));
            
            isReroutingRef.current = true; // Lock to prevent loop
            routingControl.current.setWaypoints(newWaypoints);
          }
        }
      }
    })
    .addTo(currentMap);

  }, [source.lat, source.lng, destination.lat, destination.lng, issues, avoidIssues]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full rounded-lg border border-gray-300 shadow-lg" style={{ minHeight: '600px' }} />
      
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md z-[1000] text-xs space-y-2 border border-gray-200">
        <div className="font-bold mb-1 border-b pb-1">Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Source
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Destination
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full border border-red-500 bg-red-100"></div> Hazard Radius
        </div>
      </div>
    </div>
  );
}

// --- Data & Main Component ---

const PREDEFINED_LOCATIONS = {
  sources: [
    { lat: 19.0896, lng: 72.8656, name: 'Mumbai Airport (T2)' },
    { lat: 18.9220, lng: 72.8347, name: 'Gateway of India (South)' },
    { lat: 19.1726, lng: 72.8360, name: 'Inorbit Mall Malad (North)' },
    { lat: 19.0330, lng: 73.0297, name: 'Navi Mumbai (Vashi)' },
  ],
  destinations: [
    { lat: 19.0760, lng: 72.8777, name: 'BKC (Business District)' },
    { lat: 19.1136, lng: 72.8697, name: 'Andheri Station' },
    { lat: 19.0178, lng: 72.8478, name: 'Dadar Station (Central)' },
    { lat: 19.1197, lng: 72.9050, name: 'Powai (Hiranandani)' },
    { lat: 18.9750, lng: 72.8258, name: 'Haji Ali Dargah' },
    { lat: 19.2183, lng: 72.8615, name: 'Borivali National Park' },
  ],
};

const MOCK_ISSUES: Issue[] = [
  {
    id: 'weh-block',
    coords: { lat: 19.0950, lng: 72.8530 }, 
    radius: 700,
    description: 'WEH: Flyover Construction',
    severity: 'high'
  },
  {
    id: 'sea-link-closed',
    coords: { lat: 19.0350, lng: 72.8150 },
    radius: 1000,
    description: 'Sea Link: Marathon',
    severity: 'high'
  },
  {
    id: 'jvlr-traffic',
    coords: { lat: 19.1250, lng: 72.8750 },
    radius: 500,
    description: 'JVLR: Pipeline Burst',
    severity: 'medium'
  },
  {
    id: 'saki-naka-jam',
    coords: { lat: 19.1060, lng: 72.8850 },
    radius: 400,
    description: 'Saki Naka: Gridlock',
    severity: 'medium'
  },
  {
    id: 'dadar-market',
    coords: { lat: 19.0220, lng: 72.8420 },
    radius: 400,
    description: 'Dadar: Festival',
    severity: 'high'
  },
  {
    id: 'link-road-metro',
    coords: { lat: 19.1550, lng: 72.8350 },
    radius: 500,
    description: 'Link Road: Metro Work',
    severity: 'medium'
  }
];

export default function RouteOptimization() {
  const [source, setSource] = useState<Coordinates>(PREDEFINED_LOCATIONS.sources[0]);
  const [destination, setDestination] = useState<Coordinates>(PREDEFINED_LOCATIONS.destinations[0]);
  
  const [sourceInput, setSourceInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [avoidIssues, setAvoidIssues] = useState(false);

  const handleSourceChange = (location: Coordinates) => setSource(location);
  const handleDestinationChange = (location: Coordinates) => setDestination(location);

  const handleCustomSource = () => {
    const parts = sourceInput.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      handleSourceChange({ lat: parts[0], lng: parts[1] });
      setSourceInput('');
    }
  };

  const handleCustomDestination = () => {
    const parts = destInput.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      handleDestinationChange({ lat: parts[0], lng: parts[1] });
      setDestInput('');
    }
  };

  const handleRouteCalculated = (route: Coordinates[]) => {
    setRouteData({
      coordinates: route,
      distance: calculateDistance(route),
      time: estimateTime(route),
    });
  };

  const calculateDistance = (route: Coordinates[]): number => {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += getHaversineDistance(route[i], route[i + 1]);
    }
    return totalDistance;
  };

  const getHaversineDistance = (from: Coordinates, to: Coordinates): number => {
    const R = 6371; 
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const estimateTime = (route: Coordinates[]): string => {
    const distance = calculateDistance(route);
    const avgSpeed = avoidIssues ? 25 : 35; // slower when avoiding due to smaller roads usually
    const timeHours = distance / avgSpeed;
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Smart Route Optimizer</h1>
          <p className="text-gray-500 mt-2">Hazards shown as points - routes automatically detoured if they intersect.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 space-y-4">
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    avoidIssues ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {avoidIssues ? (
                      <ShieldCheck className="text-green-600 w-6 h-6"/> 
                    ) : (
                      <AlertTriangle className="text-gray-400 w-6 h-6" />
                    )}
                    <div className="flex flex-col">
                      <Label htmlFor="avoid-mode" className="font-bold cursor-pointer text-gray-700">
                        Avoid Hazards
                      </Label>
                      <span className="text-xs text-gray-500">
                        {avoidIssues ? "Checking route for intersections" : "Standard routing"}
                      </span>
                    </div>
                  </div>
                  <Switch 
                    id="avoid-mode" 
                    checked={avoidIssues}
                    onCheckedChange={setAvoidIssues}
                  />
                </div>

                <Tabs defaultValue="quick" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="quick">Presets</TabsTrigger>
                    <TabsTrigger value="custom">Manual</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="quick" className="space-y-4 pt-4">
                      
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Start Point</Label>
                        <div className="grid grid-cols-1 gap-2">
                         {PREDEFINED_LOCATIONS.sources.map((loc, idx) => (
                            <Button
                              key={idx}
                              variant={source.name === loc.name ? 'default' : 'outline'}
                              size="sm"
                              className={`justify-start ${source.name === loc.name ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                              onClick={() => handleSourceChange(loc)}
                            >
                              <MapPin className="w-3 h-3 mr-2" /> {loc.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">End Point</Label>
                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                          {PREDEFINED_LOCATIONS.destinations.map((loc, idx) => (
                            <Button
                              key={idx}
                              variant={destination.name === loc.name ? 'default' : 'outline'}
                              size="sm"
                              className={`justify-start ${destination.name === loc.name ? 'bg-red-600 hover:bg-red-700' : ''}`}
                              onClick={() => handleDestinationChange(loc)}
                            >
                              <MapPin className="w-3 h-3 mr-2" /> {loc.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                  </TabsContent>

                  <TabsContent value="custom">
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <Label>Source (Lat, Lng)</Label>
                          <Input 
                            placeholder="e.g. 19.0760, 72.8777" 
                            value={sourceInput} 
                            onChange={e => setSourceInput(e.target.value)} 
                          />
                          <Button onClick={handleCustomSource} size="sm" variant="secondary" className="w-full">Set Source</Button>
                        </div>
                        <div className="space-y-1">
                          <Label>Destination (Lat, Lng)</Label>
                          <Input 
                            placeholder="e.g. 19.2183, 72.8615" 
                            value={destInput} 
                            onChange={e => setDestInput(e.target.value)} 
                          />
                          <Button onClick={handleCustomDestination} size="sm" variant="secondary" className="w-full">Set Destination</Button>
                        </div>
                      </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {routeData && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Trip Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium uppercase">Distance</div>
                      <div className="text-xl font-bold text-blue-900">{routeData.distance?.toFixed(1)} km</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="text-xs text-indigo-600 font-medium uppercase">Duration</div>
                      <div className="text-xl font-bold text-indigo-900">{routeData.time}</div>
                    </div>
                  </div>
                  {avoidIssues && (
                      <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 p-3 rounded border border-orange-200">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Route includes automatic detours around intersected hazards.</span>
                      </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8 h-[600px] lg:h-auto">
            <RoutingMap
              source={source}
              destination={destination}
              issues={MOCK_ISSUES}
              avoidIssues={avoidIssues}
              onRouteCalculated={handleRouteCalculated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}