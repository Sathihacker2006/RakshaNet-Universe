import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

// Initial In-Memory State
interface ServerState {
  shelters: any[];
  teams: any[];
  sensors: any[];
  incidents: any[];
  alerts: any[];
  logs: any[];
  assessments: any[];
  checkins: any[];
  currentHazard: any | null;
}

const state: ServerState = {
  shelters: [
    {
      id: 'S1',
      name: 'District Govt College Relief Hub',
      type: 'school',
      capacity: 650,
      occupied: 145,
      lat: 19.076,
      lng: 72.8777,
      status: 'open',
      facilities: ['Food Kitchen', 'Clean Water', 'Medical Ward', 'Solar Power'],
      contact: '+91 98200 11001'
    },
    {
      id: 'S2',
      name: 'Andheri West Community Center',
      type: 'hall',
      capacity: 400,
      occupied: 95,
      lat: 19.1136,
      lng: 72.8697,
      status: 'open',
      facilities: ['Water Purifier', 'First Aid', 'Sanitation Kits'],
      contact: '+91 98200 11002'
    },
    {
      id: 'S3',
      name: 'Bandra Sports Complex Safe Haven',
      type: 'stadium',
      capacity: 1200,
      occupied: 310,
      lat: 19.0596,
      lng: 72.8295,
      status: 'open',
      facilities: ['Emergency Power', 'Food Supplies', 'Field Hospital', 'Helipad Zone'],
      contact: '+91 98200 11003'
    },
    {
      id: 'S4',
      name: 'St. Xavier Disaster Shelter',
      type: 'camp',
      capacity: 250,
      occupied: 250,
      lat: 19.0822,
      lng: 72.8411,
      status: 'full',
      facilities: ['Hot Meals', 'Pediatric Care'],
      contact: '+91 98200 11004'
    },
    {
      id: 'S5',
      name: 'Powai Highland Open Evac Ground',
      type: 'open',
      capacity: 850,
      occupied: 60,
      lat: 19.1197,
      lng: 72.9057,
      status: 'open',
      facilities: ['Water Tankers', 'Generator Backup', 'NDRF Tent Ward'],
      contact: '+91 98200 11005'
    },
    {
      id: 'S6',
      name: 'Sanjay Gandhi Ridge High Shelter',
      type: 'open',
      capacity: 500,
      occupied: 40,
      lat: 19.2183,
      lng: 72.9781,
      status: 'open',
      facilities: ['Emergency Rations', 'Water', 'Satellite Comm Beacon'],
      contact: '+91 98200 11006'
    }
  ],
  teams: [
    {
      id: 'T1',
      name: 'NDRF Battalion Alpha (Quick Rescue)',
      type: 'rescue',
      members: 14,
      lat: 19.076,
      lng: 72.8777,
      status: 'standby',
      equipment: ['Inflatable Boats', 'Life Jackets', 'Rescue Cords', 'Cutters']
    },
    {
      id: 'T2',
      name: 'Rapid Disaster Medical Unit 1',
      type: 'medical',
      members: 10,
      lat: 19.0596,
      lng: 72.8295,
      status: 'deployed',
      equipment: ['ICU Ambulances', 'Oxygen Concentrators', 'Trauma Kits', 'Anti-venom']
    },
    {
      id: 'T3',
      name: 'Municipal Fire & Hazmat Brigade',
      type: 'fire',
      members: 16,
      lat: 19.1136,
      lng: 72.8697,
      status: 'on-mission',
      equipment: ['Heavy Fire Tenders', 'Hydraulic Ladders', 'Thermal Imaging']
    },
    {
      id: 'T4',
      name: 'SkyWatch Drone Reconnaissance',
      type: 'surveillance',
      members: 4,
      lat: 19.0822,
      lng: 72.8411,
      status: 'standby',
      equipment: ['Thermal Drones', 'LIDAR Scanner', 'Megaphone Broadcast Drones']
    }
  ],
  sensors: [
    {
      id: 'RG-101',
      type: 'river_gauge',
      location: 'Mithi River Basin Node 4',
      value: 4.8,
      threshold: 5.0,
      unit: 'm level',
      status: 'warning',
      lat: 19.0822,
      lng: 72.8411,
      trend: 'rising'
    },
    {
      id: 'WS-204',
      type: 'weather',
      location: 'Santacruz Coastal Radar',
      value: 92,
      threshold: 80,
      unit: 'mm/hr rain',
      status: 'critical',
      lat: 19.1136,
      lng: 72.8697,
      trend: 'rising'
    },
    {
      id: 'EQ-302',
      type: 'seismic',
      location: 'Western Continental Fault line',
      value: 4.9,
      threshold: 4.5,
      unit: 'Richter',
      status: 'warning',
      lat: 19.076,
      lng: 72.8777,
      trend: 'stable'
    },
    {
      id: 'WF-401',
      type: 'fire_risk',
      location: 'Sanjay Gandhi National Park',
      value: 78,
      threshold: 70,
      unit: '% fire danger',
      status: 'warning',
      lat: 19.2314,
      lng: 72.9047,
      trend: 'rising'
    },
    {
      id: 'LS-501',
      type: 'soil_moisture',
      location: 'Ghatkopar Hill Slope Sensor',
      value: 88,
      threshold: 85,
      unit: '% saturation',
      status: 'warning',
      lat: 19.2183,
      lng: 72.9781,
      trend: 'rising'
    },
    {
      id: 'HW-601',
      type: 'thermal',
      location: 'Central Urban Heat Island',
      value: 42.4,
      threshold: 41.0,
      unit: '°C wet-bulb',
      status: 'critical',
      lat: 19.076,
      lng: 72.8777,
      trend: 'rising'
    }
  ],
  incidents: [],
  alerts: [],
  logs: [
    {
      id: 'LOG-INIT',
      agent: 'ORCHESTRATOR',
      message: 'RakshaNet 2.0 Agentic Telemetry Bus initialized. 5 AI Agents online in high-availability mode.',
      time: new Date().toLocaleTimeString(),
      level: 'info'
    }
  ],
  assessments: [],
  checkins: [
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
  ],
  currentHazard: null
};

// Multilingual alert templates
const ALERT_TEMPLATES: Record<string, Record<string, string>> = {
  flood: {
    en: 'FLOOD ALERT: River water level critical near {location}. Evacuate immediately to nearest designated shelter. Avoid low-lying underpasses and open drains.',
    hi: 'बाढ़ चेतावनी: {location} के पास जलस्तर खतरनाक रूप से बढ़ गया है। तुरंत निकटतम सुरक्षित आश्रय स्थल पर जाएं। निचले इलाकों से दूर रहें।',
    mr: 'पूर इशारा: {location} जवळ पाण्याची पातळी धोक्याच्या वर आहे. त्वरित जवळच्या निवारा केंद्रात जा. सखल भागातून बाहेर पडा.',
    bn: 'বন্যা সতর্কতা: {location} অঞ্চলে জলস্তর আশঙ্কাজনক। অবিলম্বে নিকটবর্তী আশ্রয়কেন্দ্রে চলে যান।',
    ta: 'வெள்ள அபாயம்: {location} பகுதியில் நதி நீர் மட்டம் அபாய எல்லையை தாண்டியது. உடனடியாக நிவாரண முகாமிற்கு செல்லவும்.'
  },
  earthquake: {
    en: 'EARTHQUAKE ALERT: Seismic tremor of magnitude {magnitude} detected near {location}. DROP, COVER, and HOLD ON. Vacate damaged buildings once tremors cease.',
    hi: 'भूकंप चेतावनी: {location} के पास {magnitude} तीव्रता का भूकंप दर्ज। झुकें, ढंकें और पकड़ें। इमारतों से दूर खुले मैदान में जाएं।',
    mr: 'भूकंप इशारा: {location} जवळ {magnitude} तीव्रतेचा धक्का नोंदवला गेला. मोकळ्या मैदानात त्वरित आश्रय घ्या.',
    bn: 'ভূমিকম্প সতর্কতা: {location}-এ {magnitude} মাত্রার কম্পন অনুভূত। খোলা জায়গায় সরে যান।',
    ta: 'நிலநடுக்க எச்சரிக்கை: {location} அருகில் {magnitude} தீவிர நிலநடுக்கம். உடனடியாக திறந்தவெளிக்கு செல்லுங்கள்.'
  },
  cyclone: {
    en: 'CYCLONE WARNING: Severe tropical gale approaching {location}. Secure loose outdoor objects, stay indoors away from glass windows.',
    hi: 'चक्रवात चेतावनी: {location} के तटीय क्षेत्र में भीषण तूफान की आशंका। खिड़कियों से दूर रहें और सुरक्षित पक्के भवनों में शरण लें।',
    mr: 'चक्रीवादळ इशारा: {location} येथे अतिवृष्टी व वादळी वाऱ्याचा इशारा. घरातच सुरक्षित रहा, समुद्रकिनाऱ्यावर जाऊ नका.',
    bn: 'ঘূর্ণিঝড় সতর্কতা: {location} উপকূলে তীব্র ঝড় আছড়ে পড়ার সম্ভাবনা। সতর্ক থাকুন।',
    ta: 'புயல் எச்சரிக்கை: {location} பகுதியில் பலத்த காற்றுடன் கூடிய புயல் எச்சரிக்கை. கடலோர பகுதிகளை தவிர்க்கவும்.'
  },
  wildfire: {
    en: 'WILDFIRE ALERT: Rapid blaze detected near {location}. Evacuate UPWIND immediately. Follow NDRF containment directions.',
    hi: 'जंगल की आग चेतावनी: {location} के निकट भीषण आग फैली है। तुरंत हवा की उल्टी दिशा में सुरक्षित स्थान पर जाएं।',
    mr: 'वणवा इशारा: {location} जवळ जंगलात आग लागली आहे. त्वरित सुरक्षित अंतरावर स्थलांतर करा.',
    bn: 'দাবানল সতর্কতা: {location} অঞ্চলে দ্রুত আগুন ছড়াচ্ছে। নিরাপদে সরে যান।',
    ta: 'காட்டுத்தீ எச்சரிக்கை: {location} அருகே தீ பரவி வருகிறது. உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.'
  },
  landslide: {
    en: 'LANDSLIDE WARNING: High slope failure risk at {location}. Avoid foothill roads, watch for ground cracks and falling rocks.',
    hi: 'भूस्खलन चेतावनी: {location} में भारी बारिश से पहाड़ खिसकने का गंभीर खतरा। पहाड़ी रास्तों का प्रयोग बंद करें।',
    mr: 'दरड इशारा: {location} भागात दरड कोसळण्याची दाट शक्यता. डोंगर पायथ्याशी राहणाऱ्यांनी सुरक्षित ठिकाणी जावे.',
    bn: 'ভূমিধস সতর্কতা: {location}-এ পাহাড় ধসের আশঙ্কা। ঝুঁকিপূর্ণ রাস্তা এড়িয়ে চলুন।',
    ta: 'நிலச்சரிவு எச்சரிக்கை: {location} பகுதியில் நிலச்சரிவு ஏற்படும் அபாயம். மலைப்பாதைகளை தவிர்க்கவும்.'
  },
  heatwave: {
    en: 'HEATWAVE EMERGENCY: Wet-bulb index exceeded safe threshold in {location}. Drink plenty of fluids, avoid direct sunlight between 12-4 PM.',
    hi: 'भीषण लू चेतावनी: {location} में तापमान खतरनाक स्तर पर। खूब पानी पिएं और दोपहर 12 से 4 बजे के बीच घर से बाहर न निकलें।',
    mr: 'उष्माघात इशारा: {location} येथे तीव्र उष्णतेची लाट. भरपूर पाणी प्या आणि सावलीत थांबा.',
    bn: 'তাপপ্রবাহ সতর্কতা: {location}-এ তীব্র তাপপ্রবাহ। প্রচুর জল খান ও ছায়ায় থাকুন।',
    ta: 'வெப்ப அலை எச்சரிக்கை: {location} பகுதியில் தீவிர வெப்ப அலை. போதுமான தண்ணீர் குடிக்கவும்.'
  }
};

function addLog(agent: string, message: string, data: any = null, level: string = 'info') {
  const entry = {
    id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    agent,
    message,
    time: new Date().toLocaleTimeString(),
    data,
    level
  };
  state.logs.unshift(entry);
  if (state.logs.length > 150) state.logs.pop();
  return entry;
}

// 5 AI Agent Pipeline
async function runAgentPipeline(disasterType: string) {
  addLog('ORCHESTRATOR', `Triggered multi-agent emergency protocol for: ${disasterType.toUpperCase()}`, null, 'warn');

  // Agent 1: DETECTION
  const hazardLocations: Record<string, { location: string; lat: number; lng: number; magnitude?: string }> = {
    flood: { location: 'Mithi River Basin & Kurla Lowlands', lat: 19.0822, lng: 72.8411 },
    earthquake: { location: 'Western Continental Fault Zone', lat: 19.076, lng: 72.8777, magnitude: '5.4' },
    cyclone: { location: 'Arabian Sea Coastal Buffer', lat: 19.0596, lng: 72.8295 },
    wildfire: { location: 'Sanjay Gandhi National Park Buffer Zone', lat: 19.2314, lng: 72.9047 },
    landslide: { location: 'Ghatkopar Ridge & Asalpha Hillside', lat: 19.2183, lng: 72.9781 },
    heatwave: { location: 'Central Urban Congestion Core', lat: 19.076, lng: 72.8777 }
  };

  const loc = hazardLocations[disasterType] || hazardLocations.flood;
  const hazard = {
    id: 'HZ-' + Date.now(),
    type: disasterType,
    sensorId: 'ANOMALY-' + disasterType.substring(0, 3).toUpperCase(),
    location: loc.location,
    lat: loc.lat,
    lng: loc.lng,
    severity: 'critical',
    confidence: 94.6,
    timestamp: new Date().toISOString(),
    raw: { value: 96, threshold: 80 }
  };
  state.currentHazard = hazard;
  addLog('DETECTION', `Hazard Detected: ${hazard.type.toUpperCase()} at ${hazard.location} (Confidence: ${hazard.confidence}%)`, hazard, 'warn');

  // Agent 2: COORDINATION
  const impactRadiusKm = disasterType === 'earthquake' ? 25 : disasterType === 'cyclone' ? 18 : 6;
  const affectedPopulation = disasterType === 'earthquake' ? 45000 : disasterType === 'flood' ? 22000 : 12500;
  const incident = {
    incidentId: 'INC-' + Date.now().toString().slice(-6),
    hazardId: hazard.id,
    type: disasterType,
    location: hazard.location,
    lat: hazard.lat,
    lng: hazard.lng,
    severity: 'critical',
    severityScore: 9.2,
    affectedPopulation,
    impactRadiusKm,
    timestamp: new Date().toISOString(),
    actionPlan: {
      priority: 'LEVEL 1 IMMEDIATE EVACUATION',
      immediateAction: `Deploy watercraft & NDRF to ${loc.location}. Sound public alert sirens within ${impactRadiusKm}km perimeter.`,
      evacuateRadiusKm: impactRadiusKm
    }
  };
  state.incidents.unshift(incident);
  addLog('COORDINATION', `Incident verified: ${incident.incidentId} | Severity: ${incident.severity.toUpperCase()} (${incident.severityScore}/10) | Est. Population: ${affectedPopulation.toLocaleString()}`, incident, 'info');

  // Agent 3: COMMUNICATION
  const langAlerts = ['en', 'hi', 'mr', 'bn', 'ta'].map(lang => {
    const template = (ALERT_TEMPLATES[disasterType] && ALERT_TEMPLATES[disasterType][lang]) || ALERT_TEMPLATES.flood.en;
    const msg = template
      .replace('{location}', loc.location)
      .replace('{magnitude}', loc.magnitude || '5.2');
    return {
      id: 'ALT-' + Date.now() + '-' + lang,
      incidentId: incident.incidentId,
      type: disasterType,
      lang,
      message: msg,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      channels: ['App Push', 'Emergency Siren', 'Cell Broadcast SMS', 'FM Radio']
    };
  });
  langAlerts.forEach(a => state.alerts.unshift(a));
  addLog('COMMUNICATION', `Multilingual alerts broadcast in 5 languages across Mobile App, Cell Broadcast & Civil Defense Sirens`, langAlerts, 'success');

  // Agent 4: RESOURCE
  const openShelters = state.shelters.filter(s => s.status === 'open');
  // Dispatch teams
  state.teams.forEach((t, idx) => {
    if (idx < 3) t.status = 'on-mission';
  });
  const allocation = {
    allocatedShelters: openShelters.map(s => s.id),
    dispatchedTeams: state.teams.filter(t => t.status === 'on-mission').map(t => t.name),
    targetZone: loc.location
  };
  addLog('RESOURCE', `Allocated ${openShelters.length} open safe shelters. Deployed ${allocation.dispatchedTeams.length} emergency response teams to ${loc.location}`, allocation, 'info');

  // Agent 5: ASSESSMENT
  const assessment = {
    id: 'ASM-' + Date.now(),
    incidentId: incident.incidentId,
    damageScore: 78,
    estimatedLossINR: 45000000,
    affectedHomes: 340,
    blockedRoads: 7,
    priorityForRelief: 'Critical',
    recommendations: [
      'Prioritize aerial food drops and clean water purification tablets to sector 4.',
      'Deploy mobile generator trailers to Bandra & Powai relief shelters.',
      'Maintain continuous structural monitoring of western arterial bridges.'
    ],
    assessedAt: new Date().toISOString()
  };
  state.assessments.unshift(assessment);
  addLog('ASSESSMENT', `Structural Damage Score: ${assessment.damageScore}/100. Economic Impact: ₹${(assessment.estimatedLossINR / 100000).toFixed(1)} Lakhs. 7 transport routes obstructed.`, assessment, 'warn');

  return { hazard, incident, alerts: langAlerts, allocation, assessment };
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/shelters', (req, res) => {
  res.json(state.shelters);
});

app.get('/api/teams', (req, res) => {
  res.json(state.teams);
});

app.get('/api/sensors', (req, res) => {
  res.json(state.sensors);
});

app.get('/api/incidents', (req, res) => {
  res.json(state.incidents);
});

app.get('/api/alerts', (req, res) => {
  res.json(state.alerts.slice(0, 25));
});

app.get('/api/logs', (req, res) => {
  res.json(state.logs.slice(0, 60));
});

app.get('/api/checkins', (req, res) => {
  res.json(state.checkins);
});

// Real-Time Weather Forecast & Precipitation Telemetry Endpoint
app.get('/api/weather', async (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 19.076;
  const lng = parseFloat(req.query.lng as string) || 72.8777;
  const isGeo = req.query.isGeo === 'true';

  // Check if coordinates correspond to Mumbai/coastal zone
  const isMumbaiArea = Math.abs(lat - 19.076) < 0.6 && Math.abs(lng - 72.8777) < 0.6;
  const locationName = isGeo 
    ? (isMumbaiArea ? 'Mumbai Metro & Coastal Coastal Zone' : `Vicinity (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`)
    : 'Mumbai Central Disaster Operations Vicinity';

  // Check state for active sensors
  const weatherSensor = state.sensors.find(s => s.type === 'weather');
  const riverSensor = state.sensors.find(s => s.type === 'river_gauge');
  const activeIncident = state.incidents[0] || null;

  let weatherData: any = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,cloud_cover&hourly=precipitation_probability,precipitation,rain,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=3`;
    
    const omRes = await fetch(openMeteoUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (omRes.ok) {
      weatherData = await omRes.json();
    }
  } catch (err) {
    // Fallback to meteorological simulation engine
  }

  // Weather Code mapper to readable condition
  const getConditionFromCode = (code: number): string => {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy / Dense Mist';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 63) return 'Moderate Rain';
    if (code >= 65 && code <= 67) return 'Heavy Torrential Rain';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm with Squall';
    return 'Overcast with Rain';
  };

  const now = new Date();
  
  // Resolve current metrics
  let temperature = 28.4;
  let apparentTemperature = 32.1;
  let humidity = 88;
  let windSpeedKmH = 28;
  let windGustsKmH = 46;
  let precipitationMm = weatherSensor ? weatherSensor.value : 14.5;
  let weatherCode = 65;
  let condition = 'Heavy Monsoon Rain';
  let cloudCoverPercent = 95;

  if (weatherData && weatherData.current) {
    temperature = Number(weatherData.current.temperature_2m ?? temperature);
    apparentTemperature = Number(weatherData.current.apparent_temperature ?? (temperature + 3.5));
    humidity = Number(weatherData.current.relative_humidity_2m ?? humidity);
    windSpeedKmH = Number(weatherData.current.wind_speed_10m ?? windSpeedKmH);
    windGustsKmH = Number(weatherData.current.wind_gusts_10m ?? (windSpeedKmH * 1.5));
    const livePrecip = Number(weatherData.current.precipitation ?? weatherData.current.rain ?? 0);
    // If active flood simulation or radar sensor indicates high precipitation, blend with live sensor telemetry
    if (activeIncident && activeIncident.type === 'flood' && weatherSensor) {
      precipitationMm = Math.max(livePrecip, weatherSensor.value);
    } else {
      precipitationMm = livePrecip > 0 ? livePrecip : (weatherSensor ? weatherSensor.value : 12.0);
    }
    weatherCode = Number(weatherData.current.weather_code ?? weatherCode);
    condition = getConditionFromCode(weatherCode);
    cloudCoverPercent = Number(weatherData.current.cloud_cover ?? 90);
  } else if (activeIncident) {
    if (activeIncident.type === 'flood') {
      precipitationMm = weatherSensor ? weatherSensor.value : 88.0;
      weatherCode = 95;
      condition = 'Severe Monsoon Downpour & Thunderstorm';
      windSpeedKmH = 42;
      windGustsKmH = 68;
    } else if (activeIncident.type === 'cyclone') {
      precipitationMm = 65.0;
      weatherCode = 99;
      condition = 'Cyclonic Storm Squalls';
      windSpeedKmH = 75;
      windGustsKmH = 115;
    }
  }

  // Calculate 24h accumulation and flood risk index
  const precipAcc24h = Math.round(precipitationMm * 4.2 + 45);
  const floodRiskIndex = Math.min(100, Math.round(
    (precipitationMm > 70 ? 95 : precipitationMm > 40 ? 80 : precipitationMm > 20 ? 60 : 30) +
    (riverSensor && riverSensor.status === 'critical' ? 20 : 0)
  ));

  // Build hourly precipitation timeline (next 16 hours)
  const hourly: any[] = [];
  if (weatherData && weatherData.hourly && Array.isArray(weatherData.hourly.time)) {
    const currentHourIndex = weatherData.hourly.time.findIndex((t: string) => new Date(t) >= now);
    const startIdx = currentHourIndex >= 0 ? currentHourIndex : 0;
    
    for (let i = startIdx; i < Math.min(startIdx + 16, weatherData.hourly.time.length); i++) {
      const timeStr = weatherData.hourly.time[i];
      const d = new Date(timeStr);
      const hoursStr = d.getHours().toString().padStart(2, '0') + ':00';
      const precip = Number(weatherData.hourly.precipitation[i] ?? weatherData.hourly.rain[i] ?? 0);
      const prob = Number(weatherData.hourly.precipitation_probability ? weatherData.hourly.precipitation_probability[i] : 75);
      
      const intensity = precip >= 50 ? 'Torrential' : precip >= 25 ? 'Heavy' : precip >= 8 ? 'Moderate' : precip > 0.5 ? 'Light' : 'None';
      const hFloodRisk = Math.min(100, Math.round(precip * 1.8 + prob * 0.2));

      hourly.push({
        time: hoursStr,
        fullTimestamp: timeStr,
        precipitationMm: Number(precip.toFixed(1)),
        probability: prob,
        intensity,
        floodRiskPercent: hFloodRisk
      });
    }
  }

  // If hourly is empty from Open-Meteo, synthesize next 16 hours
  if (hourly.length === 0) {
    const baseHour = now.getHours();
    for (let i = 0; i < 16; i++) {
      const h = (baseHour + i) % 24;
      const hoursStr = h.toString().padStart(2, '0') + ':00';
      const factor = Math.sin((i / 16) * Math.PI);
      const simulatedPrecip = Math.max(0, Number((precipitationMm * (0.6 + 0.8 * factor) + (i % 3 === 0 ? 5 : -2)).toFixed(1)));
      const prob = Math.min(100, Math.max(30, Math.round(70 + factor * 25)));
      const intensity = simulatedPrecip >= 50 ? 'Torrential' : simulatedPrecip >= 25 ? 'Heavy' : simulatedPrecip >= 8 ? 'Moderate' : simulatedPrecip > 0.5 ? 'Light' : 'None';
      
      hourly.push({
        time: hoursStr,
        fullTimestamp: new Date(Date.now() + i * 3600000).toISOString(),
        precipitationMm: simulatedPrecip,
        probability: prob,
        intensity,
        floodRiskPercent: Math.min(100, Math.round(simulatedPrecip * 1.6 + prob * 0.2))
      });
    }
  }

  // Daily Forecast (3 days)
  const daily: any[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (weatherData && weatherData.daily && Array.isArray(weatherData.daily.time)) {
    for (let i = 0; i < Math.min(3, weatherData.daily.time.length); i++) {
      const dateStr = weatherData.daily.time[i];
      const d = new Date(dateStr);
      daily.push({
        date: dateStr,
        dayName: i === 0 ? 'Today' : daysOfWeek[d.getDay()],
        condition: getConditionFromCode(Number(weatherData.daily.weather_code[i] ?? 61)),
        weatherCode: Number(weatherData.daily.weather_code[i] ?? 61),
        tempMax: Math.round(weatherData.daily.temperature_2m_max[i] ?? (temperature + 2)),
        tempMin: Math.round(weatherData.daily.temperature_2m_min[i] ?? (temperature - 3)),
        precipitationSumMm: Math.round(weatherData.daily.precipitation_sum[i] ?? 45),
        precipProbability: Math.round(weatherData.daily.precipitation_probability_max ? weatherData.daily.precipitation_probability_max[i] : 85)
      });
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const d = new Date(Date.now() + i * 86400000);
      daily.push({
        date: d.toISOString().split('T')[0],
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[d.getDay()],
        condition: i === 0 ? condition : i === 1 ? 'Scattered Thunderstorms' : 'Moderate Monsoon Showers',
        weatherCode: i === 0 ? weatherCode : 63,
        tempMax: Math.round(temperature + 1 + i),
        tempMin: Math.round(temperature - 3),
        precipitationSumMm: Math.round(i === 0 ? precipAcc24h : 48 - i * 12),
        precipProbability: Math.max(40, 90 - i * 15)
      });
    }
  }

  // Generate Real-time Weather Alerts
  const alerts: any[] = [];

  if (precipitationMm >= 50 || (activeIncident && activeIncident.type === 'flood')) {
    alerts.push({
      id: 'WA-FLASH-FLOOD-EMERGENCY',
      severity: 'emergency',
      title: 'Red Alert: Flash Flood & Cloudburst Inundation',
      source: 'Regional Meteorological Centre & Coastal Radar',
      description: `Intense precipitation rate measuring ${precipitationMm.toFixed(1)} mm/hr detected across the area. Subways, storm culverts, and low-lying roads experiencing rapid water surge.`,
      effectiveUntil: new Date(Date.now() + 4 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      movementRisk: 'IMPASSABLE'
    });
  } else if (precipitationMm >= 25) {
    alerts.push({
      id: 'WA-HEAVY-RAIN-WARN',
      severity: 'warning',
      title: 'Orange Alert: Heavy Monsoon Downpour Warning',
      source: 'Doppler Weather Radar WS-204',
      description: `Sustained precipitation of ${precipitationMm.toFixed(1)} mm/hr. Waterlogging expected in underpasses. Public transit operations may experience localized suspensions.`,
      effectiveUntil: new Date(Date.now() + 5 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      movementRisk: 'HAZARDOUS'
    });
  } else if (precipitationMm >= 8) {
    alerts.push({
      id: 'WA-MODERATE-RAIN-WATCH',
      severity: 'watch',
      title: 'Yellow Watch: Steady Monsoon Rain & Slick Roadways',
      source: 'Civil Defense Weather Telemetry',
      description: `Steady rain of ${precipitationMm.toFixed(1)} mm/hr. Reduced visibility and road surface slippage. Avoid sudden braking and navigate away from open drains.`,
      effectiveUntil: new Date(Date.now() + 6 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      movementRisk: 'MODERATE'
    });
  }

  if (windGustsKmH >= 55) {
    alerts.push({
      id: 'WA-GUST-WATCH',
      severity: 'watch',
      title: 'High Wind Gust Advisory (Squall Risk)',
      source: 'Coastal Anemometer Station',
      description: `Wind gusts recorded at ${windGustsKmH.toFixed(0)} km/h. Hazard of tree limb fractures, sheet roof dislodgement, and power line whipping.`,
      effectiveUntil: new Date(Date.now() + 4 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      movementRisk: 'MODERATE'
    });
  }

  if (riverSensor && riverSensor.status !== 'normal') {
    alerts.push({
      id: 'WA-RIVER-SURGE',
      severity: 'warning',
      title: 'Mithi River Basin Spillover Risk',
      source: 'Automated Hydrographic Gauge (RG-101)',
      description: `Upstream catchment runoff has pushed gauge level to ${riverSensor.value}m (danger mark: ${riverSensor.threshold}m). Low-lying bank settlements must evacuate immediately.`,
      effectiveUntil: new Date(Date.now() + 3 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      movementRisk: 'IMPASSABLE'
    });
  }

  // Disaster Planning and Movement Decisions
  let movementDecision: any;
  const isImpassable = precipitationMm >= 50 || (activeIncident && activeIncident.type === 'flood' && activeIncident.severity === 'critical');
  const isRestricted = precipitationMm >= 22 || floodRiskIndex >= 65;
  const isCaution = precipitationMm >= 7 || windGustsKmH >= 40;

  const reliefSlot = hourly.find(h => h.precipitationMm < 15);
  const peakSlot = hourly.reduce((max, h) => h.precipitationMm > max.precipitationMm ? h : max, hourly[0] || { time: '16:00', precipitationMm: 50 });

  if (isImpassable) {
    movementDecision = {
      safeToMove: false,
      statusLevel: 'NO_TRAVEL',
      headline: 'DO NOT ATTEMPT MOVEMENT — HIGH INUNDATION DANGER',
      safeWindow: reliefSlot 
        ? `No safe travel possible now. Next potential relief window: approx. ${reliefSlot.time} (projected < 15mm/hr).`
        : 'Torrential downpour sustained. Stay in upper stories or nearest designated shelter.',
      routeImpactAdvice: 'Lowland underpasses, coastal highways, and rail corridors submerged under 0.6m - 1.2m of water. High risk of submerged open manholes and electrical grid short-circuits.',
      recommendedTransport: 'Shelter in Place',
      evacuationPriority: 'Immediate'
    };
  } else if (isRestricted) {
    movementDecision = {
      safeToMove: false,
      statusLevel: 'RESTRICTED',
      headline: 'RESTRICTED TRAVEL — HIGH-CLEARANCE CONVOYS ONLY',
      safeWindow: `Heaviest downpour expected around ${peakSlot?.time} (${peakSlot?.precipitationMm} mm/hr). Evacuate before peak or hold at current safe facility.`,
      routeImpactAdvice: 'Standard sedans and auto-rickshaws will stall in waterlogged choke points. Use only elevated arterial highways (e.g. Eastern Freeway, Western Elevated Bypass).',
      recommendedTransport: 'High Clearance 4x4',
      evacuationPriority: 'Prepare Now'
    };
  } else if (isCaution) {
    movementDecision = {
      safeToMove: true,
      statusLevel: 'CAUTION',
      headline: 'PROCEED WITH CAUTION — MONITOR PRECIPITATION PEAKS',
      safeWindow: `Favorable movement window active until approx. ${peakSlot?.time}. Transit to safe zone or shelter while daylight and visibility permit.`,
      routeImpactAdvice: 'Roads are wet with intermittent ponding. Keep headlights illuminated, wear high-visibility raincoats, and follow NDRF designated evacuation signs.',
      recommendedTransport: 'Walking (Elevated routes)',
      evacuationPriority: 'Monitor'
    };
  } else {
    movementDecision = {
      safeToMove: true,
      statusLevel: 'CLEAR',
      headline: 'OPTIMAL MOVEMENT WINDOW — ROUTES GENERALLY CLEAR',
      safeWindow: 'Conditions favorable for travel, resupply, or relocations over the next 4+ hours.',
      routeImpactAdvice: 'Standard road networks operational. Ideal window to replenish emergency kits and check on vulnerable family members.',
      recommendedTransport: 'Walking (Elevated routes)',
      evacuationPriority: 'Standby'
    };
  }

  res.json({
    locationName,
    lat,
    lng,
    isGeolocation: isGeo,
    updatedAt: new Date().toISOString(),
    current: {
      temperature,
      apparentTemperature,
      humidity,
      windSpeedKmH,
      windGustsKmH,
      weatherCode,
      condition,
      precipitationMm: Number(precipitationMm.toFixed(1)),
      precipitationAccumulation24hMm: precipAcc24h,
      floodRiskIndex,
      cloudCoverPercent
    },
    alerts,
    hourly,
    daily,
    movementDecision
  });
});

app.get('/api/stats', (req, res) => {
  const totalShelters = state.shelters.length;
  const openShelters = state.shelters.filter(s => s.status === 'open').length;
  const totalCapacity = state.shelters.reduce((acc, s) => acc + s.capacity, 0);
  const occupied = state.shelters.reduce((acc, s) => acc + s.occupied, 0);
  const incidents = state.incidents.length;
  const activeTeams = state.teams.filter(t => t.status !== 'standby').length;
  const checkinsCount = state.checkins.length;
  const unresolvedHazards = state.currentHazard ? 1 : 0;

  res.json({
    totalShelters,
    openShelters,
    totalCapacity,
    occupied,
    incidents,
    activeTeams,
    checkinsCount,
    unresolvedHazards
  });
});

app.post('/api/checkin', (req, res) => {
  const { name, phone, status, notes, lat, lng, sourceDevice } = req.body;
  const newCheckin = {
    id: req.body.id || 'CHK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: name || 'Anonymous Citizen',
    phone: phone || 'Not provided',
    status: status || 'Safe',
    notes: notes || '',
    lat: Number(lat) || 19.076,
    lng: Number(lng) || 72.8777,
    time: req.body.time || new Date().toISOString(),
    synced: true,
    sourceDevice: sourceDevice || 'Direct Web/Mobile'
  };

  state.checkins.unshift(newCheckin);
  addLog('COMMUNICATION', `Citizen Check-in: ${newCheckin.name} marked as [${newCheckin.status}] from (${newCheckin.lat.toFixed(3)}, ${newCheckin.lng.toFixed(3)})`, newCheckin, 'info');
  res.status(201).json(newCheckin);
});

// Cross-Platform Offline Synchronization Endpoint
app.post('/api/sync', (req, res) => {
  const { checkins = [], deviceId = 'unknown' } = req.body;
  let accepted = 0;

  if (Array.isArray(checkins)) {
    const existingIds = new Set(state.checkins.map(c => c.id));
    checkins.forEach(item => {
      if (!existingIds.has(item.id)) {
        state.checkins.unshift({
          ...item,
          synced: true,
          sourceDevice: deviceId
        });
        existingIds.add(item.id);
        accepted++;
      }
    });
  }

  if (accepted > 0) {
    addLog('ORCHESTRATOR', `Cross-Platform Offline Sync: Received and reconciled ${accepted} offline citizen check-in records from device ${deviceId}`, { accepted, deviceId }, 'success');
  }

  res.json({
    ok: true,
    acceptedCheckins: accepted,
    serverTimestamp: new Date().toISOString(),
    shelters: state.shelters,
    incidents: state.incidents,
    alerts: state.alerts.slice(0, 15)
  });
});

// Simulation Trigger
app.post('/api/simulate', async (req, res) => {
  const { type = 'flood' } = req.body;
  try {
    const result = await runAgentPipeline(type);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Simulation error' });
  }
});

// System Reset
app.post('/api/reset', (req, res) => {
  state.incidents = [];
  state.alerts = [];
  state.assessments = [];
  state.currentHazard = null;
  state.teams.forEach(t => (t.status = 'standby'));
  addLog('ORCHESTRATOR', 'System state reset to baseline standby. All hazard logs archived.', null, 'info');
  res.json({ ok: true });
});

// Gemini AI Emergency Advisor
app.post('/api/gemini/advisor', async (req, res) => {
  const { prompt, context, language = 'en' } = req.body;
  const ai = getGeminiClient();

  const langNames: Record<string, string> = {
    hi: 'Hindi (हिन्दी)',
    mr: 'Marathi (मराठी)',
    bn: 'Bengali (বাংলা)',
    ta: 'Tamil (தமிழ்)',
    en: 'English'
  };
  const targetLang = langNames[language] || 'English';

  if (!ai) {
    // Fallback if no Gemini API key configured
    const fallbacks: Record<string, string> = {
      hi: 'शांत रहें और सरकारी निर्देशों का पालन करें: बाढ़ की स्थिति में तुरंत ऊपरी मंजिल या ऊंचे स्थान पर जाएं। भूकंप के समय मेज के नीचे सिर ढकें। आपातकालीन सहायता के लिए 112 या 1070 पर कॉल करें।',
      mr: 'शांत राहा आणि अधिकृत नियमांचे पालन करा: पुराच्या वेळी तात्काळ उंच जागी किंवा वरच्या मजल्यावर जा. भूकंपाच्या वेळी मजबूत टेबलखाली बसा. आणीबाणीसाठी 112 किंवा 1070 वर संपर्क करा.',
      bn: 'শান্ত থাকুন এবং নির্দেশাবলী অনুসরণ করুন: বন্যার ক্ষেত্রে অবিলম্বে দোতলায় বা উঁচু স্থানে যান। ভূমিকম্পের সময় টেবিলের নিচে মাথা ঢেকে রাখুন। জরুরি সাহায্যের জন্য ১১২ বা ১০৭০ নম্বরে কল করুন।',
      ta: 'அமைதியாக இருங்கள் மற்றும் அதிகாரப்பூர்வ வழிகாட்டுதலைப் பின்பற்றுங்கள்: வெள்ளம் ஏற்பட்டால் உடனடியாக மேல்தளம் அல்லது உயரமான இடத்திற்குச் செல்லுங்கள். நிலநடுக்கத்தின் போது மேசையின் கீழ் தலையை மூடவும். அவசர உதவிக்கு 112 அல்லது 1070-ஐ அழைக்கவும்.',
      en: 'Stay calm and follow official protocols: If flooding occurs, immediately move to higher floors or higher ground. For earthquakes, drop, cover, and hold under sturdy furniture. Call 112 or 1070 for national emergency support.'
    };
    return res.json({
      answer: fallbacks[language] || fallbacks.en
    });
  }

  try {
    const systemPrompt = `You are RakshaNet Global AI Disaster & Safety Advisor. 
Provide concise, life-saving, clear step-by-step instructions for emergency survivors and responders.
Be empathetic, direct, actionable, and focus on immediate physical safety, first-aid, evacuation, and hazard mitigation.
IMPORTANT: You MUST write your entire response fluently in ${targetLang}.
Keep answers under 120 words with clear bullet points in ${targetLang}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nContext: ${context || 'General multi-hazard disaster zone'}\n\nUser Question: ${prompt}` }
          ]
        }
      ]
    });

    const answer = response.text || 'Ensure you are in a structurally sound location and signal emergency personnel.';
    res.json({ answer });
  } catch (err: any) {
    console.warn('Gemini Advisor call failed:', err);
    res.json({
      answer: 'Safety Priority: Disconnect gas and power in flooded or shaking buildings. Seek shelter in the nearest designated relief camp with food and medical supplies.'
    });
  }
});

// Gemini AI SOS Triage Analyzer
app.post('/api/gemini/triage-sos', async (req, res) => {
  const { message, location } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      urgency: 'HIGH',
      priorityScore: 9,
      recommendedAction: 'Immediate dispatch of nearest rescue team with medical supplies',
      hazardsIdentified: ['Distress signal received without delay']
    });
  }

  try {
    const prompt = `Analyze this emergency SOS message from a citizen:
"${message}"
Location: lat ${location?.lat}, lng ${location?.lng}

Return a valid JSON object with:
- "urgency": "CRITICAL" | "HIGH" | "MEDIUM"
- "priorityScore": number 1-10
- "recommendedAction": brief 1-sentence action for the rescue dispatcher
- "hazardsIdentified": array of string hazards (e.g. "trapped", "medical bleeding", "rising water")`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (e) {
    res.json({
      urgency: 'HIGH',
      priorityScore: 8,
      recommendedAction: 'Verify citizen status and send first responder unit.',
      hazardsIdentified: ['Emergency assistance needed']
    });
  }
});

// Gemini AI Multimodal Photo Damage Scanner
app.post('/api/gemini/analyze-photo', async (req, res) => {
  const { imageBase64, notes, location, hazardType = 'structural' } = req.body;
  const ai = getGeminiClient();

  let analysis: any = null;

  if (ai && imageBase64) {
    try {
      const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Clean
                }
              },
              {
                text: `You are a certified emergency structural safety engineer and disaster triage specialist.
Examine this disaster zone damage photograph (and citizen note: "${notes || 'No note provided'}").
Carefully inspect for:
1. Load-bearing column/wall shear fractures or foundation settlement.
2. Roof sagging, concrete spalling, exposed rebar.
3. Flood watermark height, standing stagnant water, submerged electrical wiring/outlets.
4. Fire scorching, structural steel deformation, toxic smoke discoloration.
5. Debris blocking egress doors/windows.

Return a strictly valid JSON object:
{
  "hazardType": "${hazardType}",
  "riskLevel": "LOW" | "MODERATE" | "SEVERE" | "IMMINENT_COLLAPSE",
  "confidence": 92,
  "hazardsDetected": ["list of specific visible threats"],
  "recommendedAction": "1 concise sentence with immediate life-safety advice",
  "safeToEnter": false,
  "structuralIntegrityScore": 35
}`
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      analysis = JSON.parse(response.text || '{}');
    } catch (e) {
      console.warn('Multimodal Gemini analysis failed, using expert fallback heuristic:', e);
    }
  }

  // Robust offline/fallback assessment
  if (!analysis || !analysis.riskLevel) {
    const isWater = notes?.toLowerCase().includes('water') || notes?.toLowerCase().includes('flood');
    const isCrack = notes?.toLowerCase().includes('crack') || notes?.toLowerCase().includes('wall');
    
    analysis = {
      hazardType: isWater ? 'flood' : isCrack ? 'earthquake' : 'structural',
      riskLevel: isCrack ? 'SEVERE' : 'MODERATE',
      confidence: 88,
      hazardsDetected: isWater 
        ? ['Submerged electrical conduits', 'Waterline above floor grade', 'Slippery footing']
        : isCrack
        ? ['Diagonal shear fractures on shear wall', 'Masonry displacement', 'Aftershock collapse hazard']
        : ['Debris accumulation in exit path', 'Structural stress indicators'],
      recommendedAction: isCrack 
        ? 'EVACUATE IMMEDIATELY: Do not re-enter building until municipal structural engineer green-tags structure.'
        : 'Avoid stepping into standing water. Disconnect main electrical circuit breaker if safe.',
      safeToEnter: false,
      structuralIntegrityScore: isCrack ? 38 : 55
    };
  }

  const report = {
    id: 'RPT-' + Date.now(),
    timestamp: new Date().toISOString(),
    ...analysis,
    imagePreview: imageBase64 ? imageBase64.slice(0, 200) + '...' : undefined,
    notes,
    lat: location?.lat || 19.076,
    lng: location?.lng || 72.8777
  };

  addLog(
    'ASSESSMENT',
    `AI Photo Damage Inspection completed: [${report.riskLevel}] Structural Integrity: ${report.structuralIntegrityScore}% - ${report.recommendedAction}`,
    report,
    report.riskLevel === 'IMMINENT_COLLAPSE' || report.riskLevel === 'SEVERE' ? 'error' : 'warn'
  );

  res.json(report);
});

// Evacuation Safe Corridor & Hazard Avoidance Route Planner
app.post('/api/route-plan', (req, res) => {
  const { startLat = 19.076, startLng = 72.8777, shelterId } = req.body;
  const targetShelter = state.shelters.find(s => s.id === shelterId) || state.shelters[0];

  // Check if direct vector intersects any active incident radius
  let hazardCrossingsAvoided = 0;
  const activeIncidents = state.incidents;

  // Simple haversine
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(targetShelter.lat - startLat);
  const dLon = toRad(targetShelter.lng - startLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(startLat)) * Math.cos(toRad(targetShelter.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const totalDistanceKm = Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));

  // Build intelligent detour waypoints
  const waypoints: any[] = [];
  waypoints.push({
    lat: startLat,
    lng: startLng,
    instruction: 'Depart current location. Keep emergency go-bag and flashlight ready.',
    isHazardAvoidance: false
  });

  if (activeIncidents.length > 0) {
    const inc = activeIncidents[0];
    hazardCrossingsAvoided = 1;
    // Calculate detour midpoint that bends away from incident
    const midLat = (startLat + targetShelter.lat) / 2;
    const midLng = (startLng + targetShelter.lng) / 2;
    // Offset vector perpendicular to incident
    const offsetLat = midLat + (midLat > inc.lat ? 0.012 : -0.012);
    const offsetLng = midLng + (midLng > inc.lng ? 0.015 : -0.015);

    waypoints.push({
      lat: Number(offsetLat.toFixed(4)),
      lng: Number(offsetLng.toFixed(4)),
      instruction: `DIVERSION CORRIDOR: Avoid ${inc.location} (${inc.type.toUpperCase()} perimeter). Follow elevated arterial road.`,
      isHazardAvoidance: true
    });
  }

  waypoints.push({
    lat: targetShelter.lat,
    lng: targetShelter.lng,
    instruction: `Arrive at Safe Haven: ${targetShelter.name}. Register at reception desk for rations and medical intake.`,
    isHazardAvoidance: false
  });

  const estimatedWalkTimeMin = Math.round(totalDistanceKm * 14); // ~4.3 km/h walking speed in emergency
  const safetyScore = hazardCrossingsAvoided > 0 ? 94 : 98;

  res.json({
    id: 'ROUTE-' + Date.now(),
    targetShelterId: targetShelter.id,
    targetShelterName: targetShelter.name,
    totalDistanceKm: Number((totalDistanceKm * (hazardCrossingsAvoided > 0 ? 1.15 : 1.0)).toFixed(2)),
    estimatedWalkTimeMin,
    safetyScore,
    hazardCrossingsAvoided,
    status: 'SAFE',
    waypoints,
    advisories: [
      'Stick to well-lit main boulevards; stay clear of flooded underpasses.',
      'Wear sturdy closed shoes to protect against glass and metal debris.',
      'Keep mobile data on low-power mode and beacon synced.'
    ]
  });
});

// Update Sensor Telemetry (for live command center testing)
app.post('/api/sensors/update', (req, res) => {
  const { sensorId, value } = req.body;
  const sensor = state.sensors.find(s => s.id === sensorId);
  if (!sensor) return res.status(404).json({ error: 'Sensor not found' });

  sensor.value = Number(value);
  if (sensor.value >= sensor.threshold) {
    sensor.status = 'critical';
    sensor.trend = 'rising';
    addLog('DETECTION', `Early Warning Triggered: ${sensor.location} exceeded safety threshold (${sensor.value} ${sensor.unit} >= ${sensor.threshold})`, sensor, 'error');
  } else if (sensor.value >= sensor.threshold * 0.85) {
    sensor.status = 'warning';
  } else {
    sensor.status = 'normal';
    sensor.trend = 'stable';
  }

  res.json(state.sensors);
});

// Start Server and Vite integration
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RakshaNet Global] Production server running on http://0.0.0.0:${PORT}`);
  });
}

start();
