import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  Compass, 
  Home, 
  Truck, 
  AlertTriangle, 
  Users, 
  Radio, 
  Maximize2,
  Navigation,
  Activity
} from 'lucide-react';
import { Shelter, ReliefTeam, Incident, CitizenCheckin } from '../types';
import { getTranslation } from '../data/translations';

interface LiveIncidentMapProps {
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

export const LiveIncidentMap: React.FC<LiveIncidentMapProps> = ({
  shelters,
  teams,
  incidents,
  checkins,
  userLocation,
  onSelectShelter,
  selectedShelterId,
  heightClass = 'h-[500px]',
  zoomLevel = 12,
  selectedLanguage = 'en'
}) => {
  const t = getTranslation(selectedLanguage);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups for granular tactical toggling
  const hazardLayerRef = useRef<L.LayerGroup | null>(null);
  const shelterLayerRef = useRef<L.LayerGroup | null>(null);
  const teamLayerRef = useRef<L.LayerGroup | null>(null);
  const checkinLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocLayerRef = useRef<L.LayerGroup | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);

  // Tactical Controls State
  const [mapTheme, setMapTheme] = useState<'dark' | 'satellite' | 'standard' | 'topo'>('dark');
  const [showHazards, setShowHazards] = useState<boolean>(true);
  const [showTeams, setShowTeams] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showCheckins, setShowCheckins] = useState<boolean>(true);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({ lat: 19.0760, lng: 72.8777 });
  const [currentZoom, setCurrentZoom] = useState<number>(zoomLevel);

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

    const defaultLat = userLocation?.lat || (incidents[0]?.lat) || 19.0760;
    const defaultLng = userLocation?.lng || (incidents[0]?.lng) || 72.8777;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: zoomLevel,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 100% Free Esri World Dark Gray Canvas (zero API key required, zero watermarks)
    const darkTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, maxNativeZoom: 16, attribution: 'Tiles © Esri' }
    ).addTo(map);
    tileLayerRef.current = darkTiles;

    const darkLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, maxNativeZoom: 16, pane: 'overlayPane' }
    ).addTo(map);
    labelLayerRef.current = darkLabels;

    // Create Layer Groups
    hazardLayerRef.current = L.layerGroup().addTo(map);
    shelterLayerRef.current = L.layerGroup().addTo(map);
    teamLayerRef.current = L.layerGroup().addTo(map);
    checkinLayerRef.current = L.layerGroup().addTo(map);
    userLocLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    map.on('move', () => {
      const center = map.getCenter();
      setActiveCoords({ lat: center.lat, lng: center.lng });
      setCurrentZoom(map.getZoom());
    });

    // Invalidate size on initial mount
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Watch container size changes so map canvas is always visible
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
      if (labelLayerRef.current) {
        map.removeLayer(labelLayerRef.current);
        labelLayerRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer Theme
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      mapInstanceRef.current.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    if (mapTheme === 'dark') {
      const darkBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 16, attribution: 'Tiles © Esri' }
      ).addTo(mapInstanceRef.current);
      tileLayerRef.current = darkBase;

      const darkLabels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 16, pane: 'overlayPane' }
      ).addTo(mapInstanceRef.current);
      labelLayerRef.current = darkLabels;
    } else if (mapTheme === 'satellite') {
      const satTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 18, attribution: 'Tiles © Esri, USGS, NOAA' }
      ).addTo(mapInstanceRef.current);
      tileLayerRef.current = satTiles;
    } else if (mapTheme === 'standard') {
      const osmTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
      ).addTo(mapInstanceRef.current);
      tileLayerRef.current = osmTiles;
    } else if (mapTheme === 'topo') {
      const topoTiles = L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        { maxZoom: 17, attribution: '© OpenTopoMap contributors' }
      ).addTo(mapInstanceRef.current);
      tileLayerRef.current = topoTiles;
    }
  }, [mapTheme]);

  // Render Hazard Perimeter Zones & Epicenters
  useEffect(() => {
    if (!hazardLayerRef.current || !mapInstanceRef.current) return;
    hazardLayerRef.current.clearLayers();

    if (!showHazards) return;

    incidents.forEach(inc => {
      const colorMap: Record<string, string> = {
        flood: '#3b82f6',
        cyclone: '#06b6d4',
        earthquake: '#f59e0b',
        wildfire: '#f97316',
        landslide: '#78716c',
        heatwave: '#ef4444'
      };
      const color = colorMap[inc.type] || '#ef4444';
      const radiusMeters = (inc.impactRadiusKm || 3) * 1000;

      // Pulsing Impact Perimeter Circle
      const perimeterCircle = L.circle([inc.lat, inc.lng], {
        radius: radiusMeters,
        color: color,
        weight: 2,
        opacity: 0.85,
        fillColor: color,
        fillOpacity: 0.18,
        dashArray: '6, 6'
      });

      perimeterCircle.bindTooltip(
        `<b>${inc.type.toUpperCase()} DANGER ZONE</b><br/>Impact Radius: ${inc.impactRadiusKm} km<br/>Affected: ~${inc.affectedPopulation?.toLocaleString() || '15,000'}`,
        { permanent: false, direction: 'center', className: 'tactical-tooltip' }
      );

      hazardLayerRef.current?.addLayer(perimeterCircle);

      // Epicenter Marker
      const epicenterHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-rose-600/40 animate-ping absolute"></div>
          <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-lg">
            ⚠️
          </div>
        </div>
      `;

      const epicenterIcon = L.divIcon({
        className: 'custom-epicenter-icon',
        html: epicenterHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const epicenterMarker = L.marker([inc.lat, inc.lng], { icon: epicenterIcon });
      epicenterMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 200px; color: #0f172a; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">
              ${inc.severity} SEVERITY
            </span>
            <span style="font-size: 10px; color: #64748b;">${new Date(inc.timestamp).toLocaleTimeString()}</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #1e293b;">
            ${inc.type} Incident #${inc.incidentId}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            <b>Location:</b> ${inc.location}
          </div>
          <div style="font-size: 11px; color: #475569;">
            <b>Evacuation Perimeter:</b> ${inc.impactRadiusKm} km
          </div>
          <div style="margin-top: 6px; font-size: 11px; background: #f1f5f9; padding: 6px; border-radius: 8px; color: #334155;">
            <b>Protocol:</b> ${inc.actionPlan?.immediateAction || 'Immediate perimeter evacuation & shelter routing'}
          </div>
        </div>
      `);

      hazardLayerRef.current?.addLayer(epicenterMarker);
    });
  }, [incidents, showHazards]);

  // Render Shelters
  useEffect(() => {
    if (!shelterLayerRef.current) return;
    shelterLayerRef.current.clearLayers();

    if (!showShelters) return;

    shelters.forEach(s => {
      const isSelected = selectedShelterId === s.id;
      const isOpen = s.status === 'open';
      const availableBeds = s.capacity - s.occupied;

      const shelterHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition transform hover:scale-110">
          ${isSelected ? '<div class="w-10 h-10 rounded-full bg-emerald-400/40 animate-ping absolute"></div>' : ''}
          <div class="w-8 h-8 rounded-2xl ${isOpen ? 'bg-emerald-600' : 'bg-slate-700'} border-2 ${isSelected ? 'border-white ring-2 ring-emerald-400' : 'border-slate-900'} flex items-center justify-center text-white shadow-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span class="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full text-[9px] font-bold ${availableBeds > 50 ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'}">
            ${availableBeds}
          </span>
        </div>
      `;

      const shelterIcon = L.divIcon({
        className: 'custom-shelter-marker',
        html: shelterHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([s.lat, s.lng], { icon: shelterIcon });
      marker.on('click', () => {
        if (onSelectShelter) onSelectShelter(s);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 220px; color: #0f172a; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; background: ${isOpen ? '#dcfce7' : '#fee2e2'}; color: ${isOpen ? '#15803d' : '#b91c1c'}; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">
              ${s.status}
            </span>
            <span style="font-size: 11px; font-weight: bold; color: #059669;">${availableBeds} beds free</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #1e293b;">${s.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Occupancy: <b>${s.occupied}</b> / ${s.capacity}</div>
          <div style="font-size: 11px; color: #64748b;">Facilities: ${s.facilities.join(', ')}</div>
          <div style="font-size: 11px; color: #64748b;">Contact: <b>${s.contact}</b></div>
          <div style="margin-top: 8px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" rel="noreferrer" style="display: block; text-align: center; background: #2563eb; color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none;">
              Navigate to Safe Shelter
            </a>
          </div>
        </div>
      `);

      shelterLayerRef.current?.addLayer(marker);
    });
  }, [shelters, selectedShelterId, showShelters]);

  // Render Relief Teams
  useEffect(() => {
    if (!teamLayerRef.current) return;
    teamLayerRef.current.clearLayers();

    if (!showTeams) return;

    teams.forEach(team => {
      const isDeployed = team.status !== 'standby';
      const teamHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full ${isDeployed ? 'bg-indigo-600 animate-pulse' : 'bg-slate-700'} border-2 border-white flex items-center justify-center text-white text-[11px] shadow-lg">
            🚒
          </div>
        </div>
      `;

      const teamIcon = L.divIcon({
        className: 'custom-team-icon',
        html: teamHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([team.lat, team.lng], { icon: teamIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; color: #0f172a; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">
              ${team.status}
            </span>
            <span style="font-size: 11px; font-weight: bold; color: #4338ca;">${team.members} Responders</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${team.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Equipment: ${team.equipment.join(', ')}</div>
          <div style="font-size: 11px; color: #64748b;">Specialization: <b>${team.type.toUpperCase()}</b></div>
        </div>
      `);

      teamLayerRef.current?.addLayer(marker);
    });
  }, [teams, showTeams]);

  // Render Citizen Checkins
  useEffect(() => {
    if (!checkinLayerRef.current) return;
    checkinLayerRef.current.clearLayers();

    if (!showCheckins) return;

    checkins.forEach(c => {
      const isSafe = c.status === 'Safe';
      const checkinHtml = `
        <div class="w-3.5 h-3.5 rounded-full ${isSafe ? 'bg-emerald-400 ring-2 ring-emerald-500/50' : 'bg-rose-500 ring-4 ring-rose-500/40 animate-ping'} shadow-sm"></div>
      `;

      const checkinIcon = L.divIcon({
        className: 'custom-checkin-icon',
        html: checkinHtml,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([c.lat, c.lng], { icon: checkinIcon });
      marker.bindTooltip(
        `<b>${c.name}</b>: ${c.status.toUpperCase()}<br/>${c.notes || ''}`,
        { direction: 'top', className: 'tactical-tooltip' }
      );

      checkinLayerRef.current?.addLayer(marker);
    });
  }, [checkins, showCheckins]);

  // Render User Location
  useEffect(() => {
    if (!userLocLayerRef.current) return;
    userLocLayerRef.current.clearLayers();

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-blue-500/30 animate-ping absolute"></div>
          <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      marker.bindTooltip('<b>Your Current Location (GPS)</b>', { direction: 'top' });
      userLocLayerRef.current.addLayer(marker);
    }
  }, [userLocation]);

  // Recenter Handler
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const targetLat = userLocation?.lat || incidents[0]?.lat || 19.0760;
    const targetLng = userLocation?.lng || incidents[0]?.lng || 72.8777;
    mapInstanceRef.current.flyTo([targetLat, targetLng], 13, { duration: 1 });
  };

  // Fit All Bounds Handler
  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const allPoints: [number, number][] = [];
    incidents.forEach(i => allPoints.push([i.lat, i.lng]));
    shelters.forEach(s => allPoints.push([s.lat, s.lng]));
    teams.forEach(t => allPoints.push([t.lat, t.lng]));
    if (userLocation) allPoints.push([userLocation.lat, userLocation.lng]);

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col relative shadow-xl">
      {/* Top Tactical Status Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
              <span>{t.liveMap?.title || 'Live Incident & Tactical Map'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[9px] font-mono uppercase">
                {incidents.length > 0 ? `${incidents.length} Active Hazards` : 'Monitoring'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {t.liveMap?.subtitle || 'Real-time hazard perimeters, relief teams & citizen safety grid'}
            </div>
          </div>
        </div>

        {/* Tactical Layer & View Switcher */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5 text-[11px]">
            <button
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapTheme === 'dark' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tactical
            </button>
            <button
              onClick={() => setMapTheme('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapTheme === 'satellite' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapTheme('standard')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapTheme === 'standard' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM
            </button>
            <button
              onClick={() => setMapTheme('topo')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapTheme === 'topo' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Topo
            </button>
          </div>

          <button
            onClick={handleRecenter}
            title={t.liveMap?.recenter || 'Recenter Map'}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitAll}
            title="Fit All Operational Zones"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer Visibility Filters Bar */}
      <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[10px] overflow-x-auto">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400 uppercase font-bold text-[9px] mr-1">Toggles:</span>
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
              showHazards
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {t.liveMap?.filterHazards || 'Hazards'} ({incidents.length})
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
              showShelters
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {t.liveMap?.filterShelters || 'Shelters'} ({shelters.length})
          </button>
          <button
            onClick={() => setShowTeams(!showTeams)}
            className={`px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
              showTeams
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            {t.liveMap?.filterTeams || 'Relief Teams'} ({teams.length})
          </button>
          <button
            onClick={() => setShowCheckins(!showCheckins)}
            className={`px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
              showCheckins
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {t.liveMap?.filterSos || 'Citizen SOS'} ({checkins.length})
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
          {activeCoords.lat.toFixed(4)}° N, {activeCoords.lng.toFixed(4)}° E | Zoom {currentZoom}x
        </div>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} relative z-0`} />

      {/* Bottom Live Tactical Coordination Bar */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-slate-300">Hazard Perimeter:</span> {incidents[0] ? `${incidents[0].impactRadiusKm} km Radius` : '0 Active'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">Open Shelters:</span> {shelters.filter(s => s.status === 'open').length} Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="font-semibold text-slate-300">NDRF Units:</span> {teams.filter(t => t.status !== 'standby').length} Deployed
          </span>
        </div>

        <div className="text-slate-500 font-mono">
          Continuous Ingestion • 24/7 Civil Defense Telemetry
        </div>
      </div>
    </div>
  );
};
