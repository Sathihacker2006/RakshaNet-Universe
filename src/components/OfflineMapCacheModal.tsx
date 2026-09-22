import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Download, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  Layers, 
  X, 
  RefreshCw,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { Shelter, Incident } from '../types';
import { 
  cacheCriticalAreas, 
  getTileCacheStats, 
  clearTileCache, 
  TileCacheStats 
} from '../services/tileCache';

interface OfflineMapCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelters: Shelter[];
  incidents: Incident[];
  userLocation: { lat: number; lng: number } | null;
  onCacheUpdated?: () => void;
}

export const OfflineMapCacheModal: React.FC<OfflineMapCacheModalProps> = ({
  isOpen,
  onClose,
  shelters,
  incidents,
  userLocation,
  onCacheUpdated
}) => {
  const [stats, setStats] = useState<TileCacheStats>({
    totalTiles: 0,
    estimatedSizeMB: 0,
    lastUpdated: null,
    areas: [],
    isCaching: false
  });
  const [isCaching, setIsCaching] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number; percent: number; statusText: string }>({
    loaded: 0,
    total: 0,
    percent: 0,
    statusText: ''
  });
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const loadStats = async () => {
    const s = await getTileCacheStats();
    setStats(s);
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  if (!isOpen) return null;

  // Build list of critical locations to cache
  const criticalAreas: { name: string; lat: number; lng: number; type: 'user' | 'shelter' | 'incident' }[] = [];
  
  if (userLocation) {
    criticalAreas.push({
      name: 'Current Vicinity (GPS Origin)',
      lat: userLocation.lat,
      lng: userLocation.lng,
      type: 'user'
    });
  }

  shelters.slice(0, 6).forEach(s => {
    criticalAreas.push({
      name: `Shelter: ${s.name}`,
      lat: s.lat,
      lng: s.lng,
      type: 'shelter'
    });
  });

  incidents.slice(0, 3).forEach(inc => {
    criticalAreas.push({
      name: `${inc.type.toUpperCase()} Zone: ${inc.location}`,
      lat: inc.lat,
      lng: inc.lng,
      type: 'incident'
    });
  });

  const handleStartCaching = async () => {
    setIsCaching(true);
    try {
      await cacheCriticalAreas(criticalAreas, (p) => {
        setProgress(p);
      });
      await loadStats();
      if (onCacheUpdated) onCacheUpdated();
    } catch (e) {
      console.error('Error during tile caching:', e);
    } finally {
      setIsCaching(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Clear all cached offline map tiles? (You will need an active connection to reload map views).')) {
      await clearTileCache();
      await loadStats();
      if (onCacheUpdated) onCacheUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Offline Map Tile Caching Engine
                {stats.totalTiles > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono">
                    READY
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Leaflet tile pre-caching for safe navigation during network blackouts
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Network Status banner */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isOnline 
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' 
              : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {isOnline 
                  ? 'Online Connection Active — Ready to download & cache regional tiles' 
                  : 'Operating Offline — All navigation runs from local cached map tiles'}
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/60">
              {isOnline ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>

          {/* Cache Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Cached Tiles</span>
              <span className="text-xl font-mono font-bold text-white mt-1">
                {stats.totalTiles}
              </span>
              <span className="text-[10px] text-slate-400 mt-auto">Stored in browser cache</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Storage Used</span>
              <span className="text-xl font-mono font-bold text-blue-400 mt-1">
                {stats.estimatedSizeMB} <span className="text-xs">MB</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-auto">Indexed CacheStorage</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Safe Areas</span>
              <span className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {criticalAreas.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-auto">GPS + Shelters + Hazards</span>
            </div>
          </div>

          {/* Progress Bar (during caching) */}
          {isCaching && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300 font-semibold flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {progress.statusText}
                </span>
                <span className="font-mono text-blue-400 font-bold">{progress.percent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Critical Areas Protected */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Critical Priority Zones for Offline Navigation ({criticalAreas.length})
              </h4>
              <span className="text-[10px] text-slate-400">Zooms 12 - 14</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {criticalAreas.map((area, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/70 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      area.type === 'user' 
                        ? 'bg-blue-400 ring-2 ring-blue-400/20' 
                        : area.type === 'shelter' 
                        ? 'bg-emerald-400' 
                        : 'bg-rose-400'
                    }`} />
                    <span className="font-medium text-slate-200">{area.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {area.lat.toFixed(4)}, {area.lng.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Info Box */}
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-start gap-2.5 text-slate-400">
            <HardDrive className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Tiles are cached directly in the browser's CacheStorage API. When cell towers or internet connectivity fails, Leaflet transparently retrieves stored tiles to preserve map tracking, safe corridor rendering, and shelter distance calculations without throwing broken-tile errors.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between gap-3">
          <button
            onClick={handleClearCache}
            disabled={isCaching || stats.totalTiles === 0}
            className="px-3 py-2 rounded-xl border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cache</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 text-xs font-semibold transition"
            >
              Close
            </button>
            <button
              onClick={handleStartCaching}
              disabled={isCaching || !isOnline}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCaching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Caching Map Areas...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{stats.totalTiles > 0 ? 'Update Offline Tiles' : 'Precache Critical Map Areas'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
