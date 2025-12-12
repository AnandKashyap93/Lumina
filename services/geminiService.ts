import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { LocationData, HelpResult } from "../types";

// Handle API key retrieval safely for both Node/Shim environments and standard Vite environments
export const getApiKey = () => {
  // Check if process.env exists (Node/Shim)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // Check standard Vite env var (fallback)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    // Support both standard naming and the specific one in your Vercel config
    if ((import.meta as any).env.VITE_API_KEY) return (import.meta as any).env.VITE_API_KEY;
    if ((import.meta as any).env.VITE_GEMINI_API_KEY) return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

// --- Chat Service ---
let chatSession: Chat | null = null;

export const initChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are Lumina, an adaptive reasoning voice companion and mental wellness support AI. Your goal is to be calming, supportive, and insightful. Keep responses concise but warm.",
    },
  });
};

export const sendMessage = async (message: string): Promise<string> => {
  if (!chatSession) initChat();
  try {
    const response: GenerateContentResponse = await chatSession!.sendMessage({ message });
    return response.text || "I'm having trouble connecting right now. Let's breathe together.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm listening, but having trouble processing. Please try again.";
  }
};

// --- Image Generation Service ---
export const generateCalmingImage = async (prompt: string): Promise<{ imageUrl: string | null; error?: string }> => {
  
  // Helper to attempt generation with a specific model
  const attemptGen = async (model: string): Promise<{ imageUrl: string | null; error?: string }> => {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { text: `Generate a photorealistic, high-quality image. ${prompt}. Ensure atmospheric lighting, soft textures, and a calming composition.` }
          ]
        },
        // Only apply imageConfig for the Pro model if we are using it
        config: model.includes('pro') ? {
            imageConfig: { aspectRatio: '16:9', imageSize: '1K' }
        } : undefined
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return { imageUrl: `data:image/png;base64,${part.inlineData.data}` };
        }
      }
      return { imageUrl: null, error: "No visual data received." };
    } catch (error: any) {
        console.error(`Error with model ${model}:`, error);
        
        // Detect quota issues
        if (error.toString().includes('429') || error.message?.includes('quota') || error.message?.includes('exhausted')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        throw error;
    }
  };

  try {
    // 1. Try the standard efficient model first
    return await attemptGen('gemini-2.5-flash-image');
  } catch (error: any) {
    // 2. If quota exceeded, try the Pro model as fallback
    if (error.message === "QUOTA_EXCEEDED") {
        console.log("Flash model quota exceeded. Falling back to Pro model...");
        try {
            return await attemptGen('gemini-3-pro-image-preview');
        } catch (fallbackError: any) {
             // 3. FINAL FALLBACK: Pollinations.ai (Free, Unlimited)
             // This ensures the user ALWAYS gets an image, even if Gemini is down/limited.
             console.log("Gemini quotas exhausted. Falling back to Pollinations.ai.");
             
             // Clean prompt for URL
             const safePrompt = encodeURIComponent(`${prompt} soothing, cinematic lighting, 8k, serene`);
             // Generate random seed to ensure new images on refresh
             const randomSeed = Math.floor(Math.random() * 10000);
             const url = `https://image.pollinations.ai/prompt/${safePrompt}?width=1280&height=720&nologo=true&seed=${randomSeed}&model=flux`;
             
             return { imageUrl: url };
        }
    }

    return { imageUrl: null, error: "Unable to generate image at this moment." };
  }
};

// --- Help / Maps Grounding Service ---
export const findMentalHealthSupport = async (location: LocationData): Promise<{ text: string, links: HelpResult[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Find the nearest mental health care centers or crisis intervention centers relative to my location.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        }
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const links: HelpResult[] = [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        links.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
      // Maps specific structure
      if (chunk.maps?.uri && chunk.maps?.title) { // Although API usually returns web chunks for maps results in 2.5
         links.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      }
    });

    return { text, links };
  } catch (error) {
    console.error("Maps error:", error);
    throw error;
  }
};