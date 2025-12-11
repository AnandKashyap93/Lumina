import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { pcmToStreamData, base64ToUint8Array } from '../utils/audio';

interface VoiceCompanionProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const VoiceCompanion: React.FC<VoiceCompanionProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [isMicOn, setIsMicOn] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioInputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback Refs
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Session Ref
  const sessionRef = useRef<any>(null); // Type 'any' for the session object returned by connect
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (!isOpen) {
        cleanup();
        return;
    }

    startSession();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    // Stop Microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect Audio Nodes
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }

    // Close Audio Contexts
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (audioInputContextRef.current) {
        audioInputContextRef.current.close();
        audioInputContextRef.current = null;
    }

    // Close Session (if possible - the API doesn't expose a close method on the promise result easily in all versions, 
    // but we can assume closing the connection logic handles it by unmounting)
    // Actually, the example says: "When the conversation is finished, use `session.close()`".
    // We will try to call close if available.
    sessionPromiseRef.current?.then(session => {
        try {
            if (session.close) session.close();
        } catch(e) { /* ignore */ }
    });

    // Stop all scheduled audio
    scheduledSourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    scheduledSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    
    setStatus('disconnected');
  };

  const startSession = async () => {
    setStatus('connecting');
    setErrorMessage('');

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key not found");

        const ai = new GoogleGenAI({ apiKey });

        // Initialize Audio Contexts
        audioInputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: {
            channelCount: 1,
            sampleRate: 16000,
        }});
        streamRef.current = stream;

        // Connect to Gemini Live
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: "You are Lumina, a warm, calm, and empathetic mental wellness companion. Speak softly and briefly. Your goal is to help the user feel heard and grounded. Do not give medical advice, but offer emotional support.",
            },
            callbacks: {
                onopen: async () => {
                    setStatus('connected');
                    // Setup Audio Processing
                    if (!audioInputContextRef.current || !streamRef.current) return;
                    
                    const source = audioInputContextRef.current.createMediaStreamSource(streamRef.current);
                    sourceRef.current = source;

                    const processor = audioInputContextRef.current.createScriptProcessor(4096, 1, 1);
                    processorRef.current = processor;

                    processor.onaudioprocess = (e) => {
                        if (!sessionPromiseRef.current) return;
                        
                        const inputData = e.inputBuffer.getChannelData(0);
                        // Convert to Base64 PCM 16-bit
                        const base64Data = pcmToStreamData(inputData);
                        
                        sessionPromiseRef.current.then(session => {
                             session.sendRealtimeInput({
                                media: {
                                    mimeType: 'audio/pcm;rate=16000',
                                    data: base64Data
                                }
                             });
                        });
                    };

                    source.connect(processor);
                    processor.connect(audioInputContextRef.current.destination);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && audioContextRef.current) {
                        const ctx = audioContextRef.current;
                        const bytes = base64ToUint8Array(audioData);
                        
                        // Decode raw PCM (s16le) to AudioBuffer
                        // The output is 24000Hz, 1 channel, s16le
                        const int16Array = new Int16Array(bytes.buffer);
                        const float32Array = new Float32Array(int16Array.length);
                        for (let i = 0; i < int16Array.length; i++) {
                            float32Array[i] = int16Array[i] / 32768.0;
                        }

                        const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
                        audioBuffer.copyToChannel(float32Array, 0);

                        // Schedule Playback
                        // Ensure we don't schedule in the past
                        const currentTime = ctx.currentTime;
                        if (nextStartTimeRef.current < currentTime) {
                            nextStartTimeRef.current = currentTime;
                        }
                        
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.start(nextStartTimeRef.current);
                        
                        scheduledSourcesRef.current.push(source);
                        source.onended = () => {
                            const index = scheduledSourcesRef.current.indexOf(source);
                            if (index > -1) scheduledSourcesRef.current.splice(index, 1);
                        };

                        nextStartTimeRef.current += audioBuffer.duration;
                    }

                    if (msg.serverContent?.interrupted) {
                        // Clear queue
                        scheduledSourcesRef.current.forEach(s => s.stop());
                        scheduledSourcesRef.current = [];
                        nextStartTimeRef.current = 0;
                    }
                },
                onclose: () => {
                    if (isOpen) setStatus('disconnected'); // Only update if we didn't initiate close
                },
                onerror: (err) => {
                    console.error("Live API Error:", err);
                    setErrorMessage("Connection error. Please try again.");
                    setStatus('error');
                }
            }
        });

        sessionPromiseRef.current = sessionPromise;

    } catch (err) {
        console.error("Setup error:", err);
        setErrorMessage("Failed to access microphone or connect.");
        setStatus('error');
    }
  };

  const toggleMic = () => {
     if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !isMicOn;
        });
        setIsMicOn(!isMicOn);
     }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className={`relative w-full max-w-md rounded-[40px] p-8 flex flex-col items-center justify-between min-h-[400px] shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-100'}`}>
            
            {/* Header */}
            <div className="w-full flex justify-between items-start">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">Lumina Live</span>
                    </h2>
                    <p className="text-sm opacity-60">
                        {status === 'connecting' && 'Establishing connection...'}
                        {status === 'connected' && 'Listening...'}
                        {status === 'error' && 'Connection failed'}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-6 h-6 opacity-60" />
                </button>
            </div>

            {/* Visualizer */}
            <div className="flex-1 flex items-center justify-center w-full my-8">
                {status === 'connecting' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
                    </div>
                )}
                
                {status === 'connected' && (
                     <div className="relative flex items-center justify-center">
                        {/* Pulse Ring 1 */}
                        <div className="absolute w-48 h-48 rounded-full bg-teal-400/20 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                        {/* Pulse Ring 2 */}
                        <div className="absolute w-32 h-32 rounded-full bg-indigo-500/20 animate-ping delay-700 opacity-20" style={{ animationDuration: '3s' }}></div>
                        
                        {/* Main Orb */}
                        <div className={`relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 shadow-[0_0_40px_rgba(45,212,191,0.4)] transition-transform duration-300 ${isMicOn ? 'scale-100' : 'scale-90 grayscale opacity-50'}`}>
                             <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                        </div>

                        {!isMicOn && (
                            <div className="absolute z-20">
                                <MicOff className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                        )}
                     </div>
                )}

                {status === 'error' && (
                     <div className="text-center px-4">
                        <p className="text-red-500 font-medium mb-2">{errorMessage}</p>
                        <button onClick={startSession} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium">Retry</button>
                     </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={toggleMic}
                    disabled={status !== 'connected'}
                    className={`p-4 rounded-full transition-all ${
                        !isMicOn 
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                        : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                    {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <Phone className="w-5 h-5 rotate-[135deg]" />
                    End Session
                </button>
            </div>

        </div>
    </div>,
    document.body
  );
};

// Helper component for phone icon since it's used in the button
const Phone = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
