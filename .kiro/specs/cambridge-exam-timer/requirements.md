# Requirements Document

## Introduction

The Cambridge Exam Timer & Proctoring Display is a web application designed to serve as a digital countdown timer for various Cambridge English examinations. The application provides a reliable timing tool for exam invigilators and candidates with two distinct interfaces: a standard configuration view and a full-screen proctoring display optimized for high visibility on large screens or projectors during exam sessions.

## Requirements

### Requirement 1

**User Story:** As an exam invigilator, I want to select a specific Cambridge exam and paper, so that I can configure the appropriate timer duration for the examination session.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display two dropdown menus for exam and paper selection
2. WHEN no exam is selected THEN the paper selection dropdown SHALL be disabled
3. WHEN an exam is selected from the first dropdown THEN the paper selection dropdown SHALL become active and populate with papers specific to that exam
4. WHEN a different exam is selected THEN the paper selection dropdown SHALL reset to its default "select" state
5. WHEN both exam and paper are selected THEN the system SHALL initialize a countdown timer with the paper's specific duration

### Requirement 2

**User Story:** As an exam invigilator, I want to control the countdown timer with start, pause, and reset functions, so that I can manage the examination timing accurately.

#### Acceptance Criteria

1. WHEN a paper is selected THEN the system SHALL provide START, PAUSE, and RESET control buttons
2. WHEN the START button is clicked for the first time THEN the system SHALL record the current system time as "START Time" and calculate the corresponding "FINISH Time"
3. WHEN the timer is running and the START button is clicked THEN the system SHALL pause the countdown and change the button label to indicate resume functionality
4. WHEN the timer is paused and the START button is clicked THEN the system SHALL resume the countdown
5. WHEN the RESET button is clicked THEN the system SHALL reset the timer to its full initial duration and clear any recorded start and finish times
6. WHEN the countdown reaches 00:00:00 THEN the system SHALL trigger a browser alert with the message "Time's up!"

### Requirement 3

**User Story:** As an exam invigilator, I want to see clear exam information and timing details, so that I can monitor the examination session effectively.

#### Acceptance Criteria

1. WHEN the application is active THEN the system SHALL display Centre Number as a hardcoded value 'ES750'
2. WHEN an exam is selected THEN the system SHALL display the exam name in the information section
3. WHEN a paper is selected THEN the system SHALL display the paper name and duration in descriptive format
4. WHEN the timer is started THEN the system SHALL display the START Time formatted as HH:MM
5. WHEN the timer is started THEN the system SHALL display the calculated FINISH Time formatted as HH:MM
6. WHEN no timer has been started THEN the START Time and FINISH Time fields SHALL remain blank

### Requirement 4

**User Story:** As an exam invigilator, I want a full-screen proctoring mode, so that candidates and staff can clearly see the timer and exam information from a distance.

#### Acceptance Criteria

1. WHEN the full-screen button is clicked THEN the system SHALL display a two-panel side-by-side layout optimized for high visibility
2. WHEN in full-screen mode THEN the left panel SHALL display exam information with extremely large, bold typography
3. WHEN in full-screen mode THEN the right panel SHALL display the countdown timer in HH:MM:SS format using a massive monospaced font
4. WHEN in full-screen mode THEN the timer controls SHALL be displayed as large, circular, icon-only buttons
5. WHEN full-screen mode is entered without exam and paper selection THEN the system SHALL display a message instructing to "Exit full screen to select an exam"

### Requirement 5

**User Story:** As an exam invigilator, I want special handling for listening papers, so that the timer behaves appropriately for different types of examinations.

#### Acceptance Criteria

1. WHEN a paper named "Listening" is selected THEN the system SHALL disable the countdown timer functionality
2. WHEN a listening paper is selected THEN the system SHALL display a clear message "Listening Test (Timer not applicable)"
3. WHEN a listening paper is selected THEN the timer controls SHALL be disabled or hidden

### Requirement 6

**User Story:** As an exam invigilator, I want visual urgency indicators, so that I can quickly identify when examination time is running low.

#### Acceptance Criteria

1. WHEN the countdown timer has 60 seconds or less remaining THEN the timer text color SHALL change to red
2. WHEN the countdown timer has 60 seconds or less remaining THEN the timer SHALL display a subtle, slow pulsing animation
3. WHEN the timer is reset or has more than 60 seconds THEN the timer SHALL return to normal visual state

### Requirement 7

**User Story:** As a user, I want a professional and accessible interface, so that the application is easy to use and meets accessibility standards.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL use a clean, professional color palette with primary blue, slate gray, and white/light gray
2. WHEN any interactive element is focused or hovered THEN the system SHALL provide clear visual feedback
3. WHEN text is displayed THEN the system SHALL use highly readable sans-serif fonts with high contrast ratios
4. WHEN buttons are in different states THEN the system SHALL clearly indicate hover, focus, and disabled states
5. WHEN icons are used THEN the system SHALL use modern, line-art SVG icons for all interface elements