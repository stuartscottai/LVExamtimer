// Core TypeScript interfaces for the Cambridge Exam Timer application

export interface Paper {
  name: string;
  durationMinutes: number;
  isListening?: boolean;
}

export interface Exam {
  name: string;
  papers: Paper[];
}

export interface TimerState {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  startTime: Date | null;
  finishTime: Date | null;
}

export interface AppState {
  selectedExam: Exam | null;
  selectedPaper: Paper | null;
  timerState: TimerState;
  isFullScreen: boolean;
}

export interface ExamInfo {
  centreNumber: string;
  examName: string;
  paperName: string;
  duration: string;
  startTime: string;
  finishTime: string;
}