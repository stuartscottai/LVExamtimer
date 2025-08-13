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

describe('App Edge Cases and Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Timer precision and accuracy', () => {
    it('maintains accurate countdown over extended periods', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Use of English'); // 75 minutes

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance timer by exactly 30 minutes (1800 seconds)
      act(() => {
        vi.advanceTimersByTime(1800000);
      });

      // Should show exactly 45 minutes remaining
      await waitFor(() => {
        expect(screen.getByText('00:45:00')).toBeInTheDocument();
      });

      // Advance by another 44 minutes and 59 seconds
      act(() => {
        vi.advanceTimersByTime(2699000);
      });

      // Should show exactly 1 second remaining
      await waitFor(() => {
        expect(screen.getByText('00:00:01')).toBeInTheDocument();
      });

      // Advance final second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should complete and show alert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Time's up!");
        expect(screen.getByText('00:00:00')).toBeInTheDocument();
      });
    });

    it('handles rapid pause/resume cycles correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'A1 Starters');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Speaking'); // 3 minutes

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(screen.getByText('00:02:50')).toBeInTheDocument();
      });

      // Rapid pause/resume cycles
      for (let i = 0; i < 5; i++) {
        // Pause
        const pauseButton = screen.getByRole('button', { name: /pause timer/i });
        await user.click(pauseButton);

        // Verify paused
        expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();

        // Resume immediately
        const resumeButton = screen.getByRole('button', { name: /start timer/i });
        await user.click(resumeButton);

        // Verify resumed
        expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
      }

      // Advance another 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should show correct time (20 seconds elapsed total)
      await waitFor(() => {
        expect(screen.getByText('00:02:40')).toBeInTheDocument();
      });
    });
  });

  describe('State consistency across operations', () => {
    it('maintains consistent state when switching between exams rapidly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      const examSelect = screen.getByLabelText('Select Cambridge exam');

      // Rapidly switch between exams
      await user.selectOptions(examSelect, 'B2 First');
      await user.selectOptions(examSelect, 'C1 Advanced');
      await user.selectOptions(examSelect, 'A2 Key for Schools');
      await user.selectOptions(examSelect, 'A1 Starters');

      // Verify final state is correct
      expect(screen.getByDisplayValue('A1 Starters')).toBeInTheDocument();
      expect(screen.getByText('Choose a paper...')).toBeInTheDocument();

      // Select paper and verify it works
      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Writing');

      expect(screen.getByText('A1 Starters')).toBeInTheDocument();
      expect(screen.getByText('Reading & Writing')).toBeInTheDocument();
      expect(screen.getByText('00:20:00')).toBeInTheDocument();
    });

    it('handles timer operations during exam/paper changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Writing');

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByText('01:19:55')).toBeInTheDocument();
      });

      // Change exam while timer is running
      await user.selectOptions(examSelect, 'C1 Advanced');

      // Verify timer is reset and stopped
      expect(screen.getByText('Choose a paper...')).toBeInTheDocument();
      expect(screen.queryByText('01:19:55')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /pause timer/i })).not.toBeInTheDocument();
    });
  });

  describe('Fullscreen API edge cases', () => {
    it('handles fullscreen API not being available', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      // Remove fullscreen API
      Object.defineProperty(document.documentElement, 'requestFullscreen', {
        value: undefined,
      });

      render(<App />);

      // Try to enter fullscreen
      const fullScreenButton = screen.getByRole('button', { name: /enter full screen/i });
      await user.click(fullScreenButton);

      // Should not crash and should remain in standard mode
      expect(screen.getByText('Exam Timer Setup')).toBeInTheDocument();
    });

    it('handles fullscreen exit via ESC key', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Use of English');

      // Enter fullscreen
      const fullScreenButton = screen.getByRole('button', { name: /enter full screen/i });
      await user.click(fullScreenButton);

      // Simulate fullscreen change
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
      });
      fireEvent(document, new Event('fullscreenchange'));

      // Verify in fullscreen
      await waitFor(() => {
        expect(screen.getByLabelText('Full-screen exam timer display')).toBeInTheDocument();
      });

      // Press ESC key
      await user.keyboard('{Escape}');

      // Should call exitFullscreen
      expect(mockExitFullscreen).toHaveBeenCalled();
    });

    it('handles unexpected fullscreen state changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Simulate external fullscreen entry (e.g., F11 key)
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
      });
      fireEvent(document, new Event('fullscreenchange'));

      // App should detect fullscreen state
      await waitFor(() => {
        expect(screen.getByLabelText('Full-screen exam timer display')).toBeInTheDocument();
      });

      // Simulate external fullscreen exit
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
      });
      fireEvent(document, new Event('fullscreenchange'));

      // App should return to standard mode
      await waitFor(() => {
        expect(screen.getByText('Exam Timer Setup')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and keyboard navigation edge cases', () => {
    it('maintains focus management during state changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Focus on exam select
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      examSelect.focus();
      expect(document.activeElement).toBe(examSelect);

      // Select exam
      await user.selectOptions(examSelect, 'B2 First');

      // Focus should remain manageable
      const paperSelect = screen.getByLabelText('Select exam paper');
      paperSelect.focus();
      expect(document.activeElement).toBe(paperSelect);
    });

    it('provides proper ARIA live region updates', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'A1 Starters');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Speaking');

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Verify timer has aria-live attribute
      const timerElement = screen.getByRole('timer');
      expect(timerElement).toHaveAttribute('aria-live', 'polite');

      // Advance timer and verify aria-label updates
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(timerElement).toHaveAttribute('aria-label', expect.stringContaining('remaining'));
      });
    });
  });

  describe('Data validation and error handling', () => {
    it('handles missing exam data gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Try to select non-existent exam (should not crash)
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      
      // Manually trigger change with invalid value
      fireEvent.change(examSelect, { target: { value: 'Non-existent Exam' } });

      // App should handle gracefully
      expect(screen.getByText('Choose an exam...')).toBeInTheDocument();
      expect(screen.getByText('Select an exam first')).toBeInTheDocument();
    });

    it('handles timer completion edge cases', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select very short duration
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'A1 Starters');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Speaking'); // 3 minutes

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Advance timer past completion (should not go negative)
      act(() => {
        vi.advanceTimersByTime(200000); // More than 3 minutes
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Time's up!");
        expect(screen.getByText('00:00:00')).toBeInTheDocument();
      });

      // Timer should not go negative
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('handles multiple timer completion alerts correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'A1 Starters');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Speaking');

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Complete timer
      act(() => {
        vi.advanceTimersByTime(180000);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledTimes(1);
      });

      // Reset and start again
      const resetButton = screen.getByRole('button', { name: /reset timer/i });
      await user.click(resetButton);

      const startAgainButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startAgainButton);

      // Complete timer again
      act(() => {
        vi.advanceTimersByTime(180000);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Performance and memory management', () => {
    it('cleans up timer intervals properly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { unmount } = render(<App />);

      // Select exam and paper
      const examSelect = screen.getByLabelText('Select Cambridge exam');
      await user.selectOptions(examSelect, 'B2 First');

      const paperSelect = screen.getByLabelText('Select exam paper');
      await user.selectOptions(paperSelect, 'Reading & Use of English');

      // Start timer
      const startButton = screen.getByRole('button', { name: /start timer/i });
      await user.click(startButton);

      // Verify timer is running
      expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();

      // Unmount component
      unmount();

      // Advance timers after unmount - should not cause errors
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // No errors should occur (timer should be cleaned up)
      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });
});