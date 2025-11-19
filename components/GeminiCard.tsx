import React from 'react';
import { TimerMode } from '../types';

interface GeminiCardProps {
  text: string;
  loading: boolean;
  mode: TimerMode;
}

const GeminiCard: React.FC<GeminiCardProps> = ({ text, loading, mode }) => {
  const getIcon = () => {
    if (loading) return (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
    if (mode === TimerMode.FOCUS) return <span className="text-2xl mr-2">🍅</span>;
    return <span className="text-2xl mr-2">📱</span>;
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 min-h-[100px]">
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-center mb-2 text-gray-400 text-xs font-bold tracking-widest uppercase">
          {loading ? "AI Thinking..." : "AI Companion"}
        </div>
        <div className="flex items-center justify-center">
             {getIcon()}
             <p className={`text-lg font-medium text-gray-700 ${loading ? 'animate-pulse bg-gray-200 text-transparent rounded' : ''}`}>
               {text || "Ready to start?"}
             </p>
        </div>
      </div>
    </div>
  );
};

export default GeminiCard;
