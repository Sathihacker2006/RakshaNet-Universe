import React from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Smartphone, 
  LayoutDashboard, 
  Globe, 
  AlertTriangle,
  Sparkles,
  Briefcase,
  Navigation,
  ChevronDown,
  Camera,
  Layers,
  CloudRain
} from 'lucide-react';
import { Incident, EmergencyAlert } from '../types';
import { getTranslation } from '../data/translations';
import { AlertReadAloudButton } from './AlertReadAloudButton';

interface HeaderProps {
  currentView: 'mobile' | 'dashboard';
  onViewChange: (view: 'mobile' | 'dashboard') => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  activeIncident: Incident | null;
  activeAlert?: EmergencyAlert | null;
  onTriggerSos: () => void;
  onOpenCheckin: () => void;
  onOpenPhotoScanner?: () => void;
  onOpenBeacon?: () => void;
  onOpenKit?: () => void;
  onOpenRoute?: () => void;
  onOpenMapCache?: () => void;
  cachedTileCount?: number;
  onOpenWeather?: () => void;
  weatherPillText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  isMobileFrame,
  onToggleMobileFrame,
  selectedLanguage,
  onLanguageChange,
  activeIncident,
  activeAlert,
  onTriggerSos,
  onOpenCheckin,
  onOpenPhotoScanner,
  onOpenBeacon,
  onOpenKit,
  onOpenRoute,
  onOpenMapCache,
  cachedTileCount = 0,
  onOpenWeather,
  weatherPillText
}) => {
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const t = getTranslation(selectedLanguage);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand & Live Alert Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-900 border border-rose-500/30 text-white shadow-lg shadow-rose-900/40">
            <span className="font-black text-lg tracking-tighter">R</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                {t.appName} <span className="text-rose-500 font-mono text-xs px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800/60">{t.globalBadge}</span>
              </h1>
              {activeIncident && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-bold text-rose-300 uppercase animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  {activeIncident.type.toUpperCase()} {t.activeStatus}
                </span>
              )}
              {(activeAlert || activeIncident) && (
                <div className="hidden md:block">
                  <AlertReadAloudButton
                    alert={activeAlert || {
                      id: 'HDR-ALERT',
                      incidentId: activeIncident?.incidentId || 'SYS-01',
                      type: activeIncident?.type || 'flood',
                      severity: activeIncident?.severity || 'critical',
                      lang: selectedLanguage,
                      message: `Emergency Alert: Disaster condition active in ${activeIncident?.location || 'local district'}. Evacuate immediately.`,
                      timestamp: new Date().toISOString(),
                      channels: ['Mobile Voice Broadcast']
                    }}
                    actionPlanText={activeIncident?.actionPlan?.immediateAction}
                    variant="pill"
                    label="Listen"
                    stopLabel="Stop"
                  />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={e => onLanguageChange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-white">EN (English)</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
              <option value="bn" className="bg-slate-900 text-white">বাংলা (Bengali)</option>
              <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* View Switcher: Mobile App vs. Command Center */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => onViewChange('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'mobile'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.views.mobile}</span>
            </button>
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'dashboard'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.views.dashboard}</span>
            </button>
          </div>

          {/* Phone Frame Toggle (when in mobile view on wide screen) */}
          {currentView === 'mobile' && (
            <button
              onClick={onToggleMobileFrame}
              title={isMobileFrame ? t.views.fullWidth : t.views.phoneFrame}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
              <span>{isMobileFrame ? t.views.fullWidth : t.views.phoneFrame}</span>
            </button>
          )}

          {/* Quick Vicinity Weather & Precipitation Button */}
          {onOpenWeather && (
            <button
              onClick={onOpenWeather}
              title="Vicinity Weather Radar, Precipitation & Movement Safety"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-xs text-slate-200 transition active:scale-95 cursor-pointer"
            >
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-white text-[11px] hidden sm:inline">
                {weatherPillText || 'Weather'}
              </span>
            </button>
          )}

          {/* Rescue Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{t.tools.rescueTools}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {toolsOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in"
                onClick={() => setToolsOpen(false)}
              >
                {onOpenWeather && (
                  <button
                    onClick={onOpenWeather}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-slate-800 transition"
                  >
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold text-white">Weather & Precipitation</div>
                      <div className="text-[10px] text-slate-400">Real-time alerts & movement plan</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={onOpenPhotoScanner}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-slate-800 transition"
                >
                  <Camera className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-bold text-white">{t.tools.aiScanner}</div>
                    <div className="text-[10px] text-slate-400">{t.tools.aiScannerDesc}</div>
                  </div>
                </button>

                <button
                  onClick={onOpenBeacon}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-slate-800 transition"
                >
                  <Radio className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-white">{t.tools.beacon}</div>
                    <div className="text-[10px] text-slate-400">{t.tools.beaconDesc}</div>
                  </div>
                </button>

                <button
                  onClick={onOpenRoute}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-slate-800 transition"
                >
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold text-white">{t.tools.route}</div>
                    <div className="text-[10px] text-slate-400">{t.tools.routeDesc}</div>
                  </div>
                </button>

                <button
                  onClick={onOpenKit}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-slate-800 transition"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">{t.tools.kit}</div>
                    <div className="text-[10px] text-slate-400">{t.tools.kitDesc}</div>
                  </div>
                </button>

                {onOpenMapCache && (
                  <button
                    onClick={onOpenMapCache}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-slate-800 transition border-t border-slate-800/80 mt-1 pt-2"
                  >
                    <Layers className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Offline Map Cache</span>
                        {cachedTileCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                            {cachedTileCount} tiles
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Precache shelters & hazard zones</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick "I'm Safe" */}
          <button
            onClick={onOpenCheckin}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-600/50 text-emerald-300 text-xs font-semibold transition"
          >
            <span>✓</span>
            <span>{t.home.markSafe.split('(')[0]}</span>
          </button>

          {/* 1-Tap SOS Emergency Panic Button */}
          <button
            onClick={onTriggerSos}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-rose-900/60 transition group active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
