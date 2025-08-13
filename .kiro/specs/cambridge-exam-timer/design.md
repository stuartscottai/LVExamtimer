# Design Document

## Overview

The Cambridge Exam Timer & Proctoring Display is a React TypeScript web application that provides a dual-interface timing solution for Cambridge English examinations. The application features a standard configuration interface and a full-screen proctoring display, built with modern web technologies for reliability and accessibility.

## Architecture

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS for utility-first styling and responsive design
- **Build Approach**: Self-contained single HTML file with ES modules and importmap for React dependencies
- **State Management**: React hooks (useState, useEffect, useMemo, useCallback, useRef) for local state management

### Application Structure
```
src/
├── App.tsx                 # Root component with main state management
├── components/
│   ├── Header.tsx         # Application header with logo and title
│   ├── Dropdown.tsx       # Reusable dropdown component
│   ├── TimerDisplay.tsx   # Timer display with formatting and urgency states
│   ├── TimerControls.tsx  # Start/Pause/Reset button controls
│   ├── ExamInfoDisplay.tsx # Exam information panel
│   ├── FullScreenButton.tsx # Full-screen toggle button
│   └── icons/             # SVG icon components
│       ├── PlayIcon.tsx
│       ├── PauseIcon.tsx
│       ├── ResetIcon.tsx
│       ├── FullScreenIcon.tsx
│       └── LogoIcon.tsx
├── types.ts               # TypeScript interfaces and types
├── constants.ts           # Exam data and configuration
└── utils.ts              # Helper functions for time formatting
```

## Components and Interfaces

### Core Data Types
```typescript
interface Paper {
  name: string;
  durationMinutes: number;
  isListening?: boolean;
}

interface Exam {
  name: string;
  papers: Paper[];
}

interface TimerState {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  startTime: Date | null;
  finishTime: Date | null;
}

interface AppState {
  selectedExam: Exam | null;
  selectedPaper: Paper | null;
  timerState: TimerState;
  isFullScreen: boolean;
}
```

### Component Specifications

#### App.tsx (Root Component)
- **Responsibilities**: Main state management, timer logic, full-screen mode handling
- **State Management**: 
  - Exam/paper selection state
  - Timer state (remaining time, running status, start/finish times)
  - Full-screen mode toggle
- **Key Methods**:
  - `handleExamSelect()`: Updates selected exam and resets paper selection
  - `handlePaperSelect()`: Sets selected paper and initializes timer
  - `startTimer()`: Records start time, calculates finish time, begins countdown
  - `pauseTimer()`: Pauses countdown while preserving state
  - `resetTimer()`: Resets to initial duration, clears start/finish times
  - `toggleFullScreen()`: Switches between standard and proctoring views

#### TimerDisplay.tsx
- **Responsibilities**: Time formatting, urgency visual states, countdown display
- **Props**: `timeRemaining: number`, `isLowTime: boolean`, `isFullScreen: boolean`
- **Features**:
  - HH:MM:SS formatting with leading zeros
  - Red color and pulsing animation when ≤60 seconds
  - Responsive font sizing for full-screen mode
  - Monospaced/tabular font for consistent digit alignment

#### TimerControls.tsx
- **Responsibilities**: Timer control buttons with dynamic states
- **Props**: `onStart: () => void`, `onPause: () => void`, `onReset: () => void`, `isRunning: boolean`, `isFullScreen: boolean`
- **Features**:
  - Dynamic Start/Pause button with icon changes
  - Large circular buttons for full-screen mode
  - Disabled states for listening papers
  - Accessible button labels and ARIA attributes

#### Dropdown.tsx
- **Responsibilities**: Reusable dropdown component for exam/paper selection
- **Props**: `options: string[]`, `value: string`, `onChange: (value: string) => void`, `disabled: boolean`, `placeholder: string`
- **Features**:
  - Tailwind-styled select element
  - Disabled state styling
  - Consistent focus and hover states

#### ExamInfoDisplay.tsx
- **Responsibilities**: Display exam metadata and timing information
- **Props**: `examInfo: ExamInfo`, `isFullScreen: boolean`
- **Features**:
  - Responsive typography scaling
  - Structured information layout
  - Time formatting for start/finish times

## Data Models

### Exam Data Structure
```typescript
const CAMBRIDGE_EXAMS: Exam[] = [
  {
    name: "A1 Starters",
    papers: [
      { name: "Reading & Writing", durationMinutes: 20 },
      { name: "Listening", durationMinutes: 20, isListening: true },
      { name: "Speaking", durationMinutes: 3 }
    ]
  },
  {
    name: "A2 Key for Schools",
    papers: [
      { name: "Reading & Writing", durationMinutes: 60 },
      { name: "Listening", durationMinutes: 30, isListening: true },
      { name: "Speaking", durationMinutes: 8 }
    ]
  },
  {
    name: "B2 First",
    papers: [
      { name: "Reading & Use of English", durationMinutes: 75 },
      { name: "Writing", durationMinutes: 80 },
      { name: "Listening", durationMinutes: 40, isListening: true },
      { name: "Speaking", durationMinutes: 14 }
    ]
  },
  {
    name: "C1 Advanced",
    papers: [
      { name: "Reading & Use of English", durationMinutes: 90 },
      { name: "Writing", durationMinutes: 90 },
      { name: "Listening", durationMinutes: 40, isListening: true },
      { name: "Speaking", durationMinutes: 15 }
    ]
  }
];
```

### Timer Logic
- **Countdown Mechanism**: `setInterval` with 1-second updates
- **Time Calculation**: Start time + duration = finish time
- **Persistence**: Timer state maintained during pause/resume cycles
- **Completion**: Browser alert when reaching 00:00:00

## Error Handling

### Timer Edge Cases
- **Browser Tab Visibility**: Use `document.visibilityState` to handle tab switching
- **System Clock Changes**: Validate time consistency on each tick
- **Invalid Selections**: Prevent timer start without valid exam/paper selection

### Full-Screen Mode
- **API Availability**: Graceful fallback if Fullscreen API not supported
- **Exit Handling**: Listen for ESC key and fullscreen change events
- **State Synchronization**: Maintain timer state across mode switches

### User Input Validation
- **Dropdown Selection**: Validate selections before enabling timer controls
- **Timer State**: Prevent invalid state transitions (e.g., pause when not running)

## Testing Strategy

### Unit Testing Approach
- **Component Testing**: Test each component in isolation with React Testing Library
- **Timer Logic**: Test countdown functionality, state transitions, and edge cases
- **Utility Functions**: Test time formatting and calculation functions
- **User Interactions**: Test dropdown selections, button clicks, and keyboard navigation

### Integration Testing
- **Full User Flows**: Test complete exam setup and timer execution workflows
- **Mode Switching**: Test transitions between standard and full-screen modes
- **State Persistence**: Verify state consistency across component re-renders

### Accessibility Testing
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Screen Reader**: Test with screen reader software for proper ARIA labels
- **Color Contrast**: Verify all text meets WCAG contrast requirements
- **Focus Management**: Test focus handling in full-screen mode transitions

### Browser Compatibility
- **Modern Browsers**: Test in Chrome, Firefox, Safari, and Edge
- **Fullscreen API**: Test fullscreen functionality across different browsers
- **Timer Accuracy**: Verify countdown precision across different environments

## Visual Design System

### Color Palette
- **Primary Blue**: `#3b82f6` (Tailwind blue-500) for headers, primary buttons
- **Slate Gray**: `#64748b` (Tailwind slate-500) for body text, secondary elements
- **Background**: `#f1f5f9` (Tailwind slate-100) for page background
- **White**: `#ffffff` for content cards and panels
- **Red**: `#ef4444` (Tailwind red-500) for urgency states and pause button
- **Success Green**: `#10b981` (Tailwind emerald-500) for active/running states

### Typography Scale
- **Standard Mode**: Base text 16px, headings 24px-32px
- **Full-Screen Mode**: Timer display 120px+, info text 24px-36px
- **Font Family**: System font stack with fallbacks: `ui-sans-serif, system-ui, sans-serif`

### Layout Specifications
- **Standard View**: Centered card layout with max-width 800px
- **Full-Screen View**: 50/50 split layout with flexbox
- **Responsive Breakpoints**: Mobile-first approach with Tailwind breakpoints
- **Spacing**: Consistent 8px grid system using Tailwind spacing utilities

### Animation and Transitions
- **Urgency Pulse**: Subtle 2-second pulse animation for low time warning
- **Button Hover**: 150ms transition for all interactive elements
- **Mode Transitions**: Smooth 300ms transitions when entering/exiting full-screen
- **Loading States**: Skeleton loading for dropdown population