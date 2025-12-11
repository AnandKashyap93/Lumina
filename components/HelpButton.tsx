import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, MapPin, ExternalLink, X, Phone } from 'lucide-react';
import { findMentalHealthSupport } from '../services/geminiService';
import { HelpResult } from '../types';

interface HelpButtonProps {
    isDarkMode: boolean;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ text: string, links: HelpResult[] } | null>(null);

  const handleGetHelp = () => {
    setIsOpen(true);
    setError(null);
    setLoading(true);
    setResults(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findMentalHealthSupport({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setResults(data);
        } catch (err) {
          setError("Unable to fetch nearby support centers at this time.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable location services to find nearby help.");
        setLoading(false);
      }
    );
  };

  return (
    <>
      <button 
        onClick={handleGetHelp}
        className="w-full h-24 bg-red-50 dark:bg-red-900/10 rounded-[32px] border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group"
      >
        <Phone className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm text-red-500">Help</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 w-full max-w-lg rounded-[32px] p-8 shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold text-red-500 mb-2 flex items-center gap-2">
              <AlertCircle />
              Crisis Support
            </h2>
            <p className="text-gray-500 mb-8 text-sm">Locating nearest mental health resources...</p>

            {loading && (
               <div className="flex flex-col items-center py-8">
                  <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin mb-4"></div>
               </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-sm mb-4">
                {error}
              </div>
            )}

            {results && (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                 <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                   Here are some nearby support centers found for you:
                 </p>
                 <div className="space-y-2">
                    {results.links.length > 0 ? (
                        results.links.map((link, idx) => (
                          <a 
                            key={idx}
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 transition-colors group"
                          >
                             <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{link.title}</span>
                             </div>
                             <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                          </a>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No direct location links found. Please try searching on Google Maps directly.</p>
                    )}
                 </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
              <p className="text-xs text-gray-400">If you are in immediate danger, please call emergency services directly.</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};