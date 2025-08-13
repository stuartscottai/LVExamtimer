import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimerDisplay from '../TimerDisplay';

describe('TimerDisplay', () => {
  it('formats time correctly in HH:MM:SS format', () => {
    render(<TimerDisplay timeRemaining={3661} />); // 1 hour, 1 minute, 1 second
    expect(screen.getByText('01:01:01')).toBeInTheDocument();
  });

  it('formats time with leading zeros', () => {
    render(<TimerDisplay timeRemaining={65} />); // 1 minute, 5 seconds
    expect(screen.getByText('00:01:05')).toBeInTheDocument();
  });

  it('displays 00:00:00 when time is zero', () => {
    render(<TimerDisplay timeRemaining={0} />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('applies normal styling when time is above 60 seconds', () => {
    render(<TimerDisplay timeRemaining={120} />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveClass('text-slate-700');
    expect(timerElement).not.toHaveClass('text-red-500');
    expect(timerElement).not.toHaveClass('pulse-urgency');
  });

  it('applies urgency styling when time is 60 seconds or less', () => {
    render(<TimerDisplay timeRemaining={60} />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveClass('text-red-500');
    expect(timerElement).toHaveClass('pulse-urgency');
  });

  it('applies urgency styling when time is less than 60 seconds', () => {
    render(<TimerDisplay timeRemaining={30} />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveClass('text-red-500');
    expect(timerElement).toHaveClass('pulse-urgency');
  });

  it('does not apply urgency styling when time is exactly 0', () => {
    render(<TimerDisplay timeRemaining={0} />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveClass('text-slate-700');
    expect(timerElement).not.toHaveClass('text-red-500');
    expect(timerElement).not.toHaveClass('pulse-urgency');
  });

  it('applies standard size classes when not in full-screen mode', () => {
    render(<TimerDisplay timeRemaining={120} />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveClass('text-4xl');
    expect(timerElement).toHaveClass('md:text-5xl');
  });

  it('applies large size classes when in full-screen mode', () => {
    render(<TimerDisplay timeRemaining={120} isFullScreen={true} />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveClass('text-8xl');
    expect(timerElement).toHaveClass('lg:text-9xl');
  });

  it('provides accessible time description', () => {
    render(<TimerDisplay timeRemaining={3661} />); // 1 hour, 1 minute, 1 second
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveAttribute('aria-label', '1 hour 1 minute 1 second remaining');
  });

  it('provides correct time description for minutes only', () => {
    render(<TimerDisplay timeRemaining={90} />); // 1 minute, 30 seconds
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveAttribute('aria-label', '1 minute 30 seconds remaining');
  });

  it('provides correct time description for seconds only', () => {
    render(<TimerDisplay timeRemaining={45} />); // 45 seconds
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveAttribute('aria-label', '45 seconds remaining');
  });

  it('handles plural forms correctly in time description', () => {
    render(<TimerDisplay timeRemaining={7322} />); // 2 hours, 2 minutes, 2 seconds
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveAttribute('aria-label', '2 hours 2 minutes 2 seconds remaining');
  });

  it('applies custom className when provided', () => {
    render(<TimerDisplay timeRemaining={120} className="custom-class" />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<TimerDisplay timeRemaining={120} />);
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveAttribute('aria-live', 'polite');
    expect(timerElement).toHaveAttribute('role', 'timer');
  });
});