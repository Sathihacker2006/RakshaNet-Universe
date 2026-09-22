import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle2, Circle, AlertCircle, X, RotateCcw, ShieldCheck } from 'lucide-react';
import { EmergencyKitItem } from '../types';

interface EmergencyKitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_KIT_ITEMS: EmergencyKitItem[] = [
  { id: '1', category: 'Water & Food', name: 'Drinking Water (1 Gallon per person/day)', quantity: '3 Days minimum', checked: true, critical: true },
  { id: '2', category: 'Water & Food', name: 'Non-perishable canned food & energy bars', quantity: '3 Days supply', checked: true, critical: true },
  { id: '3', category: 'Water & Food', name: 'Manual can opener & eating utensils', quantity: '1 Set', checked: false, critical: false },
  { id: '4', category: 'Medical', name: 'First Aid Kit (Bandages, antiseptic, gauze)', quantity: '1 Kit', checked: true, critical: true },
  { id: '5', category: 'Medical', name: 'Essential Prescription Medications', quantity: '7-14 Days supply', checked: true, critical: true },
  { id: '6', category: 'Medical', name: 'N95 Respirator Masks (dust/smoke filter)', quantity: '2 per person', checked: false, critical: true },
  { id: '7', category: 'Tools & Light', name: 'Waterproof LED Flashlight & spare batteries', quantity: '2 Units', checked: true, critical: true },
  { id: '8', category: 'Tools & Light', name: 'High-decibel emergency rescue whistle', quantity: '1 per person', checked: true, critical: true },
  { id: '9', category: 'Tools & Light', name: 'Multi-tool knife / Swiss army tool', quantity: '1 Piece', checked: false, critical: false },
  { id: '10', category: 'Documents & Comms', name: 'High-capacity Portable Power Bank & cables', quantity: '20,000 mAh', checked: true, critical: true },
  { id: '11', category: 'Documents & Comms', name: 'Waterproof pouch with ID, Deed & Insurance copies', quantity: '1 Pouch', checked: false, critical: true },
  { id: '12', category: 'Documents & Comms', name: 'Emergency Cash in small currency denominations', quantity: '₹2,000 - ₹5,000', checked: true, critical: false },
  { id: '13', category: 'Personal', name: 'Thermal Mylar Emergency Blankets', quantity: '1 per person', checked: false, critical: false },
  { id: '14', category: 'Personal', name: 'Sturdy walking shoes & waterproof rain poncho', quantity: '1 Pair', checked: true, critical: true }
];

const STORAGE_KEY = 'rakshanet_emergency_kit';

export const EmergencyKitDrawer: React.FC<EmergencyKitDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<EmergencyKitItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_KIT_ITEMS;
    } catch {
      return DEFAULT_KIT_ITEMS;
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleReset = () => {
    if (confirm('Reset emergency survival go-bag checklist to default?')) {
      setItems(DEFAULT_KIT_ITEMS);
    }
  };

  const totalCount = items.length;
  const checkedCount = items.filter(i => i.checked).length;
  const percentage = Math.round((checkedCount / totalCount) * 100);

  const categories = ['All', 'Water & Food', 'Medical', 'Tools & Light', 'Documents & Comms', 'Personal'];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-[1150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base">72-Hour Survival Go-Bag</h3>
              <p className="text-[11px] text-slate-400">Offline Disaster Preparedness Checklist</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              title="Reset checklist"
              className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Readiness Meter Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">Go-Bag Preparedness Level</span>
            </div>
            <span className="font-mono font-bold text-white text-sm">{percentage}% Ready</span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                percentage >= 80
                  ? 'bg-emerald-500'
                  : percentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{checkedCount} of {totalCount} essentials packed</span>
            <span className={percentage >= 80 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {percentage >= 80 ? 'Mission Ready for 72h Evacuation' : 'Essential items still missing'}
            </span>
          </div>
        </div>

        {/* Categories Tab */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Checklist */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3 rounded-2xl border cursor-pointer select-none transition flex items-start gap-3 ${
                item.checked
                  ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-200'
                  : 'bg-slate-950 border-slate-800/70 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {item.checked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600" />
                )}
              </span>

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${item.checked ? 'text-white' : 'text-slate-300'}`}>
                    {item.name}
                  </span>
                  {item.critical && (
                    <span className="text-[10px] uppercase font-bold text-rose-400 px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-900/60 ml-2">
                      Critical
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>{item.quantity}</span>
                  <span className="text-[10px] text-slate-400">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
        >
          Close & Save Progress
        </button>
      </div>
    </div>
  );
};
