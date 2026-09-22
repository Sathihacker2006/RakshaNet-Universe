import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, X, Sparkles, Volume2, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { askGeminiAdvisor } from '../services/api';
import { getTranslation } from '../data/translations';
import { Shelter, Incident, SensorData } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isQuick?: boolean;
}

interface EmergencyChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  shelters?: Shelter[];
  incidents?: Incident[];
  sensors?: SensorData[];
  userLocation?: { lat: number; lng: number } | null;
}

export const EmergencyChatbot: React.FC<EmergencyChatbotProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  shelters = [],
  incidents = [],
  sensors = [],
  userLocation
}) => {
  const t = getTranslation(selectedLanguage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset greeting when language changes or on first mount
  useEffect(() => {
    const greetingMsg: Message = {
      id: 'init-greeting',
      sender: 'assistant',
      text: t.chatbot.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([greetingMsg]);
  }, [selectedLanguage]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Build live context string for Gemini
  const buildContext = () => {
    const activeIncident = incidents[0];
    const openShelters = shelters.filter(s => s.status === 'open');
    const freeBeds = openShelters.reduce((acc, s) => acc + Math.max(0, s.capacity - s.occupied), 0);
    const sensorAnomalies = sensors.filter(s => s.status !== 'normal').map(s => `${s.type} in ${s.location}: ${s.value}${s.unit}`);

    return `System Status:
- Active Hazard: ${activeIncident ? `${activeIncident.type.toUpperCase()} at ${activeIncident.location} (Severity: ${activeIncident.severity})` : 'Standby, No active verified disasters'}
- Open Shelters: ${openShelters.length} centers active with ${freeBeds} available beds (${openShelters.map(s => `${s.name}: ${s.capacity - s.occupied} beds free`).join(', ')})
- Sensor Alerts: ${sensorAnomalies.length > 0 ? sensorAnomalies.join('; ') : 'All multi-hazard sensors within safe thresholds'}
- User Location Coordinates: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Mumbai/Maharashtra Region'}`;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const context = buildContext();
      const response = await askGeminiAdvisor(query, context, selectedLanguage);
      
      const assistantMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        text: 'Follow local civil defense instructions and dial 112 / 1070 for urgent dispatch.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<string, string> = {
        hi: 'hi-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        en: 'en-US'
      };
      utterance.lang = langMap[selectedLanguage] || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="emergency-chatbot-modal"
        className="w-full sm:max-w-xl h-[88vh] sm:h-[650px] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Chatbot Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
              <Bot className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm sm:text-base">
                  {t.chatbot.title}
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {t.chatbot.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([{
                  id: 'init-greeting',
                  sender: 'assistant',
                  text: t.chatbot.greeting,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
              }}
              title="Reset conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              id="btn-close-chatbot"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live System Context Strip */}
        <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{shelters.filter(s => s.status === 'open').length} {t.dashboard.sheltersOpen}</span>
            <span className="text-slate-600">•</span>
            <span>{incidents.length} {t.dashboard.activeIncidents}</span>
          </div>
          <span className="uppercase text-[10px] text-indigo-400 font-bold">
            {selectedLanguage.toUpperCase()} LIVE
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60">
          {messages.map(msg => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isBot
                      ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm font-medium'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-slate-700/40 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        title="Read aloud"
                        className="hover:text-blue-400 transition flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-slate-400 text-[11px] ml-1">Formulating survival guidance in {selectedLanguage.toUpperCase()}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Suggested Emergency Queries:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {t.chatbot.quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 hover:border-slate-600 border border-slate-700 text-[11px] text-slate-300 transition active:scale-95 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            id="chatbot-query-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t.chatbot.placeholder}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            id="btn-send-chatbot"
            disabled={!inputText.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t.chatbot.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
