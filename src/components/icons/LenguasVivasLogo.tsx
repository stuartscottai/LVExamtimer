import React from 'react';

interface LenguasVivasLogoProps {
  size?: number;
  className?: string;
}

const LenguasVivasLogo: React.FC<LenguasVivasLogoProps> = ({ size = 200, className = '' }) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Globe Icon */}
      <div className="relative">
        <svg
          width={size * 0.3}
          height={size * 0.3}
          viewBox="0 0 100 100"
          fill="none"
          className="text-white"
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
            d="M50 5 C50 5, 30 25, 30 50 C30 75, 50 95, 50 95"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M50 5 C50 5, 70 25, 70 50 C70 75, 50 95, 50 95"
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
            d="M5 50 L95 50"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M10 30 L90 30"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M10 70 L90 70"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="text-white">
        <div className="text-2xl font-bold tracking-wider">LENGUAS VIVAS</div>
        <div className="text-sm font-medium opacity-90 tracking-wide">YOUR CAMBRIDGE</div>
        <div className="text-lg font-bold tracking-wider">EXAMS CENTRE</div>
      </div>
    </div>
  );
};

export default LenguasVivasLogo;