import React from 'react';
import { Exam, Paper, TimerState } from '../types';
import { formatTimeHHMM, formatDuration } from '../utils';

interface ExamInfoDisplayProps {
  selectedExam: Exam | null;
  selectedPaper: Paper | null;
  timerState: TimerState;
  isFullScreen?: boolean;
  textSizeMultiplier?: number;
}

const ExamInfoDisplay: React.FC<ExamInfoDisplayProps> = ({
  selectedExam,
  selectedPaper,
  timerState,
  isFullScreen = false,
  textSizeMultiplier = 1
}) => {
  // Don't render if no exam or paper is selected
  if (!selectedExam || !selectedPaper) {
    return null;
  }

  // Format start and finish times (blank if timer hasn't started)
  const startTimeFormatted = timerState.startTime ? formatTimeHHMM(timerState.startTime) : '';
  const finishTimeFormatted = timerState.finishTime ? formatTimeHHMM(timerState.finishTime) : '';
  
  // Format duration
  const durationFormatted = formatDuration(selectedPaper.durationMinutes);

  // Calculate responsive font sizes with multiplier
  const getScaledSize = (baseSize: string) => {
    if (!isFullScreen) return baseSize;
    
    const sizeMap: { [key: string]: number } = {
      'text-8xl': 8,
      'text-7xl': 7,
      'text-6xl': 6,
      'text-5xl': 5,
      'text-4xl': 4,
      'text-3xl': 3,
      'text-2xl': 2,
      'text-xl': 1.25,
      'text-lg': 1.125
    };
    
    const baseLevel = sizeMap[baseSize] || 1;
    const scaledLevel = Math.round(baseLevel * textSizeMultiplier);
    
    // Map back to Tailwind classes
    const levelToClass: { [key: number]: string } = {
      9: 'text-9xl',
      8: 'text-8xl',
      7: 'text-7xl',
      6: 'text-6xl',
      5: 'text-5xl',
      4: 'text-4xl',
      3: 'text-3xl',
      2: 'text-2xl',
      1: 'text-xl'
    };
    
    return levelToClass[Math.max(1, Math.min(9, scaledLevel))] || baseSize;
  };

  // Responsive typography classes
  const containerClasses = isFullScreen 
    ? 'space-y-12 text-left' 
    : 'space-y-5 p-8 bg-slate-50 rounded-lg border border-slate-200';
    
  const titleClasses = isFullScreen 
    ? `${getScaledSize('text-8xl')} font-bold text-slate-800 mb-16` 
    : 'text-xl font-semibold text-slate-700 mb-6';
    
  const labelClasses = isFullScreen 
    ? `${getScaledSize('text-6xl')} font-medium text-blue-600` 
    : 'text-base font-medium text-blue-600';
    
  const valueClasses = isFullScreen 
    ? `${getScaledSize('text-7xl')} font-bold text-slate-800` 
    : 'text-lg font-semibold text-slate-800';
    
  const timeClasses = isFullScreen 
    ? `${getScaledSize('text-7xl')} font-bold text-slate-800` 
    : 'text-lg font-mono font-semibold text-slate-800';

  return (
    <div 
      className={containerClasses}
      role="region"
      aria-label="Exam information"
    >
      {!isFullScreen && (
        <h3 className={titleClasses}>
          Exam Information
        </h3>
      )}
      
      <div className={isFullScreen ? 'space-y-12' : 'space-y-4'}>
        {/* Centre Number */}
        <div>
          <div className={labelClasses} id="centre-label">Centre Number</div>
          <div className={valueClasses} aria-labelledby="centre-label">ES750</div>
        </div>

        {/* Exam Name */}
        <div>
          <div className={labelClasses} id="exam-label">Exam</div>
          <div className={valueClasses} aria-labelledby="exam-label">{selectedExam.name}</div>
        </div>

        {/* Paper Name */}
        <div>
          <div className={labelClasses} id="paper-label">Paper</div>
          <div className={valueClasses} aria-labelledby="paper-label">{selectedPaper.name}</div>
        </div>

        {/* Duration */}
        <div>
          <div className={labelClasses} id="duration-label">Duration</div>
          <div className={valueClasses} aria-labelledby="duration-label">{durationFormatted}</div>
        </div>

        {/* Start Time */}
        <div>
          <div className={labelClasses} id="start-label">START Time</div>
          <div 
            className={timeClasses} 
            aria-labelledby="start-label"
            aria-live="polite"
          >
            {startTimeFormatted || (isFullScreen ? '—' : '')}
          </div>
        </div>

        {/* Finish Time */}
        <div>
          <div className={labelClasses} id="finish-label">FINISH Time</div>
          <div 
            className={timeClasses} 
            aria-labelledby="finish-label"
            aria-live="polite"
          >
            {finishTimeFormatted || (isFullScreen ? '—' : '')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInfoDisplay;