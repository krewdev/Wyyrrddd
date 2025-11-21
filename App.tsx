import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Navigation } from './components/Navigation';
import { Feed } from './components/Feed';
import { Radar } from './components/Radar';
import { Profile } from './components/Profile';

const App: React.FC = () => {
  return (
    <WalletProvider>
      <Router>
        <div className="bg-cyber-black min-h-screen font-sans text-gray-100 selection:bg-cyber-cyan selection:text-black">
          {/* CRT Scanline Effect */}
          <div className="scanlines"></div>
          
          {/* Background Grid */}
          <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10 pointer-events-none"></div>

          <div className="max-w-md mx-auto min-h-screen relative bg-cyber-dark/80 shadow-2xl border-x border-cyber-dim/30 backdrop-blur-sm">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/radar" element={<Radar />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            <Navigation />
          </div>
        </div>
      </Router>
    </WalletProvider>
  );
};

export default App;