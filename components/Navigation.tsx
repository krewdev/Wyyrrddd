import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, RadarIcon, UserIcon, CameraIcon } from './Icons';
import { TutorialTrigger } from './Tutorial';

interface NavigationProps {
  onShowTutorial?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onShowTutorial }) => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 group ${
      isActive 
        ? 'text-cyber-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' 
        : 'text-gray-600 hover:text-gray-300'
    }`;
  };

  return (
    <>
      {/* Tutorial trigger button */}
      {onShowTutorial && (
        <div className="fixed top-4 right-4 z-40">
          <TutorialTrigger showTutorial={onShowTutorial} />
        </div>
      )}

      <div className="fixed bottom-4 left-0 w-full z-50 px-4 pointer-events-none">
        <div className="max-w-xs mx-auto bg-cyber-panel/90 backdrop-blur-xl border border-cyber-dim/50 rounded-full h-16 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-around px-6 pointer-events-auto relative overflow-hidden">

          {/* Top highlight line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent"></div>

          <Link to="/" className={getLinkClass('/')}>
            <HomeIcon className="w-6 h-6" />
            <span className={`text-[10px] font-bold tracking-widest font-mono transition-all duration-300 ${location.pathname === '/' ? 'opacity-100' : 'opacity-0 -translate-y-2 absolute bottom-1'}`}>FEED</span>
          </Link>

          <div className="w-[1px] h-8 bg-cyber-dim/50"></div>

          {/* Camera Button - Central */}
          <Link to="/camera" className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 group ${location.pathname === '/camera' ? 'text-cyber-pink drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]' : 'text-gray-600 hover:text-gray-300'}`}>
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${location.pathname === '/camera' ? 'bg-cyber-pink/20 border-cyber-pink shadow-[0_0_15px_rgba(255,0,60,0.6)]' : 'border-gray-600 hover:border-gray-400'}`}>
              <CameraIcon className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold tracking-widest font-mono transition-all duration-300 ${location.pathname === '/camera' ? 'opacity-100' : 'opacity-0 -translate-y-2 absolute bottom-1'}`}>CAM</span>
          </Link>

          <div className="w-[1px] h-8 bg-cyber-dim/50"></div>

          <Link to="/radar" className={getLinkClass('/radar')}>
            <RadarIcon className="w-6 h-6" />
            <span className={`text-[10px] font-bold tracking-widest font-mono transition-all duration-300 ${location.pathname === '/radar' ? 'opacity-100' : 'opacity-0 -translate-y-2 absolute bottom-1'}`}>RADAR</span>
          </Link>

          <div className="w-[1px] h-8 bg-cyber-dim/50"></div>

          <Link to="/profile" className={getLinkClass('/profile')}>
            <UserIcon className="w-6 h-6" />
            <span className={`text-[10px] font-bold tracking-widest font-mono transition-all duration-300 ${location.pathname === '/profile' ? 'opacity-100' : 'opacity-0 -translate-y-2 absolute bottom-1'}`}>ID</span>
          </Link>

          <div className="w-[1px] h-8 bg-cyber-dim/50"></div>

          <Link to="/whitepaper" className={getLinkClass('/whitepaper')}>
            <div className="w-6 h-6 flex items-center justify-center border border-current rounded-sm text-[10px] font-bold font-mono">WP</div>
            <span className={`text-[10px] font-bold tracking-widest font-mono transition-all duration-300 ${location.pathname === '/whitepaper' ? 'opacity-100' : 'opacity-0 -translate-y-2 absolute bottom-1'}`}>DOCS</span>
          </Link>
        </div>
      </div>
    </>
  );
};