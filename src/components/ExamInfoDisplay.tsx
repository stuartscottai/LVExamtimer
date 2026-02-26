import React, { useEffect, useRef, useState } from 'react';
import { Exam, Paper, TimerState } from '../types';
import { formatTimeHHMM, formatDuration } from '../utils';

interface ExamInfoDisplayProps {
  selectedExam: Exam | null;
  selectedPaper: Paper | null;
  timerState: TimerState;
  isFullScreen?: boolean;
}

const ExamInfoDisplay: React.FC<ExamInfoDisplayProps> = ({
  selectedExam,
  selectedPaper,
  timerState,
  isFullScreen = false
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const fitScaleRef = useRef(1);
  const [fitScale, setFitScale] = useState(1);

  // Don't render if no exam or paper is selected
  if (!selectedExam || !selectedPaper) {
    return null;
  }

  // Format start and finish times (blank if timer hasn't started)
  const startTimeFormatted = timerState.startTime ? formatTimeHHMM(timerState.startTime) : '';
  const finishTimeFormatted = timerState.finishTime ? formatTimeHHMM(timerState.finishTime) : '';

  // Format duration
  const durationFormatted = formatDuration(selectedPaper.durationMinutes);

  useEffect(() => {
    fitScaleRef.current = fitScale;
  }, [fitScale]);

  useEffect(() => {
    if (!isFullScreen) {
      setFitScale(1);
      return;
    }

    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) {
      return;
    }

    let animationFrame = 0;

    const measure = () => {
      if (!container || !content) {
        return;
      }

      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;

      if (!availableWidth || !availableHeight) {
        return;
      }

      const currentScale = fitScaleRef.current || 1;
      const measuredRect = content.getBoundingClientRect();
      const naturalWidth = measuredRect.width / currentScale;
      const naturalHeight = measuredRect.height / currentScale;

      if (!naturalWidth || !naturalHeight) {
        return;
      }

      const scaleFromWidth = availableWidth / naturalWidth;
      const scaleFromHeight = availableHeight / naturalHeight;
      const nextScale = Math.max(0.5, Math.min(scaleFromWidth, scaleFromHeight) * 0.995);

      setFitScale(prevScale => (
        Math.abs(prevScale - nextScale) > 0.01 ? nextScale : prevScale
      ));
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(measure);
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(container);
    resizeObserver.observe(content);

    scheduleMeasure();
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [
    isFullScreen,
    selectedExam.name,
    selectedPaper.name,
    durationFormatted,
    startTimeFormatted,
    finishTimeFormatted
  ]);

  // Responsive typography classes
  const containerClasses = isFullScreen
    ? 'h-full min-h-0 overflow-hidden text-left'
    : 'space-y-5 p-8 bg-slate-50 rounded-lg border border-slate-200';

  const titleClasses = 'text-xl font-semibold text-slate-700 mb-6';

  const labelClasses = isFullScreen
    ? 'text-lg font-semibold uppercase tracking-[0.06em] text-blue-700 leading-tight'
    : 'text-base font-medium text-blue-600';

  const valueClasses = isFullScreen
    ? 'text-3xl font-bold text-slate-800 leading-tight break-words'
    : 'text-lg font-semibold text-slate-800';

  const timeClasses = isFullScreen
    ? 'text-3xl font-mono font-bold tabular-nums text-slate-800 leading-tight'
    : 'text-lg font-mono font-semibold text-slate-800';

  const sectionSpacingClasses = isFullScreen
    ? 'inline-grid gap-5'
    : 'space-y-4';

  const itemClasses = isFullScreen
    ? 'space-y-1.5'
    : '';

  const fullScreenScaleStyles = isFullScreen
    ? {
      transform: `scale(${fitScale})`,
      transformOrigin: 'top left'
    }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      role="region"
      aria-label="Exam information"
    >
      {!isFullScreen && (
        <h3 className={titleClasses}>
          Exam Information
        </h3>
      )}

      <div
        ref={contentRef}
        className={sectionSpacingClasses}
        style={fullScreenScaleStyles}
      >
        {/* Centre Number */}
        <div className={itemClasses}>
          <div className={labelClasses} id="centre-label">Centre Number</div>
          <div className={valueClasses} aria-labelledby="centre-label">ES750</div>
        </div>

        {/* Exam Name */}
        <div className={itemClasses}>
          <div className={labelClasses} id="exam-label">Exam</div>
          <div className={valueClasses} aria-labelledby="exam-label">{selectedExam.name}</div>
        </div>

        {/* Paper Name */}
        <div className={itemClasses}>
          <div className={labelClasses} id="paper-label">Paper</div>
          <div className={valueClasses} aria-labelledby="paper-label">{selectedPaper.name}</div>
        </div>

        {/* Duration */}
        <div className={itemClasses}>
          <div className={labelClasses} id="duration-label">Duration</div>
          <div className={valueClasses} aria-labelledby="duration-label">{durationFormatted}</div>
        </div>

        {/* Start Time */}
        <div className={itemClasses}>
          <div className={labelClasses} id="start-label">START Time</div>
          <div
            className={timeClasses}
            aria-labelledby="start-label"
            aria-live="polite"
          >
            {startTimeFormatted || (isFullScreen ? '-' : '')}
          </div>
        </div>

        {/* Finish Time */}
        <div className={itemClasses}>
          <div className={labelClasses} id="finish-label">FINISH Time</div>
          <div
            className={timeClasses}
            aria-labelledby="finish-label"
            aria-live="polite"
          >
            {finishTimeFormatted || (isFullScreen ? '-' : '')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInfoDisplay;
