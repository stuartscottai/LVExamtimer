import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimerControls from '../TimerControls';

describe('TimerControls', () => {
  const mockOnStart = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders start and reset buttons when timer is not running', () => {
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
      />
    );

    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset timer/i })).toBeInTheDocument();
    expect(screen.getByText('START')).toBeInTheDocument();
    expect(screen.getByText('RESET')).toBeInTheDocument();
  });

  it('renders pause and reset buttons when timer is running', () => {
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={true}
      />
    );

    expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset timer/i })).toBeInTheDocument();
    expect(screen.getByText('PAUSE')).toBeInTheDocument();
    expect(screen.getByText('RESET')).toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
      />
    );

    const startButton = screen.getByRole('button', { name: /start timer/i });
    await user.click(startButton);

    expect(mockOnStart).toHaveBeenCalledTimes(1);
    expect(mockOnPause).not.toHaveBeenCalled();
  });

  it('calls onPause when pause button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={true}
      />
    );

    const pauseButton = screen.getByRole('button', { name: /pause timer/i });
    await user.click(pauseButton);

    expect(mockOnPause).toHaveBeenCalledTimes(1);
    expect(mockOnStart).not.toHaveBeenCalled();
  });

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset timer/i });
    await user.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling for start button (not running)', () => {
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
      />
    );

    const startButton = screen.getByRole('button', { name: /start timer/i });
    expect(startButton).toHaveClass('bg-emerald-500');
    expect(startButton).toHaveClass('hover:bg-emerald-600');
  });

  it('applies correct styling for pause button (running)', () => {
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={true}
      />
    );

    const pauseButton = screen.getByRole('button', { name: /pause timer/i });
    expect(pauseButton).toHaveClass('bg-red-500');
    expect(pauseButton).toHaveClass('hover:bg-red-600');
  });

  it('disables buttons when isDisabled is true', () => {
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
        isDisabled={true}
      />
    );

    const startButton = screen.getByRole('button', { name: /start timer/i });
    const resetButton = screen.getByRole('button', { name: /reset timer/i });

    expect(startButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it('does not call handlers when buttons are disabled', async () => {
    const user = userEvent.setup();
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
        isDisabled={true}
      />
    );

    const startButton = screen.getByRole('button', { name: /start timer/i });
    const resetButton = screen.getByRole('button', { name: /reset timer/i });

    await user.click(startButton);
    await user.click(resetButton);

    expect(mockOnStart).not.toHaveBeenCalled();
    expect(mockOnReset).not.toHaveBeenCalled();
  });

  it('renders icon-only buttons in full-screen mode', () => {
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
        isFullScreen={true}
      />
    );

    // Should not have text labels in full-screen mode
    expect(screen.queryByText('START')).not.toBeInTheDocument();
    expect(screen.queryByText('RESET')).not.toBeInTheDocument();

    // But should still have accessible labels
    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset timer/i })).toBeInTheDocument();
  });

  it('applies large button styling in full-screen mode', () => {
    render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
        isFullScreen={true}
      />
    );

    const startButton = screen.getByRole('button', { name: /start timer/i });
    const resetButton = screen.getByRole('button', { name: /reset timer/i });

    expect(startButton).toHaveClass('w-20');
    expect(startButton).toHaveClass('h-20');
    expect(resetButton).toHaveClass('w-20');
    expect(resetButton).toHaveClass('h-20');
  });

  it('uses column layout in full-screen mode', () => {
    const { container } = render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
        isFullScreen={true}
      />
    );

    const controlsContainer = container.firstChild;
    expect(controlsContainer).toHaveClass('flex-col');
    expect(controlsContainer).toHaveClass('space-y-4');
  });

  it('uses row layout in standard mode', () => {
    const { container } = render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
        isFullScreen={false}
      />
    );

    const controlsContainer = container.firstChild;
    expect(controlsContainer).toHaveClass('space-x-4');
    expect(controlsContainer).not.toHaveClass('flex-col');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <TimerControls
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
        isRunning={false}
        className="custom-controls"
      />
    );

    expect(container.firstChild).toHaveClass('custom-controls');
  });
});