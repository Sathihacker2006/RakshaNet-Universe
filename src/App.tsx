import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchShelters, 
  fetchTeams, 
  fetchSensors, 
  fetchIncidents, 
  fetchAlerts, 
  fetchLogs, 
  fetchAssessments, 
  fetchCitizenCheckins,
  simulateDisaster, 
  resetSystem,
  fetchVicinityWeather
} from './services/api';
import { 
  Shelter, 
  ReliefTeam, 
  SensorData, 
  Incident, 
  EmergencyAlert, 
  CitizenCheckin, 
  AgentLog, 
  DamageAssessment, 
  DisasterType,
  VicinityWeatherForecast
} from './types';
import { Header } from './components/Header';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { MobileAppView } from './components/MobileAppView';
import { WebDashboardView } from './components/WebDashboardView';
import { SosModal } from './components/SosModal';
import { CheckinModal } from './components/CheckinModal';
import { PhotoDamageScanner } from './components/PhotoDamageScanner';
import { EmergencyBeaconModal } from './components/EmergencyBeaconModal';
import { SafeRouteModal } from './components/SafeRouteModal';
import { EmergencyKitDrawer } from './components/EmergencyKitDrawer';
import { OfflineMapCacheModal } from './components/OfflineMapCacheModal';
import { WeatherForecastModal } from './components/WeatherForecastModal';
import { 
  initLeafletTileCaching, 
  getTileCacheStats, 
  cacheCriticalAreas, 
  TileCacheStats 
} from './services/tileCache';
import { updateSensorTelemetry } from './services/api';
import { Download, Smartphone } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'mobile' | 'dashboard'>('mobile');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Application Data States
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [teams, setTeams] = useState<ReliefTeam[]>([]);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [checkins, setCheckins] = useState<CitizenCheckin[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [assessments, setAssessments] = useState<DamageAssessment[]>([]);

  // Modals & User GPS
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState<boolean>(false);
  const [isPhotoScannerOpen, setIsPhotoScannerOpen] = useState<boolean>(false);
  const [isBeaconOpen, setIsBeaconOpen] = useState<boolean>(false);
  const [isRouteOpen, setIsRouteOpen] = useState<boolean>(false);
  const [isKitOpen, setIsKitOpen] = useState<boolean>(false);
  const [isMapCacheOpen, setIsMapCacheOpen] = useState<boolean>(false);
  const [tileCacheStats, setTileCacheStats] = useState<TileCacheStats>({
    totalTiles: 0,
    estimatedSizeMB: 0,
    lastUpdated: null,
    areas: [],
    isCaching: false
  });
  const [selectedShelterForRoute, setSelectedShelterForRoute] = useState<Shelter | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Weather Forecast & Precipitation States
  const [weather, setWeather] = useState<VicinityWeatherForecast | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState<boolean>(false);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  // Load all telemetry & status
  const loadData = useCallback(async () => {
    try {
      const [sList, tList, snList, incList, altList, chkList, lgList, asmList] = await Promise.all([
        fetchShelters(),
        fetchTeams(),
        fetchSensors(),
        fetchIncidents(),
        fetchAlerts(),
        fetchCitizenCheckins(),
        fetchLogs(),
        fetchAssessments()
      ]);

      setShelters(sList);
      setTeams(tList);
      setSensors(snList);
      setIncidents(incList);
      setAlerts(altList);
      setCheckins(chkList);
      setLogs(lgList);
      setAssessments(asmList);
    } catch (e) {
      console.warn('Error fetching telemetry from API, offline fallback retained:', e);
    }
  }, []);

  // Fetch real-time weather alerts & precipitation for vicinity
  const loadWeather = useCallback(async (useGps = false) => {
    setIsWeatherLoading(true);
    try {
      let lat = userLocation?.lat ?? 19.076;
      let lng = userLocation?.lng ?? 72.8777;

      if (useGps && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
        } catch (gpsErr) {
          console.warn('GPS query timed out or declined, continuing with cached location:', gpsErr);
        }
      }

      const forecast = await fetchVicinityWeather(lat, lng, useGps);
      setWeather(forecast);
    } catch (e) {
      console.warn('Weather fetch error, using fallback:', e);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [userLocation, incidents]);

  // Periodic weather refresh
  useEffect(() => {
    loadWeather();
    const weatherTimer = setInterval(() => {
      loadWeather();
    }, 45000);
    return () => clearInterval(weatherTimer);
  }, [loadWeather]);

  // Initial mount & GPS
  useEffect(() => {
    // 1. Initialize Leaflet offline tile caching engine
    initLeafletTileCaching();
    getTileCacheStats().then(setTileCacheStats);

    loadData();

    // Acquire GPS location
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        err => {
          console.warn('GPS location declined or restricted, defaulting to regional hub coordinates:', err);
          setUserLocation({ lat: 19.076, lng: 72.8777 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocation({ lat: 19.076, lng: 72.8777 });
    }

    // PWA BeforeInstallPrompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Refresh telemetry every 8 seconds
    const interval = setInterval(loadData, 8000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearInterval(interval);
    };
  }, [loadData]);

  // Automated background caching of critical navigation areas (user origin, safe shelters, hazard zones)
  useEffect(() => {
    if (shelters.length === 0 && !userLocation) return;

    getTileCacheStats().then(stats => {
      setTileCacheStats(stats);
      // If no tiles cached yet and device is online, automatically cache critical navigation zones
      if (stats.totalTiles === 0 && typeof navigator !== 'undefined' && navigator.onLine) {
        const critical = [
          ...(userLocation ? [{ name: 'User Vicinity (Origin)', lat: userLocation.lat, lng: userLocation.lng }] : []),
          ...shelters.slice(0, 5).map(s => ({ name: s.name, lat: s.lat, lng: s.lng })),
          ...incidents.slice(0, 2).map(i => ({ name: `${i.type.toUpperCase()} Hazard: ${i.location}`, lat: i.lat, lng: i.lng }))
        ];
        if (critical.length > 0) {
          cacheCriticalAreas(critical).then(() => {
            getTileCacheStats().then(setTileCacheStats);
          });
        }
      }
    });
  }, [shelters, incidents, userLocation]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleSimulate = async (type: DisasterType) => {
    setIsSimulating(true);
    try {
      await simulateDisaster(type);
      await loadData();
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetSystem();
      await loadData();
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  const handleToggleTeamStatus = (teamId: string) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id !== teamId) return t;
        const nextStatus =
          t.status === 'standby' ? 'deployed' : t.status === 'deployed' ? 'on-mission' : 'standby';
        return { ...t, status: nextStatus };
      })
    );
  };

  const activeIncident = incidents[0] || null;
  const activeAlert = useMemo(() => {
    const match = alerts.filter(a => a.lang === selectedLanguage);
    return match.length > 0 ? match[0] : (alerts.length > 0 ? alerts[0] : null);
  }, [alerts, selectedLanguage]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Offline Sync Banner */}
      <OfflineSyncBanner 
        onSyncComplete={loadData}
        onOpenMapCache={() => setIsMapCacheOpen(true)}
        cachedTileCount={tileCacheStats.totalTiles}
      />

      {/* Primary Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(prev => !prev)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        activeIncident={activeIncident}
        activeAlert={activeAlert}
        onTriggerSos={() => setIsSosOpen(true)}
        onOpenCheckin={() => setIsCheckinOpen(true)}
        onOpenPhotoScanner={() => setIsPhotoScannerOpen(true)}
        onOpenBeacon={() => setIsBeaconOpen(true)}
        onOpenRoute={() => setIsRouteOpen(true)}
        onOpenKit={() => setIsKitOpen(true)}
        onOpenMapCache={() => setIsMapCacheOpen(true)}
        cachedTileCount={tileCacheStats.totalTiles}
        onOpenWeather={() => setIsWeatherModalOpen(true)}
        weatherPillText={weather ? `${Math.round(weather.current.temperature)}°C • ${weather.current.precipitationMm.toFixed(1)} mm/h` : undefined}
      />

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-rose-950 to-slate-900 border-b border-rose-800/80 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-rose-400" />
            <span>Install RakshaNet Mobile PWA for complete offline disaster readiness!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 transition"
            >
              <Download className="w-3 h-3" />
              <span>Install PWA</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-slate-400 hover:text-white text-xs px-1.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        {currentView === 'mobile' ? (
          isMobileFrame ? (
            /* Simulated Smartphone Device Mockup */
            <div className="py-8 px-4 flex justify-center w-full">
              <div className="w-full max-w-[420px] rounded-[48px] bg-slate-900 border-[10px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative min-h-[740px]">
                {/* Simulated Phone Notch / Dynamic Island */}
                <div className="w-full h-7 bg-slate-950 flex items-center justify-center relative">
                  <div className="w-24 h-4 rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-slate-800 inline-block mr-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60 inline-block" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <MobileAppView
                    shelters={shelters}
                    teams={teams}
                    incidents={incidents}
                    alerts={alerts}
                    checkins={checkins}
                    userLocation={userLocation}
                    selectedLanguage={selectedLanguage}
                    onTriggerSos={() => setIsSosOpen(true)}
                    onOpenCheckin={() => setIsCheckinOpen(true)}
                    onOpenPhotoScanner={() => setIsPhotoScannerOpen(true)}
                    onOpenBeacon={() => setIsBeaconOpen(true)}
                    onOpenRoute={() => setIsRouteOpen(true)}
                    onOpenKit={() => setIsKitOpen(true)}
                    onSelectShelter={s => {
                      setSelectedShelterForRoute(s);
                      setIsRouteOpen(true);
                    }}
                    weather={weather}
                    isWeatherLoading={isWeatherLoading}
                    onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
                    onRefreshWeather={loadWeather}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Fluid Full-Width Mobile Experience */
            <MobileAppView
              shelters={shelters}
              teams={teams}
              incidents={incidents}
              alerts={alerts}
              checkins={checkins}
              userLocation={userLocation}
              selectedLanguage={selectedLanguage}
              onTriggerSos={() => setIsSosOpen(true)}
              onOpenCheckin={() => setIsCheckinOpen(true)}
              onOpenPhotoScanner={() => setIsPhotoScannerOpen(true)}
              onOpenBeacon={() => setIsBeaconOpen(true)}
              onOpenRoute={() => setIsRouteOpen(true)}
              onOpenKit={() => setIsKitOpen(true)}
              onSelectShelter={s => {
                setSelectedShelterForRoute(s);
                setIsRouteOpen(true);
              }}
              weather={weather}
              isWeatherLoading={isWeatherLoading}
              onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
              onRefreshWeather={loadWeather}
            />
          )
        ) : (
          /* Web Dashboard Command Center */
          <WebDashboardView
            shelters={shelters}
            teams={teams}
            sensors={sensors}
            incidents={incidents}
            alerts={alerts}
            checkins={checkins}
            logs={logs}
            assessments={assessments}
            userLocation={userLocation}
            selectedLanguage={selectedLanguage}
            onSimulate={handleSimulate}
            onReset={handleReset}
            isSimulating={isSimulating}
            onToggleTeamStatus={handleToggleTeamStatus}
            onOpenPhotoScanner={() => setIsPhotoScannerOpen(true)}
            onOpenBeacon={() => setIsBeaconOpen(true)}
            onOpenRoute={() => setIsRouteOpen(true)}
            onOpenKit={() => setIsKitOpen(true)}
            onUpdateSensor={async (sensorId, val) => {
              try {
                const updated = await updateSensorTelemetry(sensorId, val);
                setSensors(updated);
              } catch (e) {
                console.error(e);
              }
            }}
            weather={weather}
            isWeatherLoading={isWeatherLoading}
            onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
            onRefreshWeather={loadWeather}
          />
        )}
      </main>

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        userLocation={userLocation}
        onSuccessCheckin={loadData}
      />

      {/* "I'm Safe" Citizen Check-in Modal */}
      <CheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        userLocation={userLocation}
        onCheckinSuccess={loadData}
      />

      {/* AI Multimodal Photo Damage & Collapse Hazard Scanner */}
      <PhotoDamageScanner
        isOpen={isPhotoScannerOpen}
        onClose={() => setIsPhotoScannerOpen(false)}
        userLocation={userLocation}
        onReportCreated={() => loadData()}
      />

      {/* Optical Morse Code SOS Rescue Strobe & Torch */}
      <EmergencyBeaconModal
        isOpen={isBeaconOpen}
        onClose={() => setIsBeaconOpen(false)}
      />

      {/* Evacuation Safe Corridor & Hazard Avoidance Navigation */}
      <SafeRouteModal
        isOpen={isRouteOpen}
        onClose={() => setIsRouteOpen(false)}
        shelters={shelters}
        selectedShelter={selectedShelterForRoute}
        userLocation={userLocation}
        incidents={incidents}
      />

      {/* 72-Hour Survival Go-Bag Readiness Checklist */}
      <EmergencyKitDrawer
        isOpen={isKitOpen}
        onClose={() => setIsKitOpen(false)}
      />

      {/* Offline Map Tile Caching & Offline Navigation Engine */}
      <OfflineMapCacheModal
        isOpen={isMapCacheOpen}
        onClose={() => setIsMapCacheOpen(false)}
        shelters={shelters}
        incidents={incidents}
        userLocation={userLocation}
        onCacheUpdated={() => {
          getTileCacheStats().then(setTileCacheStats);
        }}
      />

      {/* Real-time Vicinity Weather Radar, Alerts & Movement Decision Modal */}
      <WeatherForecastModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        weather={weather}
        isLoading={isWeatherLoading}
        onRefresh={loadWeather}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}
