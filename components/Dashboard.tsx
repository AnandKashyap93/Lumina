import React, { useState } from 'react';
import { CalibrationData } from '../types';
import { ChatBot } from './ChatBot';
import { ImageGenerator } from './ImageGenerator';
import { MicroHabits } from './MicroHabits';
import { Breathe } from './Breathe';
import { HelpButton } from './HelpButton';
import { VoiceCompanion } from './VoiceCompanion';
import { Sparkles, Mic, Activity, Zap } from 'lucide-react';

interface DashboardProps {
  calibration: CalibrationData | null;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ calibration, isDarkMode }) => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 animate-fade-in flex flex-col max-w-[1600px] mx-auto">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-teal-400 to-blue-500 p-2 rounded-xl text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lumina</h1>
        </div>

        <div className="flex items-center gap-4">
           {/* Stats Pills */}
           <div className="hidden md:flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-medium flex items-center gap-2 shadow-sm">
                 <Zap className="w-4 h-4 text-purple-500" />
                 <span>{calibration?.energy ? calibration.energy * 10 : 50}% Energy</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-medium flex items-center gap-2 shadow-sm">
                 <Activity className="w-4 h-4 text-orange-500" />
                 <span>Mood {calibration?.mood || 5}/10</span>
              </div>
           </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* Main Content (Chat) - Spans 8 cols */}
        <div className="lg:col-span-8 flex flex-col h-[70vh] lg:h-auto">
           <ChatBot isDarkMode={isDarkMode} />
        </div>

        {/* Sidebar - Spans 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           
           {/* Voice Companion Card */}
           <div className="bg-teal-50 dark:bg-slate-800/50 rounded-[32px] p-6 border border-teal-100 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Mic className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-1">Voice Companion</h3>
                 <p className="text-sm opacity-70 mb-6">Real-time emotional support.</p>
                 <button 
                    onClick={() => setIsVoiceActive(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
                 >
                    <Mic className="w-4 h-4" /> Start Session
                 </button>
              </div>
           </div>

           {/* Serenity Canvas (Auto Image) */}
           <ImageGenerator calibration={calibration} />

           {/* Micro Habits */}
           <div className="flex-1 min-h-[200px]">
              <MicroHabits isDarkMode={isDarkMode} />
           </div>

           {/* Bottom Actions Row */}
           <div className="grid grid-cols-2 gap-4">
              <Breathe isDarkMode={isDarkMode} />
              <div className="relative h-24">
                 <HelpButton isDarkMode={isDarkMode} />
              </div>
           </div>

        </div>
      </div>
      
      {/* Voice Companion Overlay */}
      <VoiceCompanion 
        isOpen={isVoiceActive} 
        onClose={() => setIsVoiceActive(false)} 
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
