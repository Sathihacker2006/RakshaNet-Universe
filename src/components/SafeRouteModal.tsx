import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ExternalLink, 
  X, 
  Loader2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Shelter, EvacuationRoute, Incident } from '../types';
import { planSafeRoute } from '../services/api';

interface SafeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelters: Shelter[];
  selectedShelter: Shelter | null;
  userLocation: { lat: number; lng: number } | null;
  incidents: Incident[];
}

export const SafeRouteModal: React.FC<SafeRouteModalProps> = ({
  isOpen,
  onClose,
  shelters,
  selectedShelter,
  userLocation,
  incidents
}) => {
  const [currentShelterId, setCurrentShelterId] = useState<string>(
    selectedShelter?.id || shelters[0]?.id || 'S1'
  );
  const [route, setRoute] = useState<EvacuationRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedShelter) {
      setCurrentShelterId(selectedShelter.id);
    }
  }, [selectedShelter]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRoute = async () => {
      setIsLoading(true);
      try {
        const uLat = userLocation?.lat || 19.076;
        const uLng = userLocation?.lng || 72.8777;
        const r = await planSafeRoute(uLat, uLng, currentShelterId);
        setRoute(r);
      } catch (e) {
        console.error('Routing error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [isOpen, currentShelterId, userLocation]);

  if (!isOpen) return null;

  const target = shelters.find(s => s.id === currentShelterId) || shelters[0];

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Navigation className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base">Evacuation Safe Corridor</h3>
              <p className="text-[11px] text-slate-400">Routes calculated to steer around active hazard perimeters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shelter Target Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Safe Shelter</label>
          <select
            value={currentShelterId}
            onChange={e => setCurrentShelterId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            {shelters.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.capacity - s.occupied} spots free • {s.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
            <span>Calculating dynamic avoidance path around disaster perimeters...</span>
          </div>
        ) : route ? (
          <div className="space-y-4 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Distance</span>
                <div className="font-black text-base text-white mt-0.5">{route.totalDistanceKm} km</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Walk Time</span>
                <div className="font-black text-base text-blue-400 mt-0.5">{route.estimatedWalkTimeMin} min</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Safety Score</span>
                <div className="font-black text-base text-emerald-400 mt-0.5">{route.safetyScore}%</div>
              </div>
            </div>

            {/* Hazard Avoidance Alert Notice */}
            {route.hazardCrossingsAvoided > 0 && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Hazard Perimeter Avoided:</span>
                  This evacuation corridor automatically diverts away from low-lying flood channels and active incident zones.
                </div>
              </div>
            )}

            {/* Step-by-Step Waypoint Guidance */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Turn-by-Turn Safe Path
              </span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {route.waypoints.map((wp, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                      wp.isHazardAvoidance
                        ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                        : 'bg-slate-950 border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                        wp.isHazardAvoidance
                          ? 'bg-amber-500 text-slate-950'
                          : idx === route.waypoints.length - 1
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="leading-snug">{wp.instruction}</p>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                        GPS: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Navigation Button */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/40 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Live Google Maps Turn-by-Turn GPS</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};
