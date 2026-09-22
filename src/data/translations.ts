import { DisasterType } from '../types';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'bn' | 'ta';

export interface AppTranslations {
  appName: string;
  globalBadge: string;
  tagline: string;
  activeStatus: string;
  criticalBadge: string;
  views: {
    mobile: string;
    dashboard: string;
    phoneFrame: string;
    fullWidth: string;
  };
  tools: {
    rescueTools: string;
    aiScanner: string;
    aiScannerDesc: string;
    beacon: string;
    beaconDesc: string;
    route: string;
    routeDesc: string;
    kit: string;
    kitDesc: string;
    pwaInstall: string;
    installBtn: string;
  };
  mobileNav: {
    sos: string;
    map: string;
    teams?: string;
    ai: string;
    handbook: string;
    registry: string;
  };
  home: {
    immediateThreat: string;
    oneTapSos: string;
    abortGuard: string;
    markSafe: string;
    nearestShelter: string;
    spotsFree: string;
    away: string;
    navigate: string;
    call: string;
    allClear: string;
    allClearDesc: string;
    normal: string;
    advancedTitle: string;
    offlineReady: string;
    emergencyCallTitle: string;
    allEmergency: string;
    disasterRelief: string;
    ambulance: string;
  };
  aiAdvisor: {
    title: string;
    desc: string;
    greeting: string;
    placeholder: string;
    send: string;
    quickPromptsTitle: string;
    quickPrompts: string[];
    offlineNotice: string;
  };
  handbook: {
    title: string;
    subtitle: string;
    savedOffline?: string;
    survivalProtocol?: string;
    emergencyHotline: string;
    beforePhase: string;
    duringPhase: string;
    afterPhase: string;
    disasters: Record<DisasterType, {
      title: string;
      before: string[];
      during: string[];
      after: string[];
    }>;
  };
  registry: {
    title: string;
    subtitle?: string;
    checkinBtn?: string;
    searchPlaceholder: string;
    totalSafe: string;
    allDistricts: string;
    noResults: string;
    statusSafe: string;
    statusNeedHelp: string;
    statusInShelter: string;
  };
  sosModal: {
    title: string;
    subtitle: string;
    holdNotice: string;
    typeLabel: string;
    types: {
      medical: string;
      trapped: string;
      flood: string;
      fire: string;
      other: string;
    };
    sendBtn: string;
    cancelBtn: string;
    sending: string;
    successNotice: string;
  };
  checkinModal: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    conditionLabel: string;
    conditions: {
      safe: string;
      minor: string;
      urgent: string;
      shelter: string;
    };
    notesLabel: string;
    notesPlaceholder: string;
    submitBtn: string;
    submitting: string;
  };
  dashboard: {
    activeIncidents: string;
    sheltersOpen: string;
    bedsFree: string;
    ndrfDeployed: string;
    personnel: string;
    citizenRegistry: string;
    earlyWarning: string;
    anomalies: string;
    aiAgentsTitle: string;
    aiAgentsDesc: string;
    resetDemo: string;
    simulateTitle: string;
    tacticalTools: string;
    incidentMap: string;
    shelterNetwork: string;
    reliefTeams: string;
    normalStandby: string;
    verified: string;
    capacityOccupied: string;
    deployedUnits: string;
    liveLedger: string;
    markedSafeDesc: string;
    multiHazardScan: string;
    damageTriageTitle: string;
    damageScore: string;
    estLoss: string;
    affectedHomes: string;
    blockedRoutes: string;
    agentRecs: string;
    reliefPriority: string;
    liveTelemetryTitle: string;
    allAgents: string;
    noLogEvents: string;
    noActiveIncident: string;
    openChatbot: string;
    searchLocationOnGoogleMaps: string;
  };
  mapTabs: {
    liveMap: string;
    liveMapDesc: string;
    googleMap: string;
    googleMapDesc: string;
    dualView: string;
    dualViewDesc: string;
  };
  liveMap: {
    title: string;
    subtitle: string;
    legendHazards: string;
    legendShelters: string;
    legendTeams: string;
    legendSos: string;
    filterHazards: string;
    filterTeams: string;
    filterShelters: string;
    filterSos: string;
    recenter: string;
  };
  googleMap: {
    title: string;
    searchPlaceholder: string;
    findNearestShelter: string;
    nearestShelterFound: string;
    distanceAway: string;
    openInGoogleMaps: string;
    getDirections: string;
    layerStandard: string;
    layerSatellite: string;
    layerDark: string;
    quickAreas: string;
    openInApp: string;
    findNearbyHospitals: string;
    findNearbyPolice: string;
    findNearbyFire: string;
    satelliteHybrid: string;
    streetTraffic: string;
  };
  chatbot: {
    title: string;
    subtitle: string;
    greeting: string;
    placeholder: string;
    send: string;
    quickPrompts: string[];
    disclaimer: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, AppTranslations> = {
  en: {
    appName: 'RakshaNet',
    globalBadge: 'GLOBAL',
    tagline: 'Multi-Hazard Emergency Response & Offline Civil Defense',
    activeStatus: 'ACTIVE',
    criticalBadge: 'CRITICAL',
    views: {
      mobile: 'Mobile Citizen',
      dashboard: 'Command Center',
      phoneFrame: 'Phone Frame',
      fullWidth: 'Full Screen'
    },
    tools: {
      rescueTools: 'Rescue Tools',
      aiScanner: 'AI Damage Scanner',
      aiScannerDesc: 'Multimodal structural crack & collapse triage',
      beacon: 'Optical SOS Strobe',
      beaconDesc: 'Morse flashlight for aerial rescue teams',
      route: 'Safe Corridor Plan',
      routeDesc: 'Hazard-avoidance navigation to open shelters',
      kit: '72h Survival Go-Bag',
      kitDesc: 'Emergency rations & first aid readiness checklist',
      pwaInstall: 'Install RakshaNet Mobile PWA for complete offline disaster readiness!',
      installBtn: 'Install PWA'
    },
    mobileNav: {
      sos: 'SOS & Live',
      map: 'Safe Shelters',
      teams: 'Relief Teams',
      ai: 'AI Advisor',
      handbook: 'Survival Guide',
      registry: 'Safe Registry'
    },
    home: {
      immediateThreat: 'Immediate Threat To Life Or Safety?',
      oneTapSos: '1-TAP ALERT',
      abortGuard: '3-sec abort guard • Broadcasts GPS • Works 100% Offline',
      markSafe: 'Mark Yourself Safe ("I\'m Safe" Check-in)',
      nearestShelter: 'Nearest Open Emergency Shelter',
      spotsFree: 'spots available',
      away: 'away',
      navigate: 'Navigate (Turn-by-Turn)',
      call: 'Call',
      allClear: 'All Clear in Your District',
      allClearDesc: 'No active disaster alert within 15 km.',
      normal: 'Normal',
      advancedTitle: 'Advanced Rescue & Preparedness',
      offlineReady: '100% OFFLINE READY',
      emergencyCallTitle: 'Quick Emergency Helplines',
      allEmergency: 'All Emergency',
      disasterRelief: 'Disaster Relief',
      ambulance: 'Ambulance'
    },
    aiAdvisor: {
      title: 'RakshaNet AI Emergency Assistant',
      desc: 'Powered by Gemini 2.5 Flash for disaster triage, safe water, and life preservation',
      greeting: 'Namaste. I am your RakshaNet AI Emergency Assistant. I can guide you through evacuation routes, medical triage, water sanitation, and hazard survival. How can I protect you right now?',
      placeholder: 'Ask AI how to protect yourself or request safety guidance...',
      send: 'Ask AI',
      quickPromptsTitle: 'Quick Emergency Queries',
      quickPrompts: [
        'How to purify floodwater without electricity?',
        'What to do if trapped under earthquake debris?',
        'Immediate first aid for heavy bleeding?',
        'How to signal search rescue helicopters?'
      ],
      offlineNotice: 'Offline Safety Mode: Local AI safety protocols loaded from edge cache.'
    },
    handbook: {
      title: 'Civil Defense & Disaster Survival Handbook',
      subtitle: 'Standard Operating Procedures by NDMA, Red Cross & Fire Services',
      emergencyHotline: 'Emergency Hotline',
      beforePhase: 'BEFORE (Preparation)',
      duringPhase: 'DURING (Immediate Survival)',
      afterPhase: 'AFTER (Safe Recovery)',
      disasters: {
        flood: {
          title: 'Flash Flood & Waterlogging',
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
          ]
        },
        earthquake: {
          title: 'Earthquake & Seismic Tremors',
          before: [
            'Secure heavy wall hangings, bookshelves, and gas cylinders firmly.',
            'Keep a torch, first aid kit, and emergency whistle beside your bed.',
            'Designate an open outdoor meeting spot for your family.'
          ],
          during: [
            'DROP to your hands and knees immediately.',
            'COVER your head and neck under a sturdy table or desk.',
            'HOLD ON until the shaking completely stops. Do not use elevators!'
          ],
          after: [
            'Expect aftershocks. Check yourself and others for injuries.',
            'Check for gas leaks (smell) — do NOT ignite candles, lighters or matches.',
            'Evacuate building carefully via stairwells once primary shaking subsides.'
          ]
        },
        cyclone: {
          title: 'Cyclone & Extreme Coastal Windstorm',
          before: [
            'Board up or tape large glass windows to prevent shattering.',
            'Trim dead tree branches near power lines and your roof.',
            'Keep battery-operated radio and charged power banks ready.'
          ],
          during: [
            'Remain indoors in the strongest central room away from windows.',
            'Beware the "eye of the storm" — sudden calm is temporarily followed by fierce opposite winds.',
            'Disconnect electrical appliances to avoid high-voltage power surges.'
          ],
          after: [
            'Do not venture out until civil defense officially issues the All Clear.',
            'Watch out for broken glass, exposed wires, and dangling signs.',
            'Drive only if strictly necessary; avoid coastal roads.'
          ]
        },
        wildfire: {
          title: 'Wildfire & Urban Conflagration',
          before: [
            'Clear dry leaves, twigs, and flammable vegetation within 30 feet of home.',
            'Prepare emergency Go-Bag with N95 masks and burn ointments.',
            'Pre-plan at least two distinct motorable escape routes.'
          ],
          during: [
            'Evacuate immediately upon warning; do not hesitate for belongings.',
            'Wear non-synthetic cotton/wool clothes and wet handkerchief/N95 mask over nose.',
            'Close all windows, doors, and vents before leaving to slow internal draft.'
          ],
          after: [
            'Do not enter burnt areas until declared safe by fire crews.',
            'Check roof and attic spaces for hidden smoldering embers.',
            'Discard any food or water exposed to heat, smoke, or ash.'
          ]
        },
        landslide: {
          title: 'Landslide & Hill Slope Debris Flow',
          before: [
            'Inspect hillsides for tilt in utility poles, trees, or new ground cracks.',
            'Install flexible pipe fittings to prevent gas and water pipe ruptures.',
            'Identify uphill evacuation paths away from natural drainage gullies.'
          ],
          during: [
            'If rocks crack or trees snap, run immediately out of the path of debris.',
            'If escape is impossible, curl into a tight ball and protect your head.',
            'Stay alert for sudden changes in stream water clarity (warning of mudflow).'
          ],
          after: [
            'Stay away from the slide area; secondary collapses frequently follow.',
            'Check for trapped or injured persons without directly entering slide path.',
            'Report broken utility lines and damaged roadways to authorities.'
          ]
        },
        heatwave: {
          title: 'Extreme Heatwave & Hyperthermia',
          before: [
            'Stock Oral Rehydration Salts (ORS), coconut water, and glucose.',
            'Cover east and west-facing windows with reflective film or curtains.',
            'Schedule outdoor tasks only before 9:00 AM or after 5:30 PM.'
          ],
          during: [
            'Drink water every 20 minutes even if not feeling thirsty.',
            'Wear loose, light-colored cotton clothing and wide-brim headgear.',
            'If experiencing dizziness, rapid pulse, or lack of sweat: seek immediate shade and apply wet cloths.'
          ],
          after: [
            'Continue electrolyte rehydration over the next 48 hours.',
            'Check on elderly neighbors, children, and outdoor pets.',
            'Monitor local municipal heat advisory levels.'
          ]
        }
      }
    },
    registry: {
      title: 'Live Citizen Safety Registry',
      searchPlaceholder: 'Search by citizen name, phone, or location...',
      totalSafe: 'Marked Safe',
      allDistricts: 'All Districts',
      noResults: 'No citizen check-ins match your search.',
      statusSafe: 'Safe',
      statusNeedHelp: 'Need Help',
      statusInShelter: 'In Shelter'
    },
    sosModal: {
      title: 'CONFIRM EMERGENCY SOS',
      subtitle: 'Hold or tap button to transmit instant distress distress alert with precise GPS.',
      holdNotice: 'NDRF, Police & Medical dispatch alerted immediately',
      typeLabel: 'Type of Emergency',
      types: {
        medical: 'Medical / Trauma Emergency',
        trapped: 'Trapped Under Debris / Building',
        flood: 'Rising Water / Cut Off by Floods',
        fire: 'Trapped by Fire / Toxic Smoke',
        other: 'General Life Threat'
      },
      sendBtn: 'Send SOS Broadcast Now',
      cancelBtn: 'Cancel / False Alarm',
      sending: 'Broadcasting Distress Signal...',
      successNotice: 'SOS Transmitted! Responders notified. Keep your phone active.'
    },
    checkinModal: {
      title: 'Citizen Safety Check-in',
      subtitle: 'Mark yourself and loved ones as safe on the public and rescue registry.',
      nameLabel: 'Your Full Name',
      namePlaceholder: 'e.g. Ramesh Patil & Family (3)',
      phoneLabel: 'Contact Phone Number',
      phonePlaceholder: '+91 98765 43210',
      conditionLabel: 'Current Status',
      conditions: {
        safe: 'Safe & Secure',
        minor: 'Need Minor Supplies / Water',
        urgent: 'Urgent Medical Attention Required',
        shelter: 'Arrived at Emergency Shelter'
      },
      notesLabel: 'Brief Note (Optional)',
      notesPlaceholder: 'e.g., Safe on 2nd floor, water rising on street level.',
      submitBtn: 'Submit "I\'m Safe" Check-in',
      submitting: 'Registering...'
    },
    dashboard: {
      activeIncidents: 'ACTIVE INCIDENTS',
      sheltersOpen: 'SHELTERS OPEN',
      bedsFree: 'beds free',
      ndrfDeployed: 'NDRF & MEDICAL',
      personnel: 'personnel',
      citizenRegistry: 'CITIZEN REGISTRY',
      earlyWarning: 'EARLY WARNING',
      anomalies: 'anomalies',
      aiAgentsTitle: '5 Autonomous AI Agents Architecture',
      aiAgentsDesc: 'Decentralized disaster lifecycle from sensory ingestion to damage triage',
      resetDemo: 'Reset Demo Standby',
      simulateTitle: 'Simulate All 6 Disasters:',
      tacticalTools: 'Emergency Tactical Tools:',
      incidentMap: 'Live Incident Command Map',
      shelterNetwork: 'Shelter Network Status',
      reliefTeams: 'Tactical Relief Teams',
      normalStandby: 'Normal standby condition',
      verified: 'verified',
      capacityOccupied: 'capacity occupied',
      deployedUnits: 'rapid response tactical units',
      liveLedger: 'Live ledger',
      markedSafeDesc: 'marked safe',
      multiHazardScan: 'Multi-hazard continuous sensor scan',
      damageTriageTitle: 'Damage Assessment & Economic Loss Triage',
      damageScore: 'Damage Score',
      estLoss: 'Est. Economic Loss',
      affectedHomes: 'Affected Homes',
      blockedRoutes: 'Blocked Routes',
      agentRecs: 'Agent Recommendations:',
      reliefPriority: 'Relief Priority',
      liveTelemetryTitle: 'Live Agent Telemetry Stream',
      allAgents: 'All Agents',
      noLogEvents: 'No log events yet. Trigger a simulation to view orchestration.',
      noActiveIncident: 'No active disaster incident recorded. Trigger any simulation above to observe multi-agent orchestration.',
      openChatbot: 'Emergency AI Chatbot',
      searchLocationOnGoogleMaps: 'Google Maps Area Search'
    },
    mapTabs: {
      liveMap: 'Live Incident & Tactical Map',
      liveMapDesc: 'Real-time hazard perimeters, relief units & citizen SOS',
      googleMap: 'Google Maps Area Explorer',
      googleMapDesc: 'Search addresses, find nearest safe haven & Google navigation',
      dualView: 'Dual View (Side-by-Side)',
      dualViewDesc: 'Simultaneous tactical telemetry & Google Maps exploration'
    },
    liveMap: {
      title: 'Live Disaster & Tactical Telemetry Map',
      subtitle: 'Real-time hazard zones, NDRF units & citizen safety grid',
      legendHazards: 'Hazard Zones',
      legendShelters: 'Safe Shelters',
      legendTeams: 'NDRF Units',
      legendSos: 'Citizen SOS',
      filterHazards: 'Hazard Zones',
      filterTeams: 'Relief Teams',
      filterShelters: 'Shelters',
      filterSos: 'SOS Alerts',
      recenter: 'Recenter Map'
    },
    googleMap: {
      title: 'Google Maps Area & Safe Zone Locator',
      searchPlaceholder: 'Search any district, landmark or area (e.g. Dadar, Andheri, Kurla)...',
      findNearestShelter: 'Find Nearest Safe Shelter',
      nearestShelterFound: 'Nearest Open Safe Shelter',
      distanceAway: 'away from searched location',
      openInGoogleMaps: 'View on Google Maps',
      getDirections: 'Navigate with Google Maps',
      layerStandard: 'Standard Map',
      layerSatellite: 'Satellite Hybrid',
      layerDark: 'Tactical Dark',
      quickAreas: 'Popular Areas',
      openInApp: 'Open Google Maps App',
      findNearbyHospitals: 'Nearby Hospitals',
      findNearbyPolice: 'Nearby Police',
      findNearbyFire: 'Fire Stations',
      satelliteHybrid: 'Satellite Hybrid',
      streetTraffic: 'Road & Transit'
    },
    chatbot: {
      title: 'RakshaNet AI Emergency Chatbot',
      subtitle: 'Instant answers on shelters, first-aid, evacuation & disaster status',
      greeting: 'Hello! I am your AI Emergency & Operations Assistant. Ask me anything about nearest shelters, active warnings, safe corridors, or first-aid procedures.',
      placeholder: 'Type your emergency or operational question here...',
      send: 'Ask AI',
      quickPrompts: [
        'Where is the nearest open shelter to Dadar?',
        'What is the current flood and weather warning?',
        'First aid for flood water exposure and cuts',
        'How do I safely signal rescue helicopters at night?',
        'What is the status of NDRF relief teams?'
      ],
      disclaimer: 'Powered by Gemini AI disaster survival protocols (NDMA & WHO verified).'
    }
  },

  hi: {
    appName: 'रक्षानेट',
    globalBadge: 'ग्लोबल',
    tagline: 'बहु-आपदा आपातकालीन प्रतिक्रिया और ऑफलाइन नागरिक सुरक्षा',
    activeStatus: 'सक्रिय',
    criticalBadge: 'अति-गंभीर',
    views: {
      mobile: 'नागरिक मोबाइल',
      dashboard: 'कमांड सेंटर',
      phoneFrame: 'मोबाइल फ्रेम',
      fullWidth: 'पूर्ण स्क्रीन'
    },
    tools: {
      rescueTools: 'बचाव उपकरण',
      aiScanner: 'एआई क्षति स्कैनर',
      aiScannerDesc: 'भवन दरार, बाढ़ जलस्तर और ढहने के खतरे का विश्लेषण',
      beacon: 'ऑप्टिकल एसओएस बीकन',
      beaconDesc: 'ड्रोन और हेलिकॉप्टर के लिए मोर्स कोड स्ट्रोब लाइट',
      route: 'सुरक्षित निकासी मार्ग',
      routeDesc: 'खतरे से बचते हुए निकटतम आश्रय का रास्ता',
      kit: '72-घंटे सर्वाइवल किट',
      kitDesc: 'आपातकालीन राशन, दवाएं व आवश्यक चेकलिस्ट',
      pwaInstall: 'पूर्ण ऑफलाइन आपदा तैयारी के लिए रक्षानेट PWA ऐप इंस्टॉल करें!',
      installBtn: 'ऐप इंस्टॉल करें'
    },
    mobileNav: {
      sos: 'एसओएस और लाइव',
      map: 'सुरक्षित आश्रय',
      ai: 'एआई सलाहकार',
      handbook: 'बचाव गाइड',
      registry: 'सुरक्षा सूची'
    },
    home: {
      immediateThreat: 'क्या जीवन या सुरक्षा पर तत्काल खतरा है?',
      oneTapSos: '1-टैप अलर्ट',
      abortGuard: '3-सेकंड सुरक्षा • जीपीएस प्रसारण • 100% ऑफलाइन कार्यरत',
      markSafe: 'स्वयं को सुरक्षित चिह्नित करें ("मैं सुरक्षित हूँ")',
      nearestShelter: 'निकटतम खुला आपातकालीन आश्रय',
      spotsFree: 'स्थान उपलब्ध',
      away: 'दूरी',
      navigate: 'मार्ग देखें (GPS नेविगेशन)',
      call: 'कॉल करें',
      allClear: 'आपके क्षेत्र में सब सामान्य है',
      allClearDesc: '15 किमी के दायरे में कोई सक्रिय आपदा चेतावनी नहीं है।',
      normal: 'सामान्य',
      advancedTitle: 'उन्नत बचाव एवं तैयारी उपकरण',
      offlineReady: '100% ऑफलाइन कार्यक्षम',
      emergencyCallTitle: 'त्वरित आपातकालीन हेल्पलाइन',
      allEmergency: 'सभी आपातकाल',
      disasterRelief: 'आपदा राहत',
      ambulance: 'एम्बुलेंस'
    },
    aiAdvisor: {
      title: 'रक्षानेट एआई आपातकालीन सहायक',
      desc: 'आपदा मार्गदर्शन, सुरक्षित जल और प्राथमिक उपचार के लिए जेमिनी 2.5 फ्लैश द्वारा संचालित',
      greeting: 'नमस्ते। मैं आपका रक्षानेट एआई आपातकालीन सहायक हूँ। मैं आपको सुरक्षित निकासी मार्ग, प्राथमिक चिकित्सा, स्वच्छ जल और आपदा सुरक्षा में मार्गदर्शन कर सकता हूँ। मैं अभी आपकी कैसे सहायता कर सकता हूँ?',
      placeholder: 'अपनी सुरक्षा हेतु एआई से कोई भी प्रश्न पूछें...',
      send: 'पूछें',
      quickPromptsTitle: 'त्वरित आपातकालीन प्रश्न',
      quickPrompts: [
        'बिना बिजली के बाढ़ के पानी को कैसे शुद्ध करें?',
        'भूकंप के मलबे में फंसने पर क्या करें?',
        'गंभीर रक्तस्राव के लिए तत्काल प्राथमिक उपचार?',
        'बचाव हेलीकॉप्टरों को संकेत कैसे दें?'
      ],
      offlineNotice: 'ऑफलाइन सुरक्षा मोड: स्थानीय कैश से एआई सुरक्षा निर्देश लोड किए गए।'
    },
    handbook: {
      title: 'नागरिक सुरक्षा एवं आपदा जीवन-रक्षा पुस्तिका',
      subtitle: 'एनडीएमए (NDMA) और रेड क्रॉस द्वारा प्रमाणित मानक प्रक्रियाएं',
      emergencyHotline: 'आपातकालीन हेल्पलाइन',
      beforePhase: 'पूर्व तैयारी (आपदा से पहले)',
      duringPhase: 'सुरक्षा कदम (आपदा के दौरान)',
      afterPhase: 'बचाव व पुनर्वास (आपदा के बाद)',
      disasters: {
        flood: {
          title: 'अचानक बाढ़ व जलभराव',
          before: [
            'कम से कम 3 दिनों के लिए सीलबंद बर्तनों में पीने का पानी रखें।',
            'दस्तावेज और बिजली के महत्वपूर्ण उपकरण पानी के स्तर से ऊपर रखें।',
            'ऊँचे सुरक्षित स्थानों और नजदीकी राहत शिविरों की पहचान करें।'
          ],
          during: [
            'बहते हुए बाढ़ के पानी में कभी न चलें और न ही वाहन चलाएं।',
            'पानी घर में घुसने से पहले मुख्य बिजली स्विच और गैस वाल्व बंद करें।',
            'यदि इमारत में फंस जाएं, तो ऊपरी मंजिल या छत पर जाएं और चमकीले कपड़े/सीटी से संकेत दें।'
          ],
          after: [
            'ठहरे हुए पानी से दूर रहें; इसमें बिजली का करंट या जहरीले रसायन हो सकते हैं।',
            'पीने से पहले सभी पानी को कम से कम 3 मिनट तक अच्छी तरह उबालें।',
            'टूटे हुए बिजली के तारों की सूचना तुरंत राहत दल को दें।'
          ]
        },
        earthquake: {
          title: 'भूकंप एवं भूगर्भीय झटके',
          before: [
            'दीवार पर टंगी भारी वस्तुएं, अलमारी और गैस सिलेंडर को मजबूती से बांधें।',
            'बिस्तर के पास टॉर्च, प्राथमिक चिकित्सा बॉक्स और सीटी रखें।',
            'परिवार के लिए बाहर एक खुला सुरक्षित मिलन स्थल तय करें।'
          ],
          during: [
            'झटके महसूस होते ही तुरंत घुटनों के बल नीचे बैठें (DROP)।',
            'मजबूत मेज के नीचे अपने सिर और गर्दन को ढंकें (COVER)।',
            'कंपन रुकने तक मजबूती से पकड़ें (HOLD ON)। लिफ्ट का प्रयोग कदापि न करें!'
          ],
          after: [
            'आफ्टरशॉक्स (झटकों) के लिए तैयार रहें। चोटों की जांच करें।',
            'गैस रिसाव सूंघें — माचिस, मोमबत्ती या लाइटर न जलाएं।',
            'कंपन शांत होने पर सीढ़ियों के रास्ते सावधानी से बाहर निकलें।'
          ]
        },
        cyclone: {
          title: 'चक्रवात एवं तीव्र तटीय तूफान',
          before: [
            'खिड़कियों के कांच टूटने से रोकने के लिए उन पर टेप लगाएं या बोर्ड लगाएं।',
            'बिजली की लाइनों के पास के सूखे पेड़ और शाखाएं काट लें।',
            'बैटरी वाला रेडियो और पूरी तरह चार्ज पावर बैंक तैयार रखें।'
          ],
          during: [
            'घर के सबसे मजबूत केंद्रीय कमरे में रहें, खिड़कियों से दूर रहें।',
            'तूफान की "आंख" से सावधान रहें — अचानक शांति के बाद उलटी दिशा से भीषण हवाएं आती हैं।',
            'हाई-वोल्टेज उछाल से बचने के लिए बिजली के उपकरण अनप्लग करें।'
          ],
          after: [
            'जब तक प्रशासन "ऑल क्लियर" न दे, तब तक बाहर न निकलें।',
            'टूटे कांच, लटकते बिजली के तार और ढीले खंभों से सावधान रहें।',
            'तटीय सड़कों पर अनावश्यक यात्रा करने से बचें।'
          ]
        },
        wildfire: {
          title: 'जंगल की आग एवं भीषण अग्निकांड',
          before: [
            'घर के 30 फीट के दायरे में सूखी पत्तियां और ज्वलनशील सामग्री हटाएं।',
            'N95 मास्क और जलने की दवाइयों के साथ इमरजेंसी किट तैयार रखें।',
            'निकासी के लिए कम से कम दो अलग-अलग सड़क मार्ग पहले से तय रखें।'
          ],
          during: [
            'चेतावनी मिलते ही तुरंत सुरक्षित स्थान पर जाएं; सामान के लिए न रुकें।',
            'सूती कपड़े पहनें और चेहरे पर गीला रुमाल या N95 मास्क लगाएं।',
            'हवा के बहाव को धीमा करने के लिए घर से निकलते समय सभी खिड़की-दरवाजे बंद करें।'
          ],
          after: [
            'दमकल विभाग द्वारा सुरक्षित घोषित किए जाने से पहले जले क्षेत्र में न जाएं।',
            'छत और अटारी में छिपी हुई सुलगती चिंगारियों की जांच करें।',
            'धुएं और राख के संपर्क में आए भोजन व पानी को नष्ट करें।'
          ]
        },
        landslide: {
          title: 'भूस्खलन एवं मलबा प्रवाह',
          before: [
            'पहाड़ी ढलानों पर बिजली के खंभों या पेड़ों के झुकने पर नजर रखें।',
            'गैस और पानी की पाइपलाइनों में लचीली फिटिंग का उपयोग करें।',
            'प्राकृतिक जल नालियों से दूर ऊंचाई वाले निकासी रास्तों को पहचानें।'
          ],
          during: [
            'चट्टानों के गिरने की आवाज सुनते ही तुरंत मलबे के रास्ते से दूर भागें।',
            'यदि भागना असंभव हो, तो सिकुड़कर सिर और गर्दन को दोनों हाथों से बचाएं।',
            'नदी-नालों के पानी के रंग में अचानक मिट्टी आने पर तुरंत सतर्क हो जाएं।'
          ],
          after: [
            'भूस्खलन क्षेत्र से दूर रहें; इसके बाद दोबारा मलबा गिर सकता है।',
            'मलबे में सीधे घुसे बिना फंसे लोगों की पहचान करें और अधिकारियों को बताएं।',
            'टूटी सड़कों और पुलों की जानकारी प्रशासन को दें।'
          ]
        },
        heatwave: {
          title: 'भीषण लू एवं अत्यधिक गर्मी',
          before: [
            'ओआरएस (ORS), नारियल पानी और ग्लूकोज घर में पर्याप्त मात्रा में रखें।',
            'खिड़कियों पर धूप रोकने वाले पर्दे या रिफ्लेक्टिव शीट लगाएं।',
            'धूप वाले काम सुबह 9 बजे से पहले या शाम 5:30 बजे के बाद ही करें।'
          ],
          during: [
            'प्यास न लगने पर भी हर 20 मिनट में पानी पीते रहें।',
            'हल्के रंग के ढीले सूती कपड़े पहनें और सिर को तौलिए या टोपी से ढंकें।',
            'चक्कर आने या पसीना बंद होने पर तुरंत छांव में जाएं और ठंडे पानी की पट्टी रखें।'
          ],
          after: [
            'अगले 48 घंटों तक शरीर में पानी और नमक का संतुलन बनाए रखें।',
            'बुजुर्गों, छोटे बच्चों और पालतू जानवरों का विशेष ध्यान रखें।',
            'मौसम विभाग के स्थानीय हीट एडवाइजरी स्तर पर नजर रखें।'
          ]
        }
      }
    },
    registry: {
      title: 'नागरिक सुरक्षा एवं कुशलता पंजी',
      searchPlaceholder: 'नागरिक का नाम, फोन या स्थान से खोजें...',
      totalSafe: 'सुरक्षित दर्ज नागरिक',
      allDistricts: 'सभी जिले',
      noResults: 'इस खोज के लिए कोई नागरिक रिकॉर्ड नहीं मिला।',
      statusSafe: 'सुरक्षित',
      statusNeedHelp: 'मदद चाहिए',
      statusInShelter: 'राहत शिविर में'
    },
    sosModal: {
      title: 'आपातकालीन एसओएस की पुष्टि करें',
      subtitle: 'सटीक जीपीएस के साथ संकट संकेत भेजने के लिए बटन दबाएं।',
      holdNotice: 'एनडीआरएफ, पुलिस और मेडिकल टीम को तुरंत सूचित किया जाएगा',
      typeLabel: 'आपातकाल का प्रकार',
      types: {
        medical: 'गंभीर चिकित्सीय आपातकाल',
        trapped: 'मलबे या इमारत में फंसे हुए',
        flood: 'बाढ़ के पानी में फंसे हुए',
        fire: 'आग या जहरीले धुएं में फंसे हुए',
        other: 'अन्य गंभीर जानलेवा खतरा'
      },
      sendBtn: 'अभी एसओएस संदेश भेजें',
      cancelBtn: 'रद्द करें / गलती से खुला',
      sending: 'संकट संकेत भेजा जा रहा है...',
      successNotice: 'एसओएस प्रसारित कर दिया गया है! राहत दल को सूचना भेज दी गई है।'
    },
    checkinModal: {
      title: 'नागरिक सुरक्षा चेक-इन',
      subtitle: 'सार्वजनिक और राहत सूची पर स्वयं को और परिवार को सुरक्षित चिह्नित करें।',
      nameLabel: 'आपका पूरा नाम',
      namePlaceholder: 'जैसे: रमेश पाटील और परिवार (3)',
      phoneLabel: 'मोबाइल नंबर',
      phonePlaceholder: '+91 98765 43210',
      conditionLabel: 'वर्तमान स्थिति',
      conditions: {
        safe: 'पूरी तरह सुरक्षित हैं',
        minor: 'कम मात्रा में पानी / भोजन की आवश्यकता',
        urgent: 'तत्काल डॉक्टर / मेडिकल सहायता चाहिए',
        shelter: 'राहत शिविर में पहुंच चुके हैं'
      },
      notesLabel: 'संक्षिप्त विवरण (वैकल्पिक)',
      notesPlaceholder: 'जैसे: दूसरी मंजिल पर सुरक्षित हैं, सड़क पर पानी भर रहा है।',
      submitBtn: 'सुरक्षित स्थिति दर्ज करें ("मैं सुरक्षित हूँ")',
      submitting: 'दर्ज किया जा रहा है...'
    },
    dashboard: {
      activeIncidents: 'सक्रिय आपदाएं',
      sheltersOpen: 'खुले राहत शिविर',
      bedsFree: 'बिस्तर खाली',
      ndrfDeployed: 'राहत एवं मेडिकल बल',
      personnel: 'सैनिक व कर्मी',
      citizenRegistry: 'नागरिक पंजी',
      earlyWarning: 'पूर्व चेतावनी सेंसर',
      anomalies: 'असामान्यताएं',
      aiAgentsTitle: '5 स्वायत्त एआई एजेंट आर्किटेक्चर',
      aiAgentsDesc: 'सेंसर इनपुट से लेकर क्षति आंकलन तक स्वचालित आपदा चक्र',
      resetDemo: 'डेमो रीसेट करें',
      simulateTitle: 'सभी 6 आपदाओं का सिमुलेशन:',
      tacticalTools: 'आपातकालीन सामरिक उपकरण:',
      incidentMap: 'लाइव आपदा नियंत्रण मानचित्र',
      shelterNetwork: 'राहत शिविर नेटवर्क स्थिति',
      reliefTeams: 'तैनात राहत दल',
      normalStandby: 'सामान्य स्टैंडबाय स्थिति',
      verified: 'सत्यापित',
      capacityOccupied: 'क्षमता भरी हुई',
      deployedUnits: 'त्वरित प्रतिक्रिया सामरिक दल',
      liveLedger: 'लाइव पंजी',
      markedSafeDesc: 'सुरक्षित चिह्नित',
      multiHazardScan: 'बहु-आपदा सतत सेंसर निगरानी',
      damageTriageTitle: 'क्षति आंकलन एवं आर्थिक नुकसान वर्गीकरण',
      damageScore: 'क्षति स्कोर',
      estLoss: 'अनुमानित आर्थिक हानि',
      affectedHomes: 'प्रभावित मकान',
      blockedRoutes: 'अवरुद्ध मार्ग',
      agentRecs: 'एजेंट की सिफारिशें:',
      reliefPriority: 'राहत प्राथमिकता',
      liveTelemetryTitle: 'लाइव एजेंट टेलीमेट्री स्ट्रीम',
      allAgents: 'सभी एजेंट',
      noLogEvents: 'अभी कोई लॉग नहीं। सिमुलेशन शुरू करें।',
      noActiveIncident: 'कोई सक्रिय आपदा दर्ज नहीं है। बहु-एजेंट समन्वय देखने के लिए सिमुलेशन शुरू करें।',
      openChatbot: 'आपातकालीन एआई चैटबॉट',
      searchLocationOnGoogleMaps: 'गूगल मैप्स क्षेत्र खोज'
    },
    mapTabs: {
      liveMap: 'लाइव आपदा व टैक्टिकल नक्शा',
      liveMapDesc: 'रीयल-टाइम आपदा परिधि, राहत दल व नागरिक एसओएस',
      googleMap: 'गूगल मैप्स क्षेत्र खोजक',
      googleMapDesc: 'मोहल्ला खोज, निकटतम सुरक्षित आश्रय व नेविगेशन',
      dualView: 'दोहरा दृश्य (दोनों नक्शे साथ)',
      dualViewDesc: 'लाइव आपदा और गूगल मैप्स दोनों साथ-साथ देखें'
    },
    liveMap: {
      title: 'लाइव आपदा व टैक्टिकल नक्शा',
      subtitle: 'रीयल-टाइम बहु-आपदा टेलीमेट्री, एनडीआरएफ टीमें व नागरिक सुरक्षा ग्रिड',
      legendHazards: 'आपदा क्षेत्र',
      legendShelters: 'सुरक्षित शिविर',
      legendTeams: 'एनडीआरएफ राहत दल',
      legendSos: 'नागरिक एसओएस',
      filterHazards: 'आपदा क्षेत्र',
      filterTeams: 'राहत दल',
      filterShelters: 'शिविर',
      filterSos: 'एसओएस अलर्ट',
      recenter: 'नक्शा रीसेंटर करें'
    },
    googleMap: {
      title: 'गूगल मैप्स क्षेत्र एवं सुरक्षित शिविर खोजक',
      searchPlaceholder: 'किसी भी क्षेत्र या मोहल्ले को खोजें (उदा. दादर, अंधेरी, कुर्ला)...',
      findNearestShelter: 'निकटतम सुरक्षित शिविर खोजें',
      nearestShelterFound: 'निकटतम खुला सुरक्षित शिविर',
      distanceAway: 'खोजे गए स्थान से दूर',
      openInGoogleMaps: 'गूगल मैप्स पर देखें',
      getDirections: 'गूगल मैप्स से नेविगेट करें',
      layerStandard: 'मानक नक्शा',
      layerSatellite: 'सैटेलाइट हाइब्रिड',
      layerDark: 'टैक्टिकल डार्क',
      quickAreas: 'प्रमुख क्षेत्र',
      openInApp: 'गूगल मैप्स ऐप में खोलें',
      findNearbyHospitals: 'निकटतम अस्पताल',
      findNearbyPolice: 'निकटतम पुलिस स्टेशन',
      findNearbyFire: 'अग्निशमन केंद्र',
      satelliteHybrid: 'सैटेलाइट हाइब्रिड',
      streetTraffic: 'सड़क व ट्रांजिट'
    },
    chatbot: {
      title: 'रक्षानेट एआई आपातकालीन चैटबॉट',
      subtitle: 'शिविरों, प्राथमिक उपचार, सुरक्षित मार्गों और आपदा स्थिति पर तुरंत उत्तर',
      greeting: 'नमस्ते! मैं आपका एआई आपातकालीन और ऑपरेशनल सहायक हूँ। मुझसे निकटतम शिविर, सक्रिय अलर्ट, सुरक्षित मार्ग या प्राथमिक चिकित्सा के बारे में पूछें।',
      placeholder: 'अपना आपातकालीन या सुरक्षा प्रश्न यहाँ लिखें...',
      send: 'पूछें',
      quickPrompts: [
        'दादर के सबसे नजदीक कौन सा सुरक्षित शिविर है?',
        'वर्तमान में क्या कोई बाढ़ या चक्रवात की चेतावनी है?',
        'गंदे पानी से कटने पर क्या प्राथमिक उपचार करें?',
        'रात में बचाव दल को संकेत कैसे दें?',
        'एनडीआरएफ की कितनी टीमें तैनात हैं?'
      ],
      disclaimer: 'जेमिनी एआई आपदा प्रबंधन व एनडीएमए दिशानिर्देशों पर आधारित।'
    }
  },

  mr: {
    appName: 'रक्षानेट',
    globalBadge: 'ग्लोबल',
    tagline: 'बहु-आपत्ती आणीबाणी प्रतिसाद आणि ऑफलाइन नागरी संरक्षण',
    activeStatus: 'सक्रिय',
    criticalBadge: 'अति-गंभीर',
    views: {
      mobile: 'नागरिक मोबाइल',
      dashboard: 'कमांड सेंटर',
      phoneFrame: 'मोबाइल फ्रेम',
      fullWidth: 'पूर्ण स्क्रीन'
    },
    tools: {
      rescueTools: 'बचाव साधने',
      aiScanner: 'एआय नुकसान स्कॅनर',
      aiScannerDesc: 'इमारतीचे तडे, पूर पातळी व कोसळण्याच्या धोक्याचे विश्लेषण',
      beacon: 'ऑप्टिकल एसओएस बीकन',
      beaconDesc: 'ड्रोन आणि हेलिकॉप्टरसाठी मोर्स कोड स्ट्रोब फ्लॅश',
      route: 'सुरक्षित स्थलांतर मार्ग',
      routeDesc: 'धोकादायक क्षेत्र टाळून सुरक्षित निवाऱ्याकडे जाणारा रस्ता',
      kit: '72-तास सर्व्हायव्हल बॅग',
      kitDesc: 'आणीबाणी रेशन, औषधे आणि जीवनावश्यक यादी',
      pwaInstall: 'संपूर्ण ऑफलाइन आपत्ती सज्जतेसाठी रक्षानेट PWA ॲप इन्स्टॉल करा!',
      installBtn: 'ॲप इन्स्टॉल करा'
    },
    mobileNav: {
      sos: 'एसओएस व लाइव्ह',
      map: 'सुरक्षित निवारे',
      ai: 'एआय सल्लागार',
      handbook: 'बचाव मार्गदर्शक',
      registry: 'नागरिक नोंदणी'
    },
    home: {
      immediateThreat: 'जीवितास किंवा सुरक्षेस तात्काळ धोका आहे का?',
      oneTapSos: '1-टॅप अलर्ट',
      abortGuard: '3-सेकंद सुरक्षा • जीपीएस प्रसारण • 100% ऑफलाइन कार्यरत',
      markSafe: 'स्वतःला सुरक्षित नोंदवा ("मी सुरक्षित आहे")',
      nearestShelter: 'जवळचा खुला आणीबाणी निवारा',
      spotsFree: 'जागा उपलब्ध',
      away: 'अंतर',
      navigate: 'मार्ग पहा (GPS नेव्हिगेशन)',
      call: 'कॉल करा',
      allClear: 'आपल्या भागात सर्व सुरळीत आहे',
      allClearDesc: '15 किमी अंतरामध्ये कोणताही सक्रिय आपत्ती इशारा नाही.',
      normal: 'सामान्य',
      advancedTitle: 'प्रगत बचाव व तयारी साधने',
      offlineReady: '100% ऑफलाइन सज्ज',
      emergencyCallTitle: 'तातडीचे हेल्पलाइन नंबर',
      allEmergency: 'सर्व आणीबाणी',
      disasterRelief: 'आपत्ती निवारण',
      ambulance: 'रुग्णवाहिका'
    },
    aiAdvisor: {
      title: 'रक्षानेट एआय आपत्कालीन सहाय्यक',
      desc: 'जेमिनी 2.5 फ्लॅशद्वारे चालवलेले आपत्ती व्यवस्थापन, प्रथमोपचार व मार्गदर्शन',
      greeting: 'नमस्ते. मी तुमचा रक्षानेट एआय आपत्कालीन सहाय्यक आहे. मी तुम्हाला सुरक्षित स्थलांतर मार्ग, प्रथमोपचार, पाणी शुद्धीकरण आणि आपत्ती सुरक्षिततेबाबत मदत करू शकतो. मी तुम्हाला कशी मदत करू शकतो?',
      placeholder: 'सुरक्षेबाबत एआय ला कोणताही प्रश्न विचारा...',
      send: 'विचारा',
      quickPromptsTitle: 'तातडीचे आपत्कालीन प्रश्न',
      quickPrompts: [
        'विजेविना पुराचे पाणी कसे शुद्ध करावे?',
        'भूकंपात मलब्याखाली अडकल्यास काय करावे?',
        'रक्तस्राव थांबवण्यासाठी तात्काळ प्रथमोपचार?',
        'बचाव पथकाच्या हेलिकॉप्टरला संकेत कसे द्यावे?'
      ],
      offlineNotice: 'ऑफलाइन सुरक्षा मोड: स्थानिक कॅशमधून एआय सुरक्षा नियम लोड केले.'
    },
    handbook: {
      title: 'नागरी संरक्षण व आपत्ती जीवन-रक्षण पुस्तिका',
      subtitle: 'एनडीएमए (NDMA) व आपत्ती व्यवस्थापन प्राधिकरणाची प्रमाणित नियमावली',
      emergencyHotline: 'आणीबाणी हेल्पलाइन',
      beforePhase: 'आपत्तीपूर्व (तयारी)',
      duringPhase: 'आपत्तीदरम्यान (तात्काळ बचाव)',
      afterPhase: 'आपत्तीनंतर (सुरक्षित पुनर्वसन)',
      disasters: {
        flood: {
          title: 'अचानक पूर व जलमय स्थिती',
          before: [
            'किमान 3 दिवस पुरेल इतके पिण्याचे पाणी बंद डब्यांमध्ये साठवून ठेवा.',
            'महत्त्वाची कागदपत्रे व विजेची उपकरणे पाण्याच्या पातळीपेक्षा उंच जागी ठेवा.',
            'उंच भूभाग आणि जवळच्या मदत केंद्रांची माहिती ठेवा.'
          ],
          during: [
            'वाहत्या पुराच्या पाण्यातून कधीही चालू किंवा गाडी चालवू नका.',
            'घरात पाणी शिरण्यापूर्वी मुख्य वीज स्विच आणि गॅस सिलिंडर बंद करा.',
            'अडकल्यास घराच्या छतावर जा आणि चमकदार कापड किंवा शिट्टीने संकेत द्या.'
          ],
          after: [
            'साचलेल्या पाण्यापासून दूर राहा; त्यात विद्युत प्रवाह किंवा विषारी कीटक असू शकतात.',
            'पिण्याचे पाणी किमान 3 मिनिटे चांगले उकळून घ्या.',
            'तुटलेल्या विजेच्या तारांची माहिती तात्काळ मदत पथकाला द्या.'
          ]
        },
        earthquake: {
          title: 'भूकंप व भूगर्भीय धक्के',
          before: [
            'कपाटे, जड शोकेस व गॅस सिलिंडर भिंतीला घट्ट बांधून ठेवा.',
            'बेडशेजारी बॅटरी, प्रथमोपचार पेटी आणि शिट्टी ठेवा.',
            'कुटुंबासाठी बाहेर मोकळ्या मैदानात एक सुरक्षित जागा ठरवा.'
          ],
          during: [
            'धक्के जाणवताच त्वरित जमिनीवर बसा (DROP).',
            'मजबूत टेबलखाली डोके आणि मान सुरक्षित झाका (COVER).',
            'धक्के थांबेपर्यंत टेबलाला घट्ट धरून ठेवा (HOLD ON). लिफ्ट वापरू नका!'
          ],
          after: [
            'पुढील धक्क्यांसाठी (Aftershocks) सावध राहा.',
            'गॅस गळती वास घेऊन तपासा — काडीपेटी किंवा मेणबत्ती पेटवू नका.',
            'कंपने थांबल्यानंतर जिन्यावरून सावकाश बाहेर पडा.'
          ]
        },
        cyclone: {
          title: 'चक्रीवादळ व जोरदार किनारी वारे',
          before: [
            'खिडक्यांच्या काचा फुटू नयेत म्हणून त्यावर टेप लावा.',
            'विजेच्या तारांजवळील झाडांच्या सुक्या फांद्या छाटून घ्या.',
            'बॅटरीवर चालणारा रेडिओ आणि पॉवर बँक चार्ज करून ठेवा.'
          ],
          during: [
            'घरातील खिडक्या नसलेल्या मध्यवर्ती सुरक्षित खोलीत राहा.',
            'वादळाच्या शांत मध्यभागापासून (Eye) सावध राहा; त्यानंतर उलट्या दिशेने भीषण वारे वाहतात.',
            'विद्युत उपकरणे अनप्लग करून ठेवा.'
          ],
          after: [
            'प्रशासनाने सुरक्षित घोषित करेपर्यंत घराबाहेर पडू नका.',
            'तुटलेल्या तारा, पडलेली झाडे आणि काचांपासून दूर राहा.',
            'किनारपट्टीवरील रस्त्यांवरून प्रवास करणे टाळा.'
          ]
        },
        wildfire: {
          title: 'वणवा व भीषण आग',
          before: [
            'घराभोवतीचा 30 फूट परिसर वाळलेला पालापाचोळा मुक्त ठेवा.',
            'N95 मास्क व भाजण्यावरील मलमासह इमर्जन्सी किट तयार ठेवा.',
            'बाहेर पडण्यासाठी किमान दोन स्वतंत्र रस्ते माहित ठेवा.'
          ],
          during: [
            'इशारा मिळताच तात्काळ बाहेर पडा; सामानासाठी थांबू नका.',
            'सुती कपडे घाला आणि नाकातोंडावर ओला रुमाल बांधा.',
            'घरातून बाहेर पडताना खिडक्या व दरवाजे बंद करा.'
          ],
          after: [
            'अग्निशामक दलाने परवानगी दिल्याशिवाय जळालेल्या भागात जाऊ नका.',
            'छतावर किंवा लाकडी सामानात धगधगणारे निखारे तपासा.',
            'धूर किंवा राखेचा संपर्क झालेले अन्न खाऊ नका.'
          ]
        },
        landslide: {
          title: 'दरड कोसळणे व भूस्खलन',
          before: [
            'डोंगराच्या उतारावरील झाडे किंवा विजेचे खांब वाकल्याचे दिसल्यास त्वरित सावध व्हा.',
            'लवचिक पाईप फिटिंग वापरा ज्यामुळे गॅस किंवा पाण्याची लाईन फुटणार नाही.',
            'नैसर्गिक ओढ्यांपासून दूर उंचावरील सुरक्षित मार्ग निवडा.'
          ],
          during: [
            'दगडांचा गडगडाट ऐकू येताच तात्काळ बाजूच्या सुरक्षित जमिनीवर पळा.',
            'पळणे अशक्य असल्यास स्वतःला गोलाकार आकुंचन करून डोक्याचे रक्षण करा.',
            'ओढ्यातील पाण्याचा रंग अचानक गढूळ झाल्यास तत्काळ दूर व्हा.'
          ],
          after: [
            'दरड कोसळलेल्या क्षेत्रापासून दूर राहा; पुन्हा दरड कोसळू शकते.',
            'स्वतः मलब्यात न शिरता अडकलेल्या लोकांची माहिती बचाव पथकाला द्या.',
            'खचलेले रस्ते व पुलांची माहिती पोलिसांना कळवा.'
          ]
        },
        heatwave: {
          title: 'उष्णतेची लाट व उष्माघात',
          before: [
            'ओआरएस (ORS), लिंबू पाणी व ग्लुकोज घरात तयार ठेवा.',
            'खिडक्यांवर सूर्यप्रकाश परावर्तित करणारे पडदे लावा.',
            'उन्हातील कामे सकाळी 9 च्या आधी किंवा संध्याकाळी 5:30 नंतरच करा.'
          ],
          during: [
            'तहान लागली नसली तरीही दर 20 मिनिटांनी पाणी प्या.',
            'हलक्या रंगाचे सुती कपडे वापरा आणि डोक्यावर रुमाल किंवा टोपी घाला.',
            'चक्कर आल्यास किंवा घाम येणे थांबल्यास त्वरित सावलीत या आणि ओल्या कापडाने अंग पुसा.'
          ],
          after: [
            'पुढील दोन दिवस भरपूर पाणी व ताक, लिंबूपाणी प्या.',
            'लहान मुले, वृद्ध व्यक्ती व पाळीव प्राण्यांची विशेष काळजी घ्या.',
            'स्थानिक तापमान आणि हवामान इशाऱ्यांवर लक्ष ठेवा.'
          ]
        }
      }
    },
    registry: {
      title: 'थेट नागरिक सुरक्षा व कुशलता नोंदवही',
      searchPlaceholder: 'नागरिकाचे नाव, फोन किंवा ठिकाणाने शोधा...',
      totalSafe: 'सुरक्षित नोंदणी झालेले',
      allDistricts: 'सर्व जिल्हे',
      noResults: 'या शोधासाठी कोणतीही नोंद सापडली नाही.',
      statusSafe: 'सुरक्षित',
      statusNeedHelp: 'मदत हवी आहे',
      statusInShelter: 'राहत छावणीत'
    },
    sosModal: {
      title: 'आणीबाणी एसओएस पुष्टी करा',
      subtitle: 'अचूक जीपीएससह तात्काळ मदत संदेश पाठवण्यासाठी बटण दाबा.',
      holdNotice: 'एनडीआरएफ, पोलीस आणि रुग्णवाहिका पथकास तात्काळ अलर्ट जाईल',
      typeLabel: 'आणीबाणीचा प्रकार',
      types: {
        medical: 'गंभीर वैद्यकीय आणीबाणी',
        trapped: 'मलब्याखाली किंवा इमारतीत अडकलेले',
        flood: 'पुराच्या पाण्यात अडकलेले',
        fire: 'आग किंवा विषारी धूर',
        other: 'जीवितास तात्काळ धोका'
      },
      sendBtn: 'आताच एसओएस संदेश पाठवा',
      cancelBtn: 'रद्द करा / चुकून दाबले',
      sending: 'मदत संदेश पाठवला जात आहे...',
      successNotice: 'एसओएस संदेश पाठवला गेला आहे! मदत पथकाला सूचित करण्यात आले आहे.'
    },
    checkinModal: {
      title: 'नागरिक सुरक्षा नोंदणी',
      subtitle: 'सार्वजनिक व मदत नोंदवहीवर स्वतःला व कुटुंबियांना सुरक्षित नोंदवा.',
      nameLabel: 'तुमचे पूर्ण नाव',
      namePlaceholder: 'उदा. सागर देशमुख व कुटुंब (4)',
      phoneLabel: 'मोबाईल नंबर',
      phonePlaceholder: '+91 98765 43210',
      conditionLabel: 'सध्याची स्थिती',
      conditions: {
        safe: 'पूर्णपणे सुरक्षित आहोत',
        minor: 'पाणी / अन्नाची अल्प मदत हवी',
        urgent: 'तातडीने डॉक्टर / वैद्यकीय मदत हवी',
        shelter: 'सुरक्षित मदत केंद्रात पोहोचलो'
      },
      notesLabel: 'संक्षिप्त माहिती (ऐच्छिक)',
      notesPlaceholder: 'उदा. दुसऱ्या मजल्यावर आहोत, रस्त्यावर पाणी साचले आहे.',
      submitBtn: 'सुरक्षित नोंद करा ("मी सुरक्षित आहे")',
      submitting: 'नोंदणी सुरू आहे...'
    },
    dashboard: {
      activeIncidents: 'सक्रिय आपत्ती घटना',
      sheltersOpen: 'खुले निवारे केंद्र',
      bedsFree: 'खाटा शिल्लक',
      ndrfDeployed: 'एनडीआरएफ व वैद्यकीय पथके',
      personnel: 'जवान व मदतनीस',
      citizenRegistry: 'नागरिक नोंदवही',
      earlyWarning: 'पूर्वसूचना सेन्सर्स',
      anomalies: 'धोकादायक नोंदी',
      aiAgentsTitle: '5 स्वायत्त एआय एजंट्स आर्किटेक्चर',
      aiAgentsDesc: 'सेन्सर नोंदणीपासून नुकसान मोजमापापर्यंत स्वयंचलित आपत्ती व्यवस्थापन',
      resetDemo: 'डेमो रीसेट करा',
      simulateTitle: 'सर्व 6 आपत्तींचे सिम्युलेशन:',
      tacticalTools: 'आणीबाणी सामरिक साधने:',
      incidentMap: 'थेट आपत्ती नियंत्रण नकाशा',
      shelterNetwork: 'निवारा नेटवर्क स्थिती',
      reliefTeams: 'तैनात मदत पथके',
      normalStandby: 'सामान्य स्टँडबाय स्थिती',
      verified: 'सत्यापित',
      capacityOccupied: 'क्षमता भरली आहे',
      deployedUnits: 'जलद प्रतिसाद पथके',
      liveLedger: 'थेट नोंदवही',
      markedSafeDesc: 'सुरक्षित नोंद',
      multiHazardScan: 'बहु-आपत्ती सेन्सर सतत तपासणी',
      damageTriageTitle: 'नुकसान मोजमाप व आर्थिक तोटा विश्लेषण',
      damageScore: 'नुकसान गुण',
      estLoss: 'अंदाजित आर्थिक हानी',
      affectedHomes: 'बाधित घरे',
      blockedRoutes: 'बंद झालेले रस्ते',
      agentRecs: 'एजंटच्या शिफारसी:',
      reliefPriority: 'मदत प्राधान्यता',
      liveTelemetryTitle: 'थेट एजंट टेलिमेट्री प्रवाह',
      allAgents: 'सर्व एजंट',
      noLogEvents: 'अद्याप कोणतेही इव्हेंट नाहीत. सिम्युलेशन सुरू करा.',
      noActiveIncident: 'कोणतीही सक्रिय आपत्ती नोंदवलेली नाही. सिम्युलेशन सुरू करून कार्यपद्धती पहा.',
      openChatbot: 'आणीबाणी एआय चॅटबॉट',
      searchLocationOnGoogleMaps: 'गुगल मॅप्स परिसर शोध'
    },
    mapTabs: {
      liveMap: 'थेट आपत्ती व टॅक्टिकल नकाशा',
      liveMapDesc: 'रीयल-टाइम आपत्ती परिमिती, मदत पथके व एसओएस',
      googleMap: 'गुगल मॅप्स क्षेत्र शोधक',
      googleMapDesc: 'भाग शोध, जवळचा सुरक्षित निवारा व नेव्हिगेशन',
      dualView: 'दुहेरी दृश्य (दोन्ही नकाशे बाजूला)',
      dualViewDesc: 'थेट आपत्ती आणि गुगल मॅप्स दोन्ही एकाच वेळी'
    },
    liveMap: {
      title: 'थेट आपत्ती व टॅक्टिकल नकाशा',
      subtitle: 'रीयल-टाइम बहु-आपत्ती टेलीमेट्री, एनडीआरएफ पथके व नागरी सुरक्षा ग्रिड',
      legendHazards: 'आपत्ती क्षेत्र',
      legendShelters: 'सुरक्षित निवारे',
      legendTeams: 'एनडीआरएफ पथके',
      legendSos: 'नागरीक एसओएस',
      filterHazards: 'आपत्ती क्षेत्र',
      filterTeams: 'मदत पथके',
      filterShelters: 'निवारे',
      filterSos: 'एसओएस अलर्ट',
      recenter: 'नकाशा रीसेंटर करा'
    },
    googleMap: {
      title: 'गुगल मॅप्स परिसर व सुरक्षित निवारा शोधक',
      searchPlaceholder: 'कोणताही परिसर किंवा ठिकाण शोधा (उदा. दादर, अंधेरी, कुर्ला)...',
      findNearestShelter: 'जवळचे सुरक्षित निवारा केंद्र शोधा',
      nearestShelterFound: 'जवळचे खुले सुरक्षित निवारा केंद्र',
      distanceAway: 'शोधलेल्या ठिकाणापासून अंतर',
      openInGoogleMaps: 'गुगल मॅप्सवर पहा',
      getDirections: 'गुगल मॅप्सने दिशादर्शन करा',
      layerStandard: 'मानक नकाशा',
      layerSatellite: 'सॅटेलाइट हायब्रिड',
      layerDark: 'टॅक्टिकल डार्क',
      quickAreas: 'महत्त्वाचे भाग',
      openInApp: 'गुगल मॅप्स ॲपमध्ये उघडा',
      findNearbyHospitals: 'जवळचे रुग्णालय',
      findNearbyPolice: 'जवळचे पोलीस ठाणे',
      findNearbyFire: 'अग्निशमन दल',
      satelliteHybrid: 'सॅटेलाइट हायब्रिड',
      streetTraffic: 'रस्ता व वाहतूक'
    },
    chatbot: {
      title: 'रक्षानेट एआय आणीबाणी चॅटबॉट',
      subtitle: 'निवारे, प्रथमोपचार, सुरक्षित मार्ग व आपत्ती स्थितीवर तत्काळ उत्तरे',
      greeting: 'नमस्कार! मी तुमचा एआय आणीबाणी व ऑपरेशन्स सहाय्यक आहे. जवळचे निवारे, धोक्याची सूचना, सुरक्षित मार्ग किंवा प्रथमोपचाराबद्दल मला विचारा.',
      placeholder: 'तुमचा आणीबाणी किंवा सुरक्षेचा प्रश्न येथे टाईप करा...',
      send: 'विचारा',
      quickPrompts: [
        'दादरच्या सर्वात जवळ सुरक्षित निवारा केंद्र कुठे आहे?',
        'सध्या काही पूर किंवा चक्रीवादळाची चेतावणी आहे का?',
        'गढूळ पाण्यामुळे जखम झाल्यास प्रथमोपचार काय?',
        'रात्रीच्या वेळी बचाव पथकाला संकेत कसा द्यावा?',
        'एनडीआरएफचे किती जवान तैनात आहेत?'
      ],
      disclaimer: 'जेमिनी एआय आपत्ती व्यवस्थापन व एनडीएमए मार्गदर्शक तत्त्वांवर आधारित.'
    }
  },

  bn: {
    appName: 'রক্ষানেট',
    globalBadge: 'গ্লোবাল',
    tagline: 'বহু-দুর্যোগ জরুরি প্রতিক্রিয়া এবং অফলাইন নাগরিক সুরক্ষা',
    activeStatus: 'সক্রিয়',
    criticalBadge: 'জরুরি',
    views: {
      mobile: 'নাগরিক মোবাইল',
      dashboard: 'কমান্ড সেন্টার',
      phoneFrame: 'ফোন ফ্রেম',
      fullWidth: 'ফুল স্ক্রিন'
    },
    tools: {
      rescueTools: 'উদ্ধার সরঞ্জাম',
      aiScanner: 'এআই ক্ষয়ক্ষতি স্ক্যানার',
      aiScannerDesc: 'ভবনের ফাটল, জলস্তর ও ধসের ঝুঁকি বিশ্লেষণ',
      beacon: 'অপটিক্যাল এসওএস বীকন',
      beaconDesc: 'ড্রোন ও হেলিকপ্টারের জন্য মোর্স কোড আলো',
      route: 'নিরাপদ স্থানান্তর রুট',
      routeDesc: 'বিপদ এড়িয়ে নিকটতম আশ্রয়ে যাওয়ার পথ',
      kit: '৭২ ঘণ্টার সারভাইভাল ব্যাগ',
      kitDesc: 'জরুরি খাবার, ওষুধ ও প্রয়োজনীয় চেকলিস্ট',
      pwaInstall: 'সম্পূর্ণ অফলাইন প্রস্তুতির জন্য রক্ষানেট PWA অ্যাপ ইনস্টল করুন!',
      installBtn: 'অ্যাপ ইনস্টল করুন'
    },
    mobileNav: {
      sos: 'এসওএস ও লাইভ',
      map: 'নিরাপদ আশ্রয়',
      ai: 'এআই উপদেষ্টা',
      handbook: 'সুরক্ষা সহায়িকা',
      registry: 'নাগরিক তালিকা'
    },
    home: {
      immediateThreat: 'জীবন বা সুরক্ষায় কোনো তাৎক্ষণিক বিপদ আছে?',
      oneTapSos: '১-ট্যাপ অ্যালার্ট',
      abortGuard: '৩-সেকেন্ড সতর্কতা • জিপিএস সম্প্রচার • ১০০% অফলাইন কার্যকর',
      markSafe: 'নিজেকে নিরাপদ চিহ্নিত করুন ("আমি নিরাপদ")',
      nearestShelter: 'নিকটতম খোলা জরুরি আশ্রয়কেন্দ্র',
      spotsFree: 'স্থান খালি',
      away: 'দূরত্ব',
      navigate: 'পথ দেখুন (GPS নেভিগেশন)',
      call: 'কল করুন',
      allClear: 'আপনার অঞ্চলে পরিস্থিতি স্বাভাবিক',
      allClearDesc: '১৫ কিলোমিটারের মধ্যে কোনো সক্রিয় দুর্যোগের সতর্কতা নেই।',
      normal: 'স্বাভাবিক',
      advancedTitle: 'উন্নত উদ্ধার ও প্রস্তুতিমূলক সরঞ্জাম',
      offlineReady: '১০০% অফলাইন প্রস্তুত',
      emergencyCallTitle: 'জরুরি হেল্পলাইন নম্বর',
      allEmergency: 'সকল জরুরি সেবা',
      disasterRelief: 'দুর্যোগ ত্রাণ',
      ambulance: 'অ্যাম্বুলেন্স'
    },
    aiAdvisor: {
      title: 'রক্ষানেট এআই জরুরি সহকারী',
      desc: 'দুর্যোগ ব্যবস্থাপনা ও সুরক্ষার জন্য জেমিনি ২.৫ ফ্ল্যাশ পরিচালিত',
      greeting: 'নমস্কার। আমি আপনার রক্ষানেট এআই জরুরি সহকারী। আমি আপনাকে নিরাপদ স্থানান্তর পথ, প্রাথমিক চিকিৎসা, বিশুদ্ধ জল এবং দুর্যোগ সুরক্ষা সংক্রান্ত সহায়তা করতে পারি। আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
      placeholder: 'সুরক্ষা নিয়ে এআই-কে যেকোনো প্রশ্ন করুন...',
      send: 'জিজ্ঞাসা করুন',
      quickPromptsTitle: 'জরুরি প্রশ্নসমূহ',
      quickPrompts: [
        'বিদ্যুৎ ছাড়া বন্যার জল কীভাবে বিশুদ্ধ করব?',
        'ভূমিকম্পের ধ্বংসস্তূপে আটকে পড়লে কী করণীয়?',
        'রক্তপাত বন্ধে তাৎক্ষণিক প্রাথমিক চিকিৎসা?',
        'উদ্ধারকারী হেলিকপ্টারকে সংকেত দেওয়ার উপায়?'
      ],
      offlineNotice: 'অফলাইন সুরক্ষা মোড: লোকাল ক্যাশ থেকে সুরক্ষা নির্দেশাবলী লোড করা হয়েছে।'
    },
    handbook: {
      title: 'নাগরিক সুরক্ষা ও দুর্যোগে বাঁচার সহায়িকা',
      subtitle: 'এনডিএমএ ও আন্তর্জাতিক রেড ক্রসের প্রমিত নির্দেশিকা',
      emergencyHotline: 'জরুরি হটলাইন',
      beforePhase: 'দুর্যোগের পূর্বে (প্রস্তুতি)',
      duringPhase: 'দুর্যোগের সময়ে (তাৎক্ষণিক সুরক্ষা)',
      afterPhase: 'দুর্যোগের পরে (নিরাপদ পুনরুদ্ধার)',
      disasters: {
        flood: {
          title: 'আকস্মিক বন্যা ও জলাবদ্ধতা',
          before: [
            'সিল করা পাত্রে অন্তত ৩ দিনের জন্য পানীয় জল মজুত রাখুন।',
            'জরুরি কাগজপত্র এবং বৈদ্যুতিক জিনিসপত্র জলের স্তরের উপরে রাখুন।',
            'উঁচু জায়গা এবং নিকটতম আশ্রয়কেন্দ্র চিহ্নিত করে রাখুন।'
          ],
          during: [
            'প্রবাহিত বন্যার জলের মধ্য দিয়ে হাঁটবেন না বা গাড়ি চালাবেন না।',
            'ঘরে জল ঢোকার আগেই প্রধান বিদ্যুৎ সুইচ এবং গ্যাস সংযোগ বন্ধ করুন।',
            'আটকে পড়লে ছাদে উঠুন এবং উজ্জ্বল কাপড় বা বাঁশি বাজিয়ে সংকেত দিন।'
          ],
          after: [
            'জমে থাকা জল এড়িয়ে চলুন; এতে বিদ্যুৎস্পৃষ্ট হওয়া বা বিষাক্ত পোকার ভয় থাকে।',
            'পান করার আগে জল অন্তত ৩ মিনিট ফুটিয়ে নিন।',
            'ছেঁড়া বিদ্যুতের তার দেখলে সঙ্গে সঙ্গে উদ্ধারকারী দলকে জানান।'
          ]
        },
        earthquake: {
          title: 'ভূমিকম্প ও ভূকম্পন',
          before: [
            'দেওয়ালের ভারী জিনিসপত্র ও গ্যাস সিলিন্ডার শক্ত করে বেঁধে রাখুন।',
            'বিছানার পাশে টর্চ, ফার্স্ট এইড কিট এবং বাঁশি রাখুন।',
            'পরিবারের জন্য বাইরে একটি খোলা মিলনস্থল ঠিক করে রাখুন।'
          ],
          during: [
            'কম্পন শুরু হলে মাটিতে হাঁটু গেড়ে বসুন (DROP)।',
            'শক্ত টেবিল বা ডেস্কের নিচে মাথা ও ঘাড় ঢেকে রাখুন (COVER)।',
            'কম্পন না থামা পর্যন্ত শক্ত করে ধরে রাখুন (HOLD ON)। লিফট ব্যবহার করবেন না!'
          ],
          after: [
            'পরবর্তী মৃদু কম্পনের (Aftershocks) জন্য প্রস্তুত থাকুন।',
            'গ্যাস লিক হয়েছে কিনা গন্ধ নিন — দেশলাই বা মোমবাতি জ্বালাবেন না।',
            'কম্পন থামলে সিঁড়ি দিয়ে সাবধানে বাইরে বের হন।'
          ]
        },
        cyclone: {
          title: 'ঘূর্ণিঝড় ও উপকূলীয় তীব্র ঝড়',
          before: [
            'জানালার কাচ ভাঙা রোধ করতে টেপ বা কাঠের বোর্ড লাগান।',
            'বিদ্যুতের তারের কাছের শুকনো গাছের ডালপালা কেটে ফেলুন।',
            'ব্যাটারি চালিত রেডিও এবং সম্পূর্ণ চার্জযুক্ত পাওয়ার ব্যাংক প্রস্তুত রাখুন।'
          ],
          during: [
            'ঘরের সবচেয়ে মজবুত কেন্দ্রীয় ঘরে থাকুন, জানালা থেকে দূরে থাকুন।',
            'ঝড়ের চোখের (শান্ত কেন্দ্র) বিষয়ে সতর্ক থাকুন; এরপর বিপরীত দিক থেকে প্রবল বাতাস আসে।',
            'বৈদ্যুতিক যন্ত্রপাতি আনপ্লাগ করে রাখুন।'
          ],
          after: [
            'সরকারি নির্দেশ ছাড়া বাইরে বের হবেন না।',
            'ভাঙা কাচ, ঝুলন্ত তার এবং আলগা পোস্ট থেকে দূরে থাকুন।',
            'উপকূলের রাস্তায় গাড়ি চালানো এড়িয়ে চলুন।'
          ]
        },
        wildfire: {
          title: 'দাবানল ও ভয়াবহ অগ্নিকাণ্ড',
          before: [
            'বাড়ির চারপাশের শুকনো পাতা ও দাহ্য পদার্থ পরিষ্কার রাখুন।',
            'N95 মাস্ক এবং পোড়ার মলম সহ জরুরি ব্যাগ প্রস্তুত রাখুন।',
            'নিরাপদে সরে যাওয়ার অন্তত দুটি বিকল্প পথ জেনে রাখুন।'
          ],
          during: [
            'সতর্কবার্তা পাওয়া মাত্র দ্রুত নিরাপদ স্থানে চলে যান।',
            'সুতির পোশাক পরুন এবং মুখে ভেজা কাপড় বা N95 মাস্ক বাঁধুন।',
            'বাড়ি ছাড়ার সময় জানলা-দরজা বন্ধ করে যান যাতে বাতাসের টান কম থাকে।'
          ],
          after: [
            'দমকলের ছাড়পত্র না পাওয়া পর্যন্ত পুড়ে যাওয়া এলাকায় ঢুকবেন না।',
            'ছাদ বা চিলেকোঠায় লুকিয়ে থাকা স্ফুলিঙ্গ পরীক্ষা করুন।',
            'ধোঁয়া বা ছাই লেগে থাকা খাবার বা জল ফেলে দিন।'
          ]
        },
        landslide: {
          title: 'ভূমিধস ও পাহাড়ী কাদার ঢল',
          before: [
            'পাহাড়ের ঢালে গাছ বা বিদ্যুতের খুঁটি বেঁকে গেলে সতর্ক হন।',
            'নমনীয় পাইপ ব্যবহার করুন যাতে গ্যাস বা জলের পাইপ সহজে না ফাটে।',
            'পাহাড়ের খাঁদ থেকে দূরে উঁচু নিরাপদ রাস্তা চিনে রাখুন।'
          ],
          during: [
            'পাথর পড়ার শব্দ শুনলেই ধসের পথ থেকে দ্রুত নিরাপদ স্থানে দৌড়ান।',
            'পালানো অসম্ভব হলে শরীর গোল করে দুই হাতে মাথা ও ঘাড় বাঁচান।',
            'পাহাড়ী ঝরনার জল হঠাৎ কাদাযুক্ত হলে সাথে সাথে সরে যান।'
          ],
          after: [
            'ধসের এলাকা থেকে দূরে থাকুন; পুনরায় ধস নামার সম্ভাবনা থাকে।',
            'নিজে সরাসরি ধসে না ঢুকে উদ্ধারকারী দলকে খবর দিন।',
            'ভাঙা রাস্তা ও ব্রিজের তথ্য পুলিশকে জানান।'
          ]
        },
        heatwave: {
          title: 'তীব্র তাপপ্রবাহ ও হিটস্ট্রোক',
          before: [
            'ঘরে ওআরএস (ORS), ডাবের জল ও গ্লুকোজ মজুত রাখুন।',
            'জানালায় আলো প্রতিফলক পর্দা ব্যবহার করুন।',
            'সকাল ৯টার আগে বা বিকেল সাড়ে ৫টার পরে বাইরের কাজ করুন।'
          ],
          during: [
            'তেষ্টা না পেলেও প্রতি ২০ মিনিটে জল পান করুন।',
            'হালকা রঙের ঢিলেঢালা সুতির জামাকাপড় পরুন এবং ছাতা বা টুপি ব্যবহার করুন।',
            'মাথা ঘুরলে বা ঘাম বন্ধ হলে সঙ্গে সঙ্গে ছায়ায় যান এবং ভেজা কাপড়ে গা মুছুন।'
          ],
          after: [
            'পরবর্তী দুদিন প্রচুর জল এবং তরল খাবার পান করুন।',
            'বয়স্ক, শিশু এবং পোষা প্রাণীদের বিশেষ যত্ন নিন।',
            'আবহাওয়া দপ্তরের স্থানীয় সতর্কবার্তার দিকে খেয়াল রাখুন।'
          ]
        }
      }
    },
    registry: {
      title: 'নাগরিক সুরক্ষা ও কল্যাণ তালিকা',
      searchPlaceholder: 'নাগরিকের নাম, ফোন বা স্থান দিয়ে খুঁজুন...',
      totalSafe: 'নিরাপদ হিসেবে নথিভুক্ত',
      allDistricts: 'সকল জেলা',
      noResults: 'কোনো নাগরিকের তথ্য খুঁজে পাওয়া যায়নি।',
      statusSafe: 'নিরাপদ',
      statusNeedHelp: 'সাহায্য প্রয়োজন',
      statusInShelter: 'ত্রাণ শিবিরে'
    },
    sosModal: {
      title: 'জরুরি এসওএস নিশ্চিত করুন',
      subtitle: 'সঠিক জিপিএস অবস্থান সহ তাৎক্ষণিক বিপদের সংকেত পাঠাতে বাটনটি চাপুন।',
      holdNotice: 'এনডিআরএফ, পুলিশ এবং মেডিকেল টিমকে অবিলম্বে অ্যালার্ট পাঠানো হবে',
      typeLabel: 'জরুরি পরিস্থিতির ধরন',
      types: {
        medical: 'গুরুতর মেডিকেল ইমার্জেন্সি',
        trapped: 'ধ্বংসস্তূপে বা ভবনে আটকে পড়েছি',
        flood: 'বন্যার জলে আটকে পড়েছি',
        fire: 'আগুন বা বিষাক্ত ধোঁয়ায় আটকে পড়েছি',
        other: 'জীবনের চরম ঝুঁকি'
      },
      sendBtn: 'এখনই এসওএস সংকেত পাঠান',
      cancelBtn: 'বাতিল / ভুলবশত চাপ লেগেছে',
      sending: 'সংকেত সম্প্রচার করা হচ্ছে...',
      successNotice: 'এসওএস সফলভাবে সম্প্রচারিত হয়েছে! উদ্ধারকারী দলকে জানানো হয়েছে।'
    },
    checkinModal: {
      title: 'নাগরিক সুরক্ষা চেক-ইন',
      subtitle: 'জনসাধারণ ও উদ্ধারকারী তালিকায় নিজেকে এবং পরিবারকে নিরাপদ তালিকাভুক্ত করুন।',
      nameLabel: 'আপনার পূর্ণ নাম',
      namePlaceholder: 'যেমন: সুব্রত মুখার্জি ও পরিবার (৩)',
      phoneLabel: 'যোগাযোগ নম্বর',
      phonePlaceholder: '+91 98765 43210',
      conditionLabel: 'বর্তমান অবস্থা',
      conditions: {
        safe: 'সম্পূর্ণ নিরাপদ ও সুস্থ',
        minor: 'জল / খাবারের সামান্য সাহায্য প্রয়োজন',
        urgent: 'জরুরি ডাক্তার বা চিকিৎসার প্রয়োজন',
        shelter: 'জরুরি আশ্রয়কেন্দ্রে পৌঁছেছি'
      },
      notesLabel: 'সংক্ষিপ্ত বার্তা (ঐচ্ছিক)',
      notesPlaceholder: 'যেমন: দোতলায় নিরাপদে আছি, রাস্তায় জল বাড়ছে।',
      submitBtn: 'নিরাপদ তথ্য জমা দিন ("আমি নিরাপদ")',
      submitting: 'জমা দেওয়া হচ্ছে...'
    },
    dashboard: {
      activeIncidents: 'সক্রিয় দুর্যোগ ঘটনা',
      sheltersOpen: 'খোলা আশ্রয়কেন্দ্র',
      bedsFree: 'বেড খালি',
      ndrfDeployed: 'এনডিআরএফ ও মেডিকেল দল',
      personnel: 'কর্মী ও সেনা',
      citizenRegistry: 'নাগরিক তালিকা',
      earlyWarning: 'পূর্বাভাস সেন্সর',
      anomalies: 'অস্বাভাবিক রিডিং',
      aiAgentsTitle: '৫টি স্বায়ত্তশাসিত এআই এজেন্ট আর্কিটেকচার',
      aiAgentsDesc: 'সেন্সর তথ্য গ্রহণ থেকে ক্ষয়ক্ষতি নিরূপণ পর্যন্ত স্বয়ংক্রিয় চক্র',
      resetDemo: 'ডেমো রিসেট করুন',
      simulateTitle: 'সব কয়টি দুর্যোগের সিমুলেশন:',
      tacticalTools: 'জরুরি কৌশলগত সরঞ্জাম:',
      incidentMap: 'লাইভ দুর্যোগ নিয়ন্ত্রণ মানচিত্র',
      shelterNetwork: 'আশ্রয়কেন্দ্র নেটওয়ার্ক পরিস্থিতি',
      reliefTeams: 'মোজায়েন থাকা উদ্ধারকারী দল',
      normalStandby: 'স্বাভাবিক স্ট্যান্ডবাই অবস্থা',
      verified: 'যাচাইকৃত',
      capacityOccupied: 'ক্ষমতা পূর্ণ',
      deployedUnits: 'দ্রুত প্রতিক্রিয়াশীল দল',
      liveLedger: 'লাইভ খাতা',
      markedSafeDesc: 'নিরাপদ চিহ্নিত',
      multiHazardScan: 'বহু-দুর্যোগ অবিচ্ছিন্ন সেন্সর নজরদারি',
      damageTriageTitle: 'ক্ষয়ক্ষতি মূল্যায়ন এবং আর্থিক ক্ষতি নির্ণয়',
      damageScore: 'ক্ষতির স্কোর',
      estLoss: 'আনুমানিক আর্থিক ক্ষতি',
      affectedHomes: 'ক্ষতিগ্রস্ত বাড়িঘর',
      blockedRoutes: 'অবরুদ্ধ সড়ক',
      agentRecs: 'এজেন্টের পরামর্শসমূহ:',
      reliefPriority: 'ত্রাণ অগ্রাধিকার',
      liveTelemetryTitle: 'লাইভ এজেন্ট টেলিমেট্রি স্ট্রিম',
      allAgents: 'সকল এজেন্ট',
      noLogEvents: 'এখনও কোনো লগ নেই। সিমুলেশন শুরু করুন।',
      noActiveIncident: 'কোনো সক্রিয় দুর্যোগ রেকর্ড নেই। স্বায়ত্তশাসিত সমন্বয় দেখতে সিমুলেশন শুরু করুন।',
      openChatbot: 'জরুরি এআই চ্যাটবট',
      searchLocationOnGoogleMaps: 'গুগল ম্যাপস এলাকা সন্ধান'
    },
    mapTabs: {
      liveMap: 'লাইভ দুর্যোগ ও কৌশলগত মানচিত্র',
      liveMapDesc: 'রিয়েল-টাইম বিপদ অঞ্চল, ত্রাণ দল ও নাগরিক এসওএস',
      googleMap: 'গুগল ম্যাপস এলাকা অনুসন্ধান',
      googleMapDesc: 'ঠিকানা অনুসন্ধান, নিকটতম নিরাপদ আশ্রয় ও নেভিগেশন',
      dualView: 'দ্বৈত দৃশ্য (পাশাপাশি)',
      dualViewDesc: 'লাইভ দুর্যোগ ও গুগল ম্যাপস একসাথে পর্যবেক্ষণ'
    },
    liveMap: {
      title: 'লাইভ দুর্যোগ ও কৌশলগত মানচিত্র',
      subtitle: 'রিয়েল-টাইম বহু-বিপদ টেলিমেট্রি, এনডিআরএফ ইউনিট ও নাগরিক সুরক্ষা গ্রিড',
      legendHazards: 'বিপদ অঞ্চল',
      legendShelters: 'নিরাপদ আশ্রয়',
      legendTeams: 'ত্রাণ দল',
      legendSos: 'নাগরিক এসওএস',
      filterHazards: 'বিপদ অঞ্চল',
      filterTeams: 'ত্রাণ দল',
      filterShelters: 'আশ্রয়',
      filterSos: 'এসওএস সতর্কতা',
      recenter: 'মানচিত্র রিসেন্টার করুন'
    },
    googleMap: {
      title: 'গুগল ম্যাপস এলাকা ও নিরাপদ আশ্রয়কেন্দ্র অনুসন্ধানকারী',
      searchPlaceholder: 'যেকোনো এলাকা বা ল্যান্ডমার্ক খুঁজুন (যেমন: দাদার, আন্ধেরি, কুরলা)...',
      findNearestShelter: 'নিকটতম নিরাপদ আশ্রয় খুঁজুন',
      nearestShelterFound: 'নিকটবর্তী উন্মুক্ত নিরাপদ আশ্রয়',
      distanceAway: 'অনুসন্ধানকৃত এলাকা থেকে দূরত্ব',
      openInGoogleMaps: 'গুগল ম্যাপসে দেখুন',
      getDirections: 'গুগল ম্যাপস দিয়ে পথ খুঁজুন',
      layerStandard: 'মানক মানচিত্র',
      layerSatellite: 'স্যাটেলাইট হাইব্রিড',
      layerDark: 'কৌশলগত ডার্ক',
      quickAreas: 'জনপ্রিয় এলাকা',
      openInApp: 'গুগল ম্যাপস অ্যাপে খুলুন',
      findNearbyHospitals: 'নিকটবর্তী হাসপাতাল',
      findNearbyPolice: 'নিকটবর্তী পুলিশ স্টেশন',
      findNearbyFire: 'দমকল কেন্দ্র',
      satelliteHybrid: 'স্যাটেলাইট হাইব্রিড',
      streetTraffic: 'সড়ক ও ট্রানজিট'
    },
    chatbot: {
      title: 'রক্ষানেট এআই জরুরি চ্যাটবট',
      subtitle: 'আশ্রয়, প্রাথমিক চিকিৎসা, নিরাপদ রুট ও দুর্যোগ পরিস্থিতির তাৎক্ষণিক উত্তর',
      greeting: 'নমস্কার! আমি আপনার এআই জরুরি ও অপারেশনাল সহকারী। আশ্রয়কেন্দ্র, সক্রিয় সতর্কবার্তা, নিরাপদ পথ বা প্রাথমিক চিকিৎসা সম্পর্কে জিজ্ঞাসা করুন।',
      placeholder: 'আপনার জরুরি বা নিরাপত্তার প্রশ্নটি এখানে লিখুন...',
      send: 'জিজ্ঞাসা করুন',
      quickPrompts: [
        'দাদারের সবচেয়ে কাছে কোন আশ্রয়কেন্দ্রটি খোলা আছে?',
        'এখন কি কোনো বন্যা বা ঘূর্ণিঝড়ের সতর্কতা জারি আছে?',
        'বন্যার নোংরা জলে ক্ষত হলে কী প্রাথমিক চিকিৎসা করব?',
        'রাতে উদ্ধারকারী দলকে সংকেত পাঠানোর সঠিক উপায় কী?',
        'কতজন এনডিআরএফ কর্মী মোতায়েন আছেন?'
      ],
      disclaimer: 'জেমিনি এআই দুর্যোগ ব্যবস্থাপনা ও এনডিএমএ নীতিমালার আলোকে প্রস্তুত।'
    }
  },

  ta: {
    appName: 'ரக்ஷாநெட்',
    globalBadge: 'குளோபல்',
    tagline: 'பல்வேறு பேரிடர் அவசரக்கால மீட்பு மற்றும் ஆஃப்லைன் குடிமக்கள் பாதுகாப்பு',
    activeStatus: 'செயலில்',
    criticalBadge: 'அதி-தீவிரம்',
    views: {
      mobile: 'குடிமக்கள் மொபைல்',
      dashboard: 'கட்டுப்பாட்டு மையம்',
      phoneFrame: 'மொபைல் சட்டம்',
      fullWidth: 'முழுத்திரை'
    },
    tools: {
      rescueTools: 'மீட்புக் கருவிகள்',
      aiScanner: 'AI சேத ஸ்கேனர்',
      aiScannerDesc: 'கட்டிட விரிசல்கள், வெள்ள நீர்மட்டம் மற்றும் இடிவு அபாய பகுப்பாய்வு',
      beacon: 'ஆப்டிகல் SOS ஸ்ட்ரோப்',
      beaconDesc: 'ட்ரோன்கள் மற்றும் ஹெலிகாப்டர்களுக்கு மோர்ஸ் குறியீட்டு ஒளி விளக்கு',
      route: 'பாதுகாப்பான வெளியேற்ற பாதை',
      routeDesc: 'அபாயங்களை தவிர்த்து அருகில் உள்ள முகாமுக்கு செல்லும் வழி',
      kit: '72-மணிநேர உயிர்வாழும் பை',
      kitDesc: 'அவசர உணவு, மருந்துகள் மற்றும் அத்தியாவசியப் பொருட்களின் பட்டியல்',
      pwaInstall: 'முழுமையான ஆஃப்லைன் பேரிடர் தயார்நிலைக்கு ரக்ஷாநெட் PWA செயலியை நிறுவவும்!',
      installBtn: 'செயலியை நிறுவு'
    },
    mobileNav: {
      sos: 'SOS & நேரலை',
      map: 'பாதுகாப்பு முகாம்கள்',
      ai: 'AI ஆலோசகர்',
      handbook: 'உயிர் பிழைப்பு வழிகாட்டி',
      registry: 'பாதுகாப்பு பதிவேடு'
    },
    home: {
      immediateThreat: 'உயிருக்கோ அல்லது பாதுகாப்பிற்கோ உடனடி ஆபத்தா?',
      oneTapSos: '1-தட்டு எச்சரிக்கை',
      abortGuard: '3-நொடி பாதுகாப்பு • ஜிபிஎஸ் ஒளிபரப்பு • 100% ஆஃப்லைனில் செயல்படும்',
      markSafe: 'பாதுகாப்பாக உள்ளீர்கள் எனப் பதிவு செய்க ("நான் நலம்")',
      nearestShelter: 'அருகிலுள்ள திறந்திருக்கும் அவசரகால முகாம்',
      spotsFree: 'இடங்கள் உள்ளன',
      away: 'தொலைவு',
      navigate: 'வழிசெலுத்துக (GPS நேவிகேஷன்)',
      call: 'அழைக்க',
      allClear: 'உங்கள் பகுதியில் எந்த பேரிடர் ஆபத்தும் இல்லை',
      allClearDesc: '15 கிமீ சுற்றளவில் செயலில் உள்ள பேரிடர் எச்சரிக்கைகள் எதுவும் இல்லை.',
      normal: 'இயல்பு நிலை',
      advancedTitle: 'மேம்பட்ட மீட்பு மற்றும் தயார்நிலைக் கருவிகள்',
      offlineReady: '100% ஆஃப்லைன் தயார்நிலை',
      emergencyCallTitle: 'அவசர உதவி எண்கள்',
      allEmergency: 'அனைத்து அவசரநிலைகள்',
      disasterRelief: 'பேரிடர் நிவாரணம்',
      ambulance: 'ஆம்புலன்ஸ்'
    },
    aiAdvisor: {
      title: 'ரக்ஷாநெட் AI அவசரக்கால உதவியாளர்',
      desc: 'பேரிடர் முதலுதவி, சுத்தமான குடிநீர் மற்றும் வழிகாட்டலுக்கு ஜெமினி 2.5 ஃப்ளாஷ் மூலம் இயக்கப்படுகிறது',
      greeting: 'வணக்கம். நான் உங்கள் ரக்ஷாநெட் AI அவசரக்கால உதவியாளர். வெளியேற்ற வழிகள், முதலுதவி, குடிநீர் சுத்திகரிப்பு மற்றும் பேரிடர் பாதுகாப்பில் உங்களுக்கு உதவ முடியும். நான் உங்களுக்கு இப்போது எவ்வாறு உதவலாம்?',
      placeholder: 'உங்கள் பாதுகாப்பு குறித்து AI-யிடம் கேட்கவும்...',
      send: 'கேட்க',
      quickPromptsTitle: 'அவசரக் கேள்விகள்',
      quickPrompts: [
        'மின்சாரம் இன்றி வெள்ளநீரை எவ்வாறு சுத்திகரிப்பது?',
        'நிலநடுக்க இடிபாடுகளில் சிக்கினால் என்ன செய்வது?',
        'கடுமையான இரத்தப்போக்கிற்கு உடனடி முதலுதவி என்ன?',
        'மீட்பு ஹெலிகாப்டர்களுக்கு எவ்வாறு சைகை காட்டுவது?'
      ],
      offlineNotice: 'ஆஃப்லைன் பாதுகாப்பு முறை: உள்ளூர் சேமிப்பகத்திலிருந்து பாதுகாப்பு நெறிமுறைகள் ஏற்றப்பட்டன.'
    },
    handbook: {
      title: 'குடிமக்கள் பாதுகாப்பு மற்றும் பேரிடர் உயிர் பிழைப்பு கையேடு',
      subtitle: 'NDMA மற்றும் சர்வதேச செஞ்சிலுவைச் சங்கத்தின் அங்கீகரிக்கப்பட்ட நடைமுறைகள்',
      emergencyHotline: 'அவசர உதவி எண்',
      beforePhase: 'பேரிடருக்கு முன் (தயாரிப்பு)',
      duringPhase: 'பேரிடரின் போது (உடனடி பாதுகாப்பு)',
      afterPhase: 'பேரிடருக்குப் பின் (பாதுகாப்பான மீட்பு)',
      disasters: {
        flood: {
          title: 'திடீர் வெள்ளம் மற்றும் நீர் தேங்குதல்',
          before: [
            'குறைந்தது 3 நாட்களுக்கு தேவையான சுத்தமான குடிநீரை மூடிய பாத்திரங்களில் சேமிக்கவும்.',
            'முக்கிய ஆவணங்கள் மற்றும் மின்சார சாதனங்களை வெள்ள நீர் மட்டத்திற்கு மேல் வைக்கவும்.',
            'உயரமான இடங்கள் மற்றும் அருகிலுள்ள நிவாரண முகாம்களை முன்கூட்டியே அறிந்து கொள்ளவும்.'
          ],
          during: [
            'ஓடும் வெள்ள நீரில் ஒருபோதும் நடக்கவோ அல்லது வாகனம் ஓட்டவோ வேண்டாம்.',
            'வீட்டிற்குள் தண்ணீர் புகுவதற்கு முன்பே மெயின் சுவிட்ச் மற்றும் எரிவாயுவை அணைக்கவும்.',
            'மாடியில் சிக்கினால் கூரைக்குச் சென்று பிரகாசமான துணி அல்லது விசில் மூலம் சைகை காட்டவும்.'
          ],
          after: [
            'தேங்கி நிற்கும் தண்ணீரைத் தவிர்க்கவும்; அதில் மின்சாரம் அல்லது விஷப்பூச்சிகள் இருக்கலாம்.',
            'குடிப்பதற்கு முன் தண்ணீரை குறைந்தது 3 நிமிடங்கள் கொதிக்க வைக்கவும்.',
            'அறுந்து விழுந்த மின் கம்பிகள் குறித்து உடனடியாக மீட்புக் குழுவினருக்கு தெரிவிக்கவும்.'
          ]
        },
        earthquake: {
          title: 'நிலநடுக்கம் மற்றும் அதிர்வுகள்',
          before: [
            'சுவரில் மாட்டியுள்ள கனமான பொருட்கள் மற்றும் சிலிண்டர்களை இறுக்கமாகப் பொருத்தவும்.',
            'படுக்கைக்கு அருகில் டார்ச் லைட், முதலுதவிப் பெட்டி மற்றும் விசில் வைத்திருக்கவும்.',
            'குடும்பத்தினருடன் வெளியில் ஒன்று கூட ஒரு திறந்தவெளியை தீர்மானிக்கவும்.'
          ],
          during: [
            'அதிர்வு ஏற்பட்டவுடன் உடனே முழங்காலிட்டு அமரவும் (DROP).',
            'உறுதியான மேசையின் கீழ் தலை மற்றும் கழுத்தை மறைத்து மூடவும் (COVER).',
            'அதிர்வு நிற்கும் வரை உறுதியாகப் பிடித்துக் கொள்ளவும் (HOLD ON). லிஃப்டை பயன்படுத்த வேண்டாம்!'
          ],
          after: [
            'தொடர் அதிர்வுகளுக்கு (Aftershocks) தயாராக இருங்கள். காயங்களைச் சரிபார்க்கவும்.',
            'எரிவாயு கசிவை சோதிக்கவும் — தீப்பெட்டி, மெழுகுவர்த்தி அல்லது லைட்டரை பற்றவைக்காதீர்கள்.',
            'அதிர்வுகள் நின்றதும் படிக்கட்டுகள் வழியாக கவனமாக வெளியேறவும்.'
          ]
        },
        cyclone: {
          title: 'புயல் மற்றும் கடலோரக் காற்று',
          before: [
            'ஜன்னல் கண்ணாடிகள் உடைவதைத் தடுக்க டேப் அல்லது பலகைகளை ஒட்டவும்.',
            'மின் கம்பிகளுக்கு அருகில் உள்ள காய்ந்த மரக் கிளைகளை வெட்டவும்.',
            'பேட்டரி ரேடியோ மற்றும் முழுமையாக சார்ஜ் செய்யப்பட்ட பவர் பேங்க்களை தயாராக வைக்கவும்.'
          ],
          during: [
            'ஜன்னல்கள் இல்லாத வீட்டின் பாதுகாப்பான உள் அறையிலேயே இருக்கவும்.',
            'புயலின் மையப்பகுதி (Eye) குறித்து எச்சரிக்கையாக இருங்கள்; அமைதிக்கு பின் எதிர் திசையிலிருந்து கொடூர காற்று வீசும்.',
            'மின் சாதனங்களின் இணைப்பைத் துண்டிக்கவும்.'
          ],
          after: [
            'அதிகாரிகள் "ஆபத்து நீங்கியது" என அறிவிக்கும் வரை வெளியே வர வேண்டாம்.',
            'உடைந்த கண்ணாடிகள், தொங்கும் கம்பிகள் மற்றும் சேதமடைந்த தூண்களைத் தவிர்க்கவும்.',
            'கடலோரச் சாலைகளில் தேவையற்ற பயணங்களைத் தவிர்க்கவும்.'
          ]
        },
        wildfire: {
          title: 'காட்டுத்தீ மற்றும் பெருந்தீ',
          before: [
            'வீட்டின் 30 அடி சுற்றளவில் உள்ள காய்ந்த இலைகள் மற்றும் எரியக்கூடிய பொருட்களை அகற்றவும்.',
            'N95 முகக்கவசம் மற்றும் தீக்காய மருந்துகளுடன் அவசரப் பையை தயார் செய்யவும்.',
            'வெளியேறுவதற்கு குறைந்தது இரண்டு மாற்றுப் பாதைகளை திட்டமிட்டு வைக்கவும்.'
          ],
          during: [
            'எச்சரிக்கை விடுக்கப்பட்டவுடன் உடனே வெளியேறவும்; பொருட்களுக்காக தாமதிக்க வேண்டாம்.',
            'பருத்தி ஆடைகளை அணியுங்கள், முகத்தில் ஈரமான துணி அல்லது N95 மாஸ்க் அணியுங்கள்.',
            'காற்று உள்ளே இழுக்கப்படுவதை குறைக்க ஜன்னல்கள் மற்றும் கதவுகளை மூடிவிட்டு செல்லவும்.'
          ],
          after: [
            'தீயணைப்புத் துறை அனுமதிக்கும் வரை எரிந்த பகுதிகளுக்குள் செல்ல வேண்டாம்.',
            'கூரை மற்றும் பரண்களில் புகைந்து கொண்டிருக்கும் நெருப்புத் துகள்களை சோதிக்கவும்.',
            'புகை அல்லது சாம்பல் படிந்த உணவு மற்றும் தண்ணீரை உட்கொள்ள வேண்டாம்.'
          ]
        },
        landslide: {
          title: 'நிலச்சரிவு மற்றும் பாறை உருளல்',
          before: [
            'மலைச் சரிவுகளில் மரங்கள் அல்லது மின்கம்பங்கள் சாய்வதைக் கண்டால் எச்சரிக்கையாக இருங்கள்.',
            'எரிவாயு மற்றும் குடிநீர் குழாய்கள் உடையாமல் இருக்க நெகிழ்வான இணைப்புகளைப் பயன்படுத்தவும்.',
            'இயற்கை நீரோடைகளுக்கு அப்பால் உயரமான பாதைகளைத் தேர்ந்தெடுக்கவும்.'
          ],
          during: [
            'பாறைகள் உருளும் சத்தம் கேட்டால் உடனடியாக சரிவுப் பாதையை விட்டு ஓடவும்.',
            'ஓட முடியாவிட்டால் உடலைச் சுருட்டி இரு கைகளாலும் தலையையும் கழுத்தையும் பாதுகாக்கவும்.',
            'நீரோடையில் திடீரென சேறு கலந்த நீர் வந்தால் உடனடியாக விலகவும்.'
          ],
          after: [
            'சரிவு ஏற்பட்ட இடத்திலிருந்து தள்ளியே இருங்கள்; மீண்டும் சரிவுகள் ஏற்படலாம்.',
            'இடிபாடுகளில் சிக்கியவர்களை நேரடியாக அணுகாமல் மீட்புக் குழுவிற்கு தகவல் தெரிவிக்கவும்.',
            'உடைந்த பாலங்கள் மற்றும் சாலைகள் குறித்து அதிகாரிகளுக்கு தெரிவிக்கவும்.'
          ]
        },
        heatwave: {
          title: 'கடும் வெப்ப அலை மற்றும் வெயில் கொடுமை',
          before: [
            'ORS கரைசல்கள், இளநீர் மற்றும் குளுக்கோஸ் ஆகியவற்றை வீட்டில் போதிய அளவு வைக்கவும்.',
            'ஜன்னல்களில் வெப்பத்தை தடுக்கும் திரைச்சீலைகளைப் பொருத்தவும்.',
            'வெளியில் செல்லும் வேலைகளை காலை 9 மணிக்கு முன்போ அல்லது மாலை 5:30 மணிக்கு பின்போ திட்டமிடுங்கள்.'
          ],
          during: [
            'தாகம் எடுக்காவிட்டாலும் 20 நிமிடங்களுக்கு ஒருமுறை தண்ணீர் குடிக்கவும்.',
            'மெல்லிய பருத்தி ஆடைகளை அணியுங்கள், தலையில் தொப்பி அல்லது துணி அணியுங்கள்.',
            'மயக்கம் அல்லது வியர்வை நின்றுவிட்டால் உடனே நிழலுக்குச் சென்று ஈரத்துணியால் உடலைத் துடைக்கவும்.'
          ],
          after: [
            'அடுத்த 48 மணி நேரத்திற்கு திரவ உணவுகள் மற்றும் மோர், இளநீர் அருந்தவும்.',
            'முதியவர்கள், குழந்தைகள் மற்றும் செல்லப் பிராணிகளை விசேஷமாக கவனியுங்கள்.',
            'வானிலை மையத்தின் உள்ளூர் வெப்ப எச்சரிக்கைகளை கவனிக்கவும்.'
          ]
        }
      }
    },
    registry: {
      title: 'நேரலை குடிமக்கள் பாதுகாப்பு பதிவேடு',
      searchPlaceholder: 'பெயர், தொலைபேசி அல்லது இருப்பிடத்தை வைத்து தேடவும்...',
      totalSafe: 'பாதுகாப்பாகப் பதிவானோர்',
      allDistricts: 'அனைத்து மாவட்டங்கள்',
      noResults: 'தேடலுக்குரிய தகவல்கள் எதுவும் கிடைக்கவில்லை.',
      statusSafe: 'நலம் (Safe)',
      statusNeedHelp: 'உதவி தேவை',
      statusInShelter: 'முகாமில் உள்ளோர்'
    },
    sosModal: {
      title: 'அவசரகால SOS-ஐ உறுதிப்படுத்தவும்',
      subtitle: 'துல்லியமான ஜிபிஎஸ் உடன் உடனடி அவசர எச்சரிக்கையை அனுப்ப பொத்தானை அழுத்தவும்.',
      holdNotice: 'NDRF, காவல்துறை மற்றும் ஆம்புலன்ஸ் குழுக்களுக்கு உடனே தகவல் அனுப்பப்படும்',
      typeLabel: 'அவசரநிலையின் வகை',
      types: {
        medical: 'கடுமையான மருத்துவ அவசரநிலை',
        trapped: 'இடிபாடுகள் அல்லது கட்டிடத்தில் சிக்கியுள்ளார்',
        flood: 'வெள்ள நீரில் சூழப்பட்டுள்ளார்',
        fire: 'தீ அல்லது நச்சுப் புகையில் சிக்கியுள்ளார்',
        other: 'உயிருக்கு தீவிர ஆபத்து'
      },
      sendBtn: 'உடனே SOS செய்தியை அனுப்புக',
      cancelBtn: 'ரத்து செய்க / தவறுதலாக அழுத்தினேன்',
      sending: 'அவசர எச்சரிக்கை ஒளிபரப்பப்படுகிறது...',
      successNotice: 'SOS அனுப்பப்பட்டது! மீட்புக் குழுவிற்கு தகவல் தெரிவிக்கப்பட்டுள்ளது.'
    },
    checkinModal: {
      title: 'குடிமக்கள் பாதுகாப்புப் பதிவு',
      subtitle: 'பொது மற்றும் மீட்புப் பதிவேட்டில் உங்களையும் குடும்பத்தாரையும் நலமாகப் பதிவு செய்யுங்கள்.',
      nameLabel: 'உங்கள் முழுப் பெயர்',
      namePlaceholder: 'எ.கா. முரளி கணேசன் & குடும்பம் (3)',
      phoneLabel: 'தொலைபேசி எண்',
      phonePlaceholder: '+91 98765 43210',
      conditionLabel: 'தற்போதைய நிலை',
      conditions: {
        safe: 'முற்றிலும் பாதுகாப்பாகவும் நலமாகவும் உள்ளோம்',
        minor: 'உணவு / குடிநீர் சிறிய உதவி தேவை',
        urgent: 'உடனடி மருத்துவர் / சிகிச்சை தேவை',
        shelter: 'அவசர முகாமிற்கு வந்து சேர்ந்தோம்'
      },
      notesLabel: 'சுருக்கமான தகவல் (விருப்பத்திற்குரியது)',
      notesPlaceholder: 'எ.கா. 2வது தளத்தில் பாதுகாப்பாக உள்ளோம், தெருவில் தண்ணீர் ஏறிவருகிறது.',
      submitBtn: 'பாதுகாப்பு நிலையைப் பதிவு செய்க ("நான் நலம்")',
      submitting: 'பதிவு செய்யப்படுகிறது...'
    },
    dashboard: {
      activeIncidents: 'செயலில் உள்ள பேரிடர்கள்',
      sheltersOpen: 'திறந்திருக்கும் முகாம்கள்',
      bedsFree: 'படுக்கைகள் காலி',
      ndrfDeployed: 'NDRF & மருத்துவப் படைகள்',
      personnel: 'படை வீரர்கள் & பணியாளர்கள்',
      citizenRegistry: 'குடிமக்கள் பதிவேடு',
      earlyWarning: 'முன்னெச்சரிக்கை சென்சார்கள்',
      anomalies: 'அபாய அளவீடுகள்',
      aiAgentsTitle: '5 தன்னாட்சி AI ஏஜெண்டுகள் கட்டமைப்பு',
      aiAgentsDesc: 'சென்சார் உள்ளீடு முதல் சேத மதிப்பீடு வரை தானியங்கி பேரிடர் மேலாண்மை',
      resetDemo: 'டெமோவை மீட்டமைக்கவும்',
      simulateTitle: 'அனைத்து 6 பேரிடர்களின் மாதிரி (Simulate):',
      tacticalTools: 'அவசரகால மீட்புக் கருவிகள்:',
      incidentMap: 'நேரலை பேரிடர் கட்டுப்பாட்டு வரைபடம்',
      shelterNetwork: 'முகாம் நெட்வொர்க் நிலை',
      reliefTeams: 'களமிறங்கியுள்ள மீட்புக் குழுக்கள்',
      normalStandby: 'இயல்பான தயார்நிலை',
      verified: 'சரிபார்க்கப்பட்டது',
      capacityOccupied: 'கொள்ளளவு நிரம்பியது',
      deployedUnits: 'விரைவு அதிரடி மீட்புப் படைகள்',
      liveLedger: 'நேரலை பதிவேடு',
      markedSafeDesc: 'பாதுகாப்பாகப் பதிவு செய்தோர்',
      multiHazardScan: 'தொடர்ச்சியான பல-பேரிடர் சென்சார் கண்காணிப்பு',
      damageTriageTitle: 'சேத மதிப்பீடு மற்றும் பொருளாதார இழப்பு பகுப்பாய்வு',
      damageScore: 'சேத மதிப்பெண்',
      estLoss: 'மதிப்பிடப்பட்ட இழப்பு',
      affectedHomes: 'பாதிக்கப்பட்ட வீடுகள்',
      blockedRoutes: 'துண்டிக்கப்பட்ட சாலைகள்',
      agentRecs: 'ஏஜெண்டுகளின் பரிந்துரைகள்:',
      reliefPriority: 'நிவாரண முன்னுரிமை',
      liveTelemetryTitle: 'நேரலை ஏஜெண்ட் டெலிமெட்ரி ஸ்ட்ரீம்',
      allAgents: 'அனைத்து ஏஜெண்டுகள்',
      noLogEvents: 'பதிவுகள் எதுவும் இல்லை. ஏஜெண்ட் இயக்கத்தைப் பார்க்க சிமுலேஷன் தொடங்குங்கள்.',
      noActiveIncident: 'செயலில் உள்ள பேரிடர்கள் எதுவும் பதிவாகவில்லை. பல-ஏஜெண்ட் ஒருங்கிணைப்பைக் காண மேலே உள்ள சிமுலேஷனைத் தொடங்குங்கள்.',
      openChatbot: 'அவசரகால AI சாட்பாட்',
      searchLocationOnGoogleMaps: 'கூகுள் மேப்ஸ் பகுதி தேடல்'
    },
    mapTabs: {
      liveMap: 'நேரடி பேரழிவு மற்றும் தந்திரோபாய வரைபடம்',
      liveMapDesc: 'நிகழ்நேர ஆபத்து மண்டலங்கள், மீட்புக் குழுக்கள் மற்றும் SOS',
      googleMap: 'கூகுள் மேப்ஸ் பகுதி ஆய்வாளர்',
      googleMapDesc: 'முகவரி தேடல், அருகிலுள்ள பாதுகாப்பான புகலிடம் மற்றும் வழிகாட்டல்',
      dualView: 'இரட்டை பார்வை (பக்கவாட்டில்)',
      dualViewDesc: 'நேரடி தொலைத்தொடர்பு மற்றும் கூகுள் மேப்ஸ் ஒரே நேரத்தில்'
    },
    liveMap: {
      title: 'நேரடி பேரழிவு மற்றும் தந்திரோபாய வரைபடம்',
      subtitle: 'நிகழ்நேர பன்முக பேரழிவு அளவீடுகள், NDRF பிரிவுகள் மற்றும் குடிமக்கள் பாதுகாப்பு கட்டமைப்பு',
      legendHazards: 'ஆபத்து மண்டலங்கள்',
      legendShelters: 'பாதுகாப்பான புகலிடங்கள்',
      legendTeams: 'மீட்புக் குழுக்கள்',
      legendSos: 'குடிமக்கள் SOS',
      filterHazards: 'ஆபத்துகள்',
      filterTeams: 'மீட்புக் குழுக்கள்',
      filterShelters: 'புகலிடங்கள்',
      filterSos: 'SOS எச்சரிக்கைகள்',
      recenter: 'வரைபடத்தை மீட்டமை'
    },
    googleMap: {
      title: 'கூகுள் மேப்ஸ் பகுதி மற்றும் பாதுகாப்பான முகாம் தேடல்',
      searchPlaceholder: 'எந்தப் பகுதியையும் தேடுங்கள் (எ.கா: தாதர், அந்தேரி, குர்லா, அடையார்)...',
      findNearestShelter: 'அருகிலுள்ள பாதுகாப்பான முகாமைத் தேடு',
      nearestShelterFound: 'அருகிலுள்ள திறந்த பாதுகாப்பான முகாம்',
      distanceAway: 'தேடிய இடத்திலிருந்து தொலைவு',
      openInGoogleMaps: 'கூகுள் மேப்ஸில் பார்க்க',
      getDirections: 'கூகுள் மேப்ஸ் வழிகாட்டுதல்',
      layerStandard: 'வழக்கமான வரைபடம்',
      layerSatellite: 'செயற்கைக்கோள் ஹைபிரிட்',
      layerDark: 'தந்திரோபாய டார்க்',
      quickAreas: 'பிரபலமான பகுதிகள்',
      openInApp: 'கூகுள் மேப்ஸ் செயலியில் திறக்கவும்',
      findNearbyHospitals: 'அருகிலுள்ள மருத்துவமனைகள்',
      findNearbyPolice: 'அருகிலுள்ள காவல் நிலையம்',
      findNearbyFire: 'தீயணைப்பு நிலையம்',
      satelliteHybrid: 'செயற்கைக்கோள் ஹைபிரிட்',
      streetTraffic: 'சாலை மற்றும் போக்குவரத்து'
    },
    chatbot: {
      title: 'ரக்ஷாநெட் AI அவசரகால சாட்பாட்',
      subtitle: 'முகாம்கள், முதலுதவி, வெளியேறும் வழிகள் மற்றும் பேரிடர் நிலைக்கு உடனடி விடைகள்',
      greeting: 'வணக்கம்! நான் உங்கள் AI அவசரகால மற்றும் செயல்பாட்டு உதவியாளர். அருகிலுள்ள முகாம்கள், சுற்றறிக்கைகள், பாதுகாப்பு வழிகள் அல்லது முதலுதவி பற்றி என்னிடம் கேளுங்கள்.',
      placeholder: 'உங்கள் அவசர அல்லது பாதுகாப்பு கேள்வியை இங்கே தட்டச்சு செய்யவும்...',
      send: 'கேளுங்கள்',
      quickPrompts: [
        'தாதருக்கு மிக அருகில் திறந்திருக்கும் முகாம் எது?',
        'தற்போது ஏதேனும் வெள்ளம் அல்லது புயல் எச்சரிக்கை உள்ளதா?',
        'வெள்ள நீரில் காயம் ஏற்பட்டால் என்ன முதலுதவி செய்ய வேண்டும்?',
        'இரவில் ஹெலிகாப்டர் மீட்புக் குழுவிற்கு எவ்வாறு சைகை காட்டுவது?',
        'எத்தனை NDRF வீரர்கள் களத்தில் உள்ளனர்?'
      ],
      disclaimer: 'ஜெமினி AI பேரிடர் மேலாண்மை மற்றும் NDMA வழிகாட்டுதல்களின் அடிப்படையில் இயங்குகிறது.'
    }
  }
};

export function getTranslation(lang: string): AppTranslations {
  const code = (lang in TRANSLATIONS ? lang : 'en') as LanguageCode;
  return TRANSLATIONS[code] || TRANSLATIONS.en;
}

export interface WeatherTranslations {
  title: string;
  radarAlerts: string;
  precipitationRate: string;
  intensity: string;
  safeMovementWindow: string;
  movementDecision: string;
  roadPassability: string;
  hourlyRainfall: string;
  outlook: string;
}

export const WEATHER_TRANSLATIONS: Record<LanguageCode, WeatherTranslations> = {
  en: {
    title: 'Vicinity Weather & Precipitation',
    radarAlerts: 'Real-Time Weather Alerts',
    precipitationRate: 'Precipitation Rate',
    intensity: 'Downpour Intensity',
    safeMovementWindow: 'Safe Movement Window',
    movementDecision: 'Movement Decision',
    roadPassability: 'Road Passability & Hazard Risks',
    hourlyRainfall: 'Hourly Precipitation Timeline',
    outlook: '3-Day Weather Outlook'
  },
  hi: {
    title: 'आस-पास का मौसम और वर्षा स्तर',
    radarAlerts: 'वास्तविक समय मौसम अलर्ट',
    precipitationRate: 'वर्षा दर (मिमी/घंटा)',
    intensity: 'बारिश की तीव्रता',
    safeMovementWindow: 'सुरक्षित आवागमन समय',
    movementDecision: 'आवागमन निर्णय',
    roadPassability: 'सड़क मार्ग की स्थिति और जोखिम',
    hourlyRainfall: 'प्रति घंटा वर्षा पूर्वानुमान',
    outlook: '3-दिवसीय मौसम दृष्टिकोण'
  },
  mr: {
    title: 'परिसरातील हवामान आणि पाऊस पातळी',
    radarAlerts: 'थेट हवामान सतर्कता इशारे',
    precipitationRate: 'पावसाचा दर',
    intensity: 'पावसाची तीव्रता',
    safeMovementWindow: 'सुरक्षित हालचालींची वेळ',
    movementDecision: 'स्थलांतर निर्णय',
    roadPassability: 'रस्त्यांची स्थिती व धोका',
    hourlyRainfall: 'तासागणिक पावसाचा अंदाज',
    outlook: '३ दिवसांचा हवामान अंदाज'
  },
  bn: {
    title: 'নিকটবর্তী আবহাওয়া ও বৃষ্টিপাতের মাত্রা',
    radarAlerts: 'রিয়েল-টাইম আবহাওয়া সতর্কতা',
    precipitationRate: 'বৃষ্টিপাতের হার',
    intensity: 'বৃষ্টির তীব্রতা',
    safeMovementWindow: 'নিরাপদ চলাচলের সময়সূচী',
    movementDecision: 'চলাচলের সিদ্ধান্ত',
    roadPassability: 'রাস্তার চলাচলের উপযুক্ততা',
    hourlyRainfall: 'ঘন্টায় ঘন্টায় বৃষ্টিপাত',
    outlook: '৩ দিনের আবহাওয়ার পূর্বাভাস'
  },
  ta: {
    title: 'அருகிலுள்ள வானிலை மற்றும் மழைப்பொழிவு',
    radarAlerts: 'நேரடி வானிலை எச்சரிக்கைகள்',
    precipitationRate: 'மழைப்பொழிவு விகிதம்',
    intensity: 'மழையின் தீவிரம்',
    safeMovementWindow: 'பாதுகாப்பான பயண நேரம்',
    movementDecision: 'இயக்க முடிவு',
    roadPassability: 'சாலை வழிகள் மற்றும் அபாயங்கள்',
    hourlyRainfall: 'மணிநேர மழை அளவு',
    outlook: '3-நாள் வானிலை கண்ணோட்டம்'
  }
};

export function getWeatherTranslation(lang: string): WeatherTranslations {
  const code = (lang in WEATHER_TRANSLATIONS ? lang : 'en') as LanguageCode;
  return WEATHER_TRANSLATIONS[code] || WEATHER_TRANSLATIONS.en;
}

