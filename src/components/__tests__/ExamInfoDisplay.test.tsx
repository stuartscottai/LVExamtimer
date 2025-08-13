import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExamInfoDisplay from '../ExamInfoDisplay';
import { Exam, Paper, TimerState } from '../../types';

// Mock data for testing
const mockExam: Exam = {
  name: 'B2 First',
  papers: [
    { name: 'Reading & Use of English', durationMinutes: 75 },
    { name: 'Writing', durationMinutes: 80 }
  ]
};

const mockPaper: Paper = {
  name: 'Reading & Use of English',
  durationMinutes: 75
};

const mockTimerStateNotStarted: TimerState = {
  timeRemaining: 4500, // 75 minutes in seconds
  isRunning: false,
  startTime: null,
  finishTime: null
};

const mockTimerStateStarted: TimerState = {
  timeRemaining: 4500,
  isRunning: true,
  startTime: new Date('2024-01-15T09:00:00'),
  finishTime: new Date('2024-01-15T10:15:00')
};

describe('ExamInfoDisplay', () => {
  it('renders null when no exam or paper is selected', () => {
    const { container } = render(
      <ExamInfoDisplay
        selectedExam={null}
        selectedPaper={null}
        timerState={mockTimerStateNotStarted}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays exam information correctly', () => {
    render(
      <ExamInfoDisplay
        selectedExam={mockExam}
        selectedPaper={mockPaper}
        timerState={mockTimerStateNotStarted}
      />
    );

    expect(screen.getByText('ES750')).toBeInTheDocument();
    expect(screen.getByText('B2 First')).toBeInTheDocument();
    expect(screen.getByText('Reading & Use of English')).toBeInTheDocument();
    expect(screen.getByText('1 hour 15 minutes')).toBeInTheDocument();
  });

  it('shows blank time fields when timer has not started', () => {
    render(
      <ExamInfoDisplay
        selectedExam={mockExam}
        selectedPaper={mockPaper}
        timerState={mockTimerStateNotStarted}
      />
    );

    const startTimeElement = screen.getByText('START Time').nextElementSibling;
    const finishTimeElement = screen.getByText('FINISH Time').nextElementSibling;
    
    expect(startTimeElement?.textContent).toBe('');
    expect(finishTimeElement?.textContent).toBe('');
  });

  it('displays formatted times when timer has started', () => {
    render(
      <ExamInfoDisplay
        selectedExam={mockExam}
        selectedPaper={mockPaper}
        timerState={mockTimerStateStarted}
      />
    );

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('10:15')).toBeInTheDocument();
  });

  it('applies full-screen styling when isFullScreen is true', () => {
    render(
      <ExamInfoDisplay
        selectedExam={mockExam}
        selectedPaper={mockPaper}
        timerState={mockTimerStateNotStarted}
        isFullScreen={true}
      />
    );

    // In full-screen mode, the title should not be displayed
    expect(screen.queryByText('Exam Information')).not.toBeInTheDocument();
    
    // Should show em dash for empty times in full-screen mode
    const startTimeElement = screen.getByText('START Time').nextElementSibling;
    const finishTimeElement = screen.getByText('FINISH Time').nextElementSibling;
    
    expect(startTimeElement?.textContent).toBe('—');
    expect(finishTimeElement?.textContent).toBe('—');
  });
});