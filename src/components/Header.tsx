import React from 'react';
import { LenguasVivasLogo } from './icons';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-6 shadow-xl ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Lenguas Vivas Logo */}
        <LenguasVivasLogo size={160} />
        
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