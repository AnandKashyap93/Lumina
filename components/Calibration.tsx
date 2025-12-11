import React, { useState } from 'react';
import { CalibrationData } from '../types';
import { ChevronRight, Sun, Zap } from 'lucide-react';

interface CalibrationProps {
  onComplete: (data: CalibrationData) => void;
}

export const Calibration: React.FC<CalibrationProps> = ({ onComplete }) => {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onComplete({ mood, energy, description });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
       {/* Background */}
       <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-teal-50/50 dark:from-slate-900 dark:to-slate-900">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-400/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 blur-[100px] rounded-full"></div>
       </div>

       <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl p-8 animate-fade-in border border-white/20 dark:border-slate-700">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Daily Calibration</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Help Lumina understand your headspace.</p>
          </div>

          <div className="space-y-8">
            {/* Mood Slider */}
            <div>
              <div className="flex justify-between items-end mb-4">
                 <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                    <Sun className="w-5 h-5 text-orange-400" /> Mood
                 </label>
                 <span className="text-2xl font-bold font-mono">{mood}<span className="text-sm text-gray-400 font-sans font-normal">/10</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fbbf24 0%, #fb923c 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-2">
                <span>Heavy</span>
                <span>Radiant</span>
              </div>
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex justify-between items-end mb-4">
                 <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                    <Zap className="w-5 h-5 text-purple-500" /> Energy
                 </label>
                 <span className="text-2xl font-bold font-mono">{energy}<span className="text-sm text-gray-400 font-sans font-normal">/10</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #818cf8 0%, #c084fc 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-2">
                <span>Drained</span>
                <span>Charged</span>
              </div>
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                One word describing today <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input 
                type="text"
                placeholder="e.g., Optimistic, Foggy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              Enter Dashboard <ChevronRight className="w-5 h-5" />
            </button>
          </div>

       </div>
    </div>
  );
};
