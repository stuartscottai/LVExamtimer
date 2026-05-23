import React from 'react';
import { LenguasVivasLogo } from './icons';

interface HeaderProps {
  className?: string;
  isFullScreen?: boolean;
  onBackToHome?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreenActive?: boolean;
  centreNumber?: string;
}

const Header: React.FC<HeaderProps> = ({
  className = '',
  isFullScreen = false,
  onBackToHome,
  onToggleFullscreen,
  isFullscreenActive = false,
  centreNumber
}) => {
  const centreNumberBlock = centreNumber ? (
    <div className="border-l border-white/70 pl-3 sm:pl-6">
      <div className="text-xs font-semibold uppercase tracking-[0.06em] text-white/90 sm:text-sm">
        Centre Number:
      </div>
      <div className="text-2xl font-bold leading-tight tracking-[0.02em] sm:text-3xl">
        {centreNumber}
      </div>
    </div>
  ) : null;

  if (isFullScreen) {
    return (
      <header className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-2 shadow-xl sm:px-6 sm:py-4 lg:px-8 ${className}`}>
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <span className="sm:hidden">
              <LenguasVivasLogo size={88} />
            </span>
            <span className="hidden sm:inline">
              <LenguasVivasLogo size={140} />
            </span>
            {centreNumberBlock}
          </div>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/70 sm:h-11 sm:w-11"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/70 sm:h-11 sm:w-11"
              aria-label={isFullscreenActive ? 'Exit full-screen mode' : 'Enter full-screen mode'}
              title={isFullscreenActive ? 'Exit full-screen mode' : 'Enter full-screen mode'}
            >
              {isFullscreenActive ? (
                <span className="text-xl leading-none font-bold">{'\u2715'}</span>
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
        </div>
      </header>
    );
  }

  return (
    <header className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-4 shadow-xl sm:px-6 sm:py-6 ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Lenguas Vivas Logo */}
          <span className="sm:hidden">
            <LenguasVivasLogo size={92} />
          </span>
          <span className="hidden sm:inline">
            <LenguasVivasLogo size={160} />
          </span>
          {centreNumberBlock}
        </div>
        
        {/* Title */}
        <div className="hidden text-right sm:block">
          <h1 className="text-3xl font-bold tracking-tight">
            Cambridge Exam Timer
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
