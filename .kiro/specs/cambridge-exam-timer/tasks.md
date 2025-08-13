# Implementation Plan

- [x] 1. Set up project structure and core types





  - Create TypeScript interfaces for Exam, Paper, TimerState, and AppState
  - Define exam data constants with Cambridge exam papers and durations
  - Create utility functions for time formatting and calculations
  - _Requirements: 1.1, 1.5, 3.2, 3.3_

- [x] 2. Create base HTML structure and React setup





  - Create index.html with importmap for React dependencies
  - Set up basic React app structure with TypeScript
  - Configure Tailwind CSS integration
  - _Requirements: 7.1, 7.3_

- [x] 3. Implement core UI components





  - [x] 3.1 Create Header component with logo and title


    - Build Header.tsx with Cambridge Exam Timer branding
    - Apply primary blue styling and professional typography
    - _Requirements: 7.1, 7.3_

  - [x] 3.2 Create reusable Dropdown component


    - Build Dropdown.tsx with proper TypeScript props
    - Implement disabled state handling and styling
    - Add focus and hover states for accessibility
    - _Requirements: 1.1, 1.2, 1.3, 7.4_

  - [x] 3.3 Create SVG icon components


    - Build PlayIcon, PauseIcon, ResetIcon, FullScreenIcon components
    - Use modern line-art style with consistent sizing
    - _Requirements: 7.5_

- [x] 4. Implement exam selection functionality





  - [x] 4.1 Create exam dropdown with dynamic paper loading


    - Implement exam selection dropdown using Dropdown component
    - Add logic to populate paper dropdown when exam is selected
    - Reset paper selection when exam changes
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Create paper selection with timer initialization


    - Implement paper selection dropdown with conditional enabling
    - Initialize timer duration based on selected paper
    - Handle special case for listening papers
    - _Requirements: 1.4, 1.5, 5.1, 5.2_

- [x] 5. Build timer display and controls





  - [x] 5.1 Create TimerDisplay component


    - Build timer display with HH:MM:SS formatting
    - Implement monospaced font and large sizing
    - Add red color and pulsing animation for urgency (≤60 seconds)
    - _Requirements: 6.1, 6.2, 6.3, 4.3_

  - [x] 5.2 Create TimerControls component


    - Build START/PAUSE and RESET buttons with proper icons
    - Implement dynamic button states and labels
    - Handle disabled states for listening papers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.3_

- [x] 6. Implement timer logic and state management





  - [x] 6.1 Create timer countdown functionality


    - Implement setInterval-based countdown with 1-second updates
    - Add start time recording and finish time calculation
    - Handle timer completion with browser alert
    - _Requirements: 2.1, 2.2, 2.6, 3.4, 3.5_

  - [x] 6.2 Add pause and resume functionality

    - Implement timer pause that maintains current state
    - Add resume functionality that continues from paused time
    - Update button states dynamically during pause/resume
    - _Requirements: 2.3, 2.4_

  - [x] 6.3 Create reset functionality

    - Implement timer reset to full initial duration
    - Clear recorded start and finish times on reset
    - Reset visual urgency states
    - _Requirements: 2.5, 6.3_

- [x] 7. Build exam information display





  - Create ExamInfoDisplay component showing centre number, exam, paper, duration
  - Display START and FINISH times with HH:MM formatting
  - Keep time fields blank until timer starts
  - Handle responsive typography for different view modes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 8. Implement full-screen proctoring mode




  - [x] 8.1 Create FullScreenButton component


    - Build full-screen toggle button with appropriate icons
    - Implement Fullscreen API integration
    - Handle browser compatibility and fallbacks
    - _Requirements: 4.1_

  - [x] 8.2 Create full-screen layout


    - Implement two-panel side-by-side layout for full-screen mode
    - Create left panel with large typography for exam information
    - Create right panel with massive timer display and controls
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 8.3 Add full-screen state handling


    - Handle entry to full-screen without exam selection
    - Display instructional message when no exam is selected
    - Maintain timer state across mode transitions
    - _Requirements: 4.5_

- [x] 9. Add visual polish and accessibility





  - [x] 9.1 Implement urgency indicators


    - Add red color change for timer when ≤60 seconds
    - Create subtle pulsing animation for low time warning
    - Ensure animation is smooth and not distracting
    - _Requirements: 6.1, 6.2_

  - [x] 9.2 Add interactive states and feedback


    - Implement hover, focus, and disabled states for all buttons
    - Add proper ARIA labels and accessibility attributes
    - Ensure keyboard navigation works throughout the app
    - _Requirements: 7.2, 7.4_

- [x] 10. Create comprehensive test suite








  - [x] 10.1 Write unit tests for components




    - Test TimerDisplay formatting and urgency states
    - Test TimerControls button interactions and state changes
    - Test Dropdown component selection and disabled states
    - _Requirements: All requirements validation_

  - [x] 10.2 Write integration tests for user flows


    - Test complete exam selection and timer execution workflow
    - Test full-screen mode transitions and state persistence
    - Test listening paper special handling
    - _Requirements: All requirements validation_
-

- [x] 11. Final integration and polish







  - Integrate all components into main App.tsx
  - Test complete application workflow from exam selection to timer completion
  - Verify all visual states and transitions work correctly
  - Ensure responsive design works across different screen sizes
  - _Requirements: All requirements integration_