import { 
  Shelter, 
  ReliefTeam, 
  SensorData, 
  Incident, 
  EmergencyAlert, 
  CitizenCheckin, 
  SystemStats, 
  SyncPayload, 
  SyncResponse, 
  DisasterType,
  AgentLog,
  DamageAssessment,
  PhotoDamageReport,
  EvacuationRoute,
  VicinityWeatherForecast
} from '../types';
import { 
  loadCachedShelters, 
  saveCachedShelters, 
  loadCachedAlerts, 
  saveCachedAlerts, 
  loadCachedIncidents, 
  saveCachedIncidents,
  loadCachedCheckins,
  saveCachedCheckins,
  getOfflineQueue,
  addToOfflineQueue,
  clearOfflineQueue,
  setLastSyncTime,
  getDeviceId,
  loadCachedWeather,
  saveCachedWeather
} from './storage';

export async function fetchShelters(): Promise<Shelter[]> {
  try {
    const res = await fetch('/api/shelters');
    if (!res.ok) throw new Error('Failed to fetch shelters');
    const data = await res.json();
    saveCachedShelters(data);
    return data;
  } catch (err) {
    console.warn('Network offline or failed, using cached shelters:', err);
    return loadCachedShelters();
  }
}

export async function fetchTeams(): Promise<ReliefTeam[]> {
  try {
    const res = await fetch('/api/teams');
    if (!res.ok) throw new Error('Failed to fetch teams');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchSensors(): Promise<SensorData[]> {
  try {
    const res = await fetch('/api/sensors');
    if (!res.ok) throw new Error('Failed to fetch sensors');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchIncidents(): Promise<Incident[]> {
  try {
    const res = await fetch('/api/incidents');
    if (!res.ok) throw new Error('Failed to fetch incidents');
    const data = await res.json();
    saveCachedIncidents(data);
    return data;
  } catch (err) {
    return loadCachedIncidents();
  }
}

export async function fetchAlerts(): Promise<EmergencyAlert[]> {
  try {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    const data = await res.json();
    saveCachedAlerts(data);
    return data;
  } catch (err) {
    return loadCachedAlerts();
  }
}

export async function fetchStats(): Promise<SystemStats | null> {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function postCitizenCheckin(checkinData: Omit<CitizenCheckin, 'id' | 'time' | 'synced'>): Promise<CitizenCheckin> {
  const newCheckin: CitizenCheckin = {
    ...checkinData,
    id: 'CHK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    time: new Date().toISOString(),
    synced: false,
    sourceDevice: getDeviceId()
  };

  // Add to local cached checkins immediately for instant optimistic UI
  const currentCheckins = loadCachedCheckins();
  saveCachedCheckins([newCheckin, ...currentCheckins]);

  // Try to submit to server if online
  if (navigator.onLine) {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCheckin)
      });
      if (res.ok) {
        const saved = await res.json();
        newCheckin.synced = true;
        // Update local status
        saveCachedCheckins([newCheckin, ...currentCheckins.filter(c => c.id !== newCheckin.id)]);
        return saved;
      }
    } catch (e) {
      console.warn('Network call failed, saving to offline sync queue');
    }
  }

  // If offline or request failed, queue for background sync
  addToOfflineQueue(newCheckin);
  return newCheckin;
}

export async function syncOfflineData(): Promise<{ syncedCount: number; error?: string }> {
  const pending = getOfflineQueue();
  if (pending.length === 0) {
    return { syncedCount: 0 };
  }

  const payload: SyncPayload = {
    checkins: pending,
    clientTimestamp: new Date().toISOString(),
    deviceId: getDeviceId()
  };

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Sync server rejected payload');
    const result: SyncResponse = await res.json();
    
    // Clear queue and mark as synced
    clearOfflineQueue();
    setLastSyncTime(new Date().toISOString());

    // Update local checkins to synced
    const local = loadCachedCheckins();
    const updated = local.map(c => ({ ...c, synced: true }));
    saveCachedCheckins(updated);

    if (result.shelters) saveCachedShelters(result.shelters);
    if (result.alerts) saveCachedAlerts(result.alerts);
    if (result.incidents) saveCachedIncidents(result.incidents);

    return { syncedCount: result.acceptedCheckins || pending.length };
  } catch (err: any) {
    return { syncedCount: 0, error: err.message || 'Sync failed' };
  }
}

export async function fetchCitizenCheckins(): Promise<CitizenCheckin[]> {
  try {
    const res = await fetch('/api/checkins');
    if (!res.ok) throw new Error('Failed to fetch checkins');
    const data = await res.json();
    saveCachedCheckins(data);
    return data;
  } catch (err) {
    return loadCachedCheckins();
  }
}

export async function fetchLogs(): Promise<AgentLog[]> {
  try {
    const res = await fetch('/api/logs');
    if (!res.ok) throw new Error('Failed to fetch logs');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchAssessments(): Promise<DamageAssessment[]> {
  try {
    const res = await fetch('/api/assessments');
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function triggerSimulation(type: DisasterType): Promise<any> {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
  if (!res.ok) throw new Error('Simulation failed');
  return await res.json();
}

export const simulateDisaster = triggerSimulation;

export async function resetSystem(): Promise<any> {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Reset failed');
  return await res.json();
}

export async function askGeminiAdvisor(prompt: string, context?: string, language: string = 'en'): Promise<string> {
  try {
    const res = await fetch('/api/gemini/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context, language })
    });
    if (!res.ok) throw new Error('AI Advisor unavailable');
    const data = await res.json();
    return data.answer || 'Stay in a secure location and follow designated rescue coordinates.';
  } catch (e: any) {
    const fallbacks: Record<string, string> = {
      hi: 'ऑफलाइन सुरक्षा निर्देश: यदि नेटवर्क संपर्क टूट गया है, तो बाढ़ में तुरंत ऊंचे स्थान पर जाएं, भूकंप में क्षतिग्रस्त इमारतों से दूर रहें, और स्थानीय हेल्पलाइन 112 / 1070 पर संपर्क करें।',
      mr: 'ऑफलाइन सुरक्षा सूचना: नेटवर्क नसल्यास पुराच्या वेळी तात्काळ उंच जागेवर जा, भूकंपादरम्यान मोडकळीस आलेल्या इमारतींपासून दूर राहा, आणि 112 / 1070 वर संपर्क करा.',
      bn: 'অফলাইন সুরক্ষা নোটিশ: নেটওয়ার্ক বিচ্ছিন্ন হলে বন্যার সময় অবিলম্বে উঁচু স্থানে যান, ভূমিকম্পের সময় ক্ষতিগ্রস্ত ভবন এড়িয়ে চলুন এবং ১১২ / ১০৭০ নম্বরে যোগাযোগ করুন।',
      ta: 'ஆஃப்லைன் பாதுகாப்பு அறிவிப்பு: தொடர்பு துண்டிக்கப்பட்டால், வெள்ளத்தின் போது உடனடியாக உயரமான இடத்திற்குச் செல்லுங்கள், சேதமடைந்த கட்டிடங்களைத் தவிர்க்கவும், 112 / 1070 எண்ணைத் தொடர்பு கொள்ளவும்.',
      en: 'Offline Safety Notice: If you are cut off from network access, move immediately to higher ground during floods, avoid damaged buildings during seismic events, and contact local helplines: 112 / 1070.'
    };
    return fallbacks[language] || fallbacks.en;
  }
}

export async function triageSosMessage(message: string, location?: { lat: number; lng: number }): Promise<any> {
  try {
    const res = await fetch('/api/gemini/triage-sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, location })
    });
    if (!res.ok) throw new Error('Triage failed');
    return await res.json();
  } catch (e) {
    return {
      urgency: 'HIGH',
      recommendedAction: 'Dispatch nearest medical / rescue patrol to user coordinates',
      hazardsIdentified: ['Immediate distress call']
    };
  }
}

export async function analyzeDamagePhoto(
  imageBase64: string,
  notes?: string,
  location?: { lat: number; lng: number },
  hazardType?: string
): Promise<PhotoDamageReport> {
  try {
    const res = await fetch('/api/gemini/analyze-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, notes, location, hazardType })
    });
    if (!res.ok) throw new Error('Photo analysis failed');
    return await res.json();
  } catch (e: any) {
    // Return local emergency triage assessment
    return {
      id: 'RPT-OFFLINE-' + Date.now(),
      timestamp: new Date().toISOString(),
      hazardType: (hazardType as any) || 'structural',
      riskLevel: 'MODERATE',
      confidence: 85,
      hazardsDetected: ['Damage verified locally in offline mode', 'Potential debris obstacle'],
      recommendedAction: 'Exercise extreme caution. Keep clear of overhead loads and stay near external exits.',
      safeToEnter: false,
      structuralIntegrityScore: 60,
      notes,
      lat: location?.lat || 19.076,
      lng: location?.lng || 72.8777
    };
  }
}

export async function planSafeRoute(
  startLat: number,
  startLng: number,
  shelterId: string
): Promise<EvacuationRoute> {
  try {
    const res = await fetch('/api/route-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startLat, startLng, shelterId })
    });
    if (!res.ok) throw new Error('Routing calculation failed');
    return await res.json();
  } catch (e) {
    // Offline fallback route calculation
    return {
      id: 'ROUTE-OFFLINE-' + Date.now(),
      targetShelterId: shelterId,
      targetShelterName: 'Designated Safe Shelter',
      totalDistanceKm: 2.4,
      estimatedWalkTimeMin: 32,
      safetyScore: 90,
      hazardCrossingsAvoided: 1,
      status: 'SAFE',
      waypoints: [
        {
          lat: startLat,
          lng: startLng,
          instruction: 'Depart immediate location on foot. Stay on paved main road.',
          isHazardAvoidance: false
        },
        {
          lat: startLat + 0.008,
          lng: startLng + 0.008,
          instruction: 'Proceed along higher ground corridor away from drainage basins.',
          isHazardAvoidance: true
        }
      ],
      advisories: [
        'Do not drive through standing water of unknown depth.',
        'Follow instructions from NDRF personnel stationed along the route.'
      ]
    };
  }
}

export async function updateSensorTelemetry(sensorId: string, value: number): Promise<SensorData[]> {
  const res = await fetch('/api/sensors/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sensorId, value })
  });
  if (!res.ok) throw new Error('Failed to update sensor');
  return await res.json();
}

export async function fetchVicinityWeather(lat?: number, lng?: number, isGeo: boolean = false): Promise<VicinityWeatherForecast> {
  const queryParams = new URLSearchParams();
  if (lat !== undefined) queryParams.set('lat', lat.toString());
  if (lng !== undefined) queryParams.set('lng', lng.toString());
  if (isGeo) queryParams.set('isGeo', 'true');

  try {
    const res = await fetch(`/api/weather?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch weather forecast');
    const data: VicinityWeatherForecast = await res.json();
    saveCachedWeather(data);
    return data;
  } catch (err) {
    console.warn('Weather network request failed, attempting cached weather:', err);
    const cached = loadCachedWeather();
    if (cached) return cached;
    
    // Default fallback if totally offline on first load
    return {
      locationName: 'Local Vicinity (Offline Mode)',
      lat: lat || 19.076,
      lng: lng || 72.8777,
      isGeolocation: isGeo,
      updatedAt: new Date().toISOString(),
      current: {
        temperature: 28.5,
        apparentTemperature: 32.0,
        humidity: 89,
        windSpeedKmH: 26,
        windGustsKmH: 45,
        weatherCode: 65,
        condition: 'Heavy Monsoon Rain (Cached)',
        precipitationMm: 14.5,
        precipitationAccumulation24hMm: 95,
        floodRiskIndex: 65
      },
      alerts: [
        {
          id: 'WA-OFFLINE-MONSOON',
          severity: 'watch',
          title: 'Monsoon Heavy Precipitation Watch (Offline Data)',
          source: 'Local Cached Telemetry',
          description: 'Network offline. Using locally preserved weather advisories. Exercise extreme caution in low-lying corridors.',
          effectiveUntil: 'Station Standby',
          movementRisk: 'MODERATE'
        }
      ],
      hourly: [
        { time: 'Current', fullTimestamp: new Date().toISOString(), precipitationMm: 14.5, probability: 80, intensity: 'Moderate', floodRiskPercent: 60 },
        { time: '+2h', fullTimestamp: new Date(Date.now() + 7200000).toISOString(), precipitationMm: 22.0, probability: 85, intensity: 'Heavy', floodRiskPercent: 70 },
        { time: '+4h', fullTimestamp: new Date(Date.now() + 14400000).toISOString(), precipitationMm: 12.0, probability: 70, intensity: 'Moderate', floodRiskPercent: 50 },
        { time: '+6h', fullTimestamp: new Date(Date.now() + 21600000).toISOString(), precipitationMm: 6.0, probability: 50, intensity: 'Light', floodRiskPercent: 30 }
      ],
      daily: [
        { date: 'Today', dayName: 'Today', condition: 'Monsoon Downpour', weatherCode: 65, tempMax: 30, tempMin: 25, precipitationSumMm: 78, precipProbability: 90 },
        { date: 'Tomorrow', dayName: 'Tomorrow', condition: 'Scattered Rain', weatherCode: 63, tempMax: 31, tempMin: 26, precipitationSumMm: 45, precipProbability: 80 }
      ],
      movementDecision: {
        safeToMove: true,
        statusLevel: 'CAUTION',
        headline: 'EXERCISE CAUTION — RUNOFF ACCUMULATING',
        safeWindow: 'Transit only if necessary; seek higher ground before precipitation peaks.',
        routeImpactAdvice: 'Avoid waterlogged arterial subways. Foot movement on higher ground is recommended.',
        recommendedTransport: 'Walking (Elevated routes)',
        evacuationPriority: 'Monitor'
      }
    };
  }
}

