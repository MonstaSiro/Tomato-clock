import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, TimerConfig } from './types';
import CircularTimer from './components/CircularTimer';
import GeminiCard from './components/GeminiCard';
import { generateTip } from './services/geminiService';
import { Play, Pause, RotateCcw, Coffee, Smartphone, BookOpen } from 'lucide-react';

// Configuration for each mode (Static data: colors, labels)
const MODES_CONFIG: Record<TimerMode, Omit<TimerConfig, 'duration'>> = {
  [TimerMode.FOCUS]: {
    mode: TimerMode.FOCUS,
    label: 'Focus Time',
    color: '#ef4444', // Red-500
    description: 'Study session',
  },
  [TimerMode.SHORT_BREAK]: {
    mode: TimerMode.SHORT_BREAK,
    label: 'Phone Time',
    color: '#10b981', // Emerald-500
    description: 'Short break',
  },
  [TimerMode.LONG_BREAK]: {
    mode: TimerMode.LONG_BREAK,
    label: 'Long Break',
    color: '#3b82f6', // Blue-500
    description: 'Recharge',
  },
};

const App: React.FC = () => {
  // State for customizable durations (in seconds)
  const [durations, setDurations] = useState<Record<TimerMode, number>>({
    [TimerMode.FOCUS]: 25 * 60,
    [TimerMode.SHORT_BREAK]: 5 * 60,
    [TimerMode.LONG_BREAK]: 10 * 60,
  });

  const [currentMode, setCurrentMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(durations[TimerMode.FOCUS]);
  const [isActive, setIsActive] = useState(false);
  const [aiText, setAiText] = useState<string>("Let's get productive!");
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Ensure AudioContext is created and unlocked on user interaction
  const unlockAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    
    if (audioCtxRef.current) {
      // Resume if suspended (common in Chrome/Safari)
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Play a silent tiny beep to physically engage the audio engine
      // This is crucial for Safari on Mac/iOS
      try {
        const buffer = audioCtxRef.current.createBuffer(1, 1, 22050);
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.start(0);
      } catch (e) {
        console.error("Audio unlock failed", e);
      }
    }
  };

  const playAlarm = useCallback(() => {
    try {
      // Try to ensure context exists, though it should have been unlocked by Start
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      // Square wave is louder and more "buzzer-like" than sawtooth
      const playTone = (startTime: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square'; 
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Louder volume (0.25) and quick decay
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Distinct "Digital Watch" style beep pattern
      // Beep ... Beep ... Beep ...
      playTone(now, 880, 0.3); 
      playTone(now + 0.5, 880, 0.3);
      playTone(now + 1.0, 880, 0.6); // Longer final beep

    } catch (error) {
      console.error("Error playing alarm:", error);
    }
  }, []);

  const fetchAiContent = useCallback(async (mode: TimerMode) => {
    setLoadingAi(true);
    const text = await generateTip(mode);
    setAiText(text);
    setLoadingAi(false);
  }, []);

  // Fetch initial content on load
  useEffect(() => {
    fetchAiContent(TimerMode.FOCUS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (mode: TimerMode) => {
    setIsActive(false);
    setCurrentMode(mode);
    setTimeLeft(durations[mode]); // Load custom duration for this mode
    fetchAiContent(mode);
  };

  const toggleTimer = () => {
    if (!isActive) {
      // CRITICAL: Unlock audio immediately on user gesture (Start)
      unlockAudio();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[currentMode]);
  };

  const handleDurationUpdate = (newDurationSeconds: number) => {
    // Update duration setting for current mode
    setDurations(prev => ({
      ...prev,
      [currentMode]: newDurationSeconds
    }));
    // Reset timer to new duration
    setIsActive(false);
    setTimeLeft(newDurationSeconds);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      if (isActive) {
          setIsActive(false);
          playAlarm();
      }
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, currentMode, playAlarm]);

  const currentConfig = MODES_CONFIG[currentMode];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-gray-800 transition-colors duration-700">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <header className="mb-8 text-center">
           <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Tomato MacFocus</h1>
           <p className="text-gray-500 mt-1">Stay focused, earn your phone time.</p>
        </header>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Mode Selector */}
          <div className="flex justify-center gap-2 mb-10 p-1 bg-gray-200/50 rounded-full w-fit mx-auto backdrop-blur-sm">
            {(Object.keys(MODES_CONFIG) as TimerMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                  ${currentMode === mode 
                    ? 'bg-white text-gray-900 shadow-sm scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/30'}
                `}
              >
                {mode === TimerMode.FOCUS && <BookOpen size={14} />}
                {mode === TimerMode.SHORT_BREAK && <Smartphone size={14} />}
                {mode === TimerMode.LONG_BREAK && <Coffee size={14} />}
                {MODES_CONFIG[mode].label}
              </button>
            ))}
          </div>

          {/* Timer Visualization */}
          <div className="flex justify-center mb-10">
            <CircularTimer 
              timeLeft={timeLeft} 
              totalTime={durations[currentMode]} 
              color={currentConfig.color}
              isActive={isActive}
              onUpdateDuration={handleDurationUpdate}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              onClick={toggleTimer}
              className={`
                h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300
                ${isActive ? 'bg-orange-400' : 'bg-gray-900'}
              `}
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            
            <button
              onClick={resetTimer}
              className="h-12 w-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 hover:scale-105 transition-all"
            >
              <RotateCcw size={20} />
            </button>
          </div>
          
          {/* AI Tips Section */}
          <div className="border-t border-gray-200 pt-6">
             <GeminiCard text={aiText} loading={loadingAi} mode={currentMode} />
          </div>

        </div>

        {/* Footer Instructions */}
        <div className="mt-8 text-center text-gray-400 text-sm">
           <p>Click the timer to edit duration. MacFocus uses <strong>Gemini 2.5 Flash</strong>.</p>
        </div>

      </div>
    </div>
  );
};

export default App;