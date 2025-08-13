import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatTimeHHMM,
  minutesToSeconds,
  calculateFinishTime,
  formatDuration
} from '../utils';

describe('utils', () => {
  describe('formatTime', () => {
    it('formats seconds correctly with leading zeros', () => {
      expect(formatTime(0)).toBe('00:00:00');
      expect(formatTime(5)).toBe('00:00:05');
      expect(formatTime(65)).toBe('00:01:05');
      expect(formatTime(3661)).toBe('01:01:01');
    });

    it('handles large time values', () => {
      expect(formatTime(36000)).toBe('10:00:00'); // 10 hours
      expect(formatTime(90061)).toBe('25:01:01'); // 25 hours, 1 minute, 1 second
    });

    it('handles edge cases', () => {
      expect(formatTime(59)).toBe('00:00:59');
      expect(formatTime(60)).toBe('00:01:00');
      expect(formatTime(3599)).toBe('00:59:59');
      expect(formatTime(3600)).toBe('01:00:00');
    });
  });

  describe('formatTimeHHMM', () => {
    it('formats Date objects to HH:MM format', () => {
      const date1 = new Date('2024-01-15T09:00:00');
      const date2 = new Date('2024-01-15T14:30:00');
      const date3 = new Date('2024-01-15T00:05:00');

      expect(formatTimeHHMM(date1)).toBe('09:00');
      expect(formatTimeHHMM(date2)).toBe('14:30');
      expect(formatTimeHHMM(date3)).toBe('00:05');
    });

    it('handles edge times correctly', () => {
      const midnight = new Date('2024-01-15T00:00:00');
      const noon = new Date('2024-01-15T12:00:00');
      const almostMidnight = new Date('2024-01-15T23:59:00');

      expect(formatTimeHHMM(midnight)).toBe('00:00');
      expect(formatTimeHHMM(noon)).toBe('12:00');
      expect(formatTimeHHMM(almostMidnight)).toBe('23:59');
    });
  });

  describe('minutesToSeconds', () => {
    it('converts minutes to seconds correctly', () => {
      expect(minutesToSeconds(0)).toBe(0);
      expect(minutesToSeconds(1)).toBe(60);
      expect(minutesToSeconds(5)).toBe(300);
      expect(minutesToSeconds(60)).toBe(3600);
      expect(minutesToSeconds(90)).toBe(5400);
    });

    it('handles decimal minutes', () => {
      expect(minutesToSeconds(1.5)).toBe(90);
      expect(minutesToSeconds(2.25)).toBe(135);
    });
  });

  describe('calculateFinishTime', () => {
    it('calculates finish time correctly', () => {
      const startTime = new Date('2024-01-15T09:00:00');
      const finishTime = calculateFinishTime(startTime, 75);

      expect(finishTime.getHours()).toBe(10);
      expect(finishTime.getMinutes()).toBe(15);
      expect(finishTime.getSeconds()).toBe(0);
    });

    it('handles duration that crosses hour boundaries', () => {
      const startTime = new Date('2024-01-15T09:45:00');
      const finishTime = calculateFinishTime(startTime, 30);

      expect(finishTime.getHours()).toBe(10);
      expect(finishTime.getMinutes()).toBe(15);
    });

    it('handles duration that crosses day boundaries', () => {
      const startTime = new Date('2024-01-15T23:30:00');
      const finishTime = calculateFinishTime(startTime, 60);

      expect(finishTime.getDate()).toBe(16);
      expect(finishTime.getHours()).toBe(0);
      expect(finishTime.getMinutes()).toBe(30);
    });

    it('does not modify the original start time', () => {
      const startTime = new Date('2024-01-15T09:00:00');
      const originalTime = new Date(startTime);
      
      calculateFinishTime(startTime, 75);
      
      expect(startTime.getTime()).toBe(originalTime.getTime());
    });
  });

  describe('formatDuration', () => {
    it('formats minutes-only durations correctly', () => {
      expect(formatDuration(1)).toBe('1 minutes');
      expect(formatDuration(30)).toBe('30 minutes');
      expect(formatDuration(45)).toBe('45 minutes');
      expect(formatDuration(59)).toBe('59 minutes');
    });

    it('formats hour-only durations correctly', () => {
      expect(formatDuration(60)).toBe('1 hour');
      expect(formatDuration(120)).toBe('2 hours');
      expect(formatDuration(180)).toBe('3 hours');
    });

    it('formats mixed hour and minute durations correctly', () => {
      expect(formatDuration(75)).toBe('1 hour 15 minutes');
      expect(formatDuration(90)).toBe('1 hour 30 minutes');
      expect(formatDuration(135)).toBe('2 hours 15 minutes');
      expect(formatDuration(150)).toBe('2 hours 30 minutes');
    });

    it('handles singular vs plural forms correctly', () => {
      expect(formatDuration(1)).toBe('1 minutes'); // Edge case: 1 minute still uses "minutes"
      expect(formatDuration(60)).toBe('1 hour');
      expect(formatDuration(61)).toBe('1 hour 1 minutes');
      expect(formatDuration(120)).toBe('2 hours');
      expect(formatDuration(121)).toBe('2 hours 1 minutes');
    });

    it('handles edge cases', () => {
      expect(formatDuration(0)).toBe('0 minutes');
      expect(formatDuration(1440)).toBe('24 hours'); // Full day
    });
  });
});