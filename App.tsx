import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Navigation } from './components/Navigation';
import { Feed } from './components/Feed';
import { Radar } from './components/Radar';
import { Profile } from './components/Profile';
import { Camera } from './components/Camera';
import { Tutorial } from './components/Tutorial';

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
        <div className="bg-cyber-black min-h-screen font-sans text-gray-100 selection:bg-cyber-cyan selection:text-black">
          {/* CRT Scanline Effect */}
          <div className="scanlines"></div>

          {/* Background Grid */}
          <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10 pointer-events-none"></div>

          <div className="max-w-md mx-auto min-h-screen relative bg-cyber-dark/80 shadow-2xl border-x border-cyber-dim/30 backdrop-blur-sm overflow-hidden">
            {/* Global Algiz watermark behind every page */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] select-none">
              <span className="text-[220px] font-mono text-cyber-cyan">
                ᛉ
              </span>
            </div>

            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/radar" element={<Radar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/camera" element={<Camera />} />
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
        </div>
      </Router>
    </WalletProvider>
  );
};

export default App;