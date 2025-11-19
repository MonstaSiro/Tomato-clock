import React, { useState, useEffect, useRef } from 'react';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  color: string;
  isActive: boolean;
  onUpdateDuration: (newDuration: number) => void;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ 
  timeLeft, 
  totalTime, 
  color, 
  isActive,
  onUpdateDuration 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTimeClick = () => {
    if (!isActive) {
      setIsEditing(true);
      // Pre-fill with current total minutes (not time left) to allow editing the duration setting
      setEditValue(Math.floor(totalTime / 60).toString());
    }
  };

  const handleInputBlur = () => {
    saveDuration();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveDuration();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const saveDuration = () => {
    let newMinutes = parseInt(editValue, 10);
    if (!isNaN(newMinutes) && newMinutes > 0) {
      // Clamp between 1 and 180 minutes
      newMinutes = Math.min(Math.max(newMinutes, 1), 180);
      onUpdateDuration(newMinutes * 60);
    }
    setIsEditing(false);
  };

  return (
    <div className="relative flex items-center justify-center drop-shadow-xl">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 transition-all duration-500"
      >
        {/* Background Ring */}
        <circle
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="opacity-50"
        />
        {/* Progress Ring */}
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`transition-all duration-1000 ease-linear ${isActive ? '' : 'opacity-80'}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-gray-700">
        {isEditing ? (
          <div className="flex flex-col items-center animate-in fade-in duration-200">
            <div className="flex items-baseline">
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="text-5xl font-light text-center bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 focus:outline-none w-24 text-gray-800 placeholder-gray-300"
                placeholder="25"
              />
              <span className="text-xl font-light text-gray-400 ml-1">min</span>
            </div>
            <span className="text-xs text-gray-400 mt-2">Press Enter</span>
          </div>
        ) : (
          <>
            <span 
              onClick={handleTimeClick}
              className={`text-6xl font-light tracking-tight tabular-nums text-gray-800 cursor-pointer hover:text-gray-600 transition-colors select-none ${isActive ? 'cursor-default' : ''}`}
              title={isActive ? "Pause to edit" : "Click to edit duration"}
            >
              {formattedTime}
            </span>
            <span className={`text-sm font-medium tracking-widest uppercase mt-2 ${isActive ? 'animate-pulse' : 'opacity-50'}`}>
              {isActive ? 'Running' : 'Paused'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CircularTimer;