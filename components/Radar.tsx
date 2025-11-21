import React, { useState } from 'react';
import { analyzeSurroundings } from '../services/geminiService';
import { useWallet } from '../contexts/WalletContext';
import { TokenType } from '../types';
import { RadarIcon } from './Icons';

export const Radar: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [foundTarget, setFoundTarget] = useState<{ type: 'BROADCAST' | 'DROP'; message: string; reward: number; brand?: string } | null>(null);
  const { earnToken } = useWallet();

  const toggleScan = () => {
    if (scanning) {
        setScanning(false);
        return;
    }

    setScanning(true);
    setFoundTarget(null);

    setTimeout(async () => {
        // Simulate random geo-coordinates close to "user"
        const lat = 40.7128 + (Math.random() * 0.005);
        const lng = -74.0060 + (Math.random() * 0.005);
        
        const isAd = Math.random() > 0.3;
        
        if (isAd) {
             const analysis = await analyzeSurroundings(lat, lng);
             const parts = analysis.split(':');
             const brand = parts.length > 1 ? parts[0] : 'Unknown Source';
             const msg = parts.length > 1 ? parts[1] : analysis;

             setFoundTarget({
                 type: 'BROADCAST',
                 brand: brand,
                 message: msg,
                 reward: 25 
             });
        } else {
            setFoundTarget({
                type: 'DROP',
                message: "Geospatial Cache Unlocked. Token liquidity found.",
                reward: 50
            });
        }
        setScanning(false);
    }, 3000);
  };

  const claimReward = () => {
      if (foundTarget) {
          earnToken(TokenType.CARE, foundTarget.reward);
          alert(`Interaction Confirmed. ${foundTarget.reward} CARE credited to wallet.`);
          setFoundTarget(null);
      }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white p-6 pb-24 flex flex-col items-center relative overflow-hidden">
      
      {/* Map Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ 
               backgroundImage: 'linear-gradient(#00F0FF 1px, transparent 1px), linear-gradient(90deg, #00F0FF 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
               maskImage: 'radial-gradient(circle, black 40%, transparent 100%)'
           }}>
      </div>

      {/* Header */}
      <div className="z-10 w-full max-w-md text-center mt-8 mb-12 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
        <h2 className="text-2xl font-black tracking-tighter text-white mb-1 mt-4 font-mono uppercase text-cyber-cyan" style={{ textShadow: '0 0 10px #00F0FF' }}>Geospatial_Link</h2>
        <div className="flex justify-center items-center space-x-4 text-[10px] text-cyber-dim font-mono">
            <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse mr-2"></span>NETWORK_OK</span>
            <span>ACCURACY: &lt;3m</span>
        </div>
      </div>

      {/* Scanner Visual */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-12">
        
        {/* Static Rings */}
        <div className="absolute inset-0 border border-cyber-dim/30 rounded-full"></div>
        <div className="absolute inset-8 border border-cyber-dim/30 rounded-full border-dashed"></div>
        <div className="absolute inset-20 border border-cyber-dim/50 rounded-full"></div>
        
        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-[1px] bg-cyber-cyan"></div>
            <div className="h-full w-[1px] bg-cyber-cyan absolute"></div>
        </div>

        {/* Dynamic Scanning Rings */}
        <div className={`absolute inset-0 border border-cyber-cyan/50 rounded-full ${scanning ? 'scale-110 opacity-0 duration-[2000ms] ease-out infinite' : 'scale-100 opacity-20'} transition-all`}></div>
        {scanning && <div className="absolute inset-0 border border-cyber-cyan/30 rounded-full animate-ping"></div>}

        {/* Rotating Radar Sweep */}
        {scanning && (
            <div className="absolute inset-0 rounded-full overflow-hidden animate-spin duration-[3s]">
                <div className="w-full h-1/2 bg-gradient-to-t from-cyber-cyan/40 to-transparent origin-bottom"></div>
            </div>
        )}

        {/* Center Button */}
        <button 
          onClick={toggleScan}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 z-20 border-2 relative
            ${scanning 
                ? 'bg-cyber-black border-cyber-cyan text-cyber-cyan shadow-[0_0_30px_rgba(0,240,255,0.5)]' 
                : 'bg-cyber-panel border-cyber-dim text-gray-400 hover:border-cyber-cyan hover:text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'}
          `}
        >
            <div className={`absolute inset-1 border border-dotted rounded-full ${scanning ? 'border-cyber-cyan animate-spin-slow' : 'border-gray-600'}`}></div>
            <RadarIcon className={`w-8 h-8 mb-2 ${scanning ? 'animate-pulse text-cyber-cyan' : ''}`} />
            <span className="text-[10px] font-black tracking-widest uppercase font-mono">{scanning ? 'SCANNING' : 'INIT_SCAN'}</span>
        </button>

        {/* Coordinates HUD */}
        <div className="absolute -bottom-10 w-full flex justify-between px-4 font-mono text-[9px] text-cyber-cyan/50">
            <span>LAT: 40.7128 N</span>
            <span>LNG: 74.0060 W</span>
        </div>
      </div>

      {/* Result Card */}
      {foundTarget && (
        <div className="w-full max-w-md bg-cyber-panel/90 border border-cyber-cyan/50 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.15)] animate-pop-in relative overflow-hidden z-30">
            {/* Card Decoration */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyber-cyan"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-cyber-cyan"></div>

            <div className="bg-cyber-cyan/10 p-3 border-b border-cyber-cyan/20 flex justify-between items-center">
                <span className="text-xs font-bold text-cyber-cyan uppercase tracking-wider flex items-center">
                    <span className="w-2 h-2 bg-cyber-cyan mr-2 animate-pulse"></span>
                    {foundTarget.type === 'BROADCAST' ? 'SIGNAL_INTERCEPTED' : 'ASSET_DETECTED'}
                </span>
                <span className="bg-cyber-cyan text-black text-[10px] font-bold px-2 py-0.5 font-mono">
                    +{foundTarget.reward} CARE
                </span>
            </div>
            
            <div className="p-6">
                {foundTarget.brand && (
                    <h3 className="text-xl font-black text-white mb-1 tracking-tight">{foundTarget.brand}</h3>
                )}
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-mono">
                    >> "{foundTarget.message}"
                </p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setFoundTarget(null)}
                        className="flex-1 py-3 border border-gray-600 text-gray-400 text-xs font-bold uppercase hover:bg-gray-800 transition-colors font-mono"
                    >
                        IGNORE
                    </button>
                    <button 
                        onClick={claimReward}
                        className="flex-1 py-3 bg-cyber-cyan text-black text-xs font-bold uppercase hover:bg-white transition-colors font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    >
                        CLAIM_BOUNTY
                    </button>
                </div>
            </div>
        </div>
      )}

      {!scanning && !foundTarget && (
         <div className="absolute bottom-28 text-center w-full animate-pulse">
            <p className="text-[10px] text-cyber-dim font-mono uppercase tracking-[0.2em]">
               System Standby... Awaiting Input
            </p>
         </div>
      )}
    </div>
  );
};