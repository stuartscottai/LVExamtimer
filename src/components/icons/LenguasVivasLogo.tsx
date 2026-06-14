import React from 'react';

interface LenguasVivasLogoProps {
  size?: number;
  className?: string;
}

const LenguasVivasLogo: React.FC<LenguasVivasLogoProps> = ({ size = 200, className = '' }) => {
  const markSize = size * 0.3;
  const primarySize = size * 0.15;
  const secondarySize = size * 0.105;

  return (
    <div className={`flex items-center gap-[0.11em] text-white ${className}`} style={{ fontSize: `${size}px` }}>
      {/* Globe Icon */}
      <div className="relative">
        <svg
          width={markSize}
          height={markSize}
          viewBox="0 0 100 100"
          fill="none"
          className="text-current"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          {/* Vertical lines */}
          <path
            d="M40 8 C27 25, 27 75, 40 92"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M60 8 C73 25, 73 75, 60 92"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M50 5 L50 95"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Horizontal lines */}
          <path
            d="M7 50 L93 50"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9 33 C27 27, 73 27, 91 33"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M9 67 C27 73, 73 73, 91 67"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="text-current uppercase leading-[1.06]">
        <div
          className="font-extrabold tracking-[0.12em]"
          style={{ fontSize: `${primarySize}px` }}
        >
          Lenguas Vivas
        </div>
        <div
          className="mt-[0.16em] font-light tracking-[0.16em]"
          style={{ fontSize: `${secondarySize}px` }}
        >
          Your Cambridge
        </div>
        <div
          className="mt-[0.14em] font-light tracking-[0.14em]"
          style={{ fontSize: `${secondarySize}px` }}
        >
          <span className="font-extrabold">Exams</span> Centre
        </div>
      </div>
    </div>
  );
};

export default LenguasVivasLogo;
