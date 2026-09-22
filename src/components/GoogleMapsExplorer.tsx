import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Search, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Layers, 
  Compass, 
  Home, 
  Clock, 
  ShieldAlert, 
  Building2, 
  PhoneCall, 
  CheckCircle2,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Shelter } from '../types';
import { getTranslation } from '../data/translations';

interface GoogleMapsExplorerProps {
  shelters: Shelter[];
  userLocation: { lat: number; lng: number } | null;
  selectedLanguage?: string;
  heightClass?: string;
  onSelectShelter?: (shelter: Shelter) => void;
}

// High-reliability public map tile layers that do not require any API keys and never get blocked
const TILE_CONFIGS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, USGS, NOAA',
    maxZoom: 18
  },
  roadmap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    maxZoom: 17
  }
};

// Popular Preset Locations for quick one-tap exploration
const POPULAR_AREAS = [
  { name: 'Dadar, Mumbai', lat: 19.0178, lng: 72.8478 },
  { name: 'Andheri West', lat: 19.1136, lng: 72.8697 },
  { name: 'Kurla Mithi Basin', lat: 19.0726, lng: 72.8845 },
  { name: 'Bandra Kurla Complex (BKC)', lat: 19.0657, lng: 72.8687 },
  { name: 'Colaba / Gateway', lat: 18.9067, lng: 72.8147 },
  { name: 'Powai Hiranandani', lat: 19.1176, lng: 72.9060 },
  { name: 'Thane West', lat: 19.2183, lng: 72.9781 }
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const GoogleMapsExplorer: React.FC<GoogleMapsExplorerProps> = ({
  shelters,
  userLocation,
  selectedLanguage = 'en',
  heightClass = 'h-[460px]',
  onSelectShelter
}) => {
  const t = getTranslation(selectedLanguage);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineLayerRef = useRef<L.Polyline | null>(null);

  // States
  const [searchQuery, setSearchQuery] = useState<string>('Dadar, Mumbai');
  const [activeAreaName, setActiveAreaName] = useState<string>('Dadar, Mumbai');
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.0178,
    lng: 72.8478
  });
  const [nearestShelter, setNearestShelter] = useState<{
    shelter: Shelter;
    distanceKm: number;
    drivingMins: number;
    walkingMins: number;
  } | null>(null);

  // Layer state: 'satellite' | 'roadmap' | 'terrain'
  const [mapLayerType, setMapLayerType] = useState<'satellite' | 'roadmap' | 'terrain'>('satellite');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Find nearest shelter whenever coordinates change
  useEffect(() => {
    if (shelters.length === 0) return;
    const openShelters = shelters.filter(s => s.status === 'open');
    const candidates = openShelters.length > 0 ? openShelters : shelters;

    let closest: Shelter | null = null;
    let minDistance = Infinity;

    candidates.forEach(s => {
      const dist = calculateDistanceKm(activeCoords.lat, activeCoords.lng, s.lat, s.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = s;
      }
    });

    if (closest) {
      const drivingMins = Math.max(3, Math.round(minDistance * 2.8));
      const walkingMins = Math.max(8, Math.round(minDistance * 13));
      setNearestShelter({
        shelter: closest,
        distanceKm: minDistance,
        drivingMins,
        walkingMins
      });
    }
  }, [activeCoords, shelters]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)?._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    // Remove old instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [activeCoords.lat, activeCoords.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default to high-resolution Satellite Imagery (no API key needed)
    const initialConfig = TILE_CONFIGS[mapLayerType] || TILE_CONFIGS.satellite;
    const initialTiles = L.tileLayer(initialConfig.url, {
      maxZoom: initialConfig.maxZoom,
      attribution: initialConfig.attribution
    }).addTo(map);
    tileLayerRef.current = initialTiles;

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Force map to recognize container size immediately
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Watch container size changes so map never goes blank or hidden
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer Type
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const config = TILE_CONFIGS[mapLayerType] || TILE_CONFIGS.satellite;
    const newTiles = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      attribution: config.attribution
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  }, [mapLayerType]);

  // Update Markers & Route
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    if (routeLineLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLineLayerRef.current);
      routeLineLayerRef.current = null;
    }

    // 1. Target Searched Location Marker (Google Red Pin)
    const pinHtml = `
      <div class="relative flex items-center justify-center animate-bounce">
        <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
          📍
        </div>
      </div>
    `;
    const searchPinIcon = L.divIcon({
      className: 'google-search-pin',
      html: pinHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const searchMarker = L.marker([activeCoords.lat, activeCoords.lng], { icon: searchPinIcon });
    searchMarker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 200px; padding: 4px; color: #0f172a;">
        <span style="font-size: 10px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 9999px;">
          SEARCHED TARGET
        </span>
        <div style="font-size: 14px; font-weight: bold; margin-top: 4px; color: #0f172a;">${activeAreaName}</div>
        <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 2px;">
          ${activeCoords.lat.toFixed(4)}° N, ${activeCoords.lng.toFixed(4)}° E
        </div>
      </div>
    `).openPopup();

    markersLayerRef.current.addLayer(searchMarker);

    // 2. Nearest Safe Shelter Marker
    if (nearestShelter) {
      const s = nearestShelter.shelter;
      const shelterHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-2xl bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-sm font-black">
            🏠
          </div>
          <span class="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white text-emerald-700 shadow">
            SAFE
          </span>
        </div>
      `;

      const shelterIcon = L.divIcon({
        className: 'google-shelter-pin',
        html: shelterHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const shelterMarker = L.marker([s.lat, s.lng], { icon: shelterIcon });
      shelterMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 220px; padding: 4px; color: #0f172a;">
          <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">
            Nearest Open Safe Haven (${nearestShelter.distanceKm} km away)
          </div>
          <div style="font-size: 14px; font-weight: bold; margin-top: 2px; color: #0f172a;">${s.name}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            <b>Capacity:</b> ${s.capacity - s.occupied} beds available
          </div>
          <div style="font-size: 11px; color: #475569;">
            <b>Drive time:</b> ~${nearestShelter.drivingMins} mins | <b>Walk:</b> ~${nearestShelter.walkingMins} mins
          </div>
          <div style="margin-top: 8px;">
            <a href="https://www.google.com/maps/dir/?api=1&origin=${activeCoords.lat},${activeCoords.lng}&destination=${s.lat},${s.lng}" target="_blank" rel="noreferrer" style="display: block; text-align: center; background: #2563eb; color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none;">
              Open Google Maps Turn-by-Turn Route
            </a>
          </div>
        </div>
      `);

      markersLayerRef.current.addLayer(shelterMarker);

      // Route dashed line connecting searched spot to shelter
      const routeLine = L.polyline(
        [
          [activeCoords.lat, activeCoords.lng],
          [s.lat, s.lng]
        ],
        {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8'
        }
      ).addTo(mapInstanceRef.current);

      routeLineLayerRef.current = routeLine;

      // Fit bounds to show both search point and shelter
      const bounds = L.latLngBounds([
        [activeCoords.lat, activeCoords.lng],
        [s.lat, s.lng]
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [activeCoords, nearestShelter, mapLayerType]);

  // Execute Area Search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const query = searchQuery.trim().toLowerCase();

    // Check popular presets first
    const matchedPreset = POPULAR_AREAS.find(p => p.name.toLowerCase().includes(query));
    if (matchedPreset) {
      setActiveAreaName(matchedPreset.name);
      setActiveCoords({ lat: matchedPreset.lat, lng: matchedPreset.lng });
      setIsSearching(false);
      return;
    }

    // Check shelter names
    const matchedShelter = shelters.find(s => s.name.toLowerCase().includes(query));
    if (matchedShelter) {
      setActiveAreaName(matchedShelter.name);
      setActiveCoords({ lat: matchedShelter.lat, lng: matchedShelter.lng });
      setIsSearching(false);
      return;
    }

    // Fallback: Geocode via OpenStreetMap Nominatim for Indian & global areas
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setActiveAreaName(data[0].display_name.split(',')[0] || searchQuery);
          setActiveCoords({ lat, lng });
        } else {
          // If no result, fallback to Dadar
          setActiveAreaName(searchQuery);
        }
      })
      .catch(() => {
        setActiveAreaName(searchQuery);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  const handleSelectPreset = (area: typeof POPULAR_AREAS[0]) => {
    setSearchQuery(area.name);
    setActiveAreaName(area.name);
    setActiveCoords({ lat: area.lat, lng: area.lng });
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-xl space-y-3 p-4">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Compass className="w-5 h-5 text-blue-400" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>{t.googleMap.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono uppercase">
                  Google Maps
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.mapTabs.googleMapDesc || 'Search any address, locate nearest safe shelter & open turn-by-turn navigation'}
              </p>
            </div>
          </div>
        </div>

        {/* Layer Mode Selector */}
        <div className="flex items-center self-end sm:self-auto rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setMapLayerType('satellite')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              mapLayerType === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapLayerType('roadmap')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              mapLayerType === 'roadmap' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setMapLayerType('terrain')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              mapLayerType === 'terrain' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.googleMap.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shadow-md"
        >
          {isSearching ? <span className="animate-spin">⏳</span> : <Search className="w-3.5 h-3.5" />}
          <span>{t.googleMap.findNearestShelter}</span>
        </button>
      </form>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
        <span className="text-slate-500 font-bold uppercase text-[9px] shrink-0 mr-1">
          {t.googleMap.quickAreas}:
        </span>
        {POPULAR_AREAS.map(area => (
          <button
            key={area.name}
            type="button"
            onClick={() => handleSelectPreset(area)}
            className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition border ${
              activeAreaName === area.name
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            📍 {area.name}
          </button>
        ))}
      </div>

      {/* Nearest Shelter Intelligence Banner */}
      {nearestShelter && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.googleMap.nearestShelterFound}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-bold font-mono">
                {nearestShelter.distanceKm} km {t.googleMap.distanceAway}
              </span>
            </div>
            <div className="font-extrabold text-sm sm:text-base text-white">
              {nearestShelter.shelter.name}
            </div>
            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
              <span>🚗 ~{nearestShelter.drivingMins} mins drive</span>
              <span>•</span>
              <span>🚶 ~{nearestShelter.walkingMins} mins walk</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {nearestShelter.shelter.capacity - nearestShelter.shelter.occupied} beds available
              </span>
            </div>
          </div>

          {/* Quick Actions on Google Maps */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${activeCoords.lat},${activeCoords.lng}&destination=${nearestShelter.shelter.lat},${nearestShelter.shelter.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.googleMap.getDirections}</span>
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activeCoords.lat},${activeCoords.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.googleMap.openInGoogleMaps}</span>
            </a>
          </div>
        </div>
      )}

      {/* Map Display: Interactive Area Exploration Canvas (No API Key Required) */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <div ref={mapContainerRef} className={`w-full ${heightClass} relative z-0`} />
      </div>

      {/* Google Maps Nearby Emergency Services Quick Search Bar */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Google Maps Search for {activeAreaName}:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(activeAreaName)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-semibold text-[11px] flex items-center gap-1 transition"
          >
            <span>🏥 {t.googleMap.findNearbyHospitals || 'Hospitals'}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
          <a
            href={`https://www.google.com/maps/search/police+stations+near+${encodeURIComponent(activeAreaName)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-blue-400 font-semibold text-[11px] flex items-center gap-1 transition"
          >
            <span>👮 {t.googleMap.findNearbyPolice || 'Police'}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
          <a
            href={`https://www.google.com/maps/search/fire+stations+near+${encodeURIComponent(activeAreaName)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-400 font-semibold text-[11px] flex items-center gap-1 transition"
          >
            <span>🚒 {t.googleMap.findNearbyFire || 'Fire Stations'}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
};
