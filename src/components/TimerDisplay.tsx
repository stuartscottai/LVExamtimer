import React, { useEffect, useRef, useState } from 'react';
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
  const fullScreenCircleRef = useRef<HTMLDivElement | null>(null);
  const fullScreenTextRef = useRef<HTMLDivElement | null>(null);
  const textScaleRef = useRef(1);
  const [textScale, setTextScale] = useState(1);

  // Check if time is low (<=60 seconds) for urgency styling
  const isLowTime = timeRemaining <= 60 && timeRemaining > 0;
  
  // Format the time for display.
  // Show MM:SS below one hour, otherwise HH:MM:SS.
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = hours > 0
    ? formatTime(timeRemaining)
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Calculate progress percentage (how much time has elapsed)
  const progressPercentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  
  // Create accessible time description
  const getTimeDescription = () => {
    let description = '';
    if (hours > 0) description += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0) description += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
    if (seconds > 0 || timeRemaining === 0) description += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    return description.trim() + ' remaining';
  };

  useEffect(() => {
    textScaleRef.current = textScale;
  }, [textScale]);

  useEffect(() => {
    if (!isFullScreen) {
      setTextScale(1);
      return;
    }

    const circleElement = fullScreenCircleRef.current;
    const textElement = fullScreenTextRef.current;

    if (!circleElement || !textElement) {
      return;
    }

    let animationFrame = 0;

    const fitText = () => {
      const circle = fullScreenCircleRef.current;
      const text = fullScreenTextRef.current;

      if (!circle || !text) {
        return;
      }

      const circleSize = Math.min(circle.clientWidth, circle.clientHeight);
      const safeInnerRadius = circleSize * 0.42;

      if (!circleSize || !safeInnerRadius) {
        return;
      }

      const currentScale = textScaleRef.current || 1;
      const textRect = text.getBoundingClientRect();
      const naturalWidth = textRect.width / currentScale;
      const naturalHeight = textRect.height / currentScale;

      if (!naturalWidth || !naturalHeight) {
        return;
      }

      // Fit the text bounding rectangle inside the timer circle.
      // This maximizes size while keeping all corners inside the inner safe radius.
      const diagonal = Math.sqrt((naturalWidth * naturalWidth) + (naturalHeight * naturalHeight));
      const nextScale = ((2 * safeInnerRadius) / diagonal) * 0.992;

      setTextScale(previousScale => (
        Math.abs(previousScale - nextScale) > 0.01 ? nextScale : previousScale
      ));
    };

    const scheduleFit = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(fitText);
    };

    const resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(circleElement);
    resizeObserver.observe(textElement);

    scheduleFit();
    window.addEventListener('resize', scheduleFit);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleFit);
    };
  }, [isFullScreen, formattedTime]);

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
        <div
          ref={fullScreenCircleRef}
          className="relative h-full aspect-square max-h-full max-w-full flex items-center justify-center"
        >
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
              <div
                ref={fullScreenTextRef}
                className={`font-mono font-bold tabular-nums whitespace-nowrap ${isLowTime ? 'text-red-500 pulse-urgency' : 'text-gray-700'} text-[16rem] leading-none`}
                style={{
                  transform: `scale(${textScale})`,
                  transformOrigin: 'center center'
                }}
              >
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

