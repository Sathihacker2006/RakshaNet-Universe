import { Shelter, ReliefTeam, SensorData, DisasterType } from '../types';

export const INITIAL_SHELTERS: Shelter[] = [
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
];

export const INITIAL_TEAMS: ReliefTeam[] = [
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
];

export const INITIAL_SENSORS: SensorData[] = [
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
];

export interface SurvivalGuide {
  type: DisasterType;
  title: string;
  icon: string;
  color: string;
  before: string[];
  during: string[];
  after: string[];
  emergencyNumber: string;
}

export const SURVIVAL_HANDBOOK: Record<DisasterType, SurvivalGuide> = {
  flood: {
    type: 'flood',
    title: 'Flash Flood & Waterlogging',
    icon: 'Droplets',
    color: 'sky',
    before: [
      'Store 3 days of clean drinking water in sealed containers.',
      'Elevate essential electric equipment and documents above flood levels.',
      'Identify highest elevation points and mark nearest designated shelters.'
    ],
    during: [
      'Never drive or walk through moving floodwater (6 inches can sweep an adult).',
      'Turn off main electricity switch and gas supply before water enters.',
      'If trapped in building, move to upper floors or roof, signal with bright cloth/whistle.'
    ],
    after: [
      'Avoid standing flood water; it may be electrically charged or contaminated.',
      'Boil all tap water for at least 3 minutes before drinking.',
      'Report downed power lines immediately to emergency responders.'
    ],
    emergencyNumber: '1070 (Disaster) / 101 (Fire)'
  },
  earthquake: {
    type: 'earthquake',
    title: 'Earthquake & Seismic Tremors',
    icon: 'Activity',
    color: 'amber',
    before: [
      'Secure heavy wall hangings, bookshelves, and gas cylinders firmly.',
      'Keep a torch, first aid kit, and emergency whistle beside your bed.',
      'Designate an open outdoor meeting spot for your family.'
    ],
    during: [
      'DROP to your hands and knees.',
      'COVER your head and neck under a sturdy table or desk.',
      'HOLD ON until the shaking completely stops. Do not use elevators!'
    ],
    after: [
      'Expect aftershocks. Check yourself and others for injuries.',
      'Check for gas leaks (smell) — do NOT ignite candles, lighters or matches.',
      'Evacuate building carefully via stairwells once primary shaking subsides.'
    ],
    emergencyNumber: '112 (National Emergency)'
  },
  cyclone: {
    type: 'cyclone',
    title: 'Tropical Cyclone & Gale Storms',
    icon: 'Wind',
    color: 'teal',
    before: [
      'Board or tape glass windows with criss-cross heavy adhesive tape.',
      'Secure loose rooftop objects, tin sheets, and outdoor furniture.',
      'Fully charge smartphones, power banks, and battery radios.'
    ],
    during: [
      'Stay inside in the strongest interior room away from glass windows.',
      'Beware of the "Eye of the Storm" — calm winds will suddenly reverse with violence.',
      'Disconnect electrical appliances to prevent damage from power surges.'
    ],
    after: [
      'Remain indoors until local authorities declare the storm officially passed.',
      'Watch out for broken glass, snake hazards, and hanging electric cables.',
      'Send SMS or "I\'m Safe" check-in to reduce mobile network congestion.'
    ],
    emergencyNumber: '1077 (District Control Room)'
  },
  wildfire: {
    type: 'wildfire',
    title: 'Wildfire & Bushfire Smoke',
    icon: 'Flame',
    color: 'orange',
    before: [
      'Create a 30-foot defensible clearance space around homes near forests.',
      'Keep N95 smoke respirator masks ready for all family members.',
      'Keep your vehicle filled with fuel and oriented towards the exit.'
    ],
    during: [
      'Evacuate UPWIND immediately as instructed by civil defense.',
      'Wear cotton or wool clothing covering arms and legs; avoid synthetics.',
      'If trapped, seek open clearings, bodies of water, or burnt areas over tall grass.'
    ],
    after: [
      'Do not return to burned properties until cleared by fire marshals.',
      'Inspect roof, attic, and perimeter for lingering embers or hotspots.',
      'Filter indoor air and maintain N95 masks while airborne PM2.5 remains hazardous.'
    ],
    emergencyNumber: '101 (Fire) / 112'
  },
  landslide: {
    type: 'landslide',
    title: 'Landslide & Debris Flow',
    icon: 'Mountain',
    color: 'stone',
    before: [
      'Learn about your area’s landslide history and watch for slope movement signs.',
      'Watch for sticking doors, new cracks in foundations, or tilted retaining walls.',
      'Stay alert during intense or prolonged heavy rainfall.'
    ],
    during: [
      'If you hear cracking trees or rumbling boulders, evacuate path immediately.',
      'If caught in slope failure, curl into a tight ball and protect your head.',
      'Move perpendicular away from the path of mudflows or falling debris.'
    ],
    after: [
      'Stay away from the slide area; secondary collapses frequently follow.',
      'Look for injured and trapped persons without entering direct slide path.',
      'Inspect utility lines and foundations for broken pipes or electrical breaks.'
    ],
    emergencyNumber: '1070 / 112'
  },
  heatwave: {
    type: 'heatwave',
    title: 'Extreme Heatwave & Hyperthermia',
    icon: 'Sun',
    color: 'rose',
    before: [
      'Prepare ORS (Oral Rehydration Salts), electrolytes, and bottled water.',
      'Install dark curtains or reflective sunscreens on sun-facing windows.',
      'Identify cool communal shelters or air-conditioned public spaces.'
    ],
    during: [
      'Drink water at frequent intervals, even when not feeling thirsty.',
      'Avoid going outdoors between 12:00 PM and 4:00 PM.',
      'Wear loose, light-colored cotton clothing and cover your head outdoors.'
    ],
    after: [
      'If anyone exhibits heat exhaustion (nausea, dizziness, high pulse), move to shade.',
      'Apply cool wet towels to neck and armpits; seek immediate medical attention if delirium starts.',
      'Check in on elderly neighbors and vulnerable relatives.'
    ],
    emergencyNumber: '108 (Medical Ambulance)'
  }
};
