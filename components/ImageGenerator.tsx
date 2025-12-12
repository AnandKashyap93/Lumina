import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { generateCalmingImage } from '../services/geminiService';
import { CalibrationData } from '../types';
import { Image as ImageIcon, Loader2, RefreshCw, Sparkles, AlertCircle, Maximize2, X } from 'lucide-react';

interface ImageGeneratorProps {
    calibration: CalibrationData | null;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ calibration }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const hasInitiatedRef = useRef(false);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    
    // Construct a prompt based on calibration, tuned for the specific requested aesthetic
    const moodDesc = calibration?.mood ? (calibration.mood > 5 ? 'warm golden hour sunbeams, uplifting atmosphere, vibrant greens and golds' : 'soft misty morning, pastel pink and purple sky, calming fog, serene stillness') : 'peaceful nature scene';
    const energyDesc = calibration?.energy ? (calibration.energy > 5 ? 'flowing forest stream, dynamic light rays' : 'still lake reflection, deep ancient forest, cozy rainy window view') : 'balanced composition';
    const context = calibration?.description ? `subtly reflecting feelings of ${calibration.description}` : '';
    
    const prompt = `Cinematic nature photography, 8k resolution. ${moodDesc}, ${energyDesc}, ${context}. Elements: lush mossy forests, misty lakes, sunbeams through trees, or cozy minimalist interiors looking at nature. Ethereal lighting, magical realism, highly detailed, serene, masterpiece, photorealistic.`;
    
    const result = await generateCalmingImage(prompt);
    
    if (result.imageUrl) {
        setImageUrl(result.imageUrl);
    } else if (result.error) {
        setError(result.error);
    }
    
    setLoading(false);
  };

  // Auto generate on mount, with strict mode protection
  useEffect(() => {
    if (!imageUrl && !hasInitiatedRef.current) {
        hasInitiatedRef.current = true;
        generate();
    }
  }, []);

  return (
    <>
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-[32px] p-6 border border-gray-100 dark:border-slate-700 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Serenity Canvas</h3>
            <p className="text-xs text-gray-500">Visuals generated for your state.</p>
        </div>

        <div className="relative aspect-video bg-gray-200 dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center group">
            {loading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs">Generating safe space...</span>
            </div>
            ) : error ? (
                <div className="flex flex-col items-center gap-2 text-red-400 px-4 text-center">
                    <AlertCircle className="w-8 h-8 opacity-80" />
                    <span className="text-xs">{error}</span>
                    <button 
                        onClick={() => generate()}
                        className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : imageUrl ? (
                <>
                    <img src={imageUrl} alt="Generated scene" className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-105" />
                    
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => setIsFullScreen(true)}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                            title="Full Screen"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => generate()}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                            title="Regenerate"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </>
            ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
            )}
        </div>
        
        {!loading && !imageUrl && !error && (
            <button 
                onClick={() => generate()}
                className="w-full py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
                <Sparkles className="w-4 h-4 text-teal-500" /> Generate Safe Space
            </button>
        )}
        </div>

        {isFullScreen && imageUrl && createPortal(
            <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in p-4 md:p-8">
                <button 
                    onClick={() => setIsFullScreen(false)}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <img 
                    src={imageUrl} 
                    alt="Full screen safe space" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </div>,
            document.body
        )}
    </>
  );
};