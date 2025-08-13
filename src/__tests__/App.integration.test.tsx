import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the alert function
const mockAlert = vi.fn();
global.alert = mockAlert;

// Mock fullscreen API
const mockRequestFullscreen = vi.fn();
const mockExitFullscreen = vi.fn();

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  writable: true,
  value: mockRequestFullscreen,
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: mockExitFullscreen,
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Complete exam selection and timer execution workflow', () => {
    it('allows user to select exam, paper, and run timer successfully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Initial state - no exam selected
      expect(screen.getByText('Choose an exam...')).toBeInTheDocument();
      expect(screen.getByText('Select an exam first')).toBeInTheDocument();

      // Select an exam
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      // Verify paper dropdown is now enabled
      expect(screen.getByText('Choose a paper...')).toBeInTheDocument();

      // Select a paper
      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Use of English');

      // Verify exam information is displayed
      expect(screen.getByText('ES750')).toBeInTheDocument();
      expect(screen.getByText('B2 First')).toBeInTheDocument();
      expect(screen.getByText('Reading & Use of English')).toBeInTheDocument();
      expect(screen.getByText('1 hour 15 minutes')).toBeInTheDocument();

      // Verify timer is initialized with correct duration
      expect(screen.getByText('01:15:00')).toBeInTheDocument();

      // Verify start and reset buttons are available
      expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset timer/i })).toBeInTheDocument();

      // Start the timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Verify timer starts running
      expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
      expect(screen.getByText('PAUSE')).toBeInTheDocument();

      // Verify start and finish times are displayed
      await waitFor(() => {
        const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
        expect(timeElements.length).toBeGreaterThanOrEqual(2); // START and FINISH times
      });

      // Advance timer by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Verify timer countdown
      await waitFor(() => {
        expect(screen.getByText('01:14:59')).toBeInTheDocument();
      });

      // Pause the timer
      const pauseButton = screen.getByRole('button', { name: /pause timer/i });
      await user.click(pauseButton);

      // Verify timer is paused
      expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
      expect(screen.getByText('START')).toBeInTheDocument();

      // Advance time while paused - timer should not change
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText('01:14:59')).toBeInTheDocument();

      // Resume the timer
      const resumeButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(resumeButton);

      // Verify timer resumes
      expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();

      // Reset the timer
      const resetButton = screen.getByRole('button', { name: /reset timer/i });
      await user.click(resetButton);

      // Verify timer is reset
      expect(screen.getByText('01:15:00')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
      expect(screen.getByText('START')).toBeInTheDocument();
    });

    it('shows alert when timer reaches zero', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'A1 Starters');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Speaking'); // 3 minutes

      // Start the timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance timer to completion (3 minutes = 180 seconds)
      act(() => {
        vi.advanceTimersByTime(180000);
      });

      // Verify alert is shown and timer stops
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Time's up!");
        expect(screen.getByText('00:00:00')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
      });
    });

    it('handles exam change correctly by resetting paper and timer', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select initial exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Writing');

      // Verify initial selection
      expect(screen.getByText('B2 First')).toBeInTheDocument();
      expect(screen.getByText('Writing')).toBeInTheDocument();
      expect(screen.getByText('01:20:00')).toBeInTheDocument(); // 80 minutes

      // Start the timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByText('01:19:55')).toBeInTheDocument();
      });

      // Change exam
      await user.selectOptions(examSelect, 'A2 Key for Schools');

      // Verify paper is reset and timer is reset
      expect(screen.getByText('Choose a paper...')).toBeInTheDocument();
      expect(screen.queryByText('B2 First')).not.toBeInTheDocument();
      expect(screen.queryByText('Writing')).not.toBeInTheDocument();
      expect(screen.queryByText('01:19:55')).not.toBeInTheDocument();
    });
  });

  describe('Full-screen mode transitions and state persistence', () => {
    it('enters and exits full-screen mode correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper first
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Use of English');

      // Click full-screen button
      const fullScreenButton = screen.getByRole('button', { name: /enter full screen/i });
      await user.click(fullScreenButton);

      // Verify fullscreen API is called
      expect(mockRequestFullscreen).toHaveBeenCalled();

      // Simulate fullscreen change event
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
      });

      fireEvent(document, new Event('fullscreenchange'));

      // Verify full-screen layout
      await waitFor(() => {
        expect(screen.getByLabelText('Full-screen exam timer display')).toBeInTheDocument();
        expect(screen.getByLabelText('Exam information panel')).toBeInTheDocument();
        expect(screen.getByLabelText('Timer display and controls')).toBeInTheDocument();
      });

      // Verify exam information is displayed in full-screen
      expect(screen.getByText('ES750')).toBeInTheDocument();
      expect(screen.getByText('B2 First')).toBeInTheDocument();
      expect(screen.getByText('Reading & Use of English')).toBeInTheDocument();

      // Exit full-screen by simulating fullscreen change
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
      });

      fireEvent(document, new Event('fullscreenchange'));

      // Verify return to standard layout
      await waitFor(() => {
        expect(screen.getByText('Exam Timer Setup')).toBeInTheDocument();
        expect(screen.queryByLabelText('Full-screen exam timer display')).not.toBeInTheDocument();
      });
    });

    it('maintains timer state across full-screen transitions', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Use of English');

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(screen.getByText('01:14:50')).toBeInTheDocument();
      });

      // Enter full-screen
      const fullScreenButton = screen.getByRole('button', { name: /enter full screen/i });
      await user.click(fullScreenButton);

      // Simulate fullscreen change
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
      });
      fireEvent(document, new Event('fullscreenchange'));

      // Verify timer state is maintained in full-screen
      await waitFor(() => {
        expect(screen.getByText('01:14:50')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
      });

      // Continue timer in full-screen
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByText('01:14:45')).toBeInTheDocument();
      });

      // Exit full-screen
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
      });
      fireEvent(document, new Event('fullscreenchange'));

      // Verify timer state is maintained after exiting full-screen
      await waitFor(() => {
        expect(screen.getByText('01:14:45')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
      });
    });

    it('shows instruction message when entering full-screen without exam selection', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Click full-screen button without selecting exam
      const fullScreenButton = screen.getByRole('button', { name: /enter full screen/i });
      await user.click(fullScreenButton);

      // Simulate fullscreen change
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
      });
      fireEvent(document, new Event('fullscreenchange'));

      // Verify instruction message is shown
      await waitFor(() => {
        expect(screen.getByText('No Exam Selected')).toBeInTheDocument();
        expect(screen.getByText('Exit full screen to select an exam')).toBeInTheDocument();
        expect(screen.getByText('00:00:00')).toBeInTheDocument();
        expect(screen.getByText('Select an exam to begin')).toBeInTheDocument();
      });
    });
  });

  describe('Listening paper special handling', () => {
    it('disables timer controls for listening papers', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      // Select listening paper
      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Listening');

      // Verify listening paper message is displayed
      expect(screen.getByText('🎧 Listening Test (Timer not applicable)')).toBeInTheDocument();
      expect(screen.getByText('Timer controls are disabled for listening papers')).toBeInTheDocument();

      // Verify timer controls are not present
      expect(screen.queryByRole('button', { name: /start timer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reset timer/i })).not.toBeInTheDocument();
    });

    it('shows listening test message in full-screen mode', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and listening paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Listening');

      // Enter full-screen
      const fullScreenButton = screen.getByRole('button', { name: /enter full screen/i });
      await user.click(fullScreenButton);

      // Simulate fullscreen change
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
      });
      fireEvent(document, new Event('fullscreenchange'));

      // Verify listening test message in full-screen
      await waitFor(() => {
        expect(screen.getByText('🎧 Listening Test')).toBeInTheDocument();
        expect(screen.getByText('Timer not applicable')).toBeInTheDocument();
      });

      // Verify no timer controls in full-screen
      expect(screen.queryByRole('button', { name: /start timer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reset timer/i })).not.toBeInTheDocument();
    });

    it('switches from listening to non-listening paper correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and listening paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Listening');

      // Verify listening mode
      expect(screen.getByText('🎧 Listening Test (Timer not applicable)')).toBeInTheDocument();

      // Switch to non-listening paper
      await user.selectOptions(paperSelect, 'Writing');

      // Verify timer controls are now available
      expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset timer/i })).toBeInTheDocument();
      expect(screen.getByText('01:20:00')).toBeInTheDocument(); // 80 minutes for Writing

      // Verify listening message is gone
      expect(screen.queryByText('🎧 Listening Test (Timer not applicable)')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard navigation and shortcuts', () => {
    it('handles keyboard shortcuts correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Use of English');

      // Test Space key to start timer
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
      });

      // Test Space key to pause timer
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
      });

      // Test R key to reset timer
      await user.keyboard('r');

      await waitFor(() => {
        expect(screen.getByText('01:15:00')).toBeInTheDocument();
      });

      // Test F key for full-screen
      await user.keyboard('f');

      expect(mockRequestFullscreen).toHaveBeenCalled();
    });

    it('ignores keyboard shortcuts when focused on form elements', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Focus on exam select
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.click(examSelect);

      // Try to use Space key while focused on select
      await user.keyboard(' ');

      // Should not trigger timer start (no exam/paper selected anyway)
      expect(screen.queryByRole('button', { name: /pause timer/i })).not.toBeInTheDocument();
    });

    it('does not respond to shortcuts for listening papers', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and listening paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Listening');

      // Try keyboard shortcuts - should not work for listening papers
      await user.keyboard(' ');
      await user.keyboard('r');

      // Verify no timer controls appear
      expect(screen.queryByRole('button', { name: /start timer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reset timer/i })).not.toBeInTheDocument();
    });
  });

  describe('Timer urgency states', () => {
    it('applies urgency styling when timer reaches 60 seconds or less', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper with short duration
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'A1 Starters');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Speaking'); // 3 minutes

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance timer to 61 seconds remaining
      act(() => {
        vi.advanceTimersByTime(119000); // 3 minutes - 61 seconds = 119 seconds
      });

      await waitFor(() => {
        expect(screen.getByText('00:01:01')).toBeInTheDocument();
      });

      // Verify normal styling (no urgency yet)
      const timerElement = screen.getByRole('timer');
      expect(timerElement).toHaveClass('text-slate-700');

      // Advance timer to 60 seconds remaining
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('00:01:00')).toBeInTheDocument();
      });

      // Verify urgency styling is applied
      await waitFor(() => {
        const urgentTimerElement = screen.getByRole('timer');
        expect(urgentTimerElement).toHaveClass('text-red-500');
        expect(urgentTimerElement).toHaveClass('pulse-urgency');
      });
    });
  });
});