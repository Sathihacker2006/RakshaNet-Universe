import { Shelter, ReliefTeam, SensorData, Incident, EmergencyAlert, CitizenCheckin, DamageAssessment, VicinityWeatherForecast } from '../types';
import { INITIAL_SHELTERS, INITIAL_TEAMS, INITIAL_SENSORS } from '../data/defaultData';

const STORAGE_KEYS = {
  SHELTERS: 'rakshanet_shelters_v2',
  TEAMS: 'rakshanet_teams_v2',
  SENSORS: 'rakshanet_sensors_v2',
  INCIDENTS: 'rakshanet_incidents_v2',
  ALERTS: 'rakshanet_alerts_v2',
  CHECKINS: 'rakshanet_checkins_v2',
  OFFLINE_QUEUE: 'rakshanet_offline_queue_v2',
  ACTIVE_USER: 'rakshanet_user_v2',
  LAST_SYNC: 'rakshanet_last_sync_v2',
  DEVICE_ID: 'rakshanet_device_id_v2',
  WEATHER: 'rakshanet_vicinity_weather_v2'
};

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device';
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

export function loadCachedShelters(): Shelter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHELTERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return INITIAL_SHELTERS;
}

export function saveCachedShelters(shelters: Shelter[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

export function loadCachedAlerts(): EmergencyAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveCachedAlerts(alerts: EmergencyAlert[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts.slice(0, 30)));
  } catch (e) {}
}

export function loadCachedIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveCachedIncidents(incidents: Incident[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  } catch (e) {}
}

export function loadCachedCheckins(): CitizenCheckin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: 'CHK-SEED-1',
      name: 'Rohan Sharma & Family',
      phone: '+91 98334 22100',
      status: 'Safe',
      notes: 'Reached Bandra Sports Shelter safely with 4 members.',
      lat: 19.0596,
      lng: 72.8295,
      time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      synced: true,
      sourceDevice: 'DEV-ORIGIN'
    },
    {
      id: 'CHK-SEED-2',
      name: 'Pooja Verma',
      phone: '+91 98110 33490',
      status: 'Need Help',
      notes: 'Water rising up to 1st floor near Kurla station. Need boat rescue.',
      lat: 19.0688,
      lng: 72.8800,
      time: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      synced: true,
      sourceDevice: 'DEV-ORIGIN'
    }
  ];
}

export function saveCachedCheckins(checkins: CitizenCheckin[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins));
  } catch (e) {}
}

export function getOfflineQueue(): CitizenCheckin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function addToOfflineQueue(checkin: CitizenCheckin) {
  const queue = getOfflineQueue();
  const existingIdx = queue.findIndex(q => q.id === checkin.id);
  if (existingIdx >= 0) {
    queue[existingIdx] = checkin;
  } else {
    queue.push(checkin);
  }
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {}
}

export function clearOfflineQueue() {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  } catch (e) {}
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
}

export function setLastSyncTime(time: string) {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, time);
}

export function loadCachedWeather(): VicinityWeatherForecast | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEATHER);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function saveCachedWeather(weather: VicinityWeatherForecast) {
  try {
    localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
  } catch (e) {}
}
