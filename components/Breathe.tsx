import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wind, X, StopCircle } from 'lucide-react';

interface BreatheProps {
    isDarkMode: boolean;
}

export const Breathe: React.FC<BreatheProps> = ({ isDarkMode }) => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');

  useEffect(() => {
    if (!active) {
        setPhase('Ready');
        return;
    }

    const cycle = async () => {
      while (active) {
        setPhase('Inhale');
        await new Promise(r => setTimeout(r, 4000));
        if (!active) break;
        setPhase('Hold');
        await new Promise(r => setTimeout(r, 4000));
        if (!active) break;
        setPhase('Exhale');
        await new Promise(r => setTimeout(r, 4000));
        if (!active) break;
      }
    };
    cycle();
    return () => {}; // Cleanup handled by active check
  }, [active]);

  if (!active) {
    return (
      <button 
        onClick={() => setActive(true)}
        className="w-full h-24 bg-white dark:bg-slate-800 rounded-[32px] border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center gap-1 hover:shadow-md transition-all group"
      >
        <Wind className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm">Breathe</span>
      </button>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      <button 
        onClick={() => setActive(false)}
        className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-red-500 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative flex items-center justify-center mb-12">
        {/* Animated Circle */}
        <div 
            className={`w-64 h-64 rounded-full bg-blue-400/20 blur-3xl transition-all duration-[4000ms] ease-in-out
            ${phase === 'Inhale' ? 'scale-150 opacity-100' : ''}
            ${phase === 'Hold' ? 'scale-150 opacity-100' : ''}
            ${phase === 'Exhale' ? 'scale-100 opacity-40' : ''}
            `}
        />
        <div 
            className={`absolute w-48 h-48 rounded-full border-4 border-blue-400/30 flex items-center justify-center transition-all duration-[4000ms] ease-in-out
            ${phase === 'Inhale' ? 'scale-125 border-blue-500' : ''}
            ${phase === 'Hold' ? 'scale-125 border-blue-500' : ''}
            ${phase === 'Exhale' ? 'scale-100' : ''}
            `}
        >
             <span className="text-3xl font-light tracking-widest uppercase text-slate-700 dark:text-white">{phase}</span>
        </div>
      </div>

      <button 
        onClick={() => setActive(false)}
        className="flex items-center gap-2 px-8 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 rounded-full font-medium transition-all"
      >
        <StopCircle className="w-5 h-5" />
        Stop Exercise
      </button>
    </div>,
    document.body
  );
};
