import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Header, Dropdown, TimerDisplay, TimerControls, ExamInfoDisplay, FullScreenButton } from './components';
import { CAMBRIDGE_EXAMS } from './constants';
import { Exam, Paper, TimerState } from './types';
import './index.css';

// Main App Component
const App: React.FC = () => {
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
    const [timerState, setTimerState] = useState<TimerState>({
        timeRemaining: 0,
        isRunning: false,
        startTime: null,
        finishTime: null
    });
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Timer interval reference
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Keyboard navigation support
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle keyboard shortcuts when not in an input field
            if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement) {
                return;
            }

            // Space bar to start/pause timer (if paper is selected and not listening)
            if (event.code === 'Space' && selectedPaper && !selectedPaper.isListening) {
                event.preventDefault();
                handleStartTimer();
            }

            // 'R' key to reset timer (if paper is selected and not listening)
            if (event.code === 'KeyR' && selectedPaper && !selectedPaper.isListening) {
                event.preventDefault();
                handleResetTimer();
            }

            // 'F' key to toggle full screen
            if (event.code === 'KeyF') {
                event.preventDefault();
                if (isFullScreen) {
                    // Exit fullscreen with fallback
                    const exitFullscreen = async () => {
                        try {
                            if (document.exitFullscreen) {
                                await document.exitFullscreen();
                            } else if ((document as any).webkitExitFullscreen) {
                                await (document as any).webkitExitFullscreen();
                            } else if ((document as any).mozCancelFullScreen) {
                                await (document as any).mozCancelFullScreen();
                            } else if ((document as any).msExitFullscreen) {
                                await (document as any).msExitFullscreen();
                            } else {
                                setIsFullScreen(false);
                            }
                        } catch (error) {
                            setIsFullScreen(false);
                        }
                    };
                    exitFullscreen();
                } else {
                    // Enter fullscreen
                    const element = document.documentElement;
                    const enterFullscreen = async () => {
                        try {
                            if (element.requestFullscreen) {
                                await element.requestFullscreen();
                            } else if ((element as any).webkitRequestFullscreen) {
                                await (element as any).webkitRequestFullscreen();
                            } else if ((element as any).mozRequestFullScreen) {
                                await (element as any).mozRequestFullScreen();
                            } else if ((element as any).msRequestFullscreen) {
                                await (element as any).msRequestFullscreen();
                            }
                        } catch (error) {
                            console.error('Error entering fullscreen:', error);
                        }
                    };
                    enterFullscreen();
                }
            }

            // Escape key to exit full screen
            if (event.code === 'Escape' && isFullScreen) {
                const exitFullscreen = async () => {
                    try {
                        if (document.exitFullscreen) {
                            await document.exitFullscreen();
                        } else if ((document as any).webkitExitFullscreen) {
                            await (document as any).webkitExitFullscreen();
                        } else if ((document as any).mozCancelFullScreen) {
                            await (document as any).mozCancelFullScreen();
                        } else if ((document as any).msExitFullscreen) {
                            await (document as any).msExitFullscreen();
                        } else {
                            setIsFullScreen(false);
                        }
                    } catch (error) {
                        setIsFullScreen(false);
                    }
                };
                exitFullscreen();
            }


        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedPaper, isFullScreen, timerState.isRunning]);

    // Timer countdown effect
    useEffect(() => {
        if (timerState.isRunning && timerState.timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimerState(prevState => {
                    const newTimeRemaining = prevState.timeRemaining - 1;
                    
                    // Check if timer has completed
                    if (newTimeRemaining <= 0) {
                        // Clear the interval
                        if (timerIntervalRef.current) {
                            clearInterval(timerIntervalRef.current);
                            timerIntervalRef.current = null;
                        }
                        
                        // Show completion alert
                        alert("Time's up!");
                        
                        return {
                            ...prevState,
                            timeRemaining: 0,
                            isRunning: false
                        };
                    }
                    
                    return {
                        ...prevState,
                        timeRemaining: newTimeRemaining
                    };
                });
            }, 1000);
        } else {
            // Clear interval if timer is not running
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }

        // Cleanup function
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [timerState.isRunning, timerState.timeRemaining]);

    // Get exam names for dropdown
    const examOptions = useMemo(() => 
        CAMBRIDGE_EXAMS.map(exam => exam.name), 
        []
    );

    // Get paper names for selected exam
    const paperOptions = useMemo(() => 
        selectedExam ? selectedExam.papers.map(paper => paper.name) : [],
        [selectedExam]
    );

    // Handle exam selection
    const handleExamSelect = (examName: string) => {
        const exam = CAMBRIDGE_EXAMS.find(e => e.name === examName) || null;
        setSelectedExam(exam);
        // Reset paper selection when exam changes
        setSelectedPaper(null);
        // Reset timer state when exam changes
        setTimerState({
            timeRemaining: 0,
            isRunning: false,
            startTime: null,
            finishTime: null
        });
    };

    // Handle paper selection
    const handlePaperSelect = (paperName: string) => {
        if (!selectedExam) return;
        const paper = selectedExam.papers.find(p => p.name === paperName) || null;
        setSelectedPaper(paper);
        
        // Initialize timer duration based on selected paper
        if (paper) {
            const durationInSeconds = paper.durationMinutes * 60;
            setTimerState({
                timeRemaining: durationInSeconds,
                isRunning: false,
                startTime: null,
                finishTime: null
            });
        }
    };

    // Start timer function
    const handleStartTimer = () => {
        if (!selectedPaper || selectedPaper.isListening) return;
        
        setTimerState(prevState => {
            // If timer is already running, this is a pause action
            if (prevState.isRunning) {
                return {
                    ...prevState,
                    isRunning: false
                };
            }
            
            // If starting for the first time (no start time recorded)
            if (!prevState.startTime) {
                const startTime = new Date();
                const finishTime = new Date(startTime.getTime() + (selectedPaper.durationMinutes * 60 * 1000));
                
                return {
                    ...prevState,
                    isRunning: true,
                    startTime,
                    finishTime
                };
            }
            
            // Resume from pause
            return {
                ...prevState,
                isRunning: true
            };
        });
    };

    // Reset timer function
    const handleResetTimer = () => {
        if (!selectedPaper || selectedPaper.isListening) return;
        
        const durationInSeconds = selectedPaper.durationMinutes * 60;
        setTimerState({
            timeRemaining: durationInSeconds,
            isRunning: false,
            startTime: null,
            finishTime: null
        });
    };

    // Handle full-screen toggle
    const handleToggleFullScreen = (fullScreenState: boolean) => {
        setIsFullScreen(fullScreenState);
    };

    // Render full-screen proctoring mode
    if (isFullScreen) {
        return (
            <div 
                className="h-screen h-[100dvh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col md:flex-row relative overflow-y-auto md:overflow-hidden"
                role="application"
                aria-label="Full-screen exam timer display"
            >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
                </div>
                {/* Exit Full Screen Button */}
                <button
                    onClick={() => {
                        // Try multiple methods to exit fullscreen
                        const exitFullscreen = async () => {
                            try {
                                if (document.exitFullscreen) {
                                    await document.exitFullscreen();
                                } else if ((document as any).webkitExitFullscreen) {
                                    await (document as any).webkitExitFullscreen();
                                } else if ((document as any).mozCancelFullScreen) {
                                    await (document as any).mozCancelFullScreen();
                                } else if ((document as any).msExitFullscreen) {
                                    await (document as any).msExitFullscreen();
                                } else {
                                    // Fallback: manually set the state
                                    setIsFullScreen(false);
                                }
                            } catch (error) {
                                console.error('Error exiting fullscreen:', error);
                                // Fallback: manually set the state
                                setIsFullScreen(false);
                            }
                        };
                        exitFullscreen();
                    }}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 z-20 bg-red-500/90 hover:bg-red-500 backdrop-blur-sm text-white w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full font-bold text-lg sm:text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg hover:shadow-xl flex items-center justify-center"
                    aria-label="Exit full-screen mode"
                >
                    {'\u2715'}
                </button>


                {/* Left Panel - Exam Information */}
                <section 
                    className="w-full md:w-1/2 bg-gradient-to-br from-white via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col justify-center relative overflow-y-auto min-h-[14rem] md:min-h-0"
                    aria-label="Exam information panel"
                >
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                        <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-400/20 rounded-full blur-lg"></div>
                    </div>
                    

                    {selectedExam && selectedPaper ? (
                        <ExamInfoDisplay
                            selectedExam={selectedExam}
                            selectedPaper={selectedPaper}
                            timerState={timerState}
                            isFullScreen={true}
                        />
                    ) : (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-600 mb-4">
                                No Exam Selected
                            </div>
                            <div className="text-xl text-slate-500">
                                Exit full screen to select an exam
                            </div>
                        </div>
                    )}
                </section>

                {/* Right Panel - Timer Display and Controls */}
                <section 
                    className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center relative min-h-0"
                    aria-label="Timer display and controls"
                >
                    {selectedExam && selectedPaper ? (
                        selectedPaper.isListening ? (
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 mb-6">
                                    {'\u{1F3A7} Listening Test'}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full min-h-0 flex flex-col items-center justify-center gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
                                {/* Circular Timer Display - uses most available space */}
                                <div className="min-h-0 flex-1 w-full flex items-center justify-center">
                                    <TimerDisplay 
                                        timeRemaining={timerState.timeRemaining}
                                        totalTime={selectedPaper ? selectedPaper.durationMinutes * 60 : 0}
                                        isFullScreen={true}
                                        className="max-h-full"
                                    />
                                </div>

                                {/* Timer Controls - positioned below circle */}
                                <div className="flex-shrink-0 pb-1">
                                    <TimerControls
                                        onStart={handleStartTimer}
                                        onPause={handleStartTimer}
                                        onReset={handleResetTimer}
                                        isRunning={timerState.isRunning}
                                        isDisabled={false}
                                        isFullScreen={true}
                                    />
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold text-slate-400 mb-6">
                                00:00:00
                            </div>
                            <div className="text-lg sm:text-xl lg:text-2xl text-slate-500">
                                Select an exam to begin
                            </div>
                        </div>
                    )}
                </section>
            </div>
        );
    }

    // Render standard configuration mode
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Skip link for keyboard navigation */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            
            <Header />
            
            {/* Main Content */}
            <main id="main-content" className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-semibold text-slate-gray mb-4">
                            Exam Timer Setup
                        </h2>
                        
                        {/* Full Screen Button */}
                        <div className="mb-6">
                            <FullScreenButton onToggleFullScreen={handleToggleFullScreen} />
                        </div>


                    </div>

                    {/* Exam Selection */}
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label htmlFor="exam-select" className="block text-sm font-medium text-slate-700 mb-2">
                                Select Exam
                            </label>
                            <Dropdown
                                id="exam-select"
                                options={examOptions}
                                value={selectedExam?.name || ''}
                                onChange={handleExamSelect}
                                placeholder="Choose an exam..."
                                aria-label="Select Cambridge exam"
                            />
                        </div>

                        <div>
                            <label htmlFor="paper-select" className="block text-sm font-medium text-slate-700 mb-2">
                                Select Paper
                            </label>
                            <Dropdown
                                id="paper-select"
                                options={paperOptions}
                                value={selectedPaper?.name || ''}
                                onChange={handlePaperSelect}
                                disabled={!selectedExam}
                                placeholder={selectedExam ? "Choose a paper..." : "Select an exam first"}
                                aria-label="Select exam paper"
                            />
                        </div>

                        {/* Timer Display and Controls */}
                        {selectedExam && selectedPaper && (
                            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                                {/* Exam Information Display */}
                                <ExamInfoDisplay
                                    selectedExam={selectedExam}
                                    selectedPaper={selectedPaper}
                                    timerState={timerState}
                                    isFullScreen={false}
                                />

                                {selectedPaper.isListening ? (
                                    <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-lg text-amber-700 font-medium">
                                            {'\u{1F3A7} Listening Test'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-6">
                                        {/* Timer Display */}
                                        <div className="p-6 bg-white border-2 border-slate-200 rounded-lg">
                                            <TimerDisplay 
                                                timeRemaining={timerState.timeRemaining}
                                                isFullScreen={false}
                                            />
                                        </div>

                                        {/* Timer Controls */}
                                        <TimerControls
                                            onStart={handleStartTimer}
                                            onPause={handleStartTimer}
                                            onReset={handleResetTimer}
                                            isRunning={timerState.isRunning}
                                            isDisabled={false}
                                            isFullScreen={false}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Initialize React App
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error('Root container not found');
    // Fallback: create root container if it doesn't exist
    const fallbackRoot = document.createElement('div');
    fallbackRoot.id = 'root';
    document.body.appendChild(fallbackRoot);
    const root = createRoot(fallbackRoot);
    root.render(<App />);
}

export default App;

