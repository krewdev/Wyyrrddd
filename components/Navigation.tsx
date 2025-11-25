import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, RadarIcon, UserIcon, CameraIcon, BleedingEdgeIcon } from './Icons';
import { TutorialTrigger } from './Tutorial';

interface NavigationProps {
  onShowTutorial?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onShowTutorial }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Feed' },
    { path: '/radar', icon: RadarIcon, label: 'Radar' },
    { path: '/camera', icon: CameraIcon, label: 'Camera', isCenter: true },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
    { path: '/whitepaper', icon: () => <div className="w-5 h-5 flex items-center justify-center border border-current rounded text-xs font-semibold">WP</div>, label: 'Docs' },
  ];

  return (
    <>
      {/* Tutorial trigger button */}
      {onShowTutorial && (
        <div className="fixed top-4 right-4 z-40">
          <TutorialTrigger showTutorial={onShowTutorial} />
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Glow effect at top of nav */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 shadow-2xl shadow-blue-500/10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-around px-4 py-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:scale-110'
                    } ${item.isCenter ? 'relative' : ''}`}
                  >
                    {/* Active indicator glow */}
                    {isActive && !item.isCenter && (
                      <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-sm" />
                    )}
                    
                    {item.isCenter ? (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-2xl shadow-blue-500/60 scale-110'
                          : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-400 hover:shadow-lg hover:shadow-slate-500/30'
                      }`}>
                        {/* Center button glow ring */}
                        {isActive && (
                          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-40 animate-pulse" />
                        )}
                        <Icon className="w-6 h-6 relative z-10" />
                      </div>
                    ) : (
                      <Icon className="w-6 h-6 relative z-10" />
                    )}
                    <span className={`text-[10px] font-medium transition-all relative z-10 ${
                      isActive ? 'opacity-100 font-semibold' : 'opacity-70'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
