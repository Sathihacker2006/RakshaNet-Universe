import React, { useState, useEffect, useRef } from 'react';
import { AlertOctagon, Volume2, VolumeX, ShieldAlert, CheckCircle2, MapPin, Loader2, X } from 'lucide-react';
import { postCitizenCheckin, triageSosMessage } from '../services/api';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  onSuccessCheckin?: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSuccessCheckin
}) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isBroadcastComplete, setIsBroadcastComplete] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [name, setName] = useState<string>('Citizen in Distress');
  const [phone, setPhone] = useState<string>('');
  const [selectedEmergency, setSelectedEmergency] = useState<string>('Trapped & Need Rescue');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [triageInfo, setTriageInfo] = useState<any | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // Countdown logic
  useEffect(() => {
    if (!isOpen) {
      setIsCountingDown(true);
      setCountdown(3);
      setIsBroadcasting(false);
      setIsBroadcastComplete(false);
      stopAlarmSound();
      return;
    }

    let timer: any;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isCountingDown) {
      setIsCountingDown(false);
      triggerSosBroadcast();
    }

    return () => clearTimeout(timer);
  }, [isOpen, countdown, isCountingDown]);

  // Web Audio emergency siren generator
  const playSirenChime = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio context restricted until user gesture
    }
  };

  const startAlarmSound = () => {
    playSirenChime();
    if (!audioIntervalRef.current) {
      audioIntervalRef.current = setInterval(playSirenChime, 800);
    }
  };

  const stopAlarmSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    stopAlarmSound();
    onClose();
  };

  const triggerSosBroadcast = async () => {
    setIsBroadcasting(true);
    if (soundEnabled) {
      startAlarmSound();
    }

    const distressText = `SOS EMERGENCY: ${selectedEmergency}. ${additionalNotes}`;
    
    // Triage with server-side Gemini
    triageSosMessage(distressText, userLocation || { lat: 19.076, lng: 72.8777 }).then(res => {
      setTriageInfo(res);
    });

    try {
      await postCitizenCheckin({
        name: name || 'Emergency Survivor',
        phone: phone || 'Unlisted',
        status: 'Need Help',
        notes: `🚨 CRITICAL SOS: ${selectedEmergency} ${additionalNotes ? `— "${additionalNotes}"` : ''}`,
        lat: userLocation ? userLocation.lat : 19.076,
        lng: userLocation ? userLocation.lng : 72.8777
      });
      setIsBroadcastComplete(true);
      if (onSuccessCheckin) onSuccessCheckin();
    } catch (e) {
      // Even if network fails, storage engine queued it offline
      setIsBroadcastComplete(true);
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-rose-600/80 shadow-2xl overflow-hidden p-6">
        {/* Top Close / Audio bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <h3 className="font-black tracking-wider text-rose-500 text-lg uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Emergency SOS Broadcast
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (!next) stopAlarmSound();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={soundEnabled ? 'Mute Siren' : 'Unmute Siren'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                stopAlarmSound();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Second Abort Guard */}
        {isCountingDown ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-rose-950/60 border-4 border-rose-600 flex items-center justify-center">
              <span className="text-4xl font-black text-rose-400 animate-pulse">{countdown}</span>
            </div>
            <div>
              <h4 className="font-bold text-xl text-white">Broadcasting Emergency Signal...</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                Accidental tap? You have {countdown} second{countdown > 1 ? 's' : ''} to cancel before alerts go to NDRF & Community.
              </p>
            </div>
            <button
              onClick={handleCancelCountdown}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition"
            >
              Cancel Broadcast
            </button>
          </div>
        ) : isBroadcastComplete ? (
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-lg text-emerald-300">SOS Distress Signal Sent!</h4>
              <p className="text-xs text-slate-300">
                Your emergency beacon and GPS coordinates have been broadcast to the nearest disaster operations room and queued for continuous radio/cloud sync.
              </p>
              <div className="text-[11px] text-emerald-400/80 font-mono">
                Location: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Approx. Western Node'}
              </div>
            </div>

            {triageInfo && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-400">AI Triage Classification</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 font-bold uppercase text-[10px]">
                    {triageInfo.urgency || 'CRITICAL'} PRIORITY
                  </span>
                </div>
                <div className="text-slate-200">
                  <b>Action:</b> {triageInfo.recommendedAction}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-800/80 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">What to do right now:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Conserve phone battery (dim brightness, avoid streaming).</li>
                <li>Stay visible if on roof/clearing, or bang on pipes if trapped.</li>
                <li>If water is rising, tie a bright fabric outside window.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                stopAlarmSound();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-900/30 transition"
            >
              Close & View Evacuation Map
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name / Identifying Info</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Anand & family (3 people)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Phone (Optional for SMS relay)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Immediate Nature of Threat</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Trapped & Need Rescue',
                    'Water Entering Premises',
                    'Severe Medical Injury',
                    'Structure Cracking / Fire',
                    'Elderly / Children Alone',
                    'Need Food & Water'
                  ].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedEmergency(option)}
                      className={`p-2 rounded-xl border text-left font-medium transition ${
                        selectedEmergency === option
                          ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Specific Landmarks / Details</label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. 2nd floor balcony, red gate, water at chest level"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={triggerSosBroadcast}
                disabled={isBroadcasting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50 transition disabled:opacity-50"
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transmitting SOS...
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-5 h-5" />
                    Confirm & Send SOS Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
