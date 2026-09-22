import React from 'react';
import {
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Sun,
  Droplets,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { VicinityWeatherForecast } from '../types';
import { AlertReadAloudButton } from './AlertReadAloudButton';

interface WeatherForecastWidgetProps {
  weather: VicinityWeatherForecast | null;
  isLoading: boolean;
  onOpenModal: () => void;
  onRefresh: (useGps?: boolean) => void;
  selectedLanguage: string;
  compact?: boolean;
}

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({
  weather,
  isLoading,
  onOpenModal,
  onRefresh,
  selectedLanguage,
  compact = false
}) => {
  const current = weather?.current;
  const decision = weather?.movementDecision;
  const alerts = weather?.alerts || [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CLEAR':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-500' };
      case 'CAUTION':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-500' };
      case 'RESTRICTED':
        return { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-500' };
      case 'NO_TRAVEL':
      default:
        return { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-500' };
    }
  };

  const statusStyle = getStatusColor(decision?.statusLevel);

  const getWeatherIcon = (condition: string = '', code: number = 0) => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || code >= 95) return <CloudLightning className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />;
    if (c.includes('heavy') || c.includes('torrential') || code >= 65) return <CloudRain className="w-6 h-6 text-blue-400 shrink-0" />;
    if (c.includes('drizzle') || code >= 50) return <CloudDrizzle className="w-6 h-6 text-cyan-400 shrink-0" />;
    if (c.includes('clear') || code === 0) return <Sun className="w-6 h-6 text-amber-300 shrink-0" />;
    return <CloudRain className="w-6 h-6 text-indigo-400 shrink-0" />;
  };

  if (!weather && isLoading) {
    return (
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800" />
          <div className="space-y-1">
            <div className="w-32 h-3 bg-slate-800 rounded" />
            <div className="w-24 h-2 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="w-16 h-6 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-lg group hover:border-slate-700 transition">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400">
            <CloudRain className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white truncate">Vicinity Weather Radar</span>
              {weather?.isGeolocation && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  GPS
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
              <span className="truncate">{weather?.locationName || 'Vicinity Zone'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onRefresh(true)}
            disabled={isLoading}
            title="Update Live Radar Telemetry"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={onOpenModal}
            title="Open Detailed Weather & Movement Plan"
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition active:scale-95 flex items-center gap-1 text-[11px] font-bold px-2.5 cursor-pointer shadow-sm"
          >
            <span>Details</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Stats Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {getWeatherIcon(current?.condition, current?.weatherCode)}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{Math.round(current?.temperature ?? 28)}°C</span>
                <span className="text-[11px] text-slate-400">({current?.condition || 'Rain'})</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Feels like {Math.round(current?.apparentTemperature ?? 32)}°C • Wind {Math.round(current?.windSpeedKmH ?? 24)} km/h
              </div>
            </div>
          </div>

          {/* Current Precipitation Badge */}
          <div className="p-2.5 rounded-2xl bg-blue-950/70 border border-blue-800/80 text-right">
            <div className="text-[9px] uppercase font-bold text-blue-300 flex items-center justify-end gap-1">
              <Droplets className="w-3 h-3 text-blue-400" />
              Precipitation Rate
            </div>
            <div className="text-base font-black text-white font-mono">
              {current?.precipitationMm?.toFixed(1) ?? '14.5'} <span className="text-[10px] text-blue-300">mm/h</span>
            </div>
          </div>
        </div>

        {/* Precipitation Hazard Gauge */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-medium">Downpour Hazard Intensity</span>
            <span className="font-bold text-slate-300">
              {(current?.precipitationMm ?? 0) >= 50
                ? 'Torrential (>50mm/h)'
                : (current?.precipitationMm ?? 0) >= 25
                ? 'Heavy (25-50mm/h)'
                : (current?.precipitationMm ?? 0) >= 8
                ? 'Moderate (8-25mm/h)'
                : 'Light (<8mm/h)'}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
            <div 
              className={`h-full transition-all duration-500 ${
                (current?.precipitationMm ?? 0) >= 50
                  ? 'bg-rose-500'
                  : (current?.precipitationMm ?? 0) >= 25
                  ? 'bg-orange-500'
                  : (current?.precipitationMm ?? 0) >= 8
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, ((current?.precipitationMm ?? 14) / 70) * 100))}%` }}
            />
          </div>
        </div>

        {/* Movement Decision Callout */}
        {decision && (
          <div className={`p-3 rounded-2xl border ${statusStyle.bg} ${statusStyle.border} space-y-1.5`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-pulse`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${statusStyle.text}`}>
                  Movement: {decision.statusLevel.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-300">
                Mode: {decision.recommendedTransport.split(' ')[0]}
              </span>
            </div>

            <p className="text-xs font-bold text-white leading-snug line-clamp-2">
              {decision.headline}
            </p>

            <p className="text-[11px] text-slate-300 leading-normal line-clamp-2">
              {decision.safeWindow}
            </p>

            {/* Read Aloud Audio Control */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">Audio Broadcast:</span>
              <AlertReadAloudButton
                alert={{
                  id: 'WEATHER-WIDGET-ALERT',
                  incidentId: 'MET-STATUS',
                  type: 'flood',
                  severity: decision.statusLevel === 'NO_TRAVEL' ? 'critical' : 'warning',
                  lang: selectedLanguage,
                  message: `${decision.headline}. ${decision.safeWindow}`,
                  timestamp: new Date().toISOString(),
                  channels: ['Voice Radio']
                }}
                variant="subtle"
                label="Listen"
                stopLabel="Stop"
              />
            </div>
          </div>
        )}

        {/* Active Weather Alert Strip if alerts exist */}
        {alerts.length > 0 && (
          <div 
            onClick={onOpenModal}
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2 cursor-pointer hover:bg-rose-500/15 transition text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] font-bold text-rose-300 truncate">
                {alerts[0].title}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold shrink-0">
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
