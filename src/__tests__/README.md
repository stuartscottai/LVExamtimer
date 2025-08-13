# Cambridge Exam Timer - Test Suite

This directory contains a comprehensive test suite for the Cambridge Exam Timer application, covering both unit tests and integration tests.

## Test Structure

### Unit Tests

#### Component Tests (`src/components/__tests__/`)

- **`TimerDisplay.test.tsx`** - Tests for the timer display component
  - Time formatting (HH:MM:SS with leading zeros)
  - Urgency states (red color and pulsing animation when ≤60 seconds)
  - Full-screen vs standard mode styling
  - Accessibility attributes and ARIA labels
  - Custom className handling

- **`TimerControls.test.tsx`** - Tests for timer control buttons
  - Start/Pause button state changes and interactions
  - Reset button functionality
  - Disabled states for listening papers
  - Full-screen mode (icon-only buttons vs text+icon)
  - Button styling and layout (row vs column)
  - Event handler calls and state management

- **`Dropdown.test.tsx`** - Tests for the reusable dropdown component
  - Option rendering and selection
  - Disabled state handling
  - onChange event handling
  - Accessibility attributes (id, aria-label)
  - Custom styling and className support
  - Edge cases (empty options, special characters)

- **`ExamInfoDisplay.test.tsx`** - Tests for exam information display
  - Exam and paper information rendering
  - Time display formatting (START/FINISH times)
  - Full-screen mode styling differences
  - Null state handling (no exam/paper selected)
  - Time field states (blank vs populated)

#### Utility Tests (`src/__tests__/`)

- **`utils.test.ts`** - Tests for utility functions
  - `formatTime()` - HH:MM:SS formatting with edge cases
  - `formatTimeHHMM()` - Date to HH:MM formatting
  - `minutesToSeconds()` - Time conversion
  - `calculateFinishTime()` - Finish time calculation
  - `formatDuration()` - Human-readable duration formatting

### Integration Tests

#### Application Flow Tests (`src/__tests__/`)

- **`App.integration.test.tsx`** - Main user flow integration tests
  - **Complete exam selection workflow**: Exam selection → Paper selection → Timer initialization → Timer controls
  - **Timer execution flow**: Start → Pause → Resume → Reset → Completion with alert
  - **Full-screen mode transitions**: Enter/exit full-screen with state persistence
  - **Listening paper handling**: Special behavior for listening papers (disabled controls)
  - **Keyboard shortcuts**: Space (start/pause), R (reset), F (full-screen), Esc (exit full-screen)
  - **Timer urgency states**: Visual changes when timer reaches ≤60 seconds

- **`App.edge-cases.test.tsx`** - Edge cases and error scenarios
  - **Timer precision**: Accuracy over extended periods, rapid pause/resume cycles
  - **State consistency**: Rapid exam switching, timer operations during changes
  - **Fullscreen API edge cases**: API unavailable, external fullscreen changes, ESC key handling
  - **Accessibility**: Focus management, ARIA live regions
  - **Data validation**: Invalid selections, timer completion edge cases
  - **Performance**: Memory cleanup, interval management

## Test Configuration

### Setup Files

- **`src/test/setup.ts`** - Vitest test setup with React Testing Library and jest-dom matchers
- **`vitest.config.ts`** - Vitest configuration with jsdom environment

### Dependencies

The test suite uses:
- **Vitest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Additional DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for testing

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest src/components/__tests__/TimerDisplay.test.tsx

# Run tests with coverage
npx vitest --coverage
```

## Test Coverage

The test suite covers:

### Requirements Validation
- **Requirement 1**: Exam and paper selection functionality
- **Requirement 2**: Timer controls (start, pause, reset, completion alert)
- **Requirement 3**: Exam information display with timing details
- **Requirement 4**: Full-screen proctoring mode
- **Requirement 5**: Listening paper special handling
- **Requirement 6**: Visual urgency indicators
- **Requirement 7**: Professional and accessible interface

### Component Coverage
- All major components have comprehensive unit tests
- Integration tests cover component interactions
- Edge cases and error scenarios are tested
- Accessibility features are validated

### User Flow Coverage
- Complete exam setup and timer execution workflows
- Full-screen mode transitions and state persistence
- Keyboard navigation and shortcuts
- Special handling for different paper types
- Timer accuracy and state management

## Test Patterns

### Mocking
- `global.alert` - Mocked to test timer completion alerts
- Fullscreen API - Mocked to test full-screen functionality
- Timers - Using `vi.useFakeTimers()` for controlled time advancement

### User Interactions
- Using `@testing-library/user-event` for realistic user interactions
- Testing both mouse and keyboard interactions
- Verifying focus management and accessibility

### State Testing
- Testing component state changes
- Verifying state persistence across mode transitions
- Testing state consistency during rapid operations

### Accessibility Testing
- ARIA attributes and labels
- Keyboard navigation
- Screen reader compatibility
- Focus management

This comprehensive test suite ensures the Cambridge Exam Timer application meets all requirements and handles edge cases gracefully while maintaining accessibility and performance standards.