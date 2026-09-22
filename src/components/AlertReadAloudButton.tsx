import React from 'react';
import { Volume2, VolumeX, Square } from 'lucide-react';
import { EmergencyAlert } from '../types';
import { useAlertSpeech } from '../services/alertSpeech';

interface AlertReadAloudButtonProps {
  alert: EmergencyAlert;
  actionPlanText?: string;
  variant?: 'primary' | 'subtle' | 'compact' | 'pill';
  label?: string;
  stopLabel?: string;
  className?: string;
}

export const AlertReadAloudButton: React.FC<AlertReadAloudButtonProps> = ({
  alert,
  actionPlanText,
  variant = 'primary',
  label,
  stopLabel,
  className = ''
}) => {
  const { isAlertSpeaking, toggleAlert, isSupported } = useAlertSpeech();
  const isSpeaking = isAlertSpeaking(alert.id);

  if (!isSupported) {
    return null;
  }

  const defaultLabel = label || 'Read Aloud';
  const activeStopLabel = stopLabel || 'Stop Audio';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleAlert(alert, actionPlanText);
        }}
        title={isSpeaking ? 'Stop hands-free emergency voice broadcast' : 'Listen to emergency instructions hands-free'}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition select-none ${
          isSpeaking
            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse border border-rose-400'
            : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
        } ${className}`}
      >
        {isSpeaking ? (
          <>
            <span className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-3 bg-white animate-[bounce_0.6s_infinite_100ms] rounded-full" />
              <span className="w-0.5 h-3 bg-white animate-[bounce_0.6s_infinite_200ms] rounded-full" />
              <span className="w-0.5 h-3 bg-white animate-[bounce_0.6s_infinite_300ms] rounded-full" />
            </span>
            <Square className="w-3 h-3 fill-white" />
            <span>{activeStopLabel}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{defaultLabel}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleAlert(alert, actionPlanText);
        }}
        title={isSpeaking ? 'Stop emergency speech' : 'Read aloud emergency alert'}
        className={`p-2 rounded-xl transition flex items-center justify-center ${
          isSpeaking
            ? 'bg-rose-600 text-white shadow-md animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
        } ${className}`}
      >
        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
      </button>
    );
  }

  if (variant === 'subtle') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleAlert(alert, actionPlanText);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
          isSpeaking
            ? 'bg-rose-600 text-white shadow animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
        } ${className}`}
      >
        {isSpeaking ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-white" />
            <span>{activeStopLabel}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{defaultLabel}</span>
          </>
        )}
      </button>
    );
  }

  // Primary variant
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleAlert(alert, actionPlanText);
      }}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition select-none shadow-sm ${
        isSpeaking
          ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400 shadow-lg shadow-rose-900/40 animate-pulse'
          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-rose-500/40 hover:border-rose-400'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <div className="flex items-center gap-0.5 h-3.5">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
            <div className="w-1 h-4 bg-white rounded-full animate-[pulse_0.4s_infinite_150ms]" />
            <div className="w-1 h-2 bg-white rounded-full animate-[pulse_0.4s_infinite_300ms]" />
          </div>
          <Square className="w-3.5 h-3.5 fill-white text-white" />
          <span>{activeStopLabel}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-rose-400" />
          <span>{defaultLabel}</span>
          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] uppercase font-mono">
            Voice
          </span>
        </>
      )}
    </button>
  );
};
