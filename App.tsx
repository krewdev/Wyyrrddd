import React, { useState, useEffect, Suspense } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Navigation } from './components/Navigation';
import { Feed } from './components/Feed';
import { Radar } from './components/Radar';
import { Profile } from './components/Profile';
import { Camera } from './components/Camera';
import { Tutorial } from './components/Tutorial';
import { Whitepaper } from './components/Whitepaper';
import WebGPUScene from './components/WebGPUScene';
import { NeuralInterface } from './components/NeuralInterface';

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
        <div className="bg-cyber-black min-h-screen font-sans text-gray-100 selection:bg-cyber-cyan selection:text-black relative">
          
          {/* WebGPU Engine Layer */}
          <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
             <WebGPUScene />
          </Suspense>

          {/* CRT Scanline Effect (Overlay) */}
          <div className="scanlines pointer-events-none z-50"></div>
          
          {/* Local AI Interface */}
          <NeuralInterface />

          <div className="max-w-md mx-auto min-h-screen relative bg-cyber-dark/80 shadow-2xl border-x border-cyber-dim/30 backdrop-blur-sm overflow-hidden z-10">
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
                <Route path="/whitepaper" element={<Whitepaper />} />
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
