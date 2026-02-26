import React from 'react';
import { formatTime } from '../utils';

interface TimerDisplayProps {
  timeRemaining: number; // in seconds
  totalTime?: number; // total time in seconds for progress calculation
  isFullScreen?: boolean;
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeRemaining,
  totalTime = 0,
  isFullScreen = false,
  className = ''
}) => {
  // Check if time is low (<=60 seconds) for urgency styling
  const isLowTime = timeRemaining <= 60 && timeRemaining > 0;
  
  // Format the time for display
  const formattedTime = formatTime(timeRemaining);
  
  // Calculate progress percentage (how much time has elapsed)
  const progressPercentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  
  // Create accessible time description
  const getTimeDescription = () => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    let description = '';
    if (hours > 0) description += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0) description += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
    if (seconds > 0 || timeRemaining === 0) description += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    return description.trim() + ' remaining';
  };

  if (isFullScreen) {
    // Circular timer design for full screen - match the reference layout
    const strokeWidth = 8; // Much thinner stroke like in the reference
    const circleSize = 100; // Use percentage-based sizing
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
      <div 
        className={`w-full h-full min-h-0 flex items-center justify-center p-1 sm:p-2 ${className}`}
        role="timer"
        aria-live="polite"
        aria-label={getTimeDescription()}
        title={getTimeDescription()}
      >
        {/* Container that maintains aspect ratio and uses available space */}
        <div className="relative h-full aspect-square max-h-full max-w-full flex items-center justify-center">
          {/* SVG Circle Progress - fills container */}
          <svg
            className="transform -rotate-90 w-full h-full"
            viewBox={`0 0 ${circleSize} ${circleSize}`}
          >
            {/* Background circle - very light gray */}
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke={isLowTime ? "#ef4444" : "#2563eb"}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Timer text perfectly centered in circle - much larger */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`font-mono font-bold tabular-nums ${isLowTime ? 'text-red-500 pulse-urgency' : 'text-gray-700'} text-[clamp(2rem,11vmin,10rem)] leading-none`}>
                {formattedTime}
              </div>
            </div>
          </div>
        </div>
        
        {/* Screen reader only time description */}
        <span className="sr-only">{getTimeDescription()}</span>
      </div>
    );
  }

  // Standard timer display for non-fullscreen
  const baseClasses = `
    timer-display font-mono font-bold text-center
    transition-colors duration-300
  `;
  
  const sizeClasses = 'text-4xl md:text-5xl';
  const urgencyClasses = isLowTime ? 'text-red-500 pulse-urgency' : 'text-slate-700';
  
  return (
    <div 
      className={`${baseClasses} ${sizeClasses} ${urgencyClasses} ${className}`}
      role="timer"
      aria-live="polite"
      aria-label={getTimeDescription()}
      title={getTimeDescription()}
    >
      {formattedTime}
      {/* Screen reader only time description */}
      <span className="sr-only">{getTimeDescription()}</span>
    </div>
  );
};

export default TimerDisplay;

