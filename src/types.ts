export type DisasterType = 'flood' | 'earthquake' | 'cyclone' | 'wildfire' | 'landslide' | 'heatwave';

export type SeverityLevel = 'low' | 'moderate' | 'warning' | 'critical';

export type AgentName = 'ORCHESTRATOR' | 'DETECTION' | 'COORDINATION' | 'COMMUNICATION' | 'RESOURCE' | 'ASSESSMENT';

export interface Shelter {
  id: string;
  name: string;
  type: 'school' | 'hall' | 'stadium' | 'camp' | 'open';
  capacity: number;
  occupied: number;
  lat: number;
  lng: number;
  status: 'open' | 'full' | 'standby';
  facilities: string[];
  contact: string;
  distanceKm?: number;
}

export interface ReliefTeam {
  id: string;
  name: string;
  type: 'rescue' | 'medical' | 'fire' | 'surveillance';
  members: number;
  lat: number;
  lng: number;
  status: 'standby' | 'on-mission' | 'deployed';
  equipment: string[];
  assignedShelterId?: string;
}

export interface SensorData {
  id: string;
  type: 'river_gauge' | 'weather' | 'seismic' | 'fire_risk' | 'soil_moisture' | 'thermal';
  location: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lat: number;
  lng: number;
  trend?: 'rising' | 'stable' | 'falling';
}

export interface HazardDetection {
  id: string;
  type: DisasterType;
  sensorId: string;
  location: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  confidence: number;
  timestamp: string;
  raw?: { value: number; threshold: number; unit?: string };
}

export interface Incident {
  incidentId: string;
  hazardId?: string;
  type: DisasterType;
  location: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  severityScore: number;
  affectedPopulation: number;
  impactRadiusKm: number;
  timestamp: string;
  actionPlan: {
    priority: string;
    immediateAction: string;
    evacuateRadiusKm: number;
  };
}

export interface EmergencyAlert {
  id: string;
  incidentId: string;
  type: DisasterType;
  lang: string;
  message: string;
  severity: SeverityLevel;
  timestamp: string;
  channels: string[];
}

export interface AgentLog {
  id: string;
  agent: AgentName;
  message: string;
  time: string;
  data?: any;
  level?: 'info' | 'warn' | 'error' | 'success';
}

export interface CitizenCheckin {
  id: string;
  name: string;
  phone?: string;
  status: 'Safe' | 'Need Help' | 'At Shelter' | 'Trapped' | 'Sheltering in Place';
  notes?: string;
  lat: number;
  lng: number;
  time: string;
  synced: boolean;
  sourceDevice?: string;
}

export interface DamageAssessment {
  id: string;
  incidentId: string;
  damageScore: number;
  estimatedLossINR: number;
  affectedHomes: number;
  blockedRoads: number;
  priorityForRelief: 'High' | 'Immediate' | 'Critical';
  recommendations: string[];
  assessedAt: string;
}

export interface SystemStats {
  totalShelters: number;
  openShelters: number;
  totalCapacity: number;
  occupied: number;
  incidents: number;
  activeTeams: number;
  checkinsCount: number;
  unresolvedHazards: number;
}

export interface SyncPayload {
  checkins: CitizenCheckin[];
  clientTimestamp: string;
  deviceId: string;
}

export interface SyncResponse {
  ok: boolean;
  acceptedCheckins: number;
  serverTimestamp: string;
  shelters: Shelter[];
  incidents: Incident[];
  alerts: EmergencyAlert[];
}

export interface PhotoDamageReport {
  id: string;
  timestamp: string;
  hazardType: DisasterType | 'structural' | 'debris';
  riskLevel: 'LOW' | 'MODERATE' | 'SEVERE' | 'IMMINENT_COLLAPSE';
  confidence: number;
  hazardsDetected: string[];
  recommendedAction: string;
  safeToEnter: boolean;
  structuralIntegrityScore: number; // 0 - 100
  imagePreview?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface SafeWaypoint {
  lat: number;
  lng: number;
  instruction: string;
  isHazardAvoidance: boolean;
}

export interface EvacuationRoute {
  id: string;
  targetShelterId: string;
  targetShelterName: string;
  totalDistanceKm: number;
  estimatedWalkTimeMin: number;
  safetyScore: number; // 0 - 100
  hazardCrossingsAvoided: number;
  status: 'SAFE' | 'CAUTION' | 'IMPASSABLE';
  waypoints: SafeWaypoint[];
  advisories: string[];
}

export interface EmergencyKitItem {
  id: string;
  category: 'Water & Food' | 'Medical' | 'Tools & Light' | 'Documents & Comms' | 'Personal';
  name: string;
  quantity: string;
  checked: boolean;
  critical: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  status: 'Safe' | 'Need Help' | 'At Shelter' | 'Unknown';
  batteryLevel?: number;
  lastKnownLocation?: string;
  lastUpdated: string;
}

export interface WeatherAlert {
  id: string;
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  title: string;
  source: string;
  description: string;
  effectiveUntil: string;
  movementRisk: 'LOW' | 'MODERATE' | 'HAZARDOUS' | 'IMPASSABLE';
}

export interface HourlyPrecipitation {
  time: string; // e.g. "14:00"
  fullTimestamp: string;
  precipitationMm: number; // e.g. 12.5 mm/hr
  probability: number; // 0 - 100 %
  intensity: 'None' | 'Light' | 'Moderate' | 'Heavy' | 'Torrential';
  floodRiskPercent: number;
}

export interface DailyWeatherForecast {
  date: string;
  dayName: string;
  condition: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSumMm: number;
  precipProbability: number;
}

export interface VicinityWeatherForecast {
  locationName: string;
  lat: number;
  lng: number;
  isGeolocation: boolean;
  updatedAt: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeedKmH: number;
    windGustsKmH: number;
    weatherCode: number;
    condition: string;
    precipitationMm: number; // mm/hr rate
    precipitationAccumulation24hMm: number;
    floodRiskIndex: number; // 0 - 100
    cloudCoverPercent?: number;
  };
  alerts: WeatherAlert[];
  hourly: HourlyPrecipitation[];
  daily: DailyWeatherForecast[];
  movementDecision: {
    safeToMove: boolean;
    statusLevel: 'CLEAR' | 'CAUTION' | 'RESTRICTED' | 'NO_TRAVEL';
    headline: string;
    safeWindow: string;
    routeImpactAdvice: string;
    recommendedTransport: 'Walking (Elevated routes)' | 'High Clearance 4x4' | 'Boat Only' | 'Shelter in Place';
    evacuationPriority: 'Immediate' | 'Prepare Now' | 'Monitor' | 'Standby';
  };
}

