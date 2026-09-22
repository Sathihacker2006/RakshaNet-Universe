import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Layers } from 'lucide-react';
import { getOfflineQueue, getLastSyncTime } from '../services/storage';
import { syncOfflineData } from '../services/api';

interface OfflineSyncBannerProps {
  onSyncComplete?: () => void;
  onOpenMapCache?: () => void;
  cachedTileCount?: number;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({ 
  onSyncComplete,
  onOpenMapCache,
  cachedTileCount = 0
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const updatePendingCount = () => {
    setPendingCount(getOfflineQueue().length);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when returning online
      handleSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updatePendingCount();

    // Check periodically for offline items
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Synchronizing field data...');
    try {
      const res = await syncOfflineData();
      if (res.error) {
        setSyncStatusMsg(`Sync note: ${res.error}`);
      } else {
        setSyncStatusMsg(`Synced ${res.syncedCount} records with operations hub!`);
      }
      updatePendingCount();
      if (onSyncComplete) onSyncComplete();
    } catch (e: any) {
      setSyncStatusMsg('Sync paused - server unreachable');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  const lastSync = getLastSyncTime();

  return (
    <div className={`w-full px-4 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-3 transition-colors ${
      !isOnline 
        ? 'bg-amber-950/80 border-amber-800/80 text-amber-200' 
        : pendingCount > 0 
        ? 'bg-blue-950/60 border-blue-900 text-blue-200' 
        : 'bg-slate-900/90 border-slate-800 text-slate-400'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            Online Cloud Sync Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            Offline Mode (Local Storage & PWA Enabled)
          </span>
        )}

        {pendingCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            {pendingCount} Pending Check-in{pendingCount > 1 ? 's' : ''} Queued
          </span>
        )}

        {syncStatusMsg && (
          <span className="text-slate-300 italic hidden sm:inline">{syncStatusMsg}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {lastSync && (
          <span className="text-[11px] text-slate-500 hidden md:inline">
            Last Synced: {new Date(lastSync).toLocaleTimeString()}
          </span>
        )}

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition disabled:opacity-50"
          title="Sync offline queue with cloud"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          <span>Sync</span>
        </button>

        {onOpenMapCache && (
          <button
            onClick={onOpenMapCache}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/60"
            title="View or cache offline map tiles for critical areas"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Map Cache</span>
            {cachedTileCount > 0 ? (
              <span className="ml-0.5 px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                {cachedTileCount}
              </span>
            ) : (
              <span className="ml-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
