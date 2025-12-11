import React from 'react';
import { ArrowRight, Brain, Mic, Wind, Sparkles } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  isDarkMode: boolean;
}

export const Landing: React.FC<LandingProps> = ({ onStart, isDarkMode }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/60 border border-slate-200'}`}>
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>AI-Powered Mental Wellness</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
            Find calm in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">the chaos.</span>
          </h1>

          <p className={`text-lg max-w-lg mx-auto lg:mx-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Lumina is an emotionally intelligent companion that helps you balance productivity with well-being using advanced reasoning.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-6 items-center justify-center lg:justify-start">
            <button
              onClick={onStart}
              className="group px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="grid grid-cols-1 text-sm text-left gap-2 opacity-70">
              <div className="flex items-center gap-2">
                 <Brain className="w-4 h-4 text-teal-500" /> Understands Emotions
              </div>
              <div className="flex items-center gap-2">
                 <Mic className="w-4 h-4 text-purple-500" /> Respects Energy
              </div>
              <div className="flex items-center gap-2">
                 <Wind className="w-4 h-4 text-blue-500" /> No Toxic Positivity
              </div>
            </div>
          </div>
        </div>

        {/* Right Feature Cards */}
        <div className="relative animate-fade-in delay-200 hidden lg:block">
           <div className={`p-8 rounded-[40px] shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white/40 border-white/50'}`}>
              
              {/* Feature 1 */}
              <div className="flex items-start gap-4 p-4 border-b border-gray-200/10 mb-4">
                 <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400">
                    <Brain className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-lg">Adaptive Reasoning</h3>
                    <p className="text-sm opacity-70">Understands your energy levels</p>
                 </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 p-4 border-b border-gray-200/10 mb-4">
                 <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
                    <Mic className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-lg">Live Companion</h3>
                    <p className="text-sm opacity-70">Real-time voice support</p>
                 </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 p-4">
                 <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Wind className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-lg">Somatic Relief</h3>
                    <p className="text-sm opacity-70">Guided breathing & grounding</p>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};
