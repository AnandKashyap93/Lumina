import React, { useState, useEffect } from 'react';
import { generateCalmingImage } from '../services/geminiService';
import { CalibrationData } from '../types';
import { Image as ImageIcon, Loader2, RefreshCw, Sparkles } from 'lucide-react';

interface ImageGeneratorProps {
    calibration: CalibrationData | null;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ calibration }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    // Construct a prompt based on calibration, tuned for the specific requested aesthetic
    const moodDesc = calibration?.mood ? (calibration.mood > 5 ? 'warm golden hour sunbeams, uplifting atmosphere, vibrant greens and golds' : 'soft misty morning, pastel pink and purple sky, calming fog, serene stillness') : 'peaceful nature scene';
    const energyDesc = calibration?.energy ? (calibration.energy > 5 ? 'flowing forest stream, dynamic light rays' : 'still lake reflection, deep ancient forest, cozy rainy window view') : 'balanced composition';
    const context = calibration?.description ? `subtly reflecting feelings of ${calibration.description}` : '';
    
    const prompt = `Cinematic nature photography, 8k resolution. ${moodDesc}, ${energyDesc}, ${context}. Elements: lush mossy forests, misty lakes, sunbeams through trees, or cozy minimalist interiors looking at nature. Ethereal lighting, magical realism, highly detailed, serene, masterpiece, photorealistic.`;
    
    const result = await generateCalmingImage(prompt);
    if (result) setImageUrl(result);
    setLoading(false);
  };

  // Auto generate on mount
  useEffect(() => {
    if (!imageUrl) {
        generate();
    }
  }, []);

  return (
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
        ) : imageUrl ? (
            <>
                <img src={imageUrl} alt="Generated scene" className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-105" />
                <button 
                    onClick={generate}
                    className="absolute bottom-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
                    title="Regenerate"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </>
        ) : (
           <div className="flex flex-col items-center gap-2 text-gray-400">
             <ImageIcon className="w-8 h-8 opacity-50" />
           </div>
        )}
      </div>
      
      {!loading && !imageUrl && (
         <button 
            onClick={generate}
            className="w-full py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
         >
            <Sparkles className="w-4 h-4 text-teal-500" /> Generate Safe Space
         </button>
      )}
    </div>
  );
};
