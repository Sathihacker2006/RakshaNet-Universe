import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2, 
  X, 
  Send,
  Building,
  Droplets,
  Flame
} from 'lucide-react';
import { PhotoDamageReport } from '../types';
import { analyzeDamagePhoto } from '../services/api';

interface PhotoDamageScannerProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  onReportCreated?: (report: PhotoDamageReport) => void;
}

export const PhotoDamageScanner: React.FC<PhotoDamageScannerProps> = ({
  isOpen,
  onClose,
  userLocation,
  onReportCreated
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [hazardCategory, setHazardCategory] = useState<string>('structural');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PhotoDamageReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Sample Presets for Instant Demo Testing
  const handlePresetSelect = (preset: 'crack' | 'flood' | 'fire') => {
    // Generate a stylized simulated canvas data URL
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (preset === 'crack') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, 400, 300);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(80, 40);
        ctx.lineTo(200, 160);
        ctx.lineTo(260, 280);
        ctx.stroke();
        ctx.fillStyle = '#f87171';
        ctx.font = '16px monospace';
        ctx.fillText('DIAGONAL SHEAR FRACTURE', 20, 30);
        setNotes('Heavy structural crack on 1st floor load-bearing pillar after tremors.');
        setHazardCategory('earthquake');
      } else if (preset === 'flood') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 400, 160);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(0, 160, 400, 140);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '16px monospace';
        ctx.fillText('WATER LEVEL: 1.2M ABOVE SLAB', 20, 30);
        setNotes('Flood water entered residential ground floor, near electrical meter box.');
        setHazardCategory('flood');
      } else {
        ctx.fillStyle = '#292524';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(200, 150, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.font = '16px monospace';
        ctx.fillText('FIRE SCORCH & REBAR EXPOSURE', 20, 30);
        setNotes('Extensive scorch damage and concrete spalling along corridor ceiling.');
        setHazardCategory('wildfire');
      }
      setSelectedImage(canvas.toDataURL('image/jpeg'));
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);

    try {
      const report = await analyzeDamagePhoto(
        selectedImage,
        notes,
        userLocation || { lat: 19.076, lng: 72.8777 },
        hazardCategory
      );
      setAnalysisResult(report);
      if (onReportCreated) onReportCreated(report);
    } catch (e) {
      console.error('Photo analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                AI Visual Damage & Hazard Scanner
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-mono font-bold border border-rose-800">
                  GEMINI VISION
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Snap photos of building fractures, flood levels, or debris for immediate safety triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Simulators for Instant Demo */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300">Quick Test Image Presets:</span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handlePresetSelect('crack')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 border border-slate-700 transition"
            >
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>Wall Fracture</span>
            </button>
            <button
              onClick={() => handlePresetSelect('flood')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 border border-slate-700 transition"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Flood Ingress</span>
            </button>
            <button
              onClick={() => handlePresetSelect('fire')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 border border-slate-700 transition"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Fire Scorch</span>
            </button>
          </div>
        </div>

        {/* Upload / Camera Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
            selectedImage
              ? 'border-emerald-500/50 bg-slate-950'
              : 'border-slate-700 hover:border-rose-500 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedImage ? (
            <div className="space-y-2">
              <img
                src={selectedImage}
                alt="Uploaded damage"
                className="max-h-48 mx-auto rounded-xl object-contain border border-slate-800 shadow"
              />
              <span className="text-[11px] text-slate-400 block">Click or tap to change photo</span>
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <Upload className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="font-semibold text-xs text-white">Tap to Snap Photo or Upload from Device</div>
              <p className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP</p>
            </div>
          )}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Observed Condition / Floor Level (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. 2nd floor pillar, hear popping sounds from beam"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleAnalyze}
          disabled={!selectedImage || isAnalyzing}
          className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 transition disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Structural Safety with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Damage & Verify Structural Integrity
            </>
          )}
        </button>

        {/* Analysis Output */}
        {analysisResult && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                    analysisResult.riskLevel === 'IMMINENT_COLLAPSE' || analysisResult.riskLevel === 'SEVERE'
                      ? 'bg-rose-600 text-white'
                      : analysisResult.riskLevel === 'MODERATE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {analysisResult.riskLevel.replace('_', ' ')} RISK
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Confidence: {analysisResult.confidence}%
                </span>
              </div>

              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  analysisResult.safeToEnter
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {analysisResult.safeToEnter ? 'SAFE TO OCCUPY' : 'DO NOT ENTER'}
              </span>
            </div>

            {/* Structural Integrity Score Gauge */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold">Structural Integrity Index:</span>
                <span className="font-bold text-white font-mono">
                  {analysisResult.structuralIntegrityScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full ${
                    analysisResult.structuralIntegrityScore < 40
                      ? 'bg-rose-500'
                      : analysisResult.structuralIntegrityScore < 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${analysisResult.structuralIntegrityScore}%` }}
                />
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
              <span className="font-bold text-rose-400 block mb-0.5">Life-Safety Directive:</span>
              {analysisResult.recommendedAction}
            </div>

            {/* Identified Threats */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Visible Threats Detected:
              </span>
              <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
                {analysisResult.hazardsDetected.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Done & Return to Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
