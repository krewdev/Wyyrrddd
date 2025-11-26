import React, { useEffect, useState } from 'react';

interface ScrollIndicatorProps {
  itemCount: number;
  currentIndex: number;
  onIndicatorClick?: (index: number) => void;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ 
  itemCount, 
  currentIndex,
  onIndicatorClick 
}) => {
  const maxDots = 8;
  const dots = Math.min(itemCount, maxDots);

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {/* Left Arrow */}
      {currentIndex > 0 && (
        <div className="text-blue-500 dark:text-blue-400 animate-pulse">
          ←
        </div>
      )}

      {/* Dot Indicators */}
      <div className="flex items-center gap-2 mx-auto">
        {Array.from({ length: dots }).map((_, index) => {
          const isActive = index === currentIndex;
          const isNear = Math.abs(index - currentIndex) <= 2;
          
          return (
            <button
              key={index}
              onClick={() => onIndicatorClick?.(index)}
              className={`transition-all duration-300 rounded-full ${
                isActive
                  ? 'w-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50'
                  : isNear
                  ? 'w-2 h-2 bg-slate-400 dark:bg-slate-600 hover:bg-blue-400 dark:hover:bg-blue-500'
                  : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700'
              }`}
              style={{
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          );
        })}
      </div>

      {/* Right Arrow */}
      {currentIndex < itemCount - 1 && (
        <div className="text-blue-500 dark:text-blue-400 animate-pulse">
          →
        </div>
      )}
    </div>
  );
};

// Vertical scroll progress indicator
export const VerticalScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 shadow-lg shadow-blue-500/50"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

// Floating scroll hint
export const ScrollHint: React.FC<{ direction: 'horizontal' | 'vertical' }> = ({ direction }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 pointer-events-none z-40 animate-bounce">
      <div className="bg-blue-600/90 dark:bg-blue-500/90 text-white px-4 py-2 rounded-full shadow-lg shadow-blue-500/50 text-sm font-medium backdrop-blur-sm flex items-center gap-2">
        {direction === 'horizontal' ? (
          <>
            <span>Swipe</span>
            <span className="text-lg">←→</span>
          </>
        ) : (
          <>
            <span>Scroll</span>
            <span className="text-lg">↕</span>
          </>
        )}
      </div>
    </div>
  );
};




