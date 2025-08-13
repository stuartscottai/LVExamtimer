import React, { useState, useEffect } from 'react';
import { FullScreenIcon } from './icons';

interface FullScreenButtonProps {
  onToggleFullScreen: (isFullScreen: boolean) => void;
  className?: string;
}

const FullScreenButton: React.FC<FullScreenButtonProps> = ({
  onToggleFullScreen,
  className = ''
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if Fullscreen API is supported
  useEffect(() => {
    const checkSupport = () => {
      return !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      );
    };

    setIsSupported(checkSupport());
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      setIsFullScreen(isCurrentlyFullScreen);
      onToggleFullScreen(isCurrentlyFullScreen);
    };

    // Add event listeners for different browsers
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, [onToggleFullScreen]);

  // Toggle fullscreen function
  const toggleFullScreen = async () => {
    if (!isSupported) {
      alert('Full-screen mode is not supported in this browser.');
      return;
    }

    try {
      if (isFullScreen) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } else {
        // Enter fullscreen
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      alert('Failed to toggle full-screen mode. Please try again.');
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const buttonClasses = `
    inline-flex items-center justify-center
    px-4 py-2 text-sm font-medium rounded-lg
    bg-blue-500 hover:bg-blue-600 focus:bg-blue-600
    text-white transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <button
      onClick={toggleFullScreen}
      className={buttonClasses}
      aria-label={isFullScreen ? 'Exit full-screen mode' : 'Enter full-screen mode'}
      title={isFullScreen ? 'Exit full-screen mode' : 'Enter full-screen mode'}
    >
      <FullScreenIcon size={16} className="mr-2" />
      {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
    </button>
  );
};

export default FullScreenButton;