import React, { useState } from 'react';
import {
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  MapPin,
  RefreshCw,
  X,
  Compass,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { VicinityWeatherForecast, WeatherAlert } from '../types';
import { AlertReadAloudButton } from './AlertReadAloudButton';

interface WeatherForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: VicinityWeatherForecast | null;
  isLoading: boolean;
  onRefresh: (useGps?: boolean) => void;
  selectedLanguage: string;
}

export const WeatherForecastModal: React.FC<WeatherForecastModalProps> = ({
  isOpen,
  onClose,
  weather,
  isLoading,
  onRefresh,
  selectedLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'decision' | 'hourly' | 'alerts' | 'daily'>('decision');

  if (!isOpen) return null;

  const current = weather?.current;
  const decision = weather?.movementDecision;
  const alerts = weather?.alerts || [];
  const hourly = weather?.hourly || [];
  const daily = weather?.daily || [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CLEAR':
        return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', badge: 'bg-emerald-500' };
      case 'CAUTION':
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', badge: 'bg-amber-500' };
      case 'RESTRICTED':
        return { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', badge: 'bg-orange-500' };
      case 'NO_TRAVEL':
      default:
        return { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400', badge: 'bg-rose-600' };
    }
  };

  const statusStyle = getStatusColor(decision?.statusLevel);

  const getWeatherIcon = (condition: string = '', code: number = 0) => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || code >= 95) return <CloudLightning className="w-8 h-8 text-amber-400 animate-pulse" />;
    if (c.includes('heavy') || c.includes('torrential') || code >= 65) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (c.includes('drizzle') || code >= 50) return <CloudDrizzle className="w-8 h-8 text-cyan-400" />;
    if (c.includes('clear') || code === 0) return <Sun className="w-8 h-8 text-amber-300" />;
    return <CloudRain className="w-8 h-8 text-indigo-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">Vicinity Weather & Precipitation</h3>
                {weather?.isGeolocation && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
                    GPS Vicinity
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span className="truncate max-w-[280px] sm:max-w-md">{weather?.locationName || 'Local Operations Vicinity'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onRefresh(true)}
              disabled={isLoading}
              title="Detect GPS & Refresh Weather"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Main Weather Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                {getWeatherIcon(current?.condition, current?.weatherCode)}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{Math.round(current?.temperature ?? 28)}°C</span>
                    <span className="text-xs text-slate-400">Feels like {Math.round(current?.apparentTemperature ?? 32)}°C</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-300">{current?.condition || 'Monsoon Rain'}</div>
                </div>
              </div>

              {/* Precipitation Rate Callout */}
              <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/60 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-300">Precipitation Rate</div>
                  <div className="text-lg font-black text-white flex items-baseline gap-1">
                    <span>{current?.precipitationMm?.toFixed(1) ?? '14.5'}</span>
                    <span className="text-xs font-medium text-blue-300">mm/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Precipitation Intensity Visual Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Rainfall Intensity Level</span>
                <span className="font-bold text-slate-200">
                  {(current?.precipitationMm ?? 0) >= 50
                    ? 'Torrential Downpour (>50 mm/h)'
                    : (current?.precipitationMm ?? 0) >= 25
                    ? 'Heavy Rain (25-50 mm/h)'
                    : (current?.precipitationMm ?? 0) >= 8
                    ? 'Moderate Rain (8-25 mm/h)'
                    : 'Light Rain / Drizzle (<8 mm/h)'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-700 ${
                    (current?.precipitationMm ?? 0) >= 50
                      ? 'bg-rose-500'
                      : (current?.precipitationMm ?? 0) >= 25
                      ? 'bg-orange-500'
                      : (current?.precipitationMm ?? 0) >= 8
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, ((current?.precipitationMm ?? 14) / 75) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">24h Cumulative</span>
                <span className="font-bold text-slate-200">{current?.precipitationAccumulation24hMm ?? 95} mm</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">Flood Risk Index</span>
                <span className={`font-bold ${(current?.floodRiskIndex ?? 0) >= 70 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {current?.floodRiskIndex ?? 60}% Risk
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Wind & Gusts</span>
                  <span className="font-bold text-slate-200">{Math.round(current?.windSpeedKmH ?? 24)} km/h</span>
                </div>
                <Wind className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">Relative Humidity</span>
                <span className="font-bold text-slate-200">{current?.humidity ?? 88}%</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('decision')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'decision'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Movement Decision
            </button>
            <button
              onClick={() => setActiveTab('hourly')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'hourly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hourly Rainfall ({hourly.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weather Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'daily'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3-Day Outlook
            </button>
          </div>

          {/* TAB 1: Disaster Planning & Movement Decision */}
          {activeTab === 'decision' && decision && (
            <div className="space-y-3.5">
              {/* Movement Status Banner */}
              <div className={`p-4 rounded-3xl border ${statusStyle.bg} ${statusStyle.border} space-y-2`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusStyle.badge} animate-ping`} />
                    <span className={`text-xs font-black uppercase tracking-wider ${statusStyle.text}`}>
                      {decision.statusLevel.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-bold">
                    Evacuation Priority: {decision.evacuationPriority}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-white leading-snug">{decision.headline}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{decision.safeWindow}</p>

                {/* Read Aloud Button for Movement Decisions */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Audio Broadcast for Movement Decision:</span>
                  <AlertReadAloudButton
                    alert={{
                      id: 'WEATHER-DECISION',
                      incidentId: 'MET-01',
                      type: 'flood',
                      severity: decision.statusLevel === 'NO_TRAVEL' ? 'critical' : 'warning',
                      lang: selectedLanguage,
                      message: `${decision.headline}. ${decision.safeWindow} Transport: ${decision.recommendedTransport}.`,
                      timestamp: new Date().toISOString(),
                      channels: ['Civil Defense Meteorological Broadcast']
                    }}
                    actionPlanText={decision.routeImpactAdvice}
                    variant="pill"
                    label="Listen to Advisory"
                    stopLabel="Stop Audio"
                  />
                </div>
              </div>

              {/* Route Impact & Recommended Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <Compass className="w-4 h-4" />
                    <span>Road & Terrain Passability</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{decision.routeImpactAdvice}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Recommended Transit Mode</span>
                  </div>
                  <p className="text-white font-extrabold text-xs">{decision.recommendedTransport}</p>
                  <p className="text-slate-400 text-[10px]">
                    {decision.recommendedTransport.includes('Shelter')
                      ? 'Stay in high elevated structures. Avoid all vehicular transit.'
                      : 'Keep to arterial ridges; carry waterproofing gear & emergency comms.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Hourly Precipitation Forecast */}
          {activeTab === 'hourly' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400 font-medium">16-Hour Precipitation & Flood Probability</span>
                <span className="text-[10px] text-blue-400 font-bold">Radar Telemetry & Forecast</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {hourly.map((h, idx) => {
                  const isTorrential = h.precipitationMm >= 50;
                  const isHeavy = h.precipitationMm >= 25 && h.precipitationMm < 50;
                  const isModerate = h.precipitationMm >= 8 && h.precipitationMm < 25;

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 w-24">
                        <span className="font-bold text-white font-mono">{h.time}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isTorrential
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isHeavy
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : isModerate
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {h.intensity}
                        </span>
                      </div>

                      {/* Visual precipitation bar */}
                      <div className="flex-1 px-2 hidden sm:block">
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isTorrential
                                ? 'bg-rose-500'
                                : isHeavy
                                ? 'bg-orange-500'
                                : isModerate
                                ? 'bg-blue-500'
                                : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, (h.precipitationMm / 60) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-extrabold text-white font-mono">{h.precipitationMm} mm/h</div>
                          <div className="text-[10px] text-slate-500">{h.probability}% rain prob</div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            h.floodRiskPercent >= 70
                              ? 'bg-rose-500/20 text-rose-400'
                              : h.floodRiskPercent >= 40
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {h.floodRiskPercent}% flood
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Active Weather Alerts */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  No severe meteorological warnings active in your immediate vicinity.
                </div>
              ) : (
                alerts.map((alert: WeatherAlert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-3xl bg-slate-950 border border-slate-800/80 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <h5 className="font-extrabold text-white text-xs leading-snug">{alert.title}</h5>
                          <span className="text-[10px] text-slate-400">Source: {alert.source}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          alert.severity === 'emergency'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : alert.severity === 'warning'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400">
                        Movement Risk: <b className="text-rose-300">{alert.movementRisk}</b> • Valid until: {alert.effectiveUntil}
                      </span>
                      <AlertReadAloudButton
                        alert={{
                          id: alert.id,
                          incidentId: 'MET-ALERT',
                          type: 'flood',
                          severity: alert.severity === 'emergency' ? 'critical' : 'warning',
                          lang: selectedLanguage,
                          message: `${alert.title}. ${alert.description}`,
                          timestamp: new Date().toISOString(),
                          channels: ['Weather Radio Broadcast']
                        }}
                        variant="subtle"
                        label="Listen"
                        stopLabel="Stop"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: 3-Day Outlook */}
          {activeTab === 'daily' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {daily.map((d, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">{d.dayName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{d.date}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {getWeatherIcon(d.condition, d.weatherCode)}
                    <div>
                      <div className="font-bold text-white text-xs">{d.condition}</div>
                      <div className="text-[11px] text-slate-400">
                        {d.tempMax}° / {d.tempMin}°C
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Expected Rain:</span>
                      <b className="text-blue-300">{d.precipitationSumMm} mm</b>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Precip Probability:</span>
                      <b className="text-slate-200">{d.precipProbability}%</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Updated: {weather?.updatedAt ? new Date(weather.updatedAt).toLocaleTimeString() : 'Just now'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Close Forecast
          </button>
        </div>
      </div>
    </div>
  );
};
