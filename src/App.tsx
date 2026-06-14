import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { Header, Dropdown, TimerDisplay, TimerControls, ExamInfoDisplay, ExpandToggleIcon, PauseIcon, PlayIcon, ResetIcon } from './components';
import { CAMBRIDGE_EXAMS, CENTRE_NUMBER, MULTIPLE_EXAM_OPTIONS } from './constants';
import { Exam, Paper, TimerState } from './types';
import { formatDuration, formatTime, formatTimeHHMM } from './utils';
import './index.css';

type TimerMode = 'single' | 'multiple';
type ExtraTimePercent = 0 | 25 | 50 | 100;

interface MultiTimerSession {
    id: number;
    selectedExam: Exam | null;
    selectedPaper: Paper | null;
    extraTimePercent: ExtraTimePercent;
    timerState: TimerState;
    pausedRemainingMs: number | null;
}

interface SinglePaperTimerSession {
    timerState: TimerState;
    pausedRemainingMs: number | null;
    hasTimerCompleted: boolean;
}

interface FitToBoxProps {
    children: React.ReactNode;
}

const FitToBox: React.FC<FitToBoxProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const scaleRef = useRef(1);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        scaleRef.current = scale;
    }, [scale]);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;

        if (!container || !content) {
            return;
        }

        let animationFrame = 0;

        const fit = () => {
            const currentContainer = containerRef.current;
            const currentContent = contentRef.current;

            if (!currentContainer || !currentContent) {
                return;
            }

            const availableWidth = currentContainer.clientWidth;
            const availableHeight = currentContainer.clientHeight;
            const naturalWidth = currentContent.scrollWidth;
            const naturalHeight = currentContent.scrollHeight;

            if (!availableWidth || !availableHeight || !naturalWidth || !naturalHeight) {
                return;
            }

            const nextScale = Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight);
            const minimumScale = window.innerWidth < 640 ? 0.35 : 0.55;
            const fittedScale = Math.max(minimumScale, nextScale * 0.995);

            setScale(previousScale => (
                Math.abs(previousScale - fittedScale) > 0.005 ? fittedScale : previousScale
            ));
        };

        const scheduleFit = () => {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(fit);
        };

        const resizeObserver = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(scheduleFit)
            : null;

        resizeObserver?.observe(container);
        resizeObserver?.observe(content);
        scheduleFit();
        window.addEventListener('resize', scheduleFit);

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', scheduleFit);
        };
    }, [children]);

    return (
        <div ref={containerRef} className="h-full min-h-0 overflow-hidden">
            <div
                ref={contentRef}
                className="flex h-full min-h-0 flex-col"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center'
                }}
            >
                {children}
            </div>
        </div>
    );
};

interface PaperNavigationControlsProps {
    onPrevious: () => void;
    onNext: () => void;
    canGoPrevious: boolean;
    canGoNext: boolean;
    className?: string;
}

const PaperNavigationControls: React.FC<PaperNavigationControlsProps> = ({
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext,
    className = ''
}) => {
    const buttonClasses = 'pointer-events-auto inline-flex h-[clamp(2.75rem,7vmin,5rem)] w-[clamp(2.75rem,7vmin,5rem)] items-center justify-center rounded-lg bg-white/0 text-blue-600 shadow-[0_0.18rem_0.35rem_rgba(15,23,42,0.22)] transition-all duration-150 hover:scale-105 hover:bg-white/20 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35';
    const iconSize = 'clamp(2.2rem,5.2vmin,4.2rem)';

    return (
        <div className={`flex items-center justify-center gap-[clamp(0.75rem,2vmin,2rem)] ${className}`}>
            <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={buttonClasses}
                aria-label="Previous paper"
                title="Previous paper"
            >
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                className={buttonClasses}
                aria-label="Next paper"
                title="Next paper"
            >
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
};

interface WelcomePageDisplayProps {
    examName: string;
    centreNumber: string;
    onNext: () => void;
    onBackToHome: () => void;
    onToggleFullscreen: () => void;
    canGoNext: boolean;
    isFullscreenActive: boolean;
}

const createLogoGlobeTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const lineGrey = 'rgba(148, 163, 184, 0.58)';

    if (!context) {
        return new THREE.CanvasTexture(canvas);
    }

    context.fillStyle = '#2563eb';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = lineGrey;
    context.lineWidth = 10;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    const drawHorizontal = (y: number) => {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    };

    const drawVertical = (x: number) => {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    };

    // Three.js bends the texture around the sphere, so the texture itself
    // should use straight, symmetrical latitude and longitude lines.
    [0.26, 0.5, 0.74].forEach(yPosition => {
        drawHorizontal(canvas.height * yPosition);
    });

    const logoPositions = [0.25, 0.75];

    for (let index = 0; index < 8; index += 1) {
        drawVertical(canvas.width * (index / 8));
    }

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';

    const measureSpacedText = (text: string, font: string, letterSpacing: number) => {
        context.font = font;
        return Array.from(text).reduce((width, character, index) => (
            width + context.measureText(character).width + (index > 0 ? letterSpacing : 0)
        ), 0);
    };

    const drawSpacedText = (text: string, x: number, y: number, font: string, letterSpacing: number) => {
        const characters = Array.from(text);
        let currentX = x;
        context.font = font;
        context.textAlign = 'left';

        characters.forEach((character, index) => {
            if (index > 0) {
                currentX += letterSpacing;
            }
            context.fillText(character, currentX, y);
            currentX += context.measureText(character).width;
        });

        context.textAlign = 'center';
    };

    logoPositions.forEach(xPosition => {
        const textX = canvas.width * xPosition;
        const primaryFont = '900 70px Arial, Helvetica, sans-serif';
        const secondaryFont = '300 48px Arial, Helvetica, sans-serif';
        const examsFont = '900 48px Arial, Helvetica, sans-serif';
        const secondarySpacing = 8;

        context.font = primaryFont;
        context.letterSpacing = '10px';
        context.fillText('LENGUAS VIVAS', textX, canvas.height * 0.36);

        context.font = secondaryFont;
        context.letterSpacing = `${secondarySpacing}px`;
        context.fillText('YOUR CAMBRIDGE', textX, canvas.height * 0.445);

        context.letterSpacing = '0px';
        const examsText = 'EXAMS';
        const centreText = ' CENTRE';
        const examsWidth = measureSpacedText(examsText, examsFont, secondarySpacing);
        const centreWidth = measureSpacedText(centreText, secondaryFont, secondarySpacing);
        const lineStart = textX - ((examsWidth + centreWidth) / 2);
        const lineY = canvas.height * 0.575;

        drawSpacedText(examsText, lineStart, lineY, examsFont, secondarySpacing);
        drawSpacedText(centreText, lineStart + examsWidth, lineY, secondaryFont, secondarySpacing);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 8;
    texture.needsUpdate = true;

    return texture;
};

const WelcomeGlobe: React.FC = () => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;

        if (!mount) {
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 0, 8.6);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const texture = createLogoGlobeTexture();
        const geometry = new THREE.SphereGeometry(1.88, 128, 80);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 18,
            specular: new THREE.Color(0x60a5fa),
            color: 0xffffff
        });
        const globe = new THREE.Mesh(geometry, material);
        globe.rotation.y = 0;
        scene.add(globe);

        scene.add(new THREE.AmbientLight(0xffffff, 0.82));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
        keyLight.position.set(3, 3.5, 5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
        fillLight.position.set(-4, -1, 3);
        scene.add(fillLight);

        let animationFrame = 0;

        const resize = () => {
            const size = Math.max(1, Math.min(mount.clientWidth, mount.clientHeight));
            renderer.setSize(size, size, false);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        };

        const animate = () => {
            globe.rotation.y -= 0.003;
            renderer.render(scene, camera);
            animationFrame = requestAnimationFrame(animate);
        };

        const resizeObserver = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(resize)
            : null;

        resizeObserver?.observe(mount);
        resize();
        animate();

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver?.disconnect();
            mount.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            texture.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="welcome-logo-globe"
            aria-label="Lenguas Vivas Your Cambridge Exams Centre rotating logo globe"
        />
    );
};

const WelcomePageDisplay: React.FC<WelcomePageDisplayProps> = ({
    examName,
    centreNumber,
    onNext,
    onBackToHome,
    onToggleFullscreen,
    canGoNext,
    isFullscreenActive
}) => (
    <div className="welcome-smoke-bg relative grid h-full min-h-0 w-full grid-cols-1 overflow-hidden md:grid-cols-2">
        <div className="pointer-events-none absolute inset-0 z-0 bg-blue-950/10" aria-hidden="true" />
        <div className="absolute right-5 top-5 z-20 flex flex-col items-center gap-3">
            <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600/85 text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Back to home screen"
                title="Back to home screen"
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M4 11.5L12 5L20 11.5V20H14.5V14.5H9.5V20H4V11.5Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <button
                type="button"
                onClick={onToggleFullscreen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600/85 text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={isFullscreenActive ? 'Exit full-screen mode' : 'Enter full-screen mode'}
                title={isFullscreenActive ? 'Exit full-screen mode' : 'Enter full-screen mode'}
            >
                {isFullscreenActive ? (
                    <span className="text-xl font-bold leading-none">{'\u2715'}</span>
                ) : (
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>
        </div>

        <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="absolute bottom-8 right-8 z-20 inline-flex h-[clamp(3.2rem,6vmin,5rem)] w-[clamp(3.2rem,6vmin,5rem)] items-center justify-center rounded-lg bg-white/0 text-white shadow-[0_0.2rem_0.38rem_rgba(15,23,42,0.32)] transition-all duration-150 hover:scale-105 hover:bg-white/15 hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next paper"
            title="Next paper"
        >
            <svg
                width="clamp(2.4rem,5.4vmin,4.4rem)"
                height="clamp(2.4rem,5.4vmin,4.4rem)"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>

        <section className="relative z-10 flex min-h-[16rem] flex-col items-center justify-center p-8 text-white">
            <WelcomeGlobe />
            <div className="mt-10 border-t border-white/45 pt-8 text-center drop-shadow-[0_0.2rem_0.9rem_rgba(15,23,42,0.28)]">
                <div className="text-[clamp(1rem,2vw,1.4rem)] font-semibold uppercase tracking-[0.06em] text-white/85">
                    Centre Number
                </div>
                <div className="mt-2 text-[clamp(2.4rem,5vw,4.6rem)] font-bold leading-none">
                    {centreNumber}
                </div>
            </div>
        </section>

        <section className="relative z-10 flex min-h-[20rem] flex-col items-center justify-center p-8 text-center">
            <div className="max-w-4xl">
                <h1 className="text-[clamp(3rem,6vw,7.5rem)] font-bold leading-[1.02] text-white drop-shadow-[0_0.22rem_0.9rem_rgba(15,23,42,0.34)]">
                    Welcome to your Cambridge Exam
                </h1>
                <div className="mx-auto mt-8 h-px w-[min(28rem,62%)] bg-white/45" aria-hidden="true" />
                <div className="mt-8 text-[clamp(2.2rem,4.6vw,5.5rem)] font-semibold leading-tight text-blue-100 drop-shadow-[0_0.18rem_0.75rem_rgba(15,23,42,0.32)]">
                    {examName}
                </div>
            </div>
        </section>
    </div>
);

const createInitialTimerState = (): TimerState => ({
    timeRemaining: 0,
    extraTimeRemaining: 0,
    isRunning: false,
    startTime: null,
    finishTime: null,
    extraFinishTime: null,
    phase: 'standard'
});

const createEmptyMultiTimer = (id: number): MultiTimerSession => ({
    id,
    selectedExam: null,
    selectedPaper: null,
    extraTimePercent: 0,
    timerState: createInitialTimerState(),
    pausedRemainingMs: null
});

const EXTRA_TIME_OPTIONS: Array<{ label: string; value: ExtraTimePercent }> = [
    { label: 'No extra time', value: 0 },
    { label: '25% extra time', value: 25 },
    { label: '50% extra time', value: 50 },
    { label: '100% extra time', value: 100 }
];

const WELCOME_PAGE_NAME = 'Welcome page';
const WELCOME_PAGE_PAPER: Paper = {
    name: WELCOME_PAGE_NAME,
    durationMinutes: 0,
    isWelcomePage: true
};

const getExtraTimeLabel = (percent: ExtraTimePercent): string => (
    EXTRA_TIME_OPTIONS.find(option => option.value === percent)?.label || EXTRA_TIME_OPTIONS[0].label
);

const getExtraTimePercentFromLabel = (label: string): ExtraTimePercent => (
    EXTRA_TIME_OPTIONS.find(option => option.label === label)?.value ?? 0
);

const getOfficialDurationSeconds = (paper: Paper): number => (
    Math.round(paper.durationMinutes * 60)
);

const getExtraTimeSeconds = (paper: Paper, extraTimePercent: ExtraTimePercent): number => (
    Math.round(paper.durationMinutes * 60 * (extraTimePercent / 100))
);

const isWelcomePagePaper = (paper: Paper | null): boolean => (
    !!paper?.isWelcomePage || paper?.name === WELCOME_PAGE_NAME
);

const getSingleTimerPaperSequence = (exam: Exam | null): Paper[] => {
    if (!exam) {
        return [];
    }

    const paperByName = new Map(exam.papers.map(paper => [paper.name, paper]));
    let orderedPaperNames: string[] = [];

    if (exam.name.includes('Starters') || exam.name.includes('Movers') || exam.name.includes('Flyers')) {
        orderedPaperNames = ['Listening', 'Reading & Writing'];
    } else if (exam.name.includes('Key')) {
        orderedPaperNames = ['Reading & Writing', 'Listening'];
    } else if (exam.name.includes('Preliminary')) {
        orderedPaperNames = ['Reading', 'Writing', 'Listening'];
    } else if (
        exam.name.includes('First')
        || exam.name.includes('Advanced')
        || exam.name.includes('Proficiency')
    ) {
        orderedPaperNames = ['Reading & Use of English', 'Writing', 'Listening'];
    }

    const orderedPapers = orderedPaperNames
        .map(paperName => paperByName.get(paperName))
        .filter((paper): paper is Paper => !!paper);

    const remainingPapers = exam.papers.filter(paper => !orderedPaperNames.includes(paper.name));

    return [WELCOME_PAGE_PAPER, ...orderedPapers, ...remainingPapers];
};

const getDisplayPaper = (paper: Paper | null): Paper | null => {
    if (!paper) {
        return null;
    }

    return {
        ...paper,
        durationMinutes: paper.durationMinutes
    };
};

const getDoubleTimerAccentClasses = (examName: string) => {
    if (examName.includes('Key')) {
        return {
            text: 'text-teal-700',
            bg: 'bg-teal-600',
            border: 'border-teal-500',
            chip: 'bg-teal-50'
        };
    }

    if (examName.includes('Preliminary')) {
        return {
            text: 'text-rose-700',
            bg: 'bg-rose-600',
            border: 'border-rose-500',
            chip: 'bg-rose-50'
        };
    }

    if (examName.includes('First')) {
        return {
            text: 'text-lime-700',
            bg: 'bg-lime-500',
            border: 'border-lime-500',
            chip: 'bg-lime-50'
        };
    }

    if (examName.includes('Advanced')) {
        return {
            text: 'text-cyan-700',
            bg: 'bg-cyan-600',
            border: 'border-cyan-500',
            chip: 'bg-cyan-50'
        };
    }

    if (examName.includes('Proficiency')) {
        return {
            text: 'text-indigo-800',
            bg: 'bg-indigo-800',
            border: 'border-indigo-700',
            chip: 'bg-indigo-50'
        };
    }

    return {
        text: 'text-blue-700',
        bg: 'bg-blue-600',
        border: 'border-blue-500',
        chip: 'bg-blue-50'
    };
};

const formatTimerDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) {
        return formatTime(seconds);
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatFourDigitTimerDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) {
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Main App Component
const App: React.FC = () => {
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
    const [extraTimePercent, setExtraTimePercent] = useState<ExtraTimePercent>(0);
    const [timerState, setTimerState] = useState<TimerState>(createInitialTimerState());
    const [timerMode, setTimerMode] = useState<TimerMode>('single');
    const [multiTimers, setMultiTimers] = useState<MultiTimerSession[]>([
        createEmptyMultiTimer(1)
    ]);
    const [isTimerScreen, setIsTimerScreen] = useState(false);
    const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);
    const [isSingleExtraTimeExpanded, setIsSingleExtraTimeExpanded] = useState(false);
    const [expandedMultiExtraTimerIds, setExpandedMultiExtraTimerIds] = useState<number[]>([]);

    // Timer interval reference
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const multiTimerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const nextMultiTimerIdRef = useRef(2);
    const pausedRemainingMsRef = useRef<number | null>(null);
    const hasTimerCompletedRef = useRef(false);
    const singlePaperTimerSessionsRef = useRef<Record<string, SinglePaperTimerSession>>({});

    // Keyboard navigation support
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle keyboard shortcuts when not in an input field
            if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement) {
                return;
            }

            // Space bar to start/pause timer from timer screen only
            if (event.code === 'Space' && timerMode === 'single' && isTimerScreen && selectedPaper && !selectedPaper.isListening && !isWelcomePagePaper(selectedPaper)) {
                event.preventDefault();
                handleStartTimer();
            }

            // 'R' key to reset timer from timer screen only
            if (event.code === 'KeyR' && timerMode === 'single' && isTimerScreen && selectedPaper && !selectedPaper.isListening && !isWelcomePagePaper(selectedPaper)) {
                event.preventDefault();
                handleResetTimer();
            }

            // 'F' key toggles browser fullscreen from timer screen only
            if (event.code === 'KeyF' && isTimerScreen) {
                event.preventDefault();
                void handleToggleBrowserFullScreen();
            }

            // Escape key exits browser fullscreen
            if (event.code === 'Escape' && isBrowserFullScreen) {
                event.preventDefault();
                void exitBrowserFullScreen();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedPaper, isTimerScreen, isBrowserFullScreen, timerState.isRunning, timerMode]);

    // Timer countdown effect (clock-based to avoid interval drift)
    useEffect(() => {
        const clearTimerInterval = () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };

        if (!timerState.isRunning || (timerState.phase === 'standard' ? !timerState.finishTime : !timerState.extraFinishTime)) {
            clearTimerInterval();
            return clearTimerInterval;
        }

        const syncTimerToClock = () => {
            setTimerState(prevState => {
                const activeFinishTime = prevState.phase === 'extra'
                    ? prevState.extraFinishTime
                    : prevState.finishTime;

                if (!prevState.isRunning || !activeFinishTime) {
                    return prevState;
                }

                const remainingMs = Math.max(0, activeFinishTime.getTime() - Date.now());
                pausedRemainingMsRef.current = remainingMs;
                const newTimeRemaining = Math.max(0, Math.ceil(remainingMs / 1000));

                if (newTimeRemaining <= 0) {
                    if (prevState.phase === 'standard' && prevState.extraTimeRemaining > 0) {
                        const extraDurationMs = prevState.extraTimeRemaining * 1000;
                        return {
                            ...prevState,
                            timeRemaining: 0,
                            isRunning: true,
                            extraFinishTime: new Date(Date.now() + extraDurationMs),
                            phase: 'extra'
                        };
                    }

                    return {
                        ...prevState,
                        timeRemaining: 0,
                        extraTimeRemaining: 0,
                        isRunning: false,
                        phase: 'complete'
                    };
                }

                const currentDisplayedRemaining = prevState.phase === 'extra'
                    ? prevState.extraTimeRemaining
                    : prevState.timeRemaining;

                if (newTimeRemaining === currentDisplayedRemaining) {
                    return prevState;
                }

                return prevState.phase === 'extra'
                    ? {
                        ...prevState,
                        extraTimeRemaining: newTimeRemaining
                    }
                    : {
                        ...prevState,
                        timeRemaining: newTimeRemaining
                    };
            });
        };

        syncTimerToClock();
        timerIntervalRef.current = setInterval(syncTimerToClock, 250);

        return clearTimerInterval;
    }, [timerState.isRunning, timerState.finishTime, timerState.extraFinishTime, timerState.phase]);

    const hasRunningMultiTimer = multiTimers.some(timer => (
        timer.timerState.isRunning
        && (timer.timerState.phase === 'standard' ? timer.timerState.finishTime : timer.timerState.extraFinishTime)
    ));
    const handleToggleAllMultiTimers = () => {
        if (hasRunningMultiTimer) {
            handlePauseAllMultiTimers();
            return;
        }

        handleStartAllMultiTimers();
    };

    // Multiple timer countdown effect
    useEffect(() => {
        const clearMultiTimerInterval = () => {
            if (multiTimerIntervalRef.current) {
                clearInterval(multiTimerIntervalRef.current);
                multiTimerIntervalRef.current = null;
            }
        };

        if (!hasRunningMultiTimer) {
            clearMultiTimerInterval();
            return clearMultiTimerInterval;
        }

        const syncTimersToClock = () => {
            setMultiTimers(prevTimers => prevTimers.map(timer => {
                const activeFinishTime = timer.timerState.phase === 'extra'
                    ? timer.timerState.extraFinishTime
                    : timer.timerState.finishTime;

                if (!timer.timerState.isRunning || !activeFinishTime) {
                    return timer;
                }

                const remainingMs = Math.max(0, activeFinishTime.getTime() - Date.now());
                const newTimeRemaining = Math.max(0, Math.ceil(remainingMs / 1000));

                if (newTimeRemaining <= 0) {
                    if (timer.timerState.phase === 'standard' && timer.timerState.extraTimeRemaining > 0) {
                        const extraDurationMs = timer.timerState.extraTimeRemaining * 1000;
                        return {
                            ...timer,
                            pausedRemainingMs: extraDurationMs,
                            timerState: {
                                ...timer.timerState,
                                timeRemaining: 0,
                                isRunning: true,
                                extraFinishTime: new Date(Date.now() + extraDurationMs),
                                phase: 'extra'
                            }
                        };
                    }

                    return {
                        ...timer,
                        pausedRemainingMs: 0,
                        timerState: {
                            ...timer.timerState,
                            timeRemaining: 0,
                            extraTimeRemaining: 0,
                            isRunning: false,
                            phase: 'complete'
                        }
                    };
                }

                const currentDisplayedRemaining = timer.timerState.phase === 'extra'
                    ? timer.timerState.extraTimeRemaining
                    : timer.timerState.timeRemaining;

                if (newTimeRemaining === currentDisplayedRemaining) {
                    return {
                        ...timer,
                        pausedRemainingMs: remainingMs
                    };
                }

                return {
                    ...timer,
                    pausedRemainingMs: remainingMs,
                    timerState: {
                        ...timer.timerState,
                        ...(timer.timerState.phase === 'extra'
                            ? { extraTimeRemaining: newTimeRemaining }
                            : { timeRemaining: newTimeRemaining }
                        )
                    }
                };
            }));
        };

        syncTimersToClock();
        multiTimerIntervalRef.current = setInterval(syncTimersToClock, 250);

        return clearMultiTimerInterval;
    }, [hasRunningMultiTimer]);

    // Track completed state outside state updater logic
    useEffect(() => {
        const hasTimerStarted = !!timerState.startTime;
        const hasTimerCompleted = !timerState.isRunning && timerState.timeRemaining === 0 && hasTimerStarted;

        if (hasTimerCompleted && !hasTimerCompletedRef.current) {
            hasTimerCompletedRef.current = true;
        }
    }, [timerState.isRunning, timerState.timeRemaining, timerState.startTime]);

    // Track browser fullscreen state changes (including ESC/F11 exits)
    useEffect(() => {
        const handleFullScreenChange = () => {
            const isCurrentlyFullScreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement
            );

            setIsBrowserFullScreen(isCurrentlyFullScreen);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange as EventListener);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange as EventListener);
        document.addEventListener('MSFullscreenChange', handleFullScreenChange as EventListener);

        handleFullScreenChange();

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange as EventListener);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange as EventListener);
            document.removeEventListener('MSFullscreenChange', handleFullScreenChange as EventListener);
        };
    }, []);

    const multipleExamOptions = useMemo(() =>
        MULTIPLE_EXAM_OPTIONS.map(exam => exam.name),
        []
    );

    const examOptionGroups = useMemo(() => [
        {
            label: 'Young Learners',
            options: ['A1 Starters', 'A1 Movers', 'A2 Flyers']
        },
        {
            label: 'A2 Key',
            options: ['A2 Key', 'A2 Key for Schools']
        },
        {
            label: 'B1 Preliminary',
            options: ['B1 Preliminary', 'B1 Preliminary for Schools']
        },
        {
            label: 'B2 First',
            options: ['B2 First Certificate', 'B2 First Certificate for Schools']
        },
        {
            label: 'Multiple Exams',
            options: multipleExamOptions
        }
    ], [multipleExamOptions]);

    const directExamOptions = useMemo(() => [
        'C1 Advanced',
        'C2 Proficiency',
        '1 minute TEST'
    ], []);

    const allAvailableExams = useMemo(() =>
        [...CAMBRIDGE_EXAMS, ...MULTIPLE_EXAM_OPTIONS],
        []
    );

    // Get paper names for selected exam
    const singleTimerPaperSequence = useMemo(() =>
        getSingleTimerPaperSequence(selectedExam),
        [selectedExam]
    );
    const paperOptions = useMemo(() => 
        singleTimerPaperSequence.map(paper => paper.name),
        [singleTimerPaperSequence]
    );
    const extraTimeOptionLabels = useMemo(() =>
        EXTRA_TIME_OPTIONS.filter(option => option.value > 0).map(option => option.label),
        []
    );
    const displaySelectedPaper = useMemo(
        () => getDisplayPaper(selectedPaper),
        [selectedPaper]
    );

    // Handle exam selection
    const handleExamSelect = (examName: string) => {
        const exam = allAvailableExams.find(e => e.name === examName) || null;
        setSelectedExam(exam);
        // Reset paper selection when exam changes
        setSelectedPaper(null);
        singlePaperTimerSessionsRef.current = {};
        pausedRemainingMsRef.current = null;
        hasTimerCompletedRef.current = false;
        // Reset timer state when exam changes
        setTimerState({
            timeRemaining: 0,
            extraTimeRemaining: 0,
            isRunning: false,
            startTime: null,
            finishTime: null,
            extraFinishTime: null,
            phase: 'standard'
        });
    };

    // Handle paper selection
    const handlePaperSelect = (paperName: string) => {
        if (!selectedExam) return;
        const paper = singleTimerPaperSequence.find(p => p.name === paperName) || null;
        saveCurrentSinglePaperSession();
        setSelectedPaper(paper);
        
        // Initialize timer duration based on selected paper
        if (paper) {
            restoreSinglePaperSession(paper);
        }
    };

    const applySingleExtraTime = (nextExtraTimePercent: ExtraTimePercent) => {
        setExtraTimePercent(nextExtraTimePercent);

        if (!selectedPaper || selectedPaper.isListening || isWelcomePagePaper(selectedPaper)) {
            return;
        }

        const durationInSeconds = getOfficialDurationSeconds(selectedPaper);
        pausedRemainingMsRef.current = durationInSeconds * 1000;
        hasTimerCompletedRef.current = false;
        setTimerState({
            timeRemaining: durationInSeconds,
            extraTimeRemaining: getExtraTimeSeconds(selectedPaper, nextExtraTimePercent),
            isRunning: false,
            startTime: null,
            finishTime: null,
            extraFinishTime: null,
            phase: 'standard'
        });
    };

    const handleExtraTimeToggle = (isChecked: boolean) => {
        applySingleExtraTime(isChecked ? 25 : 0);
    };

    const handleExtraTimeSelect = (extraTimeLabel: string) => {
        applySingleExtraTime(getExtraTimePercentFromLabel(extraTimeLabel));
    };

    const getSinglePaperSessionKey = (exam: Exam | null, paper: Paper | null) => (
        exam && paper ? `${exam.name}::${paper.name}` : null
    );

    const createTimerStateForPaper = (paper: Paper): SinglePaperTimerSession => {
        const durationInSeconds = getOfficialDurationSeconds(paper);

        return {
            timerState: {
                timeRemaining: durationInSeconds,
                extraTimeRemaining: getExtraTimeSeconds(paper, extraTimePercent),
                isRunning: false,
                startTime: null,
                finishTime: null,
                extraFinishTime: null,
                phase: 'standard'
            },
            pausedRemainingMs: durationInSeconds * 1000,
            hasTimerCompleted: false
        };
    };

    const syncSavedSinglePaperSessionToClock = (session: SinglePaperTimerSession): SinglePaperTimerSession => {
        const { timerState: savedState } = session;
        const activeFinishTime = savedState.phase === 'extra'
            ? savedState.extraFinishTime
            : savedState.finishTime;

        if (!savedState.isRunning || !activeFinishTime) {
            return session;
        }

        const remainingMs = Math.max(0, activeFinishTime.getTime() - Date.now());

        if (remainingMs > 0) {
            return {
                ...session,
                pausedRemainingMs: remainingMs,
                timerState: savedState.phase === 'extra'
                    ? {
                        ...savedState,
                        extraTimeRemaining: Math.max(0, Math.ceil(remainingMs / 1000))
                    }
                    : {
                        ...savedState,
                        timeRemaining: Math.max(0, Math.ceil(remainingMs / 1000))
                    }
            };
        }

        if (savedState.phase === 'standard' && savedState.extraTimeRemaining > 0) {
            const elapsedIntoExtraMs = Date.now() - activeFinishTime.getTime();
            const remainingExtraMs = Math.max(0, (savedState.extraTimeRemaining * 1000) - elapsedIntoExtraMs);

            if (remainingExtraMs > 0) {
                return {
                    ...session,
                    pausedRemainingMs: remainingExtraMs,
                    timerState: {
                        ...savedState,
                        timeRemaining: 0,
                        extraTimeRemaining: Math.max(0, Math.ceil(remainingExtraMs / 1000)),
                        isRunning: true,
                        extraFinishTime: new Date(Date.now() + remainingExtraMs),
                        phase: 'extra'
                    }
                };
            }
        }

        return {
            timerState: {
                ...savedState,
                timeRemaining: 0,
                extraTimeRemaining: 0,
                isRunning: false,
                phase: 'complete'
            },
            pausedRemainingMs: 0,
            hasTimerCompleted: true
        };
    };

    const saveCurrentSinglePaperSession = () => {
        const sessionKey = getSinglePaperSessionKey(selectedExam, selectedPaper);

        if (!sessionKey) {
            return;
        }

        singlePaperTimerSessionsRef.current[sessionKey] = {
            timerState,
            pausedRemainingMs: pausedRemainingMsRef.current,
            hasTimerCompleted: hasTimerCompletedRef.current
        };
    };

    const restoreSinglePaperSession = (paper: Paper) => {
        const sessionKey = getSinglePaperSessionKey(selectedExam, paper);
        const savedSession = sessionKey
            ? singlePaperTimerSessionsRef.current[sessionKey]
            : null;
        const nextSession = savedSession
            ? syncSavedSinglePaperSessionToClock(savedSession)
            : createTimerStateForPaper(paper);

        pausedRemainingMsRef.current = nextSession.pausedRemainingMs;
        hasTimerCompletedRef.current = nextSession.hasTimerCompleted;
        setTimerState(nextSession.timerState);

        if (sessionKey) {
            singlePaperTimerSessionsRef.current[sessionKey] = nextSession;
        }
    };

    const confirmNavigateFromRunningSingleTimer = () => {
        if (!timerState.isRunning || !selectedPaper || selectedPaper.isListening || isWelcomePagePaper(selectedPaper)) {
            return true;
        }

        return window.confirm(
            'The current timer is still running. Are you sure you want to navigate away from this paper? This may interrupt the timer display. Click OK to continue, or Cancel to stay on this paper.'
        );
    };

    const handleMultiExamSelect = (timerId: number, examName: string) => {
        const exam = allAvailableExams.find(e => e.name === examName) || null;

        setMultiTimers(prevTimers => prevTimers.map(timer => (
            timer.id === timerId
                ? {
                    ...timer,
                    selectedExam: exam,
                    selectedPaper: null,
                    extraTimePercent: 0,
                    pausedRemainingMs: null,
                    timerState: createInitialTimerState()
                }
                : timer
        )));
    };

    const handleMultiPaperSelect = (timerId: number, paperName: string) => {
        setMultiTimers(prevTimers => prevTimers.map(timer => {
            if (timer.id !== timerId || !timer.selectedExam) {
                return timer;
            }

            const paper = timer.selectedExam.papers.find(p => p.name === paperName) || null;
            const durationInSeconds = paper ? getOfficialDurationSeconds(paper) : 0;

            return {
                ...timer,
                selectedPaper: paper,
                pausedRemainingMs: paper ? durationInSeconds * 1000 : null,
                timerState: paper
                    ? {
                        timeRemaining: durationInSeconds,
                        extraTimeRemaining: getExtraTimeSeconds(paper, timer.extraTimePercent),
                        isRunning: false,
                        startTime: null,
                        finishTime: null,
                        extraFinishTime: null,
                        phase: 'standard'
                    }
                    : createInitialTimerState()
            };
        }));
    };

    const applyMultiExtraTime = (timerId: number, nextExtraTimePercent: ExtraTimePercent) => {
        setMultiTimers(prevTimers => prevTimers.map(timer => {
            if (timer.id !== timerId) {
                return timer;
            }

            const durationInSeconds = timer.selectedPaper
                ? getOfficialDurationSeconds(timer.selectedPaper)
                : 0;

            return {
                ...timer,
                extraTimePercent: nextExtraTimePercent,
                pausedRemainingMs: timer.selectedPaper ? durationInSeconds * 1000 : null,
                timerState: timer.selectedPaper
                    ? {
                        timeRemaining: durationInSeconds,
                        extraTimeRemaining: getExtraTimeSeconds(timer.selectedPaper, nextExtraTimePercent),
                        isRunning: false,
                        startTime: null,
                        finishTime: null,
                        extraFinishTime: null,
                        phase: 'standard'
                    }
                    : createInitialTimerState()
            };
        }));
    };

    const handleMultiExtraTimeToggle = (timerId: number, isChecked: boolean) => {
        applyMultiExtraTime(timerId, isChecked ? 25 : 0);
    };

    const handleMultiExtraTimeSelect = (timerId: number, extraTimeLabel: string) => {
        applyMultiExtraTime(timerId, getExtraTimePercentFromLabel(extraTimeLabel));
    };

    const handleAddMultiTimer = () => {
        setMultiTimers(prevTimers => {
            if (prevTimers.length >= 3) {
                return prevTimers;
            }

            const nextTimer = createEmptyMultiTimer(nextMultiTimerIdRef.current);
            nextMultiTimerIdRef.current += 1;
            return [...prevTimers, nextTimer];
        });
    };

    const handleRemoveMultiTimer = (timerId: number) => {
        setMultiTimers(prevTimers => (
            prevTimers.length <= 1
                ? prevTimers
                : prevTimers.filter(timer => timer.id !== timerId)
        ));
    };

    const updateMultiTimer = (
        timerId: number,
        updater: (timer: MultiTimerSession) => MultiTimerSession
    ) => {
        setMultiTimers(prevTimers => prevTimers.map(timer => (
            timer.id === timerId ? updater(timer) : timer
        )));
    };

    const handleStartMultiTimer = (timerId: number) => {
        updateMultiTimer(timerId, timer => {
            const currentRemaining = timer.timerState.phase === 'extra'
                ? timer.timerState.extraTimeRemaining
                : timer.timerState.timeRemaining;

            if (!timer.selectedPaper || timer.selectedPaper.isListening || currentRemaining <= 0) {
                return timer;
            }

            if (timer.timerState.isRunning) {
                const activeFinishTime = timer.timerState.phase === 'extra'
                    ? timer.timerState.extraFinishTime
                    : timer.timerState.finishTime;
                const remainingMs = activeFinishTime
                    ? Math.max(0, activeFinishTime.getTime() - Date.now())
                    : Math.max(0, currentRemaining * 1000);

                return {
                    ...timer,
                    pausedRemainingMs: remainingMs,
                    timerState: {
                        ...timer.timerState,
                        isRunning: false,
                        ...(timer.timerState.phase === 'extra'
                            ? {
                                extraFinishTime: null,
                                extraTimeRemaining: Math.max(0, Math.ceil(remainingMs / 1000))
                            }
                            : {
                                finishTime: null,
                                timeRemaining: Math.max(0, Math.ceil(remainingMs / 1000))
                            }
                        )
                    }
                };
            }

            if (!timer.timerState.startTime) {
                const startTime = new Date();
                const durationInSeconds = getOfficialDurationSeconds(timer.selectedPaper);
                const durationMs = durationInSeconds * 1000;

                return {
                    ...timer,
                    pausedRemainingMs: durationMs,
                    timerState: {
                        ...timer.timerState,
                        timeRemaining: durationInSeconds,
                        extraTimeRemaining: getExtraTimeSeconds(timer.selectedPaper, timer.extraTimePercent),
                        isRunning: true,
                        startTime,
                        finishTime: new Date(startTime.getTime() + durationMs),
                        extraFinishTime: null,
                        phase: 'standard'
                    }
                };
            }

            const resumeRemainingMs = timer.pausedRemainingMs ?? (timer.timerState.timeRemaining * 1000);

            return {
                ...timer,
                pausedRemainingMs: resumeRemainingMs,
                timerState: {
                    ...timer.timerState,
                    isRunning: true,
                    ...(timer.timerState.phase === 'extra'
                        ? {
                            extraFinishTime: new Date(Date.now() + resumeRemainingMs),
                            extraTimeRemaining: Math.max(0, Math.ceil(resumeRemainingMs / 1000))
                        }
                        : {
                            finishTime: new Date(Date.now() + resumeRemainingMs),
                            timeRemaining: Math.max(0, Math.ceil(resumeRemainingMs / 1000))
                        }
                    )
                }
            };
        });
    };

    const handleResetMultiTimer = (timerId: number) => {
        updateMultiTimer(timerId, timer => {
            if (!timer.selectedPaper || timer.selectedPaper.isListening) {
                return timer;
            }

            const durationInSeconds = getOfficialDurationSeconds(timer.selectedPaper);

            return {
                ...timer,
                pausedRemainingMs: durationInSeconds * 1000,
                timerState: {
                    timeRemaining: durationInSeconds,
                    extraTimeRemaining: getExtraTimeSeconds(timer.selectedPaper, timer.extraTimePercent),
                    isRunning: false,
                    startTime: null,
                    finishTime: null,
                    extraFinishTime: null,
                    phase: 'standard'
                }
            };
        });
    };

    const handleStartAllMultiTimers = () => {
        multiTimers.forEach(timer => {
            if (timer.selectedPaper && !timer.selectedPaper.isListening && !timer.timerState.isRunning) {
                handleStartMultiTimer(timer.id);
            }
        });
    };

    const handlePauseAllMultiTimers = () => {
        multiTimers.forEach(timer => {
            if (timer.timerState.isRunning) {
                handleStartMultiTimer(timer.id);
            }
        });
    };

    const handleResetAllMultiTimers = () => {
        multiTimers.forEach(timer => handleResetMultiTimer(timer.id));
    };

    // Start timer function
    const handleStartTimer = () => {
        if (!selectedPaper || selectedPaper.isListening || isWelcomePagePaper(selectedPaper)) return;
        
        setTimerState(prevState => {
            const currentRemaining = prevState.phase === 'extra'
                ? prevState.extraTimeRemaining
                : prevState.timeRemaining;

            if (currentRemaining <= 0) {
                return prevState;
            }

            // If timer is already running, this is a pause action
            if (prevState.isRunning) {
                const activeFinishTime = prevState.phase === 'extra'
                    ? prevState.extraFinishTime
                    : prevState.finishTime;
                const remainingMs = activeFinishTime
                    ? Math.max(0, activeFinishTime.getTime() - Date.now())
                    : Math.max(0, currentRemaining * 1000);
                pausedRemainingMsRef.current = remainingMs;

                return {
                    ...prevState,
                    isRunning: false,
                    ...(prevState.phase === 'extra'
                        ? {
                            extraFinishTime: null,
                            extraTimeRemaining: Math.max(0, Math.ceil(remainingMs / 1000))
                        }
                        : {
                            finishTime: null,
                            timeRemaining: Math.max(0, Math.ceil(remainingMs / 1000))
                        }
                    )
                };
            }
            
            // If starting for the first time (no start time recorded)
            if (!prevState.startTime) {
                const startTime = new Date();
                const durationInSeconds = getOfficialDurationSeconds(selectedPaper);
                const finishTime = new Date(startTime.getTime() + (durationInSeconds * 1000));
                pausedRemainingMsRef.current = durationInSeconds * 1000;
                hasTimerCompletedRef.current = false;
                
                return {
                    ...prevState,
                    timeRemaining: durationInSeconds,
                    extraTimeRemaining: getExtraTimeSeconds(selectedPaper, extraTimePercent),
                    isRunning: true,
                    startTime,
                    finishTime,
                    extraFinishTime: null,
                    phase: 'standard'
                };
            }
            
            // Resume from pause
            const resumeRemainingMs = pausedRemainingMsRef.current ?? (currentRemaining * 1000);
            hasTimerCompletedRef.current = false;

            return {
                ...prevState,
                isRunning: true,
                ...(prevState.phase === 'extra'
                    ? {
                        extraFinishTime: new Date(Date.now() + resumeRemainingMs),
                        extraTimeRemaining: Math.max(0, Math.ceil(resumeRemainingMs / 1000))
                    }
                    : {
                        finishTime: new Date(Date.now() + resumeRemainingMs),
                        timeRemaining: Math.max(0, Math.ceil(resumeRemainingMs / 1000))
                    }
                )
            };
        });
    };

    // Reset timer function
    const handleResetTimer = () => {
        if (!selectedPaper || selectedPaper.isListening || isWelcomePagePaper(selectedPaper)) return;
        
        const durationInSeconds = getOfficialDurationSeconds(selectedPaper);
        pausedRemainingMsRef.current = durationInSeconds * 1000;
        hasTimerCompletedRef.current = false;
        setTimerState({
            timeRemaining: durationInSeconds,
            extraTimeRemaining: getExtraTimeSeconds(selectedPaper, extraTimePercent),
            isRunning: false,
            startTime: null,
            finishTime: null,
            extraFinishTime: null,
            phase: 'standard'
        });
    };

    const requestBrowserFullScreen = async () => {
        const element = document.documentElement;

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
            setIsBrowserFullScreen(false);
        }
    };

    const exitBrowserFullScreen = async () => {
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
                setIsBrowserFullScreen(false);
            }
        } catch (error) {
            setIsBrowserFullScreen(false);
        }
    };

    const handleToggleBrowserFullScreen = async () => {
        if (isBrowserFullScreen) {
            await exitBrowserFullScreen();
            return;
        }

        await requestBrowserFullScreen();
    };

    const handleOpenTimerScreen = () => {
        setIsTimerScreen(true);
    };

    const handleBackToHomeScreen = async () => {
        if (isBrowserFullScreen) {
            await exitBrowserFullScreen();
        }

        setIsTimerScreen(false);
    };

    const readyMultiTimerCount = multiTimers.filter(timer => !!timer.selectedExam && !!timer.selectedPaper).length;
    const hasReadyMultiTimer = readyMultiTimerCount >= 2
        && multiTimers.every(timer => !!timer.selectedExam && !!timer.selectedPaper);
    const canOpenTimerScreen = timerMode === 'single'
        ? !!selectedExam && !!selectedPaper
        : hasReadyMultiTimer;
    const selectedSinglePaperIndex = selectedPaper
        ? singleTimerPaperSequence.findIndex(paper => paper.name === selectedPaper.name)
        : -1;
    const canGoToPreviousSinglePaper = selectedSinglePaperIndex > 0;
    const canGoToNextSinglePaper = selectedSinglePaperIndex >= 0
        && selectedSinglePaperIndex < singleTimerPaperSequence.length - 1;

    const selectSinglePaperByIndex = (paperIndex: number) => {
        const nextPaper = singleTimerPaperSequence[paperIndex];

        if (!nextPaper) {
            return;
        }

        if (!confirmNavigateFromRunningSingleTimer()) {
            return;
        }

        handlePaperSelect(nextPaper.name);
        setIsSingleExtraTimeExpanded(false);
    };

    const handlePreviousSinglePaper = () => {
        if (canGoToPreviousSinglePaper) {
            selectSinglePaperByIndex(selectedSinglePaperIndex - 1);
        }
    };

    const handleNextSinglePaper = () => {
        if (canGoToNextSinglePaper) {
            selectSinglePaperByIndex(selectedSinglePaperIndex + 1);
        }
    };

    const toggleMultiExtraTimeExpanded = (timerId: number) => {
        setExpandedMultiExtraTimerIds(prevIds => (
            prevIds.includes(timerId)
                ? prevIds.filter(id => id !== timerId)
                : [...prevIds, timerId]
        ));
    };

    // Render timer screen (windowed by default, optionally browser fullscreen)
    if (isTimerScreen) {
        if (timerMode === 'multiple') {
            const readyTimers = multiTimers.filter(timer => timer.selectedExam && timer.selectedPaper);
            const gridClasses = readyTimers.length === 1
                ? 'grid-cols-1 max-w-5xl mx-auto'
                : readyTimers.length === 2
                    ? 'grid-cols-1 lg:grid-cols-2'
                    : 'grid-cols-1 lg:grid-cols-3';

            return (
                <div
                    className="h-screen h-[100dvh] bg-slate-100 relative flex flex-col overflow-hidden max-sm:h-auto max-sm:min-h-[100dvh] max-sm:overflow-y-auto"
                    role="application"
                    aria-label="Multiple exam timer screen display"
                >
                    <Header
                        isFullScreen={true}
                        className="relative z-10"
                        onBackToHome={handleBackToHomeScreen}
                        onToggleFullscreen={handleToggleBrowserFullScreen}
                        isFullscreenActive={isBrowserFullScreen}
                        centreNumber={CENTRE_NUMBER}
                    />

                    <main className={`grid ${gridClasses} flex-1 min-h-0 gap-4 overflow-hidden px-4 pt-4 pb-0 max-sm:flex-none max-sm:grid-cols-1 max-sm:gap-3 max-sm:overflow-visible max-sm:px-3 max-sm:pt-3 sm:px-6 sm:pt-6`}>
                        {readyTimers.map((timer, index) => {
                            const selectedTimerExam = timer.selectedExam as Exam;
                            const selectedTimerPaper = timer.selectedPaper as Paper;
                            const adjustedTimerPaper = getDisplayPaper(selectedTimerPaper) as Paper;
                            const totalTimerSeconds = getOfficialDurationSeconds(selectedTimerPaper);
                            const totalExtraTimerSeconds = getExtraTimeSeconds(selectedTimerPaper, timer.extraTimePercent);
                            const officialTimeUp = timer.timerState.phase === 'extra' || timer.timerState.phase === 'complete';
                            const isExtraTimeExpanded = expandedMultiExtraTimerIds.includes(timer.id);
                            const startTime = timer.timerState.startTime ? formatTimeHHMM(timer.timerState.startTime) : '-';
                            const finishTime = timer.timerState.finishTime ? formatTimeHHMM(timer.timerState.finishTime) : '-';
                            const progressPercentage = totalTimerSeconds > 0
                                ? Math.min(100, Math.max(0, ((totalTimerSeconds - timer.timerState.timeRemaining) / totalTimerSeconds) * 100))
                                : 0;
                            const extraProgressPercentage = totalExtraTimerSeconds > 0
                                ? Math.min(100, Math.max(0, ((totalExtraTimerSeconds - timer.timerState.extraTimeRemaining) / totalExtraTimerSeconds) * 100))
                                : 0;
                            const accentClasses = readyTimers.length >= 2
                                ? getDoubleTimerAccentClasses(selectedTimerExam.name)
                                : {
                                    text: 'text-blue-700',
                                    bg: 'bg-blue-600',
                                    border: 'border-blue-500',
                                    chip: 'bg-blue-50'
                                };
                            const tabClasses = readyTimers.length === 3
                                ? 'min-w-[clamp(7.5rem,10vw,11rem)] rounded-b-[1.2rem] px-7 pb-2 pt-2.5 text-[clamp(0.95rem,1.05vw,1.25rem)]'
                                : 'min-w-[clamp(9rem,14vw,15rem)] rounded-b-[1.4rem] px-10 pb-2.5 pt-3 text-[clamp(1.05rem,1.35vw,1.6rem)]';
                            const timerTextClasses = readyTimers.length === 3
                                ? 'text-[clamp(5.25rem,7.8vw,9.2rem)]'
                                : 'text-[clamp(5.75rem,9vw,12rem)]';
                            const completeTextClasses = readyTimers.length === 3
                                ? 'text-[clamp(2.8rem,3.8vw,4.8rem)]'
                                : 'text-[clamp(3.5rem,5vw,6.5rem)]';
                            const listeningIconClasses = readyTimers.length === 3
                                ? 'text-[clamp(6rem,9vw,11rem)]'
                                : 'text-[clamp(7rem,12vw,14rem)]';
                            const progressClasses = readyTimers.length === 3
                                ? 'mt-5 h-8'
                                : 'mt-6 h-8';
                            const timeRowClasses = readyTimers.length === 3
                                ? 'mt-5 mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3'
                                : 'mt-6 mb-5 grid grid-cols-[1fr_auto_1fr] items-baseline gap-6 text-center';
                            const timeLabelClasses = readyTimers.length === 3
                                ? 'text-[clamp(0.95rem,1.05vw,1.25rem)] leading-[1.05]'
                                : 'mr-4 text-[clamp(1.05rem,1.25vw,1.5rem)]';
                            const timeValueClasses = readyTimers.length === 3
                                ? 'text-[clamp(1.85rem,2.15vw,2.8rem)]'
                                : 'text-[clamp(1.8rem,2.25vw,3rem)]';
                            const infoGridClasses = readyTimers.length === 3
                                ? 'grid-cols-[clamp(7rem,7.8vw,9rem)_minmax(0,1fr)] pt-4'
                                : 'grid-cols-[clamp(8rem,10vw,12rem)_minmax(0,1fr)] pt-4';
                            const infoPanelHeightClasses = readyTimers.length === 3
                                ? 'h-[clamp(13rem,25vh,18rem)]'
                                : 'h-[clamp(12rem,22vh,16rem)]';
                            const infoLabelClasses = readyTimers.length === 3
                                ? 'text-[clamp(1rem,1.1vw,1.3rem)]'
                                : 'text-[clamp(1.05rem,1.25vw,1.5rem)]';
                            const infoValueClasses = readyTimers.length === 3
                                ? 'text-[clamp(1.35rem,1.6vw,2rem)]'
                                : 'text-[clamp(1.4rem,1.9vw,2.5rem)]';
                            const infoRowPadding = readyTimers.length === 3 ? 'py-3' : 'py-3';
                            const timerDisplayText = readyTimers.length === 3
                                ? formatFourDigitTimerDisplay(timer.timerState.timeRemaining)
                                : formatTimerDisplay(timer.timerState.timeRemaining);
                            const extraTimeDisplay = readyTimers.length === 3
                                ? formatFourDigitTimerDisplay(timer.timerState.extraTimeRemaining)
                                : formatTimerDisplay(timer.timerState.extraTimeRemaining);

                            if (readyTimers.length >= 2) {
                                return (
                                    <section
                                        key={timer.id}
                                        className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white/95 p-5 pt-14 shadow-sm max-sm:h-[calc(100dvh-10rem)] max-sm:min-h-[31rem] max-sm:p-4 max-sm:pt-12"
                                        aria-label={`Timer ${index + 1}`}
                                    >
                                        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 justify-center">
                                            <div className={`${tabClasses} ${accentClasses.chip} text-center font-bold uppercase tracking-[0.06em] ${accentClasses.text} shadow-sm`}>
                                                Exam {index + 1}
                                            </div>
                                        </div>

                                        <FitToBox>
                                            {selectedTimerPaper.isListening ? (
                                                <div className="flex flex-1 items-center justify-center text-center">
                                                    <div className={`${listeningIconClasses} leading-none`} aria-label="Listening test">
                                                        {'\u{1F3A7}'}
                                                    </div>
                                                </div>
                                            ) : isExtraTimeExpanded && timer.extraTimePercent > 0 && officialTimeUp ? (
                                                <div className={`flex flex-1 flex-col justify-center ${readyTimers.length === 3 ? 'pt-3' : ''}`}>
                                                    <div className={`text-center text-[clamp(1.2rem,1.5vw,2rem)] font-semibold uppercase tracking-[0.08em] ${accentClasses.text}`}>
                                                        {timer.timerState.phase === 'complete' ? 'Extra Time Finished' : 'Extra Time Remaining'}
                                                    </div>
                                                    <div className={`mt-4 text-center font-mono ${readyTimers.length === 3 ? 'text-[clamp(5.25rem,7.8vw,9.2rem)]' : 'text-[clamp(5.75rem,9vw,12rem)]'} font-bold leading-none tracking-[0.04em] text-slate-900`}>
                                                        {extraTimeDisplay}
                                                    </div>
                                                    <div className={`${progressClasses} overflow-hidden rounded-full border-2 ${accentClasses.border} bg-white`}>
                                                        <div
                                                            className={`h-full rounded-full ${accentClasses.bg} transition-all duration-1000 ease-linear`}
                                                            style={{ width: `${extraProgressPercentage}%` }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleMultiExtraTimeExpanded(timer.id)}
                                                        className={`absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border ${accentClasses.border} bg-white/90 ${accentClasses.text} shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                        aria-label="Shrink extra time timer"
                                                        title="Shrink extra time timer"
                                                    >
                                                        <ExpandToggleIcon collapsed size={17} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`flex flex-1 flex-col justify-center ${readyTimers.length === 3 ? 'pt-6' : ''}`}>
                                                    <div className={`text-center ${officialTimeUp ? completeTextClasses : timerTextClasses} font-bold leading-none tracking-[0.04em] text-slate-900 ${officialTimeUp ? 'font-sans whitespace-nowrap text-red-500' : 'font-mono'}`}>
                                                        {officialTimeUp ? "Time's Up!" : timerDisplayText}
                                                    </div>

                                                    {timer.extraTimePercent > 0 && officialTimeUp && (
                                                        <div className={`relative mx-auto mt-4 w-fit min-w-[18rem] rounded-lg border ${accentClasses.border} ${accentClasses.chip} px-14 py-2 text-center`}>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleMultiExtraTimeExpanded(timer.id)}
                                                                className={`absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border ${accentClasses.border} bg-white/90 ${accentClasses.text} shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                                aria-label="Enlarge extra time timer"
                                                                title="Enlarge extra time timer"
                                                            >
                                                                <ExpandToggleIcon size={15} />
                                                            </button>
                                                            <div className={`text-center text-sm font-semibold uppercase tracking-[0.08em] ${accentClasses.text}`}>
                                                                {timer.timerState.phase === 'complete' ? 'Extra Time Finished' : 'Extra Time Remaining'}
                                                            </div>
                                                            <div className="font-mono text-3xl font-bold leading-none text-slate-900">
                                                                {extraTimeDisplay}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={`${progressClasses} overflow-hidden rounded-full border-2 ${accentClasses.border} bg-white`}>
                                                        <div
                                                            className={`h-full rounded-full ${accentClasses.bg} transition-all duration-1000 ease-linear`}
                                                            style={{ width: `${progressPercentage}%` }}
                                                        />
                                                    </div>

                                                    <div className={timeRowClasses}>
                                                        <div className={readyTimers.length === 3 ? 'grid grid-cols-[max-content_max-content] items-center justify-center gap-x-3' : undefined}>
                                                            <span className={`${timeLabelClasses} font-semibold uppercase tracking-[0.08em] ${accentClasses.text}`}>
                                                                {readyTimers.length === 3 ? (
                                                                    <>
                                                                        Start<br />
                                                                        Time:
                                                                    </>
                                                                ) : (
                                                                    'Start Time:'
                                                                )}
                                                            </span>
                                                            <span className={`font-mono ${timeValueClasses} font-bold leading-none text-slate-900`}>
                                                                {startTime}
                                                            </span>
                                                        </div>
                                                        <div className="h-10 w-px bg-slate-300" aria-hidden="true" />
                                                        <div className={readyTimers.length === 3 ? 'grid grid-cols-[max-content_max-content] items-center justify-center gap-x-3' : undefined}>
                                                            <span className={`${timeLabelClasses} font-semibold uppercase tracking-[0.08em] ${accentClasses.text}`}>
                                                                {readyTimers.length === 3 ? (
                                                                    <>
                                                                        Finish<br />
                                                                        Time:
                                                                    </>
                                                                ) : (
                                                                    'Finish Time:'
                                                                )}
                                                            </span>
                                                            <span className={`font-mono ${timeValueClasses} font-bold leading-none text-slate-900`}>
                                                                {finishTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`grid ${infoGridClasses} ${infoPanelHeightClasses} flex-none content-start border-t border-slate-300`}>
                                                <div className={`border-b border-slate-200 ${infoRowPadding} ${infoLabelClasses} font-semibold uppercase tracking-[0.08em] ${accentClasses.text}`}>
                                                    Exam:
                                                </div>
                                                <div className={`border-b border-slate-200 ${infoRowPadding} ${infoValueClasses} font-semibold leading-tight text-slate-900`}>
                                                    {selectedTimerExam.name}
                                                </div>

                                                <div className={`border-b border-slate-200 ${infoRowPadding} ${infoLabelClasses} font-semibold uppercase tracking-[0.08em] ${accentClasses.text}`}>
                                                    Paper:
                                                </div>
                                                <div className={`border-b border-slate-200 ${infoRowPadding} ${infoValueClasses} font-semibold leading-tight text-slate-900`}>
                                                    {selectedTimerPaper.name}
                                                </div>

                                                <div className={`${infoRowPadding} ${infoLabelClasses} font-semibold uppercase tracking-[0.08em] ${accentClasses.text}`}>
                                                    Duration:
                                                </div>
                                                <div className={`${infoRowPadding} ${infoValueClasses} font-semibold leading-tight text-slate-900`}>
                                                    <span>
                                                        {formatDuration(adjustedTimerPaper.durationMinutes)}{timer.extraTimePercent > 0 ? '*' : ''}
                                                    </span>
                                                    {timer.extraTimePercent > 0 && (
                                                        <div className={`mt-1 text-[clamp(0.8rem,0.9vw,1.05rem)] font-semibold leading-tight ${accentClasses.text}`}>
                                                            * Some candidates have {timer.extraTimePercent}% extra time
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </FitToBox>
                                    </section>
                                );
                            }

                            return (
                                <section
                                    key={timer.id}
                                    className="flex min-h-[28rem] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                                    aria-label={`Timer ${index + 1}`}
                                >
                                    <div className="grid flex-none grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-200 pb-3">
                                        <div className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1">
                                            <div className="text-[clamp(0.95rem,1vw,1.15rem)] font-semibold uppercase tracking-[0.08em] text-blue-700">
                                                Exam:
                                            </div>
                                            <h2 className="min-w-0 text-[clamp(1.35rem,1.8vw,2.35rem)] font-bold leading-tight text-slate-800">
                                                {selectedTimerExam.name}
                                            </h2>

                                            <div className="text-[clamp(0.95rem,1vw,1.15rem)] font-semibold uppercase tracking-[0.08em] text-blue-700">
                                                Paper:
                                            </div>
                                            <div className="min-w-0 text-[clamp(1.15rem,1.45vw,1.9rem)] font-semibold leading-tight text-slate-700">
                                                {selectedTimerPaper.name}
                                            </div>

                                            <div className="text-[clamp(0.95rem,1vw,1.15rem)] font-semibold uppercase tracking-[0.08em] text-blue-700">
                                                Duration:
                                            </div>
                                            <div className="text-[clamp(1.3rem,1.7vw,2.2rem)] font-bold leading-tight text-slate-800">
                                                <span>
                                                    {formatDuration(adjustedTimerPaper.durationMinutes)}{timer.extraTimePercent > 0 ? '*' : ''}
                                                </span>
                                                {timer.extraTimePercent > 0 && (
                                                    <div className="mt-1 text-sm font-semibold leading-tight text-blue-700">
                                                        * Some candidates have {timer.extraTimePercent}% extra time
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid shrink-0 grid-cols-[max-content_max-content] items-baseline gap-x-3 gap-y-1">
                                            <div className="text-[clamp(0.95rem,1vw,1.15rem)] font-semibold uppercase tracking-[0.08em] text-blue-700">
                                                Start:
                                            </div>
                                            <div className="font-mono text-[clamp(1.4rem,1.75vw,2.4rem)] font-bold leading-none text-slate-800">
                                                {startTime}
                                            </div>
                                            <div className="text-[clamp(0.95rem,1vw,1.15rem)] font-semibold uppercase tracking-[0.08em] text-blue-700">
                                                Finish:
                                            </div>
                                            <div className="font-mono text-[clamp(1.4rem,1.75vw,2.4rem)] font-bold leading-none text-slate-800">
                                                {finishTime}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedTimerPaper.isListening ? (
                                        <div className="flex flex-1 items-center justify-center text-center">
                                            <div className="text-[clamp(2.25rem,4vw,5rem)] font-bold text-slate-700">
                                                {'\u{1F3A7} Listening Test'}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex min-h-0 flex-1 items-center justify-center py-2">
                                                <TimerDisplay
                                                    timeRemaining={isExtraTimeExpanded && timer.extraTimePercent > 0 && officialTimeUp ? timer.timerState.extraTimeRemaining : timer.timerState.timeRemaining}
                                                    totalTime={isExtraTimeExpanded && timer.extraTimePercent > 0 && officialTimeUp ? totalExtraTimerSeconds : totalTimerSeconds}
                                                    isFullScreen={true}
                                                    isComplete={officialTimeUp && !isExtraTimeExpanded}
                                                    className="max-h-full"
                                                >
                                                    {timer.extraTimePercent > 0 && officialTimeUp && (
                                                        <div className="relative mb-3 min-w-[18rem] rounded-lg border border-blue-300 bg-blue-50 px-14 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleMultiExtraTimeExpanded(timer.id)}
                                                                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-300 bg-white/90 text-blue-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                aria-label={isExtraTimeExpanded ? 'Shrink extra time timer' : 'Enlarge extra time timer'}
                                                                title={isExtraTimeExpanded ? 'Shrink extra time timer' : 'Enlarge extra time timer'}
                                                            >
                                                                <ExpandToggleIcon collapsed={isExtraTimeExpanded} size={15} />
                                                            </button>
                                                            <div className="text-center text-sm font-semibold uppercase tracking-[0.08em] text-blue-700">
                                                                {timer.timerState.phase === 'complete' ? 'Extra Time Finished' : 'Extra Time Remaining'}
                                                            </div>
                                                            <div className="font-mono text-3xl font-bold leading-none text-slate-900">
                                                                {formatTimerDisplay(timer.timerState.extraTimeRemaining)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <TimerControls
                                                        onStart={() => handleStartMultiTimer(timer.id)}
                                                        onPause={() => handleStartMultiTimer(timer.id)}
                                                        onReset={() => handleResetMultiTimer(timer.id)}
                                                        isRunning={timer.timerState.isRunning}
                                                        isFullScreen={true}
                                                        className="shrink-0"
                                                    />
                                                </TimerDisplay>
                                            </div>
                                        </>
                                    )}
                                </section>
                            );
                        })}
                    </main>

                    <div className="flex h-[clamp(6rem,10vh,7.5rem)] flex-none items-center justify-center gap-[clamp(0.75rem,2vmin,2rem)] px-4 py-4 max-sm:sticky max-sm:bottom-0 max-sm:z-20 max-sm:h-20 max-sm:bg-slate-100/95 max-sm:py-2 max-sm:backdrop-blur sm:px-6">
                        <button
                            type="button"
                            onClick={handleToggleAllMultiTimers}
                            className={`inline-flex h-[clamp(2.75rem,7vmin,5rem)] w-[clamp(2.75rem,7vmin,5rem)] items-center justify-center rounded-lg text-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                hasRunningMultiTimer
                                    ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                                    : 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500'
                            }`}
                            aria-label={hasRunningMultiTimer ? 'Pause all timers' : 'Start all timers'}
                            title={hasRunningMultiTimer ? 'Pause all timers' : 'Start all timers'}
                        >
                            {hasRunningMultiTimer ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
                        </button>
                        <button
                            type="button"
                            onClick={handleResetAllMultiTimers}
                            className="inline-flex h-[clamp(2.75rem,7vmin,5rem)] w-[clamp(2.75rem,7vmin,5rem)] items-center justify-center rounded-lg bg-slate-500 text-white shadow-md transition-colors hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            aria-label="Reset all timers"
                            title="Reset all timers"
                        >
                            <ResetIcon size={24} />
                        </button>
                    </div>
                </div>
            );
        }

        const singleOfficialTimeUp = timerState.phase === 'extra' || timerState.phase === 'complete';
        const singleExtraTotalSeconds = selectedPaper ? getExtraTimeSeconds(selectedPaper, extraTimePercent) : 0;
        const isSingleWelcomePage = isWelcomePagePaper(selectedPaper);

        return (
            <div 
                className="h-screen h-[100dvh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative flex flex-col overflow-hidden max-sm:h-auto max-sm:min-h-[100dvh] max-sm:overflow-y-auto"
                role="application"
                aria-label="Exam timer screen display"
            >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
                </div>

                {!isSingleWelcomePage && (
                    <Header
                        isFullScreen={true}
                        className="relative z-10"
                        onBackToHome={handleBackToHomeScreen}
                        onToggleFullscreen={handleToggleBrowserFullScreen}
                        isFullscreenActive={isBrowserFullScreen}
                        centreNumber={CENTRE_NUMBER}
                    />
                )}

                {isSingleWelcomePage && selectedExam ? (
                    <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
                        <WelcomePageDisplay
                            examName={selectedExam.name}
                            centreNumber={CENTRE_NUMBER}
                            onNext={handleNextSinglePaper}
                            onBackToHome={handleBackToHomeScreen}
                            onToggleFullscreen={handleToggleBrowserFullScreen}
                            canGoNext={canGoToNextSinglePaper}
                            isFullscreenActive={isBrowserFullScreen}
                        />
                    </main>
                ) : (
                <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-y-auto max-sm:overflow-visible md:flex-row md:overflow-hidden">
                {/* Left Panel - Exam Information */}
                <section 
                    className="w-full md:w-1/2 bg-gradient-to-br from-white via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col justify-center relative overflow-y-auto min-h-[14rem] max-sm:min-h-[16rem] md:min-h-0"
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
                            selectedPaper={displaySelectedPaper}
                            timerState={timerState}
                            isFullScreen={true}
                            extraTimePercent={selectedPaper.isListening ? 0 : extraTimePercent}
                        />
                    ) : (
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-600 mb-4">
                                No Exam Selected
                            </div>
                            <div className="text-xl text-slate-500">
                                Go back to setup screen to select an exam
                            </div>
                        </div>
                    )}
                </section>

                {/* Right Panel - Timer Display and Controls */}
                <section 
                    className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center relative min-h-0 max-sm:min-h-[calc(100dvh-18rem)]"
                    aria-label="Timer display and controls"
                >
                    {selectedExam && selectedPaper && (
                        <PaperNavigationControls
                            onPrevious={handlePreviousSinglePaper}
                            onNext={handleNextSinglePaper}
                            canGoPrevious={canGoToPreviousSinglePaper}
                            canGoNext={canGoToNextSinglePaper}
                            className="pointer-events-none absolute inset-x-[clamp(1rem,3vmin,2rem)] bottom-[clamp(1rem,3vmin,2rem)] z-20 justify-between"
                        />
                    )}
                    {selectedExam && selectedPaper ? (
                        selectedPaper.isListening ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-10 p-8 text-center">
                                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 mb-6">
                                    {'\u{1F3A7} Listening Test'}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-3 lg:p-4">
                                {/* Circular Timer Display - uses the available column space */}
                                <div className="min-h-0 h-full w-full flex items-center justify-center">
                                    <TimerDisplay 
                                        timeRemaining={isSingleExtraTimeExpanded && singleOfficialTimeUp ? timerState.extraTimeRemaining : timerState.timeRemaining}
                                        totalTime={isSingleExtraTimeExpanded && singleOfficialTimeUp ? singleExtraTotalSeconds : (selectedPaper ? getOfficialDurationSeconds(selectedPaper) : 0)}
                                        isFullScreen={true}
                                        isComplete={singleOfficialTimeUp && (!isSingleExtraTimeExpanded || timerState.phase === 'complete')}
                                        completeLabel={isSingleExtraTimeExpanded && timerState.phase === 'complete' ? 'Extra Time Finished' : "Time's Up!"}
                                        className="max-h-full"
                                    >
                                        {extraTimePercent > 0 && singleOfficialTimeUp && !isSingleExtraTimeExpanded && (
                                            <div className="relative mb-3 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSingleExtraTimeExpanded(isExpanded => !isExpanded)}
                                                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-300 bg-white/90 text-blue-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    aria-label={isSingleExtraTimeExpanded ? 'Shrink extra time timer' : 'Enlarge extra time timer'}
                                                    title={isSingleExtraTimeExpanded ? 'Shrink extra time timer' : 'Enlarge extra time timer'}
                                                >
                                                    <ExpandToggleIcon collapsed={isSingleExtraTimeExpanded} size={15} />
                                                </button>
                                                <div className="px-8 text-xs font-semibold uppercase tracking-[0.04em] leading-tight text-blue-700 sm:text-sm">
                                                    {timerState.phase === 'complete' ? 'Extra Time Finished' : 'Extra Time Remaining'}
                                                </div>
                                                <div className="font-mono text-3xl font-bold leading-none text-slate-900">
                                                    {formatTimerDisplay(timerState.extraTimeRemaining)}
                                                </div>
                                            </div>
                                        )}
                                        {extraTimePercent > 0 && timerState.phase === 'extra' && isSingleExtraTimeExpanded && (
                                            <>
                                                <div className="absolute left-1/2 top-[calc(12%+2cm)] -translate-x-1/2 whitespace-nowrap text-center text-[clamp(1.2rem,1.7vw,2.2rem)] font-semibold uppercase tracking-[0.08em] text-blue-700">
                                                    Extra Time Remaining
                                                </div>
                                            </>
                                        )}
                                        {extraTimePercent > 0 && singleOfficialTimeUp && isSingleExtraTimeExpanded && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSingleExtraTimeExpanded(false)}
                                                    className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-300 bg-white/90 text-blue-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    aria-label="Shrink extra time timer"
                                                    title="Shrink extra time timer"
                                                >
                                                    <ExpandToggleIcon collapsed size={17} />
                                                </button>
                                            </>
                                        )}
                                        <TimerControls
                                            onStart={handleStartTimer}
                                            onPause={handleStartTimer}
                                            onReset={handleResetTimer}
                                            isRunning={timerState.isRunning}
                                            isDisabled={false}
                                            isFullScreen={true}
                                        />
                                    </TimerDisplay>
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
                )}
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
            
            <Header centreNumber={CENTRE_NUMBER} />
            
            {/* Main Content */}
            <main id="main-content" className="max-w-4xl mx-auto p-3 sm:p-6">
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-semibold text-slate-gray mb-4">
                            Exam Timer Setup
                        </h2>


                    </div>

                    {/* Exam Selection */}
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <div className="block text-sm font-medium text-slate-700 mb-2">
                                Timer Mode
                            </div>
                            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setTimerMode('single')}
                                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        timerMode === 'single'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-slate-600 hover:bg-white/70'
                                    }`}
                                >
                                    Single Timer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTimerMode('multiple')}
                                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        timerMode === 'multiple'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-slate-600 hover:bg-white/70'
                                    }`}
                                >
                                    Multiple Timers
                                </button>
                            </div>
                        </div>

                        {timerMode === 'single' ? (
                            <>
                                <div>
                                    <label htmlFor="exam-select" className="block text-sm font-medium text-slate-700 mb-2">
                                        Select Exam
                                    </label>
                                    <Dropdown
                                        id="exam-select"
                                        options={directExamOptions}
                                        optionGroups={examOptionGroups}
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

                                <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-3 max-sm:grid-cols-1">
                                    <label className={`inline-flex items-center gap-3 text-sm font-semibold ${selectedPaper && !selectedPaper.isListening ? 'text-slate-700' : 'text-slate-400'}`}>
                                        <input
                                            type="checkbox"
                                            checked={extraTimePercent > 0 && !!selectedPaper && !selectedPaper.isListening}
                                            onChange={(event) => handleExtraTimeToggle(event.target.checked)}
                                            disabled={!selectedPaper || selectedPaper.isListening}
                                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        Do any candidates have extra time?
                                    </label>

                                    <div className="min-h-[3.125rem]">
                                        {extraTimePercent > 0 && selectedPaper && !selectedPaper.isListening && (
                                        <Dropdown
                                            id="extra-time-select"
                                            options={extraTimeOptionLabels}
                                            value={getExtraTimeLabel(extraTimePercent)}
                                            onChange={handleExtraTimeSelect}
                                            disabled={!selectedPaper || selectedPaper.isListening}
                                            placeholder="Choose extra time..."
                                            aria-label="Select extra time allowance"
                                        />
                                        )}
                                    </div>
                                </div>

                                {/* Exam Information Preview */}
                                {selectedExam && selectedPaper && !isWelcomePagePaper(selectedPaper) && (
                                    <div className="mt-6 sm:mt-8 space-y-4">
                                        <ExamInfoDisplay
                                            selectedExam={selectedExam}
                                            selectedPaper={displaySelectedPaper}
                                            timerState={timerState}
                                            isFullScreen={false}
                                            showTimes={false}
                                            extraTimePercent={selectedPaper.isListening ? 0 : extraTimePercent}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                {multiTimers.map((timer, index) => {
                                    const multiPaperOptions = timer.selectedExam
                                        ? timer.selectedExam.papers.map(paper => paper.name)
                                        : [];

                                    return (
                                        <section
                                            key={timer.id}
                                            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                            aria-label={`Timer ${index + 1} setup`}
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <h3 className="text-base font-semibold text-slate-800">
                                                    Timer {index + 1}
                                                </h3>
                                                {multiTimers.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMultiTimer(timer.id)}
                                                        className="rounded-md px-3 py-1 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label htmlFor={`multi-exam-${timer.id}`} className="block text-sm font-medium text-slate-700 mb-2">
                                                        Select Exam
                                                    </label>
                                                    <Dropdown
                                                        id={`multi-exam-${timer.id}`}
                                                        options={directExamOptions}
                                                        optionGroups={examOptionGroups}
                                                        value={timer.selectedExam?.name || ''}
                                                        onChange={(examName) => handleMultiExamSelect(timer.id, examName)}
                                                        placeholder="Choose an exam..."
                                                        aria-label={`Select exam for timer ${index + 1}`}
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`multi-paper-${timer.id}`} className="block text-sm font-medium text-slate-700 mb-2">
                                                        Select Paper
                                                    </label>
                                                    <Dropdown
                                                        id={`multi-paper-${timer.id}`}
                                                        options={multiPaperOptions}
                                                        value={timer.selectedPaper?.name || ''}
                                                        onChange={(paperName) => handleMultiPaperSelect(timer.id, paperName)}
                                                        disabled={!timer.selectedExam}
                                                        placeholder={timer.selectedExam ? "Choose a paper..." : "Select an exam first"}
                                                        aria-label={`Select paper for timer ${index + 1}`}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-3 max-sm:grid-cols-1 md:col-span-2">
                                                    <label className={`inline-flex items-center gap-3 text-sm font-semibold ${timer.selectedPaper ? 'text-slate-700' : 'text-slate-400'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={timer.extraTimePercent > 0}
                                                            onChange={(event) => handleMultiExtraTimeToggle(timer.id, event.target.checked)}
                                                            disabled={!timer.selectedPaper}
                                                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                        Do any candidates have extra time?
                                                    </label>

                                                    <div className="min-h-[3.125rem]">
                                                        {timer.extraTimePercent > 0 && (
                                                        <Dropdown
                                                            id={`multi-extra-time-${timer.id}`}
                                                            options={extraTimeOptionLabels}
                                                            value={getExtraTimeLabel(timer.extraTimePercent)}
                                                            onChange={(extraTimeLabel) => handleMultiExtraTimeSelect(timer.id, extraTimeLabel)}
                                                            disabled={!timer.selectedPaper}
                                                            placeholder="Choose extra time..."
                                                            aria-label={`Select extra time allowance for timer ${index + 1}`}
                                                        />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </section>
                                    );
                                })}

                                {multiTimers.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={handleAddMultiTimer}
                                        className="w-full rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        + Add Timer
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleOpenTimerScreen}
                                disabled={!canOpenTimerScreen}
                                className="w-full inline-flex items-center justify-center px-4 py-3 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Go to timer screen"
                                title="Go to timer screen"
                            >
                                Go to Timer Screen
                            </button>
                        </div>
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

