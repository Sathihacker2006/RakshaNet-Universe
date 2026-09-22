import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Home, 
  Users, 
  Radio, 
  RotateCcw, 
  Layers, 
  TrendingUp, 
  AlertCircle, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Zap, 
  Droplets, 
  Wind, 
  Flame, 
  Mountain, 
  Sun,
  Truck,
  FileText,
  Camera,
  Navigation,
  Briefcase,
  Sliders,
  MessageSquare,
  Bot,
  Volume2,
  CloudRain
} from 'lucide-react';
import { Shelter, ReliefTeam, SensorData, Incident, EmergencyAlert, CitizenCheckin, AgentLog, DamageAssessment, DisasterType, VicinityWeatherForecast } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { LiveIncidentMap } from './LiveIncidentMap';
import { GoogleMapsExplorer } from './GoogleMapsExplorer';
import { EmergencyChatbot } from './EmergencyChatbot';
import { getTranslation } from '../data/translations';
import { AlertReadAloudButton } from './AlertReadAloudButton';
import { WeatherForecastWidget } from './WeatherForecastWidget';

interface WebDashboardViewProps {
  shelters: Shelter[];
  teams: ReliefTeam[];
  sensors: SensorData[];
  incidents: Incident[];
  alerts: EmergencyAlert[];
  checkins: CitizenCheckin[];
  logs: AgentLog[];
  assessments: DamageAssessment[];
  userLocation: { lat: number; lng: number } | null;
  selectedLanguage?: string;
  onSimulate: (type: DisasterType) => void;
  onReset: () => void;
  isSimulating: boolean;
  onUpdateShelterOccupancy?: (id: string, newOccupied: number) => void;
  onToggleTeamStatus?: (id: string) => void;
  onOpenPhotoScanner?: () => void;
  onOpenBeacon?: () => void;
  onOpenKit?: () => void;
  onOpenRoute?: () => void;
  onUpdateSensor?: (sensorId: string, value: number) => void;
  weather?: VicinityWeatherForecast | null;
  isWeatherLoading?: boolean;
  onOpenWeatherModal?: () => void;
  onRefreshWeather?: (useGps?: boolean) => void;
}

export const WebDashboardView: React.FC<WebDashboardViewProps> = ({
  shelters,
  teams,
  sensors,
  incidents,
  alerts,
  checkins,
  logs,
  assessments,
  userLocation,
  selectedLanguage = 'en',
  onSimulate,
  onReset,
  isSimulating,
  onToggleTeamStatus,
  onOpenPhotoScanner,
  onOpenBeacon,
  onOpenKit,
  onOpenRoute,
  onUpdateSensor,
  weather,
  isWeatherLoading = false,
  onOpenWeatherModal,
  onRefreshWeather
}) => {
  const t = getTranslation(selectedLanguage);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('ALL');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [mapViewMode, setMapViewMode] = useState<'live' | 'google' | 'dual'>('live');

  const activeIncident = incidents[0] || null;
  const latestAssessment = assessments[0] || null;

  const openShelters = shelters.filter(s => s.status === 'open');
  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const percentCapacityOccupied = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const activeTeams = teams.filter(t => t.status !== 'standby');

  // Filter logs
  const filteredLogs = logs.filter(l => {
    if (selectedAgentFilter === 'ALL') return true;
    return l.agent === selectedAgentFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Stat Bento Cards - Fully Localized */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Active Incidents */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-bold tracking-wider">{t.dashboard.activeIncidents}</span>
            <span className={`w-2 h-2 rounded-full ${activeIncident ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {incidents.length}
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-1">
            {activeIncident ? `${activeIncident.type.toUpperCase()} ${t.dashboard.verified}` : t.dashboard.normalStandby}
          </div>
        </div>

        {/* Metric 2: Shelters Capacity */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-bold tracking-wider">{t.dashboard.sheltersOpen}</span>
            <span className="text-[11px] font-bold text-emerald-400">
              {openShelters.length} / {shelters.length}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {totalCapacity - totalOccupied} <span className="text-sm font-medium text-slate-400">{t.dashboard.bedsFree}</span>
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-1">
            {percentCapacityOccupied}% {t.dashboard.capacityOccupied} ({totalCapacity.toLocaleString()})
          </div>
        </div>

        {/* Metric 3: Relief Teams */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-bold tracking-wider">{t.dashboard.ndrfDeployed}</span>
            <span className="text-[11px] font-bold text-indigo-400">{activeTeams.length} deployed</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {teams.reduce((acc, t) => acc + t.members, 0)} <span className="text-sm font-medium text-slate-400">{t.dashboard.personnel}</span>
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-1">
            {teams.length} {t.dashboard.deployedUnits}
          </div>
        </div>

        {/* Metric 4: Citizen Check-ins */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-bold tracking-wider">{t.dashboard.citizenRegistry}</span>
            <span className="text-[11px] font-bold text-blue-400">{t.dashboard.liveLedger}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {checkins.length}
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-1">
            {checkins.filter(c => c.status === 'Safe').length} {t.dashboard.markedSafeDesc} • {checkins.filter(c => c.status === 'Need Help').length} SOS
          </div>
        </div>

        {/* Metric 5: Sensor Feeds */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-bold tracking-wider">{t.dashboard.earlyWarning}</span>
            <span className="text-[11px] font-bold text-amber-400">6 Sensors</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {sensors.filter(s => s.status !== 'normal').length} <span className="text-sm font-medium text-slate-400">{t.dashboard.anomalies}</span>
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-1">
            {t.dashboard.multiHazardScan}
          </div>
        </div>
      </div>

      {/* 5 AI Agent Orchestration Pipeline & Simulation Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Zap className="w-5 h-5 text-rose-400" />
            </span>
            <div>
              <h2 className="font-extrabold text-base text-white">{t.dashboard.aiAgentsTitle}</h2>
              <p className="text-xs text-slate-400">{t.dashboard.aiAgentsDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChatbotOpen(true)}
              id="btn-open-chatbot-top"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md transition active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t.dashboard.openChatbot}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px]">AI</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.dashboard.resetDemo}</span>
            </button>
          </div>
        </div>

        {/* 5-Agent Interactive Visual Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            {
              name: 'DETECTION',
              title: selectedLanguage === 'hi' ? 'डिटेक्शन एजेंट' : selectedLanguage === 'mr' ? 'डिटेक्शन एजंट' : selectedLanguage === 'bn' ? 'শনাক্তকারী এজেন্ট' : selectedLanguage === 'ta' ? 'கண்டறிதல் ஏஜெண்ட்' : 'Detection Agent',
              desc: selectedLanguage === 'hi' ? 'सेंसर व विसंगति स्कैन' : selectedLanguage === 'mr' ? 'सेन्सर्स व विसंगती तपासणी' : 'Telemetry & Anomaly Scan',
              color: 'rose',
              status: activeIncident ? (selectedLanguage === 'hi' ? 'ट्रिगर हुआ' : 'Triggered') : (selectedLanguage === 'hi' ? '24/7 सक्रिय स्कैन' : 'Scanning 24/7')
            },
            {
              name: 'COORDINATION',
              title: selectedLanguage === 'hi' ? 'समन्वय एजेंट' : selectedLanguage === 'mr' ? 'समन्वय एजंट' : selectedLanguage === 'bn' ? 'সমন্বয়কারী এজেন্ট' : selectedLanguage === 'ta' ? 'ஒருங்கிணைப்பு ஏஜெண்ட்' : 'Coordination Agent',
              desc: selectedLanguage === 'hi' ? 'गंभीरता व निकासी परिधि' : selectedLanguage === 'mr' ? 'तीव्रता व बाहेर पडण्याची हद्द' : 'Severity & Perimeter Evac',
              color: 'blue',
              status: activeIncident ? (selectedLanguage === 'hi' ? 'सक्रिय आपातकाल' : 'Active Incident') : (selectedLanguage === 'hi' ? 'स्टैंडबाय' : 'Standby')
            },
            {
              name: 'COMMUNICATION',
              title: selectedLanguage === 'hi' ? 'संचार एजेंट' : selectedLanguage === 'mr' ? 'संवाद एजंट' : selectedLanguage === 'bn' ? 'যোগাযোগ এজেন্ট' : selectedLanguage === 'ta' ? 'தகவல் தொடர்பு ஏஜெண்ட்' : 'Comms Agent',
              desc: selectedLanguage === 'hi' ? '5 भाषाओं में सायरन व चेतावनी' : selectedLanguage === 'mr' ? '5 भाषांमध्ये अलर्ट व सायरन' : 'Multilingual Siren & SMS',
              color: 'emerald',
              status: activeIncident ? (selectedLanguage === 'hi' ? '5 भाषाओं में प्रसारण' : 'Broadcasting 5 Langs') : (selectedLanguage === 'hi' ? 'स्टैंडबाय' : 'Standby')
            },
            {
              name: 'RESOURCE',
              title: selectedLanguage === 'hi' ? 'संसाधन एजेंट' : selectedLanguage === 'mr' ? 'संसाधन एजंट' : selectedLanguage === 'bn' ? 'সম্পদ বিতরণ এজেন্ট' : selectedLanguage === 'ta' ? 'வள மேலாண்மை ஏஜெண்ட்' : 'Resource Agent',
              desc: selectedLanguage === 'hi' ? 'आश्रय व एनडीआरएफ टीम प्रेषण' : selectedLanguage === 'mr' ? 'निवारे व पथके वाटप' : 'Shelters & Teams Dispatch',
              color: 'amber',
              status: activeIncident ? (selectedLanguage === 'hi' ? 'दस्ते रवाना' : 'Dispatched') : (selectedLanguage === 'hi' ? 'स्टैंडबाय' : 'Standby')
            },
            {
              name: 'ASSESSMENT',
              title: selectedLanguage === 'hi' ? 'आकलन एजेंट' : selectedLanguage === 'mr' ? 'मोजमाप एजंट' : selectedLanguage === 'bn' ? 'ক্ষয়ক্ষতি মূল্যায়ন এজেন্ট' : selectedLanguage === 'ta' ? 'சேத மதிப்பீட்டு ஏஜெண்ட்' : 'Assessment Agent',
              desc: selectedLanguage === 'hi' ? 'नुकसान व आर्थिक क्षति गणना' : selectedLanguage === 'mr' ? 'नुकसान व आर्थिक तोटा' : 'Damage & Economic Loss',
              color: 'purple',
              status: latestAssessment ? (selectedLanguage === 'hi' ? 'स्कोर तैयार' : 'Score Calculated') : (selectedLanguage === 'hi' ? 'स्टैंडबाय' : 'Standby')
            }
          ].map(agent => (
            <div
              key={agent.name}
              className={`p-3 rounded-2xl border transition ${
                activeIncident
                  ? 'border-slate-700 bg-slate-800/80 shadow'
                  : 'border-slate-800/80 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-black text-slate-400 tracking-wider uppercase">{agent.name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeIncident ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                  }`}
                />
              </div>
              <div className="font-bold text-xs text-white">{agent.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{agent.desc}</div>
              <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 inline-block">
                {agent.status}
              </div>
            </div>
          ))}
        </div>

        {/* Multi-Hazard Simulation Triggers */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>{t.dashboard.simulateTitle}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { type: 'flood', label: `🌊 ${t.handbook.disasters.flood?.title || 'Flood'}`, color: 'hover:bg-blue-600 hover:text-white' },
              { type: 'earthquake', label: `🌋 ${t.handbook.disasters.earthquake?.title || 'Earthquake'}`, color: 'hover:bg-amber-600 hover:text-white' },
              { type: 'cyclone', label: `🌀 ${t.handbook.disasters.cyclone?.title || 'Cyclone'}`, color: 'hover:bg-teal-600 hover:text-white' },
              { type: 'wildfire', label: `🔥 ${t.handbook.disasters.wildfire?.title || 'Wildfire'}`, color: 'hover:bg-orange-600 hover:text-white' },
              { type: 'landslide', label: `⛰️ ${t.handbook.disasters.landslide?.title || 'Landslide'}`, color: 'hover:bg-stone-600 hover:text-white' },
              { type: 'heatwave', label: `☀️ ${t.handbook.disasters.heatwave?.title || 'Heatwave'}`, color: 'hover:bg-rose-600 hover:text-white' }
            ].map(btn => (
              <button
                key={btn.type}
                disabled={isSimulating}
                onClick={() => onSimulate(btn.type as DisasterType)}
                className={`px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50 ${btn.color}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tactical Mission Tools Bar */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400">{t.dashboard.tacticalTools}</span>
          <div className="flex flex-wrap items-center gap-2">
            {onOpenWeatherModal && (
              <button
                onClick={onOpenWeatherModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/70 hover:bg-sky-900/70 border border-sky-700/70 text-sky-200 text-xs font-bold transition shadow-sm"
              >
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>Weather & Precipitation</span>
              </button>
            )}
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 text-xs font-bold transition"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.dashboard.openChatbot}</span>
            </button>
            <button
              onClick={onOpenPhotoScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.tools.aiScanner}</span>
            </button>
            <button
              onClick={onOpenRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 text-xs font-semibold transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.tools.route}</span>
            </button>
            <button
              onClick={onOpenBeacon}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-semibold transition"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{t.tools.beacon}</span>
            </button>
            <button
              onClick={onOpenKit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold transition"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t.tools.kit}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vicinity Weather Forecast, Precipitation & Movement Decision Overview */}
      <WeatherForecastWidget
        weather={weather ?? null}
        isLoading={isWeatherLoading}
        onOpenModal={onOpenWeatherModal ?? (() => {})}
        onRefresh={onRefreshWeather ?? (() => {})}
        selectedLanguage={selectedLanguage}
      />

      {/* Center 2-Column Grid: Left Map & Incident, Right Shelters & Telemetry Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Map & Incident Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map Section: Separate Live Map & Google Map with Dual View Option */}
          <div className="space-y-3">
            {/* Map Mode Tabs Header */}
            <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800/80">
                <button
                  onClick={() => setMapViewMode('live')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    mapViewMode === 'live'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <span>{t.mapTabs.liveMap}</span>
                </button>

                <button
                  onClick={() => setMapViewMode('google')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    mapViewMode === 'google'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-blue-300" />
                  <span>{t.mapTabs.googleMap}</span>
                </button>

                <button
                  onClick={() => setMapViewMode('dual')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    mapViewMode === 'dual'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-300" />
                  <span>{t.mapTabs.dualView}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 px-2 font-medium">
                {mapViewMode === 'live' && (t.mapTabs.liveMapDesc || 'Real-time hazard zones & units')}
                {mapViewMode === 'google' && (t.mapTabs.googleMapDesc || 'Search address & find nearest shelter')}
                {mapViewMode === 'dual' && (t.mapTabs.dualViewDesc || 'Side-by-side tactical & Google Maps')}
              </div>
            </div>

            {/* Map Rendering Container */}
            {mapViewMode === 'live' && (
              <LiveIncidentMap
                shelters={shelters}
                teams={teams}
                incidents={incidents}
                checkins={checkins}
                userLocation={userLocation}
                selectedShelterId={selectedShelterId}
                onSelectShelter={s => setSelectedShelterId(s.id)}
                heightClass="h-[480px]"
                selectedLanguage={selectedLanguage}
              />
            )}

            {mapViewMode === 'google' && (
              <GoogleMapsExplorer
                shelters={shelters}
                userLocation={userLocation}
                selectedLanguage={selectedLanguage}
                heightClass="h-[480px]"
                onSelectShelter={s => setSelectedShelterId(s.id)}
              />
            )}

            {mapViewMode === 'dual' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 px-1">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>1. {t.mapTabs.liveMap}</span>
                  </div>
                  <LiveIncidentMap
                    shelters={shelters}
                    teams={teams}
                    incidents={incidents}
                    checkins={checkins}
                    userLocation={userLocation}
                    selectedShelterId={selectedShelterId}
                    onSelectShelter={s => setSelectedShelterId(s.id)}
                    heightClass="h-[380px]"
                    selectedLanguage={selectedLanguage}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 px-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>2. {t.mapTabs.googleMap}</span>
                  </div>
                  <GoogleMapsExplorer
                    shelters={shelters}
                    userLocation={userLocation}
                    selectedLanguage={selectedLanguage}
                    heightClass="h-[380px]"
                    onSelectShelter={s => setSelectedShelterId(s.id)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Current Incident & Impact Summary */}
          {activeIncident ? (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider">
                    {activeIncident.severity}
                  </span>
                  <h4 className="font-bold text-white text-base">
                    Incident #{activeIncident.incidentId} — {activeIncident.type.toUpperCase()}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(activeIncident.timestamp).toLocaleTimeString()}
                  </span>
                  <AlertReadAloudButton
                    alert={alerts.find(a => a.lang === selectedLanguage) || alerts[0] || {
                      id: 'INC-' + activeIncident.incidentId,
                      incidentId: activeIncident.incidentId,
                      type: activeIncident.type,
                      severity: activeIncident.severity,
                      lang: selectedLanguage || 'en',
                      message: `Emergency Alert: Critical ${activeIncident.type} danger identified near ${activeIncident.location}. Evacuate perimeter immediately.`,
                      timestamp: activeIncident.timestamp,
                      channels: ['Civil Defense Sirens', 'Mobile Voice Broadcast']
                    }}
                    actionPlanText={activeIncident.actionPlan?.immediateAction}
                    variant="pill"
                    label="Read Aloud"
                    stopLabel="Stop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Location</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeIncident.location}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Radius</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeIncident.impactRadiusKm} km</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Pop. Affected</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeIncident.affectedPopulation?.toLocaleString() || '15,000'}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 flex items-center justify-between gap-3">
                <div>
                  <b>Immediate Action Protocol:</b> {activeIncident.actionPlan?.immediateAction}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-center py-8">
              <p className="text-xs text-slate-400">
                {t.dashboard.noActiveIncident}
              </p>
            </div>
          )}

          {/* Active Multilingual Voice Broadcasts Panel */}
          {alerts.length > 0 && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  <span>Multilingual Emergency Voice Broadcasts ({alerts.length})</span>
                </h4>
                <span className="text-xs font-semibold text-slate-400">Web Speech API</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                          {alert.severity}
                        </span>
                        <span className="text-slate-500 uppercase font-mono font-bold">[{alert.lang}]</span>
                        <span className="text-slate-500 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-2">{alert.message}</p>
                    </div>
                    <AlertReadAloudButton
                      alert={alert}
                      actionPlanText={activeIncident?.actionPlan?.immediateAction}
                      variant="subtle"
                      label="Read"
                      stopLabel="Stop"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Damage Assessment Card */}
          {latestAssessment && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>{t.dashboard.damageTriageTitle}</span>
                </h4>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {t.dashboard.reliefPriority}: {latestAssessment.priorityForRelief}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{t.dashboard.damageScore}</span>
                  <div className="font-black text-xl text-white mt-0.5">{latestAssessment.damageScore} / 100</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{t.dashboard.estLoss}</span>
                  <div className="font-black text-xl text-rose-400 mt-0.5">
                    ₹{(latestAssessment.estimatedLossINR / 100000).toFixed(1)}L
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{t.dashboard.affectedHomes}</span>
                  <div className="font-black text-xl text-white mt-0.5">{latestAssessment.affectedHomes}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{t.dashboard.blockedRoutes}</span>
                  <div className="font-black text-xl text-amber-400 mt-0.5">{latestAssessment.blockedRoads}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400">{t.dashboard.agentRecs}</div>
                <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
                  {latestAssessment.recommendations.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Live Telemetry Logs & Relief Resource Manager */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Agent Logs Stream */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{t.dashboard.liveTelemetryTitle}</span>
              </h3>
              <select
                value={selectedAgentFilter}
                onChange={e => setSelectedAgentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="ALL">{t.dashboard.allAgents}</option>
                <option value="ORCHESTRATOR">Orchestrator</option>
                <option value="DETECTION">Detection</option>
                <option value="COORDINATION">Coordination</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="RESOURCE">Resource</option>
                <option value="ASSESSMENT">Assessment</option>
              </select>
            </div>

            <div className="h-[280px] overflow-y-auto font-mono text-[11px] space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center pt-8">{t.dashboard.noLogEvents}</div>
              ) : (
                filteredLogs.map(log => {
                  const agentColor =
                    log.agent === 'DETECTION'
                      ? 'text-rose-400'
                      : log.agent === 'COORDINATION'
                      ? 'text-blue-400'
                      : log.agent === 'COMMUNICATION'
                      ? 'text-emerald-400'
                      : log.agent === 'RESOURCE'
                      ? 'text-amber-400'
                      : log.agent === 'ASSESSMENT'
                      ? 'text-purple-400'
                      : 'text-slate-400';

                  return (
                    <div key={log.id} className="leading-relaxed border-b border-slate-900 pb-1.5">
                      <span className="text-slate-600">[{log.time}]</span>{' '}
                      <span className={`font-bold ${agentColor}`}>[{log.agent}]</span>{' '}
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Shelters & Safe Zones Manager */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                <span>{t.dashboard.shelterNetwork} ({shelters.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {shelters.map(s => {
                const isOpen = s.status === 'open';
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShelterId(s.id)}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Occupancy: <b>{s.occupied} / {s.capacity}</b> • Facilities: {s.facilities.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relief Response Teams Dispatcher */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>{t.dashboard.reliefTeams} ({teams.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {teams.map(t => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-white">{t.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {t.members} Responders • {t.equipment.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleTeamStatus && onToggleTeamStatus(t.id)}
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition ${
                      t.status === 'on-mission'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : t.status === 'deployed'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Emergency AI Chatbot Launcher for Command Center */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        id="btn-floating-chatbot"
        aria-label="Open Emergency AI Chatbot"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs sm:text-sm shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-indigo-400/40 hover:scale-105 active:scale-95 transition"
      >
        <span className="relative flex items-center justify-center">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </span>
        <span className="hidden sm:inline">{t.chatbot.title}</span>
        <span className="sm:hidden">{t.dashboard.openChatbot}</span>
      </button>

      {/* Emergency Chatbot Modal */}
      <EmergencyChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        selectedLanguage={selectedLanguage}
        shelters={shelters}
        incidents={incidents}
        sensors={sensors}
        userLocation={userLocation}
      />
    </div>
  );
};
