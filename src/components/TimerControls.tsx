import React from 'react';
import { PlayIcon, PauseIcon, ResetIcon } from './icons';

interface TimerControlsProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
  isDisabled?: boolean; // For listening papers
  isFullScreen?: boolean;
  className?: string;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  onStart,
  onPause,
  onReset,
  isRunning,
  isDisabled = false,
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
    ? 'w-20 h-20 text-lg' // Large circular buttons for full-screen
    : 'px-6 py-3 text-base'; // Standard rectangular buttons

  // Icon size based on full-screen mode
  const iconSize = isFullScreen ? 32 : 20;

  // Start/Pause button styling
  const startPauseClasses = isRunning
    ? `${baseButtonClasses} ${buttonSizeClasses} bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white`
    : `${baseButtonClasses} ${buttonSizeClasses} bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 text-white`;

  // Reset button styling
  const resetClasses = `
    ${baseButtonClasses} ${buttonSizeClasses}
    bg-slate-500 hover:bg-slate-600 focus:ring-slate-500 text-white
  `;

  // Container classes based on full-screen mode - horizontal for full screen
  const containerClasses = isFullScreen
    ? 'flex items-center justify-center space-x-8'
    : 'flex items-center justify-center space-x-4';

  return (
    <div className={`${containerClasses} ${className}`}>
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
    </div>
  );
};

export default TimerControls;