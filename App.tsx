import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Navigation } from './components/Navigation';
import { Feed } from './components/Feed';
import { Radar } from './components/Radar';
import { Profile } from './components/Profile';
import { Camera } from './components/Camera';
import { Tutorial } from './components/Tutorial';
import { Whitepaper } from './components/Whitepaper';
import { AmbientParticles } from './components/AmbientParticles';
import { PerplexitySearch } from './components/PerplexitySearch';

// Lazy load the heavy bleeding edge component
const BleedingEdge = lazy(() => import('./components/BleedingEdge'));

const App: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const tutorialSeen = localStorage.getItem('wyyrrddd-tutorial-seen');
    if (!tutorialSeen) {
      // Delay tutorial to let app load first
      setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('wyyrrddd-tutorial-seen', 'true');
    setHasSeenTutorial(true);
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
          {/* Ambient Particles Effect */}
          <AmbientParticles />
          
          <div className="max-w-md mx-auto min-h-screen bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/radar" element={<Radar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/camera" element={<Camera />} />
                <Route path="/whitepaper" element={<Whitepaper />} />
                <Route 
                  path="/bleeding-edge" 
                  element={
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading WebGPU Engine...</p>
                        </div>
                      </div>
                    }>
                      <BleedingEdge />
                    </Suspense>
                  } 
                />
              </Routes>
              <Navigation onShowTutorial={handleShowTutorial} />
            </div>
          </div>

          {/* Tutorial */}
          <Tutorial
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={handleTutorialComplete}
          />

          {/* Perplexity AI Search */}
          <PerplexitySearch />
        </div>
      </Router>
    </WalletProvider>
  );
};

export default App;
