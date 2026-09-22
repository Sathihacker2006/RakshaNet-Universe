import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  Radio, 
  MapPin, 
  Navigation, 
  Users, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Maximize2, 
  PhoneCall, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  RotateCw, 
  Copy, 
  Check, 
  ChevronRight,
  ExternalLink,
  Flame,
  Droplets,
  Search,
  Crosshair
} from 'lucide-react';
import { ReliefTeam, Incident } from '../types';
import { getTranslation } from '../data/translations';

interface EnrichedReliefTeam extends ReliefTeam {
  distanceKm?: number;
  etaMinutes?: number;
}

interface ReliefTeamTrackerProps {
  teams: ReliefTeam[];
  userLocation: { lat: number; lng: number } | null;
  incidents?: Incident[];
  selectedLanguage?: string;
  onSelectTeam?: (team: ReliefTeam) => void;
  heightClass?: string;
  className?: string;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

function getTeamIconEmoji(type: ReliefTeam['type']): string {
  switch (type) {
    case 'medical': return '🚑';
    case 'fire': return '🚒';
    case 'rescue': return '🚤';
    case 'surveillance': return '🚁';
    default: return '🛡️';
  }
}

function getTeamColor(type: ReliefTeam['type']): { border: string; bg: string; text: string; ring: string } {
  switch (type) {
    case 'medical':
      return { border: 'border-emerald-400', bg: 'bg-emerald-950', text: 'text-emerald-400', ring: '#10b981' };
    case 'fire':
      return { border: 'border-amber-400', bg: 'bg-amber-950', text: 'text-amber-400', ring: '#f59e0b' };
    case 'rescue':
      return { border: 'border-sky-400', bg: 'bg-sky-950', text: 'text-sky-400', ring: '#0ea5e9' };
    case 'surveillance':
      return { border: 'border-purple-400', bg: 'bg-purple-950', text: 'text-purple-400', ring: '#a855f7' };
    default:
      return { border: 'border-blue-400', bg: 'bg-blue-950', text: 'text-blue-400', ring: '#3b82f6' };
  }
}

export const ReliefTeamTracker: React.FC<ReliefTeamTrackerProps> = ({
  teams,
  userLocation,
  incidents = [],
  selectedLanguage = 'en',
  onSelectTeam,
  heightClass = 'h-[360px]',
  className = ''
}) => {
  const t = getTranslation(selectedLanguage);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const vectorLineRef = useRef<L.Polyline | null>(null);
  const hazardLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Real-time coordinates state with live telemetry drift
  const [localTeams, setLocalTeams] = useState<ReliefTeam[]>(teams);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'deployed' | 'on-mission' | 'standby'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [lastTelemetryTime, setLastTelemetryTime] = useState<Date>(new Date());
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dispatchModalTeam, setDispatchModalTeam] = useState<EnrichedReliefTeam | null>(null);
  const [dispatchSentSuccess, setDispatchSentSuccess] = useState<boolean>(false);

  // Sync when parent teams array changes
  useEffect(() => {
    setLocalTeams(teams);
  }, [teams]);

  // Simulated live telemetry movement: subtle drift for deployed / on-mission units
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setLocalTeams(prev => 
        prev.map(team => {
          if (team.status === 'standby') return team;
          // Micro-movement jitter (~5-15 meters) simulating patrol/response transit
          const deltaLat = (Math.random() - 0.5) * 0.00035;
          const deltaLng = (Math.random() - 0.5) * 0.00035;
          return {
            ...team,
            lat: Number((team.lat + deltaLat).toFixed(5)),
            lng: Number((team.lng + deltaLng).toFixed(5))
          };
        })
      );
      setLastTelemetryTime(new Date());
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Distance sorted teams relative to user
  const enrichedTeams = useMemo(() => {
    const userLat = userLocation?.lat ?? 19.076;
    const userLng = userLocation?.lng ?? 72.8777;

    return localTeams.map(t => {
      const dist = calculateDistanceKm(userLat, userLng, t.lat, t.lng);
      // Rough ETA assuming 30 km/h emergency speed through disaster corridors
      const etaMinutes = Math.max(3, Math.round((dist / 30) * 60));
      return {
        ...t,
        distanceKm: dist,
        etaMinutes
      };
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [localTeams, userLocation]);

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return enrichedTeams.filter(t => {
      if (filterStatus === 'deployed' && t.status !== 'deployed' && t.status !== 'on-mission') return false;
      if (filterStatus === 'on-mission' && t.status !== 'on-mission') return false;
      if (filterStatus === 'standby' && t.status !== 'standby') return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchEquip = t.equipment.some(e => e.toLowerCase().includes(q));
        const matchType = t.type.toLowerCase().includes(q);
        if (!matchName && !matchEquip && !matchType) return false;
      }
      return true;
    });
  }, [enrichedTeams, filterStatus, filterType, searchQuery]);

  const nearestDeployedTeam = useMemo(() => {
    return enrichedTeams.find(t => t.status === 'deployed' || t.status === 'on-mission') || enrichedTeams[0];
  }, [enrichedTeams]);

  // Selected team object
  const selectedTeam = useMemo(() => {
    return enrichedTeams.find(t => t.id === selectedTeamId) || null;
  }, [enrichedTeams, selectedTeamId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultLat = userLocation?.lat || 19.0760;
    const defaultLng = userLocation?.lng || 72.8777;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High performance dark tactical canvas
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, maxNativeZoom: 16 }
    ).addTo(map);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, maxNativeZoom: 16 }
    ).addTo(map);

    hazardLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

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

  // Update Hazard Layer
  useEffect(() => {
    const layer = hazardLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    incidents.forEach(inc => {
      const radiusMeters = (inc.impactRadiusKm || 4) * 1000;
      L.circle([inc.lat, inc.lng], {
        radius: radiusMeters,
        color: '#f43f5e',
        weight: 1.5,
        fillColor: '#f43f5e',
        fillOpacity: 0.12,
        dashArray: '5, 5'
      }).addTo(layer);
    });
  }, [incidents]);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = userLocation?.lat ?? 19.076;
    const lng = userLocation?.lng ?? 72.8777;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></span>
            <span class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xl"></span>
            <span class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-blue-950/90 border border-blue-400/80 text-white text-[9px] font-black uppercase whitespace-nowrap shadow">
              You
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 2000
      }).addTo(map);

      userMarkerRef.current.bindPopup(`
        <div class="p-2 text-slate-900 font-sans text-xs">
          <b>📍 Your Live Coordinates</b><br/>
          <code class="text-blue-700 font-mono">${lat.toFixed(4)}, ${lng.toFixed(4)}</code>
        </div>
      `);
    }
  }, [userLocation]);

  // Render & Update Relief Team Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    localTeams.forEach(team => {
      const isSelected = selectedTeamId === team.id;
      const isDeployed = team.status === 'deployed' || team.status === 'on-mission';
      const colorStyle = getTeamColor(team.type);
      const emoji = getTeamIconEmoji(team.type);

      const markerHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer transition transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          ${isDeployed ? `<span class="absolute -top-1 w-10 h-10 rounded-full animate-ping opacity-60" style="background-color: ${colorStyle.ring}"></span>` : ''}
          <div class="relative w-8 h-8 rounded-2xl ${colorStyle.bg} border-2 ${isSelected ? 'border-white ring-4 ring-sky-400' : colorStyle.border} flex items-center justify-center text-sm shadow-xl">
            ${emoji}
          </div>
          <div class="mt-1 px-1.5 py-0.5 rounded-md bg-slate-950/95 border border-slate-700/80 text-[9px] font-mono text-slate-200 font-semibold shadow-md whitespace-nowrap flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full ${isDeployed ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}"></span>
            <span>${team.lat.toFixed(3)}, ${team.lng.toFixed(3)}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-team-tracker-marker',
        html: markerHtml,
        iconSize: [44, 48],
        iconAnchor: [22, 24]
      });

      const marker = L.marker([team.lat, team.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1500 : isDeployed ? 800 : 500
      });

      const dist = userLocation 
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, team.lat, team.lng)
        : null;

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 220px; color: #0f172a; padding: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; background: ${isDeployed ? '#dcfce7' : '#f1f5f9'}; color: ${isDeployed ? '#15803d' : '#475569'}; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">
              ${team.status}
            </span>
            <span style="font-size: 11px; font-weight: bold; color: #2563eb;">
              ${dist !== null ? `${dist} km away` : 'Standby'}
            </span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${team.name}</div>
          <div style="font-size: 11px; font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; margin: 4px 0; color: #0369a1;">
            GPS: ${team.lat.toFixed(5)}, ${team.lng.toFixed(5)}
          </div>
          <div style="font-size: 11px; color: #475569;">
            <b>Responders:</b> ${team.members} Personnel (${team.type.toUpperCase()})
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            <b>Equipment:</b> ${team.equipment.join(', ')}
          </div>
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${team.lat},${team.lng}" target="_blank" rel="noreferrer" style="flex: 1; text-align: center; background: #2563eb; color: white; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">
              Navigate
            </a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        handleFocusTeam(team);
      });

      layer.addLayer(marker);
      markerMapRef.current.set(team.id, marker);
    });
  }, [localTeams, selectedTeamId, userLocation]);

  // Update Vector Polyline when team selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (vectorLineRef.current) {
      map.removeLayer(vectorLineRef.current);
      vectorLineRef.current = null;
    }

    if (!selectedTeam || !userLocation) return;

    const line = L.polyline(
      [
        [userLocation.lat, userLocation.lng],
        [selectedTeam.lat, selectedTeam.lng]
      ],
      {
        color: '#38bdf8',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.85
      }
    ).addTo(map);

    vectorLineRef.current = line;

    return () => {
      if (vectorLineRef.current) {
        map.removeLayer(vectorLineRef.current);
        vectorLineRef.current = null;
      }
    };
  }, [selectedTeam, userLocation]);

  // Focus team helper
  const handleFocusTeam = (team: ReliefTeam) => {
    setSelectedTeamId(team.id);
    if (onSelectTeam) onSelectTeam(team);

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([team.lat, team.lng], 14, { duration: 1.2 });
      const marker = markerMapRef.current.get(team.id);
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 1200);
      }
    }
  };

  // Center all teams
  const handleCenterAllTeams = () => {
    const map = mapInstanceRef.current;
    if (!map || localTeams.length === 0) return;

    const points: [number, number][] = localTeams.map(t => [t.lat, t.lng]);
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  };

  // Manual Satellite Ping
  const handleTriggerPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setLastTelemetryTime(new Date());
      setIsPinging(false);
    }, 700);
  };

  const handleCopyCoords = (id: string, lat: number, lng: number) => {
    const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenDispatchModal = (team: EnrichedReliefTeam) => {
    setDispatchModalTeam(team);
    setDispatchSentSuccess(false);
  };

  const handleConfirmDispatch = () => {
    setDispatchSentSuccess(true);
    setTimeout(() => {
      setDispatchModalTeam(null);
      setDispatchSentSuccess(false);
    }, 2400);
  };

  const deployedCount = localTeams.filter(t => t.status === 'deployed' || t.status === 'on-mission').length;
  const standbyCount = localTeams.filter(t => t.status === 'standby').length;
  const totalResponders = localTeams.reduce((sum, t) => sum + t.members, 0);

  return (
    <div className={`space-y-4 ${className}`} id="relief-team-tracker">
      {/* Header Banner & Real-Time Status HUD */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-700/60 relative">
              <Truck className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">Relief Team Tracker</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase border border-indigo-500/30">
                  Live GPS
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>Streaming IRNSS/GPS Telemetry</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">{lastTelemetryTime.toLocaleTimeString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTriggerPing}
              disabled={isPinging}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Recalibrate GPS Ping"
            >
              <RotateCw className={`w-3.5 h-3.5 text-sky-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Ping GPS</span>
            </button>

            <button
              onClick={handleCenterAllTeams}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Fit All Teams in View"
            >
              <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
              <span>Center All</span>
            </button>
          </div>
        </div>

        {/* Tactical Counters Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Deployed</span>
            <div className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{deployedCount} Units</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Personnel</span>
            <div className="text-base font-black text-sky-400">
              {totalResponders} Crew
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Standby Depot</span>
            <div className="text-base font-black text-slate-300">
              {standbyCount} Units
            </div>
          </div>
        </div>
      </div>

      {/* Nearest Deployed Team Alert Card */}
      {nearestDeployedTeam && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/80 via-indigo-950/60 to-slate-900 border border-sky-600/40 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-900/80 border border-sky-400 flex items-center justify-center text-lg shrink-0">
              {getTeamIconEmoji(nearestDeployedTeam.type)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/30">
                  Closest Unit
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-xs">
                  {nearestDeployedTeam.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5 font-mono">
                <span className="text-sky-300 font-bold">📍 {nearestDeployedTeam.distanceKm} km</span>
                <span>•</span>
                <span className="text-emerald-400">ETA ~{nearestDeployedTeam.etaMinutes}m</span>
                <span>•</span>
                <span className="text-slate-400">{nearestDeployedTeam.lat.toFixed(4)}, {nearestDeployedTeam.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleFocusTeam(nearestDeployedTeam)}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition flex items-center gap-1 cursor-pointer"
          >
            <span>Track</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Map Visualizer */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

        {/* Selected Team Map HUD Overlay */}
        {selectedTeam && (
          <div className="absolute top-3 left-3 right-3 z-10 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700 shadow-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-xl shrink-0">{getTeamIconEmoji(selectedTeam.type)}</span>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">{selectedTeam.name}</h4>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                  <span className="text-sky-400 font-bold">{selectedTeam.distanceKm} km away</span>
                  <span>•</span>
                  <span>{selectedTeam.lat.toFixed(5)}, {selectedTeam.lng.toFixed(5)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleOpenDispatchModal(selectedTeam)}
                className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Radio className="w-3 h-3" />
                <span>Request</span>
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTeam.lat},${selectedTeam.lng}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Navigate in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Map Legend Floating Pill */}
        <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2.5 shadow-md">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>You</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Medical</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Rescue</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Fire</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Drone</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teams by name, boat, ambulance, drones..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All (${localTeams.length})` },
            { id: 'deployed', label: `Deployed (${deployedCount})` },
            { id: 'on-mission', label: 'On-Mission' },
            { id: 'standby', label: `Standby (${standbyCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Specialization Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Specializations' },
            { id: 'rescue', label: '🚤 Quick Rescue' },
            { id: 'medical', label: '🚑 Medical Care' },
            { id: 'fire', label: '🚒 Fire & Hazmat' },
            { id: 'surveillance', label: '🚁 Drone Recon' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                filterType === type.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deployed Teams Coordinate Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Active Relief Units ({filteredTeams.length})</span>
          <span className="text-[11px] text-slate-500 font-normal">Sorted by distance</span>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            No relief teams match the selected filter or search query.
          </div>
        ) : (
          filteredTeams.map(team => {
            const isSelected = selectedTeamId === team.id;
            const isDeployed = team.status === 'deployed' || team.status === 'on-mission';
            const color = getTeamColor(team.type);
            const emoji = getTeamIconEmoji(team.type);

            return (
              <div
                key={team.id}
                onClick={() => handleFocusTeam(team)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-slate-900/90 shadow-lg'
                    : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${color.bg} border ${color.border} flex items-center justify-center text-lg shrink-0 mt-0.5`}>
                      {emoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-white">{team.name}</h4>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            team.status === 'deployed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : team.status === 'on-mission'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {team.status}
                        </span>
                      </div>

                      {/* Coordinates Monospace Display */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-[11px] font-mono text-sky-300">
                          <Compass className="w-3 h-3 text-sky-400" />
                          <span>{team.lat.toFixed(5)}° N, {team.lng.toFixed(5)}° E</span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleCopyCoords(team.id, team.lat, team.lng);
                            }}
                            className="ml-1 text-slate-400 hover:text-white p-0.5"
                            title="Copy Coordinates"
                          >
                            {copiedId === team.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {team.distanceKm !== undefined && (
                          <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                            <span>📍 {team.distanceKm} km</span>
                            <span className="text-slate-500 font-normal">({team.etaMinutes}m ETA)</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>👥 <strong>{team.members}</strong> Responders</span>
                        <span>•</span>
                        <span className="capitalize">{team.type} Unit</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleFocusTeam(team);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Locate</span>
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenDispatchModal(team);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Dispatch</span>
                    </button>
                  </div>
                </div>

                {/* Equipment Tags */}
                <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-slate-800/80">
                  {team.equipment.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800/80"
                    >
                      {item}
                    </span>
                  ))}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${team.lat},${team.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-800/80 text-blue-300 hover:text-white flex items-center gap-1 ml-auto font-medium"
                  >
                    <span>Google Maps Directions</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch Assistance Modal */}
      {dispatchModalTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <Radio className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-white text-sm">Emergency Dispatch Request</h3>
              </div>
              <button
                onClick={() => setDispatchModalTeam(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {dispatchSentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-white">Dispatch Alert Transmitted!</h4>
                <p className="text-xs text-emerald-200">
                  Unit <strong>{dispatchModalTeam.name}</strong> has received your emergency coordinates ({userLocation?.lat.toFixed(4)}, {userLocation?.lng.toFixed(4)}). Standby on VHF Channel 16.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Unit:</span>
                    <strong className="text-white">{dispatchModalTeam.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Unit Coordinates:</span>
                    <span className="font-mono text-sky-400">{dispatchModalTeam.lat.toFixed(4)}, {dispatchModalTeam.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Your Current GPS:</span>
                    <span className="font-mono text-emerald-400">
                      {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : '19.0760, 72.8777 (Estimated)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Distance:</span>
                    <strong className="text-white">{dispatchModalTeam.distanceKm ?? '2.1'} km (~{dispatchModalTeam.etaMinutes ?? '6'} mins)</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Tactical Frequency:</span>
                    <span className="font-mono text-amber-300">VHF 156.800 MHz (Ch 16)</span>
                  </div>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Sending this dispatch broadcasts your coordinates directly into NDRF / Incident Command telemetry with priority life-safety routing.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setDispatchModalTeam(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDispatch}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/40 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Send Dispatch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
