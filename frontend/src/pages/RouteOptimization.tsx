import { useEffect, useRef, useState } from 'react';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Switch } from '@/components/ui/switch';

import { AlertTriangle, ShieldCheck, MapPin, Loader2, Menu, X } from 'lucide-react';

import Navigation from '@/components/Navigation';



// --- CONFIGURATION ---

// TODO: Get your key from https://developer.tomtom.com/

const TOMTOM_API_KEY = '9AQLCrdW8uX57RaLauRBG8gI8z8o3ICv';



// --- Types ---

export interface Coordinates {

    lat: number;

    lng: number;

    name?: string;

}



export interface Issue {

    id: string;

    coords: Coordinates;

    radius: number; // in meters

    description: string;

    severity: 'high' | 'medium';

}



interface RoutingMapProps {

    source: Coordinates;

    destination: Coordinates;

    issues: Issue[];

    avoidIssues: boolean;

    onRouteCalculated?: (data: { distance: number; duration: number }) => void;

}



// --- Icons ---

const sourceIconSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233B82F6"><circle cx="12" cy="12" r="8" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="white"/></svg>';

const destIconSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EF4444"><path d="M12 2C6.5 2 2 6.5 2 12c0 8 10 18 10 18s10-10 10-18c0-5.5-4.5-10-10-10z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>';

const hazardIconSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>';



// --- Helper: Create Bounding Box for TomTom ---

// TomTom "avoidAreas" takes rectangles: northEastCorner, southWestCorner

const createBoundingBoxFromCircle = (center: Coordinates, radiusMeters: number) => {

    const R = 6378.137; // Earth Radius km

    const dy = (radiusMeters / 1000) / R * (180 / Math.PI);

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

    const routeLayer = useRef<L.GeoJSON | null>(null);

    const markerLayer = useRef<L.LayerGroup | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);



    // Initialize Map

    useEffect(() => {

        if (!mapContainer.current || map.current) return;

        map.current = L.map(mapContainer.current).setView([source.lat, source.lng], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {

            maxZoom: 19,

            attribution: '© OpenStreetMap',

        }).addTo(map.current);

        markerLayer.current = L.layerGroup().addTo(map.current);



        // @ts-ignore

        delete L.Icon.Default.prototype._getIconUrl;

        L.Icon.Default.mergeOptions({

            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',

            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',

            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',

        });

    }, []);



    // Update Markers

    useEffect(() => {

        if (!map.current || !markerLayer.current) return;

        markerLayer.current.clearLayers();



        L.marker([source.lat, source.lng], { icon: L.icon({ iconUrl: sourceIconSvg, iconSize: [32, 32], iconAnchor: [16, 16] }) }).bindPopup('Source').addTo(markerLayer.current);

        L.marker([destination.lat, destination.lng], { icon: L.icon({ iconUrl: destIconSvg, iconSize: [32, 32], iconAnchor: [16, 32] }) }).bindPopup('Destination').addTo(markerLayer.current);



        issues.forEach(issue => {

            L.marker([issue.coords.lat, issue.coords.lng], {

                icon: L.icon({ iconUrl: hazardIconSvg, iconSize: [28, 28], iconAnchor: [14, 14] })

            }).bindPopup(`<b>${issue.description}</b><br>Avoidance: ${avoidIssues ? 'ON' : 'OFF'}`).addTo(markerLayer.current!);



            // Draw the rectangle TomTom is seeing (visual debug)

            if (avoidIssues) {

                const bbox = createBoundingBoxFromCircle(issue.coords, issue.radius);

                L.rectangle([

                    [bbox.southWestCorner.latitude, bbox.southWestCorner.longitude],

                    [bbox.northEastCorner.latitude, bbox.northEastCorner.longitude]

                ], { color: '#ef4444', weight: 1, fillOpacity: 0.1, dashArray: '4,4' }).addTo(markerLayer.current!);

            } else {

                L.circle([issue.coords.lat, issue.coords.lng], { radius: issue.radius, color: '#fbbf24', weight: 1, fillOpacity: 0.1 }).addTo(markerLayer.current!);

            }

        });

    }, [source, destination, issues, avoidIssues]);



    // Fetch Route from TomTom

    useEffect(() => {

        const fetchRoute = async () => {

            if (!map.current) return;



            // FIXED: Only check if key is empty or the generic placeholder

            if (!TOMTOM_API_KEY || TOMTOM_API_KEY === 'YOUR_TOMTOM_API_KEY_HERE') {

                setError('Missing TomTom API Key');

                return;

            }



            setIsLoading(true);

            setError(null);



            try {

                // 1. Prepare Body with Avoid Areas

                const body: any = {

                    avoidAreas: {

                        rectangles: []

                    }

                };



                if (avoidIssues && issues.length > 0) {

                    body.avoidAreas.rectangles = issues.map(issue =>

                        createBoundingBoxFromCircle(issue.coords, issue.radius)

                    );

                }



                // 2. TomTom URL Structure: /calculateRoute/lat,lon:lat,lon/json

                const locations = `${source.lat},${source.lng}:${destination.lat},${destination.lng}`;

                const url = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?key=${TOMTOM_API_KEY}`;



                // 3. Call API

                const response = await fetch(url, {

                    method: 'POST',

                    headers: {

                        'Content-Type': 'application/json'

                    },

                    body: JSON.stringify(body)

                });



                const data = await response.json();



                if (data.error || !data.routes || data.routes.length === 0) {

                    console.error("TomTom Error:", data);

                    throw new Error(data.error?.description || 'No route found');

                }



                const route = data.routes[0];



                // 4. Convert TomTom points to GeoJSON LineString

                const coordinates = route.legs[0].points.map((pt: any) => [pt.longitude, pt.latitude]);



                const geoJson: any = {

                    type: 'Feature',

                    properties: {},

                    geometry: {

                        type: 'LineString',

                        coordinates: coordinates

                    }

                };



                // 5. Render

                if (routeLayer.current) map.current.removeLayer(routeLayer.current);



                routeLayer.current = L.geoJSON(geoJson, {

                    style: {

                        color: avoidIssues ? '#22c55e' : '#3b82f6',

                        weight: 5,

                        opacity: 0.8

                    }

                }).addTo(map.current);



                map.current.fitBounds(routeLayer.current.getBounds(), { padding: [50, 50] });



                // 6. Stats

                if (onRouteCalculated) {

                    onRouteCalculated({

                        distance: route.summary.lengthInMeters / 1000,

                        duration: route.summary.travelTimeInSeconds

                    });

                }



            } catch (err: any) {

                console.error(err);

                setError(err.message);

            } finally {

                setIsLoading(false);

            }

        };



        const timer = setTimeout(fetchRoute, 500);

        return () => clearTimeout(timer);



    }, [source, destination, issues, avoidIssues]);



    return (

        <div className="w-full h-full relative group">

            <div ref={mapContainer} className="w-full h-full rounded-lg border border-gray-300 shadow-lg" style={{ minHeight: '600px' }} />



            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-md shadow-md z-[1000] text-xs space-y-2 border border-gray-200">

                {isLoading && <div className="flex items-center gap-2 text-blue-600 font-bold border-b pb-2 mb-2"><Loader2 className="w-3 h-3 animate-spin" /> Calculating...</div>}

                {error && <div className="text-red-600 font-bold border-b pb-2 mb-2 max-w-[200px]">Error: {error}</div>}

                <div className="font-bold mb-1">TomTom Map Legend</div>

                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Source</div>

                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Destination</div>

                <div className="flex items-center gap-2"><div className={`w-2 h-2 border ${avoidIssues ? 'border-red-500 bg-red-100' : 'border-amber-500 bg-amber-100'}`}></div> Hazard Box</div>

            </div>

        </div>

    );

}
// ... existing imports and types ...

// --- Data & Main Component ---

const PREDEFINED_LOCATIONS = {
    sources: [
        { lat: 19.0896, lng: 72.8656, name: 'Mumbai Airport (T2)' },
        { lat: 18.9220, lng: 72.8347, name: 'Gateway of India' },
        { lat: 19.0330, lng: 73.0297, name: 'Navi Mumbai (Vashi)' },
        { lat: 19.0178, lng: 72.8478, name: 'Dadar Station (Central)' }, // New
        { lat: 19.2183, lng: 72.9781, name: 'Thane West' }, // New
        { lat: 19.1031, lng: 72.8267, name: 'Juhu Beach' }, // New
        { lat: 19.2310, lng: 72.8560, name: 'Borivali West' }, // New
    ],
    destinations: [
        { lat: 19.0760, lng: 72.8777, name: 'BKC (Business District)' },
        { lat: 19.1136, lng: 72.8697, name: 'Andheri Station' },
        { lat: 18.9750, lng: 72.8258, name: 'Haji Ali Dargah' },
        { lat: 19.1180, lng: 72.9100, name: 'Powai (Hiranandani)' }, // New
        { lat: 18.9100, lng: 72.8090, name: 'Colaba Causeway' }, // New
        { lat: 19.1860, lng: 72.8360, name: 'Mindspace (Malad)' }, // New
        { lat: 19.0726, lng: 72.9002, name: 'Vidyavihar (Phoenix)' }, // New
    ],
};

const MOCK_ISSUES: Issue[] = [
    { id: 'weh-block', coords: { lat: 19.0950, lng: 72.8530 }, radius: 700, description: 'WEH: Flyover Maintenance', severity: 'high' },
    { id: 'sea-link-closed', coords: { lat: 19.0350, lng: 72.8150 }, radius: 1000, description: 'Sea Link: Strong Winds', severity: 'high' },
    { id: 'jvlr-traffic', coords: { lat: 19.1250, lng: 72.8750 }, radius: 500, description: 'JVLR: Pipeline Work', severity: 'medium' },
    // New Hazards
    { id: 'sakinaka-jam', coords: { lat: 19.1030, lng: 72.8850 }, radius: 400, description: 'Saki Naka: Heavy Congestion', severity: 'high' },
    { id: 'sion-circle', coords: { lat: 19.0430, lng: 72.8630 }, radius: 400, description: 'Sion Circle: Water Logging', severity: 'medium' },
    { id: 'eeh-metro', coords: { lat: 19.1300, lng: 72.9350 }, radius: 600, description: 'EEH: Metro Girder Launch', severity: 'high' },
    { id: 'sv-road', coords: { lat: 19.1700, lng: 72.8400 }, radius: 300, description: 'SV Road: Market Traffic', severity: 'medium' }
];

// ... rest of the component ...


export default function RouteOptimization() {

    const [source, setSource] = useState<Coordinates>(PREDEFINED_LOCATIONS.sources[0]);

    const [destination, setDestination] = useState<Coordinates>(PREDEFINED_LOCATIONS.destinations[0]);

    const [sourceInput, setSourceInput] = useState('');

    const [destInput, setDestInput] = useState('');

    const [routeStats, setRouteStats] = useState<{ distance: number, duration: number } | null>(null);

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



    const formatDuration = (seconds: number) => {

        const h = Math.floor(seconds / 3600);

        const m = Math.floor((seconds % 3600) / 60);

        return h > 0 ? `${h}h ${m}m` : `${m}m`;

    };



    return (

        <div className="min-h-screen bg-slate-50 font-sans">

            <Navigation />

            <div className="p-6">

                <div className="max-w-7xl mx-auto">

                <div className="mb-8">

                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Smart Route Optimizer</h1>

                    <p className="text-gray-500 mt-2"></p>

                </div>



                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-4 space-y-4">

                        <Card className="shadow-sm border-slate-200">

                            <CardHeader className="pb-3"><CardTitle className="text-lg">Configuration</CardTitle></CardHeader>

                            <CardContent className="space-y-6">

                                <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${avoidIssues ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>

                                    <div className="flex items-center gap-3">

                                        {avoidIssues ? <ShieldCheck className="text-green-600 w-6 h-6" /> : <AlertTriangle className="text-gray-400 w-6 h-6" />}

                                        <div className="flex flex-col">

                                            <Label htmlFor="avoid-mode" className="font-bold cursor-pointer text-gray-700">Avoid Issues</Label>

                                            <span className="text-xs text-gray-500">{avoidIssues ? "Strict Area Avoidance" : "Standard Routing"}</span>

                                        </div>

                                    </div>

                                    <Switch id="avoid-mode" checked={avoidIssues} onCheckedChange={setAvoidIssues} />

                                </div>



                                <Tabs defaultValue="quick" className="w-full">

                                    <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="quick">Presets</TabsTrigger><TabsTrigger value="custom">Manual</TabsTrigger></TabsList>

                                    <TabsContent value="quick" className="space-y-4 pt-4">

                                        <div>

                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Start Point</Label>

                                            <div className="grid grid-cols-1 gap-2">

                                                {PREDEFINED_LOCATIONS.sources.map((loc, idx) => (

                                                    <Button key={idx} variant={source.name === loc.name ? 'default' : 'outline'} size="sm" className={`justify-start ${source.name === loc.name ? 'bg-blue-600 hover:bg-blue-700' : ''}`} onClick={() => handleSourceChange(loc)}>

                                                        <MapPin className="w-3 h-3 mr-2" /> {loc.name}

                                                    </Button>

                                                ))}

                                            </div>

                                        </div>

                                        <div>

                                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">End Point</Label>

                                            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">

                                                {PREDEFINED_LOCATIONS.destinations.map((loc, idx) => (

                                                    <Button key={idx} variant={destination.name === loc.name ? 'default' : 'outline'} size="sm" className={`justify-start ${destination.name === loc.name ? 'bg-red-600 hover:bg-red-700' : ''}`} onClick={() => handleDestinationChange(loc)}>

                                                        <MapPin className="w-3 h-3 mr-2" /> {loc.name}

                                                    </Button>

                                                ))}

                                            </div>

                                        </div>

                                    </TabsContent>

                                    <TabsContent value="custom">

                                        <div className="space-y-3 pt-2">

                                            <div className="space-y-1"><Label>Source (Lat, Lng)</Label><Input value={sourceInput} onChange={e => setSourceInput(e.target.value)} placeholder="19.0760, 72.8777" /><Button onClick={handleCustomSource} size="sm" variant="secondary" className="w-full">Set Source</Button></div>

                                            <div className="space-y-1"><Label>Destination (Lat, Lng)</Label><Input value={destInput} onChange={e => setDestInput(e.target.value)} placeholder="19.2183, 72.8615" /><Button onClick={handleCustomDestination} size="sm" variant="secondary" className="w-full">Set Destination</Button></div>

                                        </div>

                                    </TabsContent>

                                </Tabs>

                            </CardContent>

                        </Card>



                        {routeStats && (

                            <Card className="shadow-sm border-slate-200">

                                <CardHeader className="pb-2"><CardTitle className="text-base">Trip Summary</CardTitle></CardHeader>

                                <CardContent className="space-y-3">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100"><div className="text-xs text-blue-600 font-medium uppercase">Distance</div><div className="text-xl font-bold text-blue-900">{routeStats.distance.toFixed(1)} km</div></div>

                                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100"><div className="text-xs text-indigo-600 font-medium uppercase">Duration</div><div className="text-xl font-bold text-indigo-900">{formatDuration(routeStats.duration)}</div></div>

                                    </div>

                                </CardContent>

                            </Card>

                        )}

                    </div>

                    <div className="lg:col-span-8 h-[600px] lg:h-auto">

                        <RoutingMap source={source} destination={destination} issues={MOCK_ISSUES} avoidIssues={avoidIssues} onRouteCalculated={setRouteStats} />

                    </div>

                </div>

            </div>

            </div>

        </div>

    );

}

