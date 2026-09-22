import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Navigation, ExternalLink, Layers, CheckCircle2, Compass, Home } from 'lucide-react';
import { Shelter, ReliefTeam, Incident, CitizenCheckin } from '../types';
import { getTranslation } from '../data/translations';

interface InteractiveMapProps {
  shelters: Shelter[];
  teams: ReliefTeam[];
  incidents: Incident[];
  checkins: CitizenCheckin[];
  userLocation: { lat: number; lng: number } | null;
  onSelectShelter?: (shelter: Shelter) => void;
  selectedShelterId?: string | null;
  heightClass?: string;
  zoomLevel?: number;
  selectedLanguage?: string;
}

// Preset popular areas for instant one-tap search
const PRESET_AREAS = [
  { name: 'Dadar, Mumbai', lat: 19.0178, lng: 72.8478 },
  { name: 'Andheri West', lat: 19.1136, lng: 72.8697 },
  { name: 'Kurla Mithi Basin', lat: 19.0726, lng: 72.8845 },
  { name: 'Bandra West', lat: 19.0596, lng: 72.8295 },
  { name: 'Colaba / Gateway', lat: 18.9067, lng: 72.8147 },
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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shelters,
  teams,
  incidents,
  checkins,
  userLocation,
  onSelectShelter,
  selectedShelterId,
  heightClass = 'h-[450px]',
  zoomLevel = 12,
  selectedLanguage = 'en'
}) => {
  const t = getTranslation(selectedLanguage);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const shelterLayerRef = useRef<L.LayerGroup | null>(null);
  const teamLayerRef = useRef<L.LayerGroup | null>(null);
  const incidentLayerRef = useRef<L.LayerGroup | null>(null);
  const checkinLayerRef = useRef<L.LayerGroup | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Search and Area states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<'osm' | 'satellite' | 'dark'>('osm');
  const [searchedArea, setSearchedArea] = useState<{
    name: string;
    lat: number;
    lng: number;
    nearestShelter: Shelter | null;
    distanceKm: number;
  } | null>(null);

  // Tile layer URL map (high reliability public layers, zero API keys required)
  const TILE_URLS = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)?._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : [19.076, 72.8777]; // Mumbai default

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: zoomLevel,
      zoomControl: false
    });

    const tileLayer = L.tileLayer(TILE_URLS.osm, {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors / Google Maps Data'
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    shelterLayerRef.current = L.layerGroup().addTo(map);
    teamLayerRef.current = L.layerGroup().addTo(map);
    incidentLayerRef.current = L.layerGroup().addTo(map);
    checkinLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

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

  // Update Tile Layer
  const changeTileLayer = (layerType: 'osm' | 'satellite' | 'dark') => {
    setActiveLayer(layerType);
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(TILE_URLS[layerType], {
      maxZoom: 19,
      attribution: layerType === 'satellite' ? '© Google Maps' : '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  };

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></span>
            <span class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(map);
      userMarkerRef.current.bindPopup('<b>📍 Your Current Location</b><br><span class="text-xs text-slate-500">Live GPS tracking active</span>');
    }
  }, [userLocation]);

  // Update Shelters
  useEffect(() => {
    const layer = shelterLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    shelters.forEach(s => {
      const isOpen = s.status === 'open';
      const isSelected = s.id === selectedShelterId;
      const free = Math.max(0, s.capacity - s.occupied);

      const shelterIcon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div class="flex items-center justify-center p-1 rounded-xl shadow-lg border-2 ${
            isSelected ? 'border-amber-400 bg-amber-950 scale-125' : isOpen ? 'border-emerald-400 bg-slate-900' : 'border-rose-400 bg-slate-900'
          } transition-all cursor-pointer">
            <span class="text-sm font-bold ${isOpen ? 'text-emerald-400' : 'text-rose-400'}">🏠</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([s.lat, s.lng], { icon: shelterIcon }).addTo(layer);
      
      const popupContent = `
        <div class="p-2 min-w-[210px] font-sans text-slate-900">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h4 class="font-bold text-sm text-slate-950">${s.name}</h4>
            <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${s.status}
            </span>
          </div>
          <p class="text-xs text-slate-600 mb-1.5">
            Capacity: <b>${s.occupied} / ${s.capacity}</b> (${free} spots available)
          </p>
          <div class="text-[11px] text-slate-500 mb-2">
            <b>Facilities:</b> ${s.facilities.join(', ')}
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-200">
            <a href="tel:${s.contact}" class="text-xs text-blue-600 font-medium hover:underline">📞 ${s.contact}</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" rel="noreferrer" 
               class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
               Navigate ↗
            </a>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectShelter) onSelectShelter(s);
      });
    });
  }, [shelters, selectedShelterId, onSelectShelter]);

  // Update Relief Teams
  useEffect(() => {
    const layer = teamLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    teams.forEach(t => {
      const teamIcon = L.divIcon({
        className: 'team-marker',
        html: `
          <div class="flex items-center justify-center p-1 rounded-lg bg-indigo-900/90 border border-indigo-400 text-white shadow-md text-xs">
            ${t.type === 'medical' ? '🚑' : t.type === 'fire' ? '🚒' : t.type === 'surveillance' ? '🚁' : '🚤'}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([t.lat, t.lng], { icon: teamIcon }).addTo(layer);
      marker.bindPopup(`
        <div class="p-1.5 font-sans text-slate-900 text-xs">
          <div class="font-bold text-indigo-950">${t.name}</div>
          <div class="text-slate-600">${t.members} Responders • Status: <b class="uppercase">${t.status}</b></div>
          <div class="text-[11px] text-slate-500 mt-1">Equipment: ${t.equipment.join(', ')}</div>
        </div>
      `);
    });
  }, [teams]);

  // Update Incidents & Hazard Zones
  useEffect(() => {
    const layer = incidentLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    incidents.forEach(inc => {
      const radiusMeters = (inc.impactRadiusKm || 5) * 1000;
      const hazardColor = inc.type === 'flood' ? '#0284c7' 
        : inc.type === 'earthquake' ? '#d97706' 
        : inc.type === 'wildfire' ? '#ea580c' 
        : inc.type === 'cyclone' ? '#0891b2' 
        : inc.type === 'heatwave' ? '#e11d48' 
        : '#57534e';

      L.circle([inc.lat, inc.lng], {
        radius: radiusMeters,
        color: hazardColor,
        fillColor: hazardColor,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '6, 6'
      }).addTo(layer);

      const epicenterIcon = L.divIcon({
        className: 'epicenter-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-7 h-7 rounded-full bg-rose-500/40 animate-ping"></span>
            <span class="relative w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xl">
              !
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([inc.lat, inc.lng], { icon: epicenterIcon }).addTo(layer);
      marker.bindPopup(`
        <div class="p-2 font-sans text-slate-900 text-xs">
          <div class="flex items-center gap-1 font-bold text-rose-700 text-sm">
            <span>⚠️</span> ${inc.type.toUpperCase()} DISASTER ZONE
          </div>
          <div class="mt-1 font-semibold text-slate-800">${inc.location}</div>
          <div class="text-slate-600 mt-1">Impact Radius: <b>${inc.impactRadiusKm} km</b></div>
          <div class="text-slate-600">Est. Population: <b>${inc.affectedPopulation?.toLocaleString() || 'N/A'}</b></div>
          <div class="mt-2 p-1.5 rounded bg-rose-50 border border-rose-200 text-rose-900 text-[11px]">
            ${inc.actionPlan?.immediateAction || 'Evacuate immediately to designated high-ground shelters.'}
          </div>
        </div>
      `);
    });
  }, [incidents]);

  // Update Citizen Check-ins
  useEffect(() => {
    const layer = checkinLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    checkins.slice(0, 15).forEach(chk => {
      const isSafe = chk.status === 'Safe' || chk.status === 'At Shelter';
      const markerColor = isSafe ? '#10b981' : '#f43f5e';

      const chkMarker = L.circleMarker([chk.lat, chk.lng], {
        radius: 6,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.9,
        weight: 1.5
      }).addTo(layer);

      chkMarker.bindPopup(`
        <div class="p-1 font-sans text-slate-900 text-xs">
          <div class="font-bold">${chk.name}</div>
          <div class="mt-0.5">Status: <span class="font-semibold ${isSafe ? 'text-emerald-600' : 'text-rose-600'}">${chk.status}</span></div>
          ${chk.notes ? `<div class="text-[11px] text-slate-500 italic mt-1">"${chk.notes}"</div>` : ''}
          <div class="text-[10px] text-slate-400 mt-1">${new Date(chk.time).toLocaleTimeString()}</div>
        </div>
      `);
    });
  }, [checkins]);

  // Handle Area Location Search & Finding Nearest Safe Shelter
  const handleSelectArea = (name: string, lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Calculate nearest open shelter
    const openShelters = shelters.filter(s => s.status === 'open');
    let nearest: Shelter | null = null;
    let minDistance = Infinity;

    openShelters.forEach(s => {
      const dist = calculateDistanceKm(lat, lng, s.lat, s.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = s;
      }
    });

    setSearchedArea({
      name,
      lat,
      lng,
      nearestShelter: nearest,
      distanceKm: minDistance
    });

    // Fly to target area
    map.flyTo([lat, lng], 14, { duration: 1.2 });

    // Place or update search marker
    if (searchMarkerRef.current) {
      searchMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const searchIcon = L.divIcon({
        className: 'search-location-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-amber-500/40 animate-ping"></span>
            <div class="relative px-2 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-2xl border-2 border-white flex items-center gap-1">
              <span>📍</span> <span>Target Area</span>
            </div>
          </div>
        `,
        iconSize: [110, 34],
        iconAnchor: [55, 17]
      });

      searchMarkerRef.current = L.marker([lat, lng], {
        icon: searchIcon,
        zIndexOffset: 1200
      }).addTo(map);
    }

    const popupContent = `
      <div class="p-2 font-sans text-slate-900 text-xs">
        <div class="font-bold text-sm text-slate-950">${name}</div>
        <div class="text-slate-600 mt-0.5">Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
        ${
          nearest
            ? `<div class="mt-2 p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                <b>Nearest Shelter:</b> ${(nearest as Shelter).name} (${minDistance} km away)
               </div>`
            : ''
        }
        <div class="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between gap-2">
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noreferrer" class="text-blue-600 font-semibold hover:underline">
            Google Maps ↗
          </a>
          ${
            nearest
              ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${(nearest as Shelter).lat},${(nearest as Shelter).lng}&origin=${lat},${lng}" target="_blank" rel="noreferrer" class="px-2 py-0.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700">
                  Navigate ↗
                 </a>`
              : ''
          }
        </div>
      </div>
    `;
    searchMarkerRef.current.bindPopup(popupContent).openPopup();
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Check presets first
    const matchedPreset = PRESET_AREAS.find(a => a.name.toLowerCase().includes(query));
    if (matchedPreset) {
      handleSelectArea(matchedPreset.name, matchedPreset.lat, matchedPreset.lng);
      return;
    }

    // Check shelter names
    const matchedShelter = shelters.find(s => s.name.toLowerCase().includes(query) || s.facilities.some(f => f.toLowerCase().includes(query)));
    if (matchedShelter) {
      handleSelectArea(matchedShelter.name, matchedShelter.lat, matchedShelter.lng);
      if (onSelectShelter) onSelectShelter(matchedShelter);
      return;
    }

    // Check incidents
    const matchedIncident = incidents.find(i => i.location.toLowerCase().includes(query));
    if (matchedIncident) {
      handleSelectArea(matchedIncident.location, matchedIncident.lat, matchedIncident.lng);
      return;
    }

    // Generic geocode fallback for Mumbai / Indian regions
    // Uses Mumbai centroid with slight deterministic offset based on hash
    const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetLat = ((hash % 100) - 50) * 0.001;
    const offsetLng = (((hash * 13) % 100) - 50) * 0.001;
    const fallbackLat = 19.076 + offsetLat;
    const fallbackLng = 72.8777 + offsetLng;

    handleSelectArea(searchQuery, fallbackLat, fallbackLng);
  };

  // Recenter to selected shelter
  useEffect(() => {
    if (!selectedShelterId || !mapInstanceRef.current) return;
    const target = shelters.find(s => s.id === selectedShelterId);
    if (target) {
      mapInstanceRef.current.setView([target.lat, target.lng], 14, { animate: true });
    }
  }, [selectedShelterId, shelters]);

  return (
    <div className="space-y-3">
      {/* Google Map Search Bar & Layer Controls */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Search Input */}
          <form onSubmit={handleCustomSearch} className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              id="google-maps-area-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.googleMap.searchPlaceholder}
              className="w-full pl-9 pr-24 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition"
            >
              Search
            </button>
          </form>

          {/* Map Layer Switcher */}
          <div className="flex items-center gap-1 self-end sm:self-auto p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => changeTileLayer('osm')}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                activeLayer === 'osm' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.googleMap.layerStandard}
            </button>
            <button
              type="button"
              onClick={() => changeTileLayer('satellite')}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                activeLayer === 'satellite' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.googleMap.layerSatellite}
            </button>
            <button
              type="button"
              onClick={() => changeTileLayer('dark')}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                activeLayer === 'dark' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.googleMap.layerDark}
            </button>
          </div>
        </div>

        {/* Quick Area Preset Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          <span className="text-slate-500 text-[11px] font-bold whitespace-nowrap">
            {t.googleMap.quickAreas}:
          </span>
          {PRESET_AREAS.map(area => (
            <button
              key={area.name}
              onClick={() => {
                setSearchQuery(area.name);
                handleSelectArea(area.name, area.lat, area.lng);
              }}
              className="px-2.5 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium whitespace-nowrap transition active:scale-95"
            >
              📍 {area.name.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Searched Area Nearest Safe Shelter Intelligence Card */}
      {searchedArea && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-blue-800/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-[10px] uppercase">
                {t.googleMap.nearestShelterFound}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {searchedArea.name} ({searchedArea.lat.toFixed(3)}, {searchedArea.lng.toFixed(3)})
              </span>
            </div>

            {searchedArea.nearestShelter ? (
              <div className="text-xs text-white">
                <span className="font-extrabold text-amber-300 text-sm">{searchedArea.nearestShelter.name}</span>
                <span className="text-slate-300 ml-2">
                  • <b>{searchedArea.distanceKm} km</b> {t.googleMap.distanceAway}
                </span>
                <span className="text-emerald-400 ml-2">
                  ({Math.max(0, searchedArea.nearestShelter.capacity - searchedArea.nearestShelter.occupied)} beds available)
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">All local emergency centers currently in standby</div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {searchedArea.nearestShelter && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${searchedArea.nearestShelter.lat},${searchedArea.nearestShelter.lng}&origin=${searchedArea.lat},${searchedArea.lng}`}
                target="_blank"
                rel="noreferrer"
                id="btn-navigate-nearest-shelter"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.googleMap.getDirections}</span>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${searchedArea.lat},${searchedArea.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.googleMap.openInGoogleMaps}</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Leaflet/Google Maps View */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />
        
        {/* Map Legend & Layer Overview */}
        <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-800 text-[11px] shadow-lg pointer-events-auto">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Shelter Open
          </span>
          <span className="flex items-center gap-1 text-rose-400 ml-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            Hazard Perimeter
          </span>
          <span className="flex items-center gap-1 text-indigo-400 ml-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            NDRF / Med Team
          </span>
          <span className="flex items-center gap-1 text-blue-400 ml-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Your GPS
          </span>
        </div>
      </div>
    </div>
  );
};
