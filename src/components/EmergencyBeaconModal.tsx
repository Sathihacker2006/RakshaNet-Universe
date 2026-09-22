import React, { useState, useEffect, useRef } from 'react';
import { Radio, Volume2, VolumeX, Flashlight, X, AlertOctagon } from 'lucide-react';

interface EmergencyBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyBeaconModal: React.FC<EmergencyBeaconModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isStrobeLit, setIsStrobeLit] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [morseSymbol, setMorseSymbol] = useState<string>('S');

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const morseTimeoutRef = useRef<any>(null);

  // Morse Code Sequence for SOS: (... --- ...)
  // Durations: dot = 180ms, dash = 540ms, element-gap = 180ms, letter-gap = 540ms, word-gap = 1200ms
  const MORSE_PATTERN = [
    // S (...)
    { on: true, dur: 180, symbol: '• (S)' },
    { on: false, dur: 180, symbol: '' },
    { on: true, dur: 180, symbol: '• (S)' },
    { on: false, dur: 180, symbol: '' },
    { on: true, dur: 180, symbol: '• (S)' },
    { on: false, dur: 540, symbol: '' },
    // O (---)
    { on: true, dur: 540, symbol: '— (O)' },
    { on: false, dur: 180, symbol: '' },
    { on: true, dur: 540, symbol: '— (O)' },
    { on: false, dur: 180, symbol: '' },
    { on: true, dur: 540, symbol: '— (O)' },
    { on: false, dur: 540, symbol: '' },
    // S (...)
    { on: true, dur: 180, symbol: '• (S)' },
    { on: false, dur: 180, symbol: '' },
    { on: true, dur: 180, symbol: '• (S)' },
    { on: false, dur: 180, symbol: '' },
    { on: true, dur: 180, symbol: '• (S)' },
    { on: false, dur: 1200, symbol: '' }
  ];

  // Sound generator
  const playMorseTone = (durationMs: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      // Audio context policy
    }
  };

  // Hardware Torch toggle
  const toggleTorch = async () => {
    try {
      if (torchEnabled) {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
        }
        setTorchEnabled(false);
      } else {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          mediaStreamRef.current = stream;
          const track = stream.getVideoTracks()[0];
          const imageCapture = (track as any).applyConstraints ? track : null;
          if (imageCapture) {
            await (imageCapture as any).applyConstraints({
              advanced: [{ torch: true }]
            });
          }
          setTorchEnabled(true);
        }
      }
    } catch (e) {
      console.warn('Torch not accessible on this device/browser:', e);
      setTorchEnabled(false);
    }
  };

  // Morse strobe loop
  useEffect(() => {
    if (!isOpen || !isActive) {
      setIsStrobeLit(false);
      return;
    }

    let stepIdx = 0;

    const runStep = () => {
      const step = MORSE_PATTERN[stepIdx];
      setIsStrobeLit(step.on);
      if (step.symbol) setMorseSymbol(step.symbol);

      if (step.on && soundEnabled) {
        playMorseTone(step.dur);
      }

      stepIdx = (stepIdx + 1) % MORSE_PATTERN.length;
      morseTimeoutRef.current = setTimeout(runStep, step.dur);
    };

    runStep();

    return () => {
      clearTimeout(morseTimeoutRef.current);
    };
  }, [isOpen, isActive, soundEnabled]);

  // Clean up torch on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[1200] flex flex-col justify-between p-6 transition-colors duration-75 select-none ${
        isStrobeLit ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
      }`}
    >
      {/* Top Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <h2 className={`font-black text-sm uppercase tracking-widest ${isStrobeLit ? 'text-slate-900' : 'text-rose-400'}`}>
            Optical SOS Rescue Strobe
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`p-2.5 rounded-2xl border transition ${
              isStrobeLit
                ? 'bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleTorch}
            className={`p-2.5 rounded-2xl border transition ${
              torchEnabled
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                : isStrobeLit
                ? 'bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            title="Toggle Hardware Camera Flash Torch"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className={`p-2.5 rounded-2xl border transition ${
              isStrobeLit
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Beacon Visualizer */}
      <div className="text-center space-y-6 z-10 my-auto">
        <div
          className={`w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center border-4 transition-all duration-75 ${
            isStrobeLit
              ? 'bg-rose-600 border-slate-900 text-white scale-110 shadow-[0_0_80px_rgba(225,29,72,0.9)]'
              : 'bg-slate-900 border-rose-500/50 text-rose-500 scale-100'
          }`}
        >
          <Radio className="w-12 h-12 stroke-[2.5]" />
          <span className="font-black text-2xl tracking-widest mt-1">S.O.S.</span>
        </div>

        <div>
          <div className={`font-mono text-xl font-black tracking-widest ${isStrobeLit ? 'text-slate-900' : 'text-white'}`}>
            {morseSymbol || '... --- ...'}
          </div>
          <p className={`text-xs mt-1 ${isStrobeLit ? 'text-slate-700' : 'text-slate-400'}`}>
            Hold phone high facing outward toward sky, drone, or rescue boats.
          </p>
        </div>
      </div>

      {/* Bottom Emergency Help Bar */}
      <div className="z-10 flex items-center justify-between pt-4 border-t border-slate-800/40 text-xs">
        <span className={`${isStrobeLit ? 'text-slate-700' : 'text-slate-400'}`}>
          Standard Maritime & Airborne Distress Pattern: 3 Short, 3 Long, 3 Short
        </span>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition"
        >
          Turn Off Strobe
        </button>
      </div>
    </div>
  );
};
