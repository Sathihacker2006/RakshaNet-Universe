import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Bot, 
  BookOpen, 
  Users, 
  Navigation, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Droplets, 
  Activity, 
  Wind, 
  Flame, 
  Mountain, 
  Sun,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  Camera,
  Radio,
  Briefcase,
  Volume2,
  CloudRain,
  Truck
} from 'lucide-react';
import { Shelter, ReliefTeam, Incident, EmergencyAlert, CitizenCheckin, DisasterType, VicinityWeatherForecast } from '../types';
import { SURVIVAL_HANDBOOK, SurvivalGuide } from '../data/defaultData';
import { InteractiveMap } from './InteractiveMap';
import { LiveIncidentMap } from './LiveIncidentMap';
import { GoogleMapsExplorer } from './GoogleMapsExplorer';
import { ReliefTeamTracker } from './ReliefTeamTracker';
import { askGeminiAdvisor } from '../services/api';
import { getTranslation } from '../data/translations';
import { AlertReadAloudButton } from './AlertReadAloudButton';
import { WeatherForecastWidget } from './WeatherForecastWidget';

interface MobileAppViewProps {
  shelters: Shelter[];
  teams: ReliefTeam[];
  incidents: Incident[];
  alerts: EmergencyAlert[];
  checkins: CitizenCheckin[];
  userLocation: { lat: number; lng: number } | null;
  selectedLanguage: string;
  onTriggerSos: () => void;
  onOpenCheckin: () => void;
  onSelectShelter?: (shelter: Shelter) => void;
  onOpenPhotoScanner?: () => void;
  onOpenBeacon?: () => void;
  onOpenKit?: () => void;
  onOpenRoute?: () => void;
  weather?: VicinityWeatherForecast | null;
  isWeatherLoading?: boolean;
  onOpenWeatherModal?: () => void;
  onRefreshWeather?: (useGps?: boolean) => void;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  shelters,
  teams,
  incidents,
  alerts,
  checkins,
  userLocation,
  selectedLanguage,
  onTriggerSos,
  onOpenCheckin,
  onOpenPhotoScanner,
  onOpenBeacon,
  onOpenKit,
  onOpenRoute,
  weather,
  isWeatherLoading = false,
  onOpenWeatherModal,
  onRefreshWeather
}) => {
  const t = getTranslation(selectedLanguage);
  const [activeTab, setActiveTab] = useState<'sos' | 'weather' | 'map' | 'ai' | 'handbook' | 'registry'>('sos');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [selectedDisasterTab, setSelectedDisasterTab] = useState<DisasterType>('flood');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [mobileMapMode, setMobileMapMode] = useState<'live' | 'google'>('live');
  
  // AI Advisor State
  const [advisorQuery, setAdvisorQuery] = useState<string>('');
  const [advisorMessages, setAdvisorMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: t.aiAdvisor.greeting
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Sync initial greeting when user switches language
  React.useEffect(() => {
    setAdvisorMessages(prev => {
      if (prev.length <= 1) {
        return [{ role: 'ai', text: t.aiAdvisor.greeting }];
      }
      return prev;
    });
  }, [selectedLanguage, t.aiAdvisor.greeting]);

  // Search filter for registry
  const [registrySearch, setRegistrySearch] = useState<string>('');

  // Haversine distance calculator
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Shelters sorted by distance
  const sortedShelters = useMemo(() => {
    const userLat = userLocation?.lat || 19.076;
    const userLng = userLocation?.lng || 72.8777;

    return shelters
      .map(s => ({
        ...s,
        distanceKm: calculateDistance(userLat, userLng, s.lat, s.lng)
      }))
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
      .filter(s => {
        if (facilityFilter === 'all') return true;
        if (facilityFilter === 'medical') return s.facilities.some(f => f.toLowerCase().includes('med'));
        if (facilityFilter === 'food') return s.facilities.some(f => f.toLowerCase().includes('food') || f.toLowerCase().includes('meal'));
        if (facilityFilter === 'water') return s.facilities.some(f => f.toLowerCase().includes('water'));
        if (facilityFilter === 'power') return s.facilities.some(f => f.toLowerCase().includes('power') || f.toLowerCase().includes('solar'));
        return true;
      });
  }, [shelters, userLocation, facilityFilter]);

  const nearestShelter = sortedShelters.find(s => s.status === 'open') || sortedShelters[0];

  // Filtered alerts for current language or fallback
  const currentLangAlerts = useMemo(() => {
    const match = alerts.filter(a => a.lang === selectedLanguage);
    return match.length > 0 ? match : alerts.filter(a => a.lang === 'en');
  }, [alerts, selectedLanguage]);

  const activeIncident = incidents[0] || null;

  const handleSendAiQuestion = async (textToSend?: string) => {
    const question = textToSend || advisorQuery;
    if (!question.trim()) return;

    setAdvisorMessages(prev => [...prev, { role: 'user', text: question }]);
    setAdvisorQuery('');
    setIsAiLoading(true);

    const context = activeIncident
      ? `Active ${activeIncident.type.toUpperCase()} disaster in ${activeIncident.location}. Severity: ${activeIncident.severity}. Nearest shelter: ${nearestShelter?.name}.`
      : `General disaster preparedness zone. Nearest shelter: ${nearestShelter?.name}.`;

    try {
      const response = await askGeminiAdvisor(question, context, selectedLanguage);
      setAdvisorMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setAdvisorMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: t.aiAdvisor.offlineNotice
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredCheckins = useMemo(() => {
    if (!registrySearch.trim()) return checkins;
    const q = registrySearch.toLowerCase();
    return checkins.filter(
      c => c.name.toLowerCase().includes(q) || (c.notes && c.notes.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q))
    );
  }, [checkins, registrySearch]);

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-8rem)] pb-24 bg-slate-950 text-slate-100 select-none">
      {/* Top Mobile Status Header */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-200">RAKSHA CITIZEN MOBILE</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>GPS: Active</span>
          <span>•</span>
          <span>Battery: 92%</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* TAB 1: SOS & EMERGENCY HOME */}
        {activeTab === 'sos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Active Hazard Warning Card */}
            {activeIncident ? (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/80 to-rose-900/60 border-2 border-rose-600/80 shadow-xl shadow-rose-950/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-rose-600 text-white">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                        OFFICIAL EMERGENCY BROADCAST
                      </span>
                      <h3 className="font-extrabold text-base text-white uppercase tracking-tight">
                        {activeIncident.type} DISASTER ALERT
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase">
                    Level 1
                  </span>
                </div>

                <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
                  {currentLangAlerts[0]?.message ||
                    `Critical ${activeIncident.type} danger identified near ${activeIncident.location}. Evacuate perimeter immediately.`}
                </p>

                {activeIncident.actionPlan?.immediateAction && (
                  <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-[11px] text-rose-200">
                    <span className="font-bold text-rose-300">Action Protocol: </span>
                    {activeIncident.actionPlan.immediateAction}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-rose-800/60 text-[11px] text-rose-200">
                  <span className="truncate">📍 {activeIncident.location}</span>
                  <AlertReadAloudButton
                    alert={currentLangAlerts[0] || {
                      id: 'INC-' + activeIncident.incidentId,
                      incidentId: activeIncident.incidentId,
                      type: activeIncident.type,
                      severity: activeIncident.severity,
                      lang: selectedLanguage,
                      message: `Critical ${activeIncident.type} danger identified near ${activeIncident.location}. Evacuate perimeter immediately.`,
                      timestamp: activeIncident.timestamp,
                      channels: ['Civil Defense Sirens', 'Mobile Voice Broadcast']
                    }}
                    actionPlanText={activeIncident.actionPlan?.immediateAction}
                    variant="pill"
                    label="Read Aloud"
                    stopLabel="Stop Audio"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{t.home.allClear}</h4>
                    <p className="text-xs text-slate-400">{t.home.allClearDesc}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  {t.home.normal}
                </span>
              </div>
            )}

            {/* Active Emergency Audio Broadcasts & Voice Alerts Feed */}
            {currentLangAlerts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                    Emergency Voice Bulletins ({currentLangAlerts.length})
                  </span>
                  <span className="text-[10px] text-rose-400 font-medium">Hands-free Audio</span>
                </div>
                <div className="space-y-2">
                  {currentLangAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold uppercase text-[10px]">
                            {alert.severity}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <AlertReadAloudButton
                          alert={alert}
                          actionPlanText={activeIncident?.actionPlan?.immediateAction}
                          variant="pill"
                          label="Read Aloud"
                          stopLabel="Stop"
                        />
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{alert.message}</p>
                      {alert.channels && alert.channels.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/80">
                          {alert.channels.map((ch, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                              {ch}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Vicinity Weather Alerts & Precipitation Telemetry */}
            <WeatherForecastWidget
              weather={weather ?? null}
              isLoading={isWeatherLoading}
              onOpenModal={onOpenWeatherModal ?? (() => setActiveTab('weather'))}
              onRefresh={onRefreshWeather ?? (() => {})}
              selectedLanguage={selectedLanguage}
            />

            {/* Giant 1-Tap SOS Button */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {t.home.immediateThreat}
              </span>

              <div className="relative inline-block my-2">
                <div className="absolute inset-0 rounded-full bg-rose-600/30 animate-ping"></div>
                <button
                  onClick={onTriggerSos}
                  className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 border-4 border-rose-400/80 shadow-2xl shadow-rose-900/80 flex flex-col items-center justify-center text-white active:scale-95 transition cursor-pointer"
                >
                  <ShieldAlert className="w-10 h-10 text-white stroke-[2.5]" />
                  <span className="font-black text-2xl tracking-wider uppercase mt-1">SOS</span>
                  <span className="text-[10px] tracking-widest text-rose-200 font-semibold">{t.home.oneTapSos}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>{t.home.abortGuard}</span>
              </div>

              {/* Quick "I'm Safe" Banner Button */}
              <button
                onClick={onOpenCheckin}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t.home.markSafe}</span>
              </button>
            </div>

            {/* Advanced Civil Defense & Survival Tools 2x2 Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  {t.home.advancedTitle}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{t.home.offlineReady}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* AI Photo Scanner */}
                <button
                  onClick={onOpenPhotoScanner}
                  className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-left transition space-y-2 group active:scale-98"
                >
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/20 transition">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white group-hover:text-rose-400 transition">
                      {t.tools.aiScanner}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {t.tools.aiScannerDesc}
                    </p>
                  </div>
                </button>

                {/* Optical SOS Beacon */}
                <button
                  onClick={onOpenBeacon}
                  className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition space-y-2 group active:scale-98"
                >
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 transition">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white group-hover:text-amber-400 transition">
                      {t.tools.beacon}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {t.tools.beaconDesc}
                    </p>
                  </div>
                </button>

                {/* Safe Evacuation Route */}
                <button
                  onClick={onOpenRoute}
                  className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-left transition space-y-2 group active:scale-98"
                >
                  <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white group-hover:text-blue-400 transition">
                      {t.tools.route}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {t.tools.routeDesc}
                    </p>
                  </div>
                </button>

                {/* 72h Survival Kit */}
                <button
                  onClick={onOpenKit}
                  className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition space-y-2 group active:scale-98"
                >
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white group-hover:text-emerald-400 transition">
                      {t.tools.kit}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {t.tools.kitDesc}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Nearest Safe Haven Card */}
            {nearestShelter && (
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" />
                    {t.home.nearestShelter}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    {nearestShelter.distanceKm || '~1.8'} km {t.home.away}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base">{nearestShelter.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {nearestShelter.capacity - nearestShelter.occupied} {t.home.spotsFree} • Facilities: {nearestShelter.facilities.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearestShelter.lat},${nearestShelter.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t.home.navigate}</span>
                  </a>
                  <a
                    href={`tel:${nearestShelter.contact}`}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.home.call}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Emergency Numbers Quick Grid */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href="tel:112"
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-center transition"
              >
                <div className="text-base font-black text-rose-400">112</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{t.home.allEmergency}</div>
              </a>
              <a
                href="tel:1070"
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-center transition"
              >
                <div className="text-base font-black text-blue-400">1070</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{t.home.disasterRelief}</div>
              </a>
              <a
                href="tel:108"
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-center transition"
              >
                <div className="text-base font-black text-emerald-400">108</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{t.home.ambulance}</div>
              </a>
            </div>
          </div>
        )}

        {/* TAB: VICINITY WEATHER FORECAST & MOVEMENT PLAN */}
        {activeTab === 'weather' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <WeatherForecastWidget
              weather={weather ?? null}
              isLoading={isWeatherLoading}
              onOpenModal={onOpenWeatherModal ?? (() => {})}
              onRefresh={onRefreshWeather ?? (() => {})}
              selectedLanguage={selectedLanguage}
            />

            {/* Quick Movement Decision Banner */}
            {weather && (
              <div className={`p-4 rounded-3xl border ${
                weather.movementDecision.safeToMove
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {weather.movementDecision.safeToMove ? '🟢 Movement Permitted' : '🔴 Movement Restricted'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80">
                    Priority: {weather.movementDecision.evacuationPriority.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-bold">{weather.movementDecision.headline}</p>
                <p className="text-xs leading-relaxed text-slate-300 mt-1">{weather.movementDecision.routeImpactAdvice}</p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span>Safe Window: <strong className="text-white">{weather.movementDecision.safeWindow}</strong></span>
                  <button
                    onClick={onOpenWeatherModal}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition text-xs"
                  >
                    Open Full Weather Radar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MAP & SHELTERS */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Map Mode Switcher */}
            <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-1 text-xs">
              <button
                onClick={() => setMobileMapMode('live')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  mobileMapMode === 'live'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>{t.mapTabs.liveMap}</span>
              </button>

              <button
                onClick={() => setMobileMapMode('google')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  mobileMapMode === 'google'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-blue-300" />
                <span>{t.mapTabs.googleMap}</span>
              </button>
            </div>

            {/* Separate Map Views */}
            {mobileMapMode === 'live' ? (
              <LiveIncidentMap
                shelters={sortedShelters}
                teams={teams}
                incidents={incidents}
                checkins={checkins}
                userLocation={userLocation}
                selectedShelterId={selectedShelterId}
                onSelectShelter={s => setSelectedShelterId(s.id)}
                heightClass="h-[360px]"
                selectedLanguage={selectedLanguage}
              />
            ) : (
              <GoogleMapsExplorer
                shelters={sortedShelters}
                userLocation={userLocation}
                selectedLanguage={selectedLanguage}
                heightClass="h-[360px]"
                onSelectShelter={s => setSelectedShelterId(s.id)}
              />
            )}

            {/* Facility Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Shelters' },
                { id: 'medical', label: '🚑 Medical Care' },
                { id: 'food', label: '🍲 Food Kitchen' },
                { id: 'water', label: '💧 Clean Water' },
                { id: 'power', label: '⚡ Generator/Solar' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFacilityFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition ${
                    facilityFilter === f.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Shelters List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Safe Zones & Relief Camps ({sortedShelters.length})
              </h3>

              {sortedShelters.map(s => {
                const isOpen = s.status === 'open';
                const isSelected = s.id === selectedShelterId;
                const free = Math.max(0, s.capacity - s.occupied);
                const percentFull = Math.min(100, Math.round((s.occupied / s.capacity) * 100));

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShelterId(s.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-slate-900 shadow-md'
                        : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-white">{s.name}</h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span>📍 {s.distanceKm || '2.0'} km away</span>
                          <span>•</span>
                          <span>{free} spots free ({percentFull}% full)</span>
                        </div>
                      </div>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition shrink-0"
                      >
                        <span>Go</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Capacity Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          percentFull > 90 ? 'bg-rose-500' : percentFull > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentFull}%` }}
                      ></div>
                    </div>

                    {/* Facilities tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {s.facilities.map((fac, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {fac}
                        </span>
                      ))}
                      <a
                        href={`tel:${s.contact}`}
                        onClick={e => e.stopPropagation()}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-blue-400 hover:underline ml-auto"
                      >
                        📞 {s.contact}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: AI SAFETY ADVISOR */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Bot className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">{t.aiAdvisor.title}</h3>
                  <p className="text-[11px] text-slate-400">{t.aiAdvisor.desc}</p>
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div className="pt-2 flex flex-wrap gap-1.5 text-xs">
                {t.aiAdvisor.quickPrompts.map((prompt: string) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendAiQuestion(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat conversation area */}
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 max-h-[380px] overflow-y-auto">
              {advisorMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white ml-8 font-medium'
                      : 'bg-slate-800/90 text-slate-200 mr-6 border border-slate-700/60'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-400" /> RakshaNet AI
                    </div>
                  )}
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
              ))}
              {isAiLoading && (
                <div className="p-3 rounded-2xl bg-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                  <span>Consulting disaster survival guidelines...</span>
                </div>
              )}
            </div>

            {/* Input bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendAiQuestion();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={advisorQuery}
                onChange={e => setAdvisorQuery(e.target.value)}
                placeholder={t.aiAdvisor.placeholder}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !advisorQuery.trim()}
                className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: OFFLINE SURVIVAL HANDBOOK */}
        {activeTab === 'handbook' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{t.handbook.title}</h3>
                <p className="text-[11px] text-slate-400">{t.handbook.subtitle}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {t.handbook.savedOffline}
              </span>
            </div>

            {/* 6 Disaster Type Selector Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(
                [
                  { type: 'flood', label: t.handbook.disasters.flood.title.split(' ')[0] || 'Flood', icon: Droplets, color: 'text-sky-400' },
                  { type: 'earthquake', label: t.handbook.disasters.earthquake.title.split(' ')[0] || 'Quake', icon: Activity, color: 'text-amber-400' },
                  { type: 'cyclone', label: t.handbook.disasters.cyclone.title.split(' ')[0] || 'Cyclone', icon: Wind, color: 'text-teal-400' },
                  { type: 'wildfire', label: t.handbook.disasters.wildfire.title.split(' ')[0] || 'Wildfire', icon: Flame, color: 'text-orange-400' },
                  { type: 'landslide', label: t.handbook.disasters.landslide.title.split(' ')[0] || 'Landslide', icon: Mountain, color: 'text-stone-300' },
                  { type: 'heatwave', label: t.handbook.disasters.heatwave.title.split(' ')[0] || 'Heatwave', icon: Sun, color: 'text-rose-400' }
                ] as const
              ).map(item => {
                const Icon = item.icon;
                const isSelected = selectedDisasterTab === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => setSelectedDisasterTab(item.type)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-slate-900 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? item.color : 'text-slate-400'}`} />
                    <span className="text-[11px] font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Guide Details */}
            {(() => {
              const guide = t.handbook.disasters[selectedDisasterTab] || SURVIVAL_HANDBOOK[selectedDisasterTab];
              const emergencyNum = SURVIVAL_HANDBOOK[selectedDisasterTab]?.emergencyNumber || '112 / 1070';
              return (
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t.handbook.survivalProtocol}</span>
                      <h4 className="font-black text-lg text-white">{guide.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">{t.handbook.emergencyHotline}</div>
                      <div className="text-xs font-bold text-rose-400">{emergencyNum}</div>
                    </div>
                  </div>

                  {/* Before */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {t.handbook.beforePhase}
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                      {guide.before.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* During */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      {t.handbook.duringPhase}
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                      {guide.during.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  {/* After */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {t.handbook.afterPhase}
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                      {guide.after.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: SAFE REGISTRY & COMMUNITY */}
        {activeTab === 'registry' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{t.registry.title}</h3>
                <p className="text-[11px] text-slate-400">{t.registry.subtitle}</p>
              </div>
              <button
                onClick={onOpenCheckin}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
              >
                {t.registry.checkinBtn}
              </button>
            </div>

            {/* Search filter */}
            <input
              type="text"
              value={registrySearch}
              onChange={e => setRegistrySearch(e.target.value)}
              placeholder={t.registry.searchPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
            />

            {/* Check-ins list */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto">
              {filteredCheckins.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  {t.registry.noResults}
                </div>
              ) : (
                filteredCheckins.map(chk => {
                  const isSafe = chk.status === 'Safe' || chk.status === 'At Shelter';
                  return (
                    <div
                      key={chk.id}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{chk.name}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {chk.status}
                        </span>
                      </div>

                      {chk.notes && (
                        <p className="text-xs text-slate-300 italic">"{chk.notes}"</p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>Time: {new Date(chk.time).toLocaleTimeString()}</span>
                        <span>{chk.synced ? 'Synced to Hub' : 'Queued (Offline)'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800">
        <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'sos' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.mobileNav.sos}</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'weather' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Weather</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'map' ? 'text-blue-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.mobileNav.map}</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'ai' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.mobileNav.ai}</span>
          </button>

          <button
            onClick={() => setActiveTab('handbook')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'handbook' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.mobileNav.handbook}</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'registry' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.mobileNav.registry}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
