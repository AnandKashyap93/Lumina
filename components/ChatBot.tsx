import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { sendMessage } from '../services/geminiService';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface ChatBotProps {
    isDarkMode: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessage(input);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-[32px] overflow-hidden shadow-sm border transition-colors ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
    }`}>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
        {messages.length === 0 ? (
            // Empty State
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-6">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-medium mb-2">How are you feeling right now?</h2>
                <p className="max-w-md text-sm">I'm here to listen, support, and help you find clarity.</p>
            </div>
        ) : (
            // Messages
            messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-sm dark:bg-white dark:text-slate-900' 
                      : 'bg-gray-100 text-slate-800 rounded-tl-sm dark:bg-slate-700 dark:text-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
            ))
        )}
        
        {isLoading && (
            <div className="flex justify-start">
               <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center h-12">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
               </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 pt-2">
        <div className={`flex items-center gap-2 p-2 pr-2 pl-6 rounded-full border shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share your thoughts..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm h-10 outline-none placeholder-gray-400"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                input.trim() 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105' 
                : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
