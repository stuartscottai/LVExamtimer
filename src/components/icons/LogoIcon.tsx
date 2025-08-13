import React from 'react';

interface LogoIconProps {
  size?: number;
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      {/* Cambridge-style academic logo with clock elements */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="16"
        cy="16"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Clock hands */}
      <line
        x1="16"
        y1="16"
        x2="16"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="16"
        x2="20"
        y2="16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Academic elements */}
      <rect
        x="6"
        y="6"
        width="4"
        height="2"
        fill="currentColor"
      />
      <rect
        x="22"
        y="6"
        width="4"
        height="2"
        fill="currentColor"
      />
    </svg>
  );
};

export default LogoIcon;