import { useState, useEffect, useCallback } from 'react';
import { EmergencyAlert } from '../types';

// Speech synthesis voice language fallbacks
const LANG_VOICE_MAP: Record<string, string[]> = {
  hi: ['hi-IN', 'hi_IN', 'hi'],
  mr: ['mr-IN', 'mr_IN', 'mr', 'hi-IN', 'hi'],
  bn: ['bn-IN', 'bn_BD', 'bn'],
  ta: ['ta-IN', 'ta_LK', 'ta'],
  en: ['en-IN', 'en-US', 'en-GB', 'en']
};

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

// Global active speaking state tracker for reactive UI updates
let currentSpeakingAlertId: string | null = null;
const speechListeners = new Set<(activeId: string | null) => void>();

function notifySpeechListeners(id: string | null) {
  currentSpeakingAlertId = id;
  speechListeners.forEach(listener => listener(id));
}

export function getCurrentSpeakingAlertId(): string | null {
  return currentSpeakingAlertId;
}

/**
 * Finds the closest matching voice for the target language in the browser's voice table.
 */
export function getVoiceForLanguage(lang: string): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetCodes = LANG_VOICE_MAP[lang] || [lang, 'en-US', 'en'];

  // 1. Exact match (e.g. "hi-IN")
  for (const code of targetCodes) {
    const cleanCode = code.toLowerCase().replace('_', '-');
    const exact = voices.find(v => v.lang.toLowerCase().replace('_', '-') === cleanCode);
    if (exact) return exact;
  }

  // 2. Prefix match (e.g. "hi")
  for (const code of targetCodes) {
    const prefix = code.split(/[-_]/)[0].toLowerCase();
    const match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;
  }

  // 3. Fallback to default or first available voice
  return voices.find(v => v.default) || voices[0] || null;
}

/**
 * Cancels any active speech synthesis.
 */
export function stopAlertSpeech() {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('Speech cancellation error:', err);
  }
  notifySpeechListeners(null);
}

/**
 * Formats emergency alert text into clear, authoritative spoken instructions.
 */
export function formatSpokenAlert(alert: EmergencyAlert, actionPlanText?: string): string {
  const lang = alert.lang || 'en';
  const cleanMsg = alert.message ? alert.message.trim() : '';
  const action = actionPlanText ? actionPlanText.trim() : '';

  switch (lang) {
    case 'hi':
      return `आपातकालीन सूचना! ${cleanMsg} ${action ? `निर्देश: ${action}` : 'कृपया तुरंत सुरक्षित स्थान पर जाएं।'}`;
    case 'mr':
      return `आपत्कालीन इशारा! ${cleanMsg} ${action ? `सूचना: ${action}` : 'कृपया तात्काळ सुरक्षित ठिकाणी जावे.'}`;
    case 'bn':
      return `জরুরি সতর্কতা! ${cleanMsg} ${action ? `নির্দেশনা: ${action}` : 'অবিলম্বে নিরাপদ আশ্রয়ে সরে যান।'}`;
    case 'ta':
      return `அவசர எச்சரிக்கை! ${cleanMsg} ${action ? `வழிகாட்டல்: ${action}` : 'உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.'}`;
    case 'en':
    default:
      return `Emergency Alert! Severity: ${alert.severity.toUpperCase()}. ${cleanMsg} ${
        action ? `Critical action protocol: ${action}` : 'Please evacuate to the nearest safe shelter immediately.'
      }`;
  }
}

/**
 * Speaks an emergency alert aloud using the browser's Web Speech API.
 */
export function speakAlert(
  alert: EmergencyAlert,
  actionPlanText?: string,
  callbacks?: { onStart?: () => void; onEnd?: () => void; onError?: (err: any) => void }
): boolean {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Web Speech API is not supported in this browser environment.');
    return false;
  }

  // Stop any active speech first
  stopAlertSpeech();

  const textToSpeak = formatSpokenAlert(alert, actionPlanText);
  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  // Set language and find voice
  utterance.lang = LANG_VOICE_MAP[alert.lang]?.[0] || 'en-US';
  const selectedVoice = getVoiceForLanguage(alert.lang);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Clear, authoritative pacing for emergency disaster conditions
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;

  utterance.onstart = () => {
    notifySpeechListeners(alert.id);
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    notifySpeechListeners(null);
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    notifySpeechListeners(null);
    callbacks?.onError?.(e);
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Failed to trigger speech synthesis:', err);
    notifySpeechListeners(null);
    return false;
  }
}

/**
 * Custom React Hook for easily wiring Read Aloud into components.
 */
export function useAlertSpeech() {
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(currentSpeakingAlertId);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(isSpeechSynthesisSupported());

    // Make sure voices are preloaded
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        // triggers re-cache of voices internally
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
    }
  }, []);

  useEffect(() => {
    speechListeners.add(setActiveSpeakingId);
    return () => {
      speechListeners.delete(setActiveSpeakingId);
    };
  }, []);

  const readAlert = useCallback((alert: EmergencyAlert, actionPlanText?: string) => {
    return speakAlert(alert, actionPlanText);
  }, []);

  const stop = useCallback(() => {
    stopAlertSpeech();
  }, []);

  const toggle = useCallback((alert: EmergencyAlert, actionPlanText?: string) => {
    if (currentSpeakingAlertId === alert.id) {
      stopAlertSpeech();
    } else {
      speakAlert(alert, actionPlanText);
    }
  }, []);

  return {
    isSpeaking: activeSpeakingId !== null,
    activeAlertId: activeSpeakingId,
    isAlertSpeaking: (id: string) => activeSpeakingId === id,
    readAlert,
    stopSpeaking: stop,
    toggleAlert: toggle,
    isSupported
  };
}
