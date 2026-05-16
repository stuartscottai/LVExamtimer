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
    <div className="border-l border-white/70 pl-6">
      <div className="text-sm font-semibold uppercase tracking-[0.06em] text-white/90">
        Centre Number:
      </div>
      <div className="text-3xl font-bold leading-tight tracking-[0.02em]">
        {centreNumber}
      </div>
    </div>
  ) : null;

  if (isFullScreen) {
    return (
      <header className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 shadow-xl ${className}`}>
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <LenguasVivasLogo size={140} />
            {centreNumberBlock}
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/70"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/70"
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
    <header className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-6 shadow-xl ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Lenguas Vivas Logo */}
          <LenguasVivasLogo size={160} />
          {centreNumberBlock}
        </div>
        
        {/* Title */}
        <div className="text-right">
          <h1 className="text-3xl font-bold tracking-tight">
            Cambridge Exam Timer
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
