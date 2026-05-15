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
  const fontSizeRef = useRef(48);
  const [fontSize, setFontSize] = useState(48);

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
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    if (!isFullScreen) {
      setFontSize(48);
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

      const measuredRect = content.getBoundingClientRect();
      const renderedHeight = measuredRect.height;

      if (!renderedHeight) {
        return;
      }

      let low = 12;
      let high = Math.min(availableHeight / 3.8, availableWidth / 4.5, 96);
      let best = low;
      const previousFontSize = content.style.fontSize;

      for (let index = 0; index < 10; index += 1) {
        const candidate = (low + high) / 2;
        content.style.fontSize = `${candidate}px`;

        const fits = content.scrollWidth <= availableWidth + 1
          && content.scrollHeight <= availableHeight + 1;

        if (fits) {
          best = candidate;
          low = candidate;
        } else {
          high = candidate;
        }
      }

      content.style.fontSize = previousFontSize;
      const nextFontSize = Math.max(12, best * 0.98);

      setFontSize(prevFontSize => (
        Math.abs(prevFontSize - nextFontSize) > 0.5 ? nextFontSize : prevFontSize
      ));
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(measure);
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(scheduleMeasure)
      : null;

    resizeObserver?.observe(container);
    resizeObserver?.observe(content);

    scheduleMeasure();
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
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
    ? 'self-center text-[0.46em] font-semibold uppercase tracking-[0.04em] text-blue-700 leading-[1.05] whitespace-nowrap'
    : 'text-base font-medium uppercase text-blue-600 whitespace-nowrap';

  const valueClasses = isFullScreen
    ? 'text-[1em] font-bold text-slate-800 leading-tight whitespace-normal break-normal'
    : 'text-lg font-semibold text-slate-800';

  const timeClasses = isFullScreen
    ? 'text-[1em] font-mono font-bold tabular-nums text-slate-800 leading-tight'
    : 'text-lg font-mono font-semibold text-slate-800';

  const sectionSpacingClasses = isFullScreen
    ? 'grid w-full grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-[0.42em] gap-y-[0.72em]'
    : 'grid grid-cols-1 gap-y-4 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-baseline sm:gap-x-4';

  const itemClasses = isFullScreen
    ? 'contents'
    : 'contents';

  const fullScreenStyles = isFullScreen
    ? {
      fontSize: `${fontSize}px`
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
        style={fullScreenStyles}
      >
        {/* Centre Number */}
        <div className={itemClasses}>
          <div className={labelClasses} id="centre-label">
            {isFullScreen ? (
              <>
                Centre<br />
                Number:
              </>
            ) : (
              'Centre Number:'
            )}
          </div>
          <div className={valueClasses} aria-labelledby="centre-label">ES750</div>
        </div>

        {/* Exam Name */}
        <div className={itemClasses}>
          <div className={labelClasses} id="exam-label">Exam:</div>
          <div className={valueClasses} aria-labelledby="exam-label">{selectedExam.name}</div>
        </div>

        {/* Paper Name */}
        <div className={itemClasses}>
          <div className={labelClasses} id="paper-label">Paper:</div>
          <div className={valueClasses} aria-labelledby="paper-label">{selectedPaper.name}</div>
        </div>

        {/* Duration */}
        <div className={itemClasses}>
          <div className={labelClasses} id="duration-label">Duration:</div>
          <div className={valueClasses} aria-labelledby="duration-label">{durationFormatted}</div>
        </div>

        {/* Start Time */}
        <div className={itemClasses}>
          <div className={labelClasses} id="start-label">Start Time:</div>
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
          <div className={labelClasses} id="finish-label">Finish Time:</div>
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
