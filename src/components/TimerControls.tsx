import React from 'react';
import { PlayIcon, PauseIcon, ResetIcon } from './icons';

interface TimerControlsProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isRunning: boolean;
  isDisabled?: boolean; // For listening papers
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  isFullScreen?: boolean;
  className?: string;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  onStart,
  onPause,
  onReset,
  onPrevious,
  onNext,
  isRunning,
  isDisabled = false,
  canGoPrevious = false,
  canGoNext = false,
  isFullScreen = false,
  className = ''
}) => {
  // Handle start/pause button click
  const handleStartPause = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  // Base button classes
  const baseButtonClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Size classes based on full-screen mode
  const buttonSizeClasses = isFullScreen
    ? 'w-[clamp(2.75rem,7vmin,5rem)] h-[clamp(2.75rem,7vmin,5rem)] text-lg'
    : 'px-6 py-3 text-base'; // Standard rectangular buttons

  // Icon size based on full-screen mode
  const iconSize = isFullScreen ? 24 : 20;
  const navigationIconSize = isFullScreen ? 40 : 24;

  // Start/Pause button styling
  const startPauseClasses = isRunning
    ? `${baseButtonClasses} ${buttonSizeClasses} bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white`
    : `${baseButtonClasses} ${buttonSizeClasses} bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 text-white`;

  // Reset button styling
  const resetClasses = `
    ${baseButtonClasses} ${buttonSizeClasses}
    bg-slate-500 hover:bg-slate-600 focus:ring-slate-500 text-white
  `;

  const navigationClasses = `
    ${baseButtonClasses} ${buttonSizeClasses}
    rounded-lg bg-white/0 text-blue-600 shadow-[0_0.18rem_0.35rem_rgba(15,23,42,0.22)]
    hover:scale-105 hover:bg-white/20 hover:text-blue-700 focus:ring-blue-500
  `;

  // Container classes based on full-screen mode - horizontal for full screen
  const containerClasses = isFullScreen
    ? 'flex items-center justify-center gap-[clamp(0.75rem,2vmin,2rem)]'
    : 'flex items-center justify-center gap-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      {onPrevious && (
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={navigationClasses}
          aria-label="Previous paper"
          title="Previous paper"
        >
          <svg
            width={navigationIconSize}
            height={navigationIconSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Start/Pause Button */}
      <button
        onClick={handleStartPause}
        disabled={isDisabled}
        className={startPauseClasses}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        title={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isFullScreen ? (
          // Icon-only for full-screen mode
          isRunning ? (
            <PauseIcon size={iconSize} />
          ) : (
            <PlayIcon size={iconSize} />
          )
        ) : (
          // Icon + text for standard mode
          <>
            {isRunning ? (
              <>
                <PauseIcon size={iconSize} className="mr-2" />
                PAUSE
              </>
            ) : (
              <>
                <PlayIcon size={iconSize} className="mr-2" />
                START
              </>
            )}
          </>
        )}
      </button>

      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={isDisabled}
        className={resetClasses}
        aria-label="Reset timer"
        title="Reset timer"
      >
        {isFullScreen ? (
          // Icon-only for full-screen mode
          <ResetIcon size={iconSize} />
        ) : (
          // Icon + text for standard mode
          <>
            <ResetIcon size={iconSize} className="mr-2" />
            RESET
          </>
        )}
      </button>

      {onNext && (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={navigationClasses}
          aria-label="Next paper"
          title="Next paper"
        >
          <svg
            width={navigationIconSize}
            height={navigationIconSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TimerControls;
