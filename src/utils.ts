// Utility functions for time formatting and calculations

/**
 * Formats seconds into HH:MM:SS format with leading zeros
 * @param seconds - Total seconds to format
 * @returns Formatted time string (e.g., "01:23:45")
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Formats a Date object to HH:MM format
 * @param date - Date object to format
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTimeHHMM(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts minutes to seconds
 * @param minutes - Number of minutes
 * @returns Number of seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Calculates finish time based on start time and duration
 * @param startTime - Start time as Date object
 * @param durationMinutes - Duration in minutes
 * @returns Finish time as Date object
 */
export function calculateFinishTime(startTime: Date, durationMinutes: number): Date {
  const finishTime = new Date(startTime);
  finishTime.setMinutes(finishTime.getMinutes() + durationMinutes);
  return finishTime;
}

/**
 * Formats duration in minutes to descriptive string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "1 hour 30 minutes" or "45 minutes")
 */
export function formatDuration(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSecondsAfterHours = totalSeconds % 3600;
  const wholeMinutes = Math.floor(remainingSecondsAfterHours / 60);
  const seconds = remainingSecondsAfterHours % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }

  if (wholeMinutes > 0) {
    parts.push(`${wholeMinutes} minute${wholeMinutes > 1 ? 's' : ''}`);
  }

  if (seconds > 0) {
    parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(' ') : '0 minutes';
}
