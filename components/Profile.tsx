import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { TokenType } from '../types';
import { HeartIcon, LikeIcon, CareIcon, CreepIcon } from './Icons';
import { WalletConnector } from './WalletConnector';

export const Profile: React.FC = () => {
  const {
    wallet,
    isSellingData,
    toggleSellingData,
    daoEarningsDot,
    dotPrice,
    tokenRates,
    isWalletConnected,
    connectedAccount,
    api,
    connectWallet,
    disconnectWallet,
    dotBalance
  } = useWallet();

  // Calculate Total Net Worth in USD
  const tokenValueUsd = 
    (wallet.balances[TokenType.LIKE] * tokenRates[TokenType.LIKE] * dotPrice) +
    (wallet.balances[TokenType.LOVE] * tokenRates[TokenType.LOVE] * dotPrice) +
    (wallet.balances[TokenType.CARE] * tokenRates[TokenType.CARE] * dotPrice) +
    (wallet.balances[TokenType.CREEP] * tokenRates[TokenType.CREEP] * dotPrice);
  
  const daoValueUsd = daoEarningsDot * dotPrice;
  const totalUsd = tokenValueUsd + daoValueUsd;

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-4 pb-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-dim/20 to-cyber-black">
        
        {/* Profile Header */}
        <div className="relative flex items-center space-x-5 mt-6 mb-10 p-4 border border-cyber-dim/30 bg-cyber-black/40 backdrop-blur-md rounded-sm">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                 <div className="absolute top-0 right-0 text-[180px] font-mono text-cyber-dim/5 -translate-y-10 translate-x-10 pointer-events-none">ID</div>
            </div>

            <div className="relative w-20 h-20">
                 <div className="absolute inset-0 border-2 border-cyber-cyan rounded-full border-dashed animate-spin-slow"></div>
                 <div className="absolute -inset-1 border border-cyber-dim rounded-full"></div>
                 <img 
                    src="https://api.dicebear.com/9.x/avataaars/svg?seed=You" 
                    alt="Profile" 
                    className="w-full h-full rounded-full bg-gray-800 p-1"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-cyber-black flex items-center justify-center rounded-full border border-cyber-cyan">
                    <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="z-10">
                <h2 className="text-2xl font-black tracking-tight">@USER_8921</h2>
                <p className="text-cyber-cyan font-mono text-xs">0x8f71...3A2b</p>
                <div className="flex items-center space-x-2 mt-3">
                    <span className="bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                        Tier 3 Access
                    </span>
                </div>
            </div>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6">
          <WalletConnector
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            isConnected={isWalletConnected}
            currentAccount={connectedAccount}
          />
          {isWalletConnected && (
            <div className="mt-3 p-3 bg-cyber-panel border border-cyber-cyan/30 rounded">
              <div className="text-xs text-gray-400 font-mono mb-1">DOT Balance</div>
              <div className="text-lg font-mono text-cyber-cyan font-bold">{dotBalance}</div>
            </div>
          )}
        </div>

        {/* Net Worth Card */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-cyber-panel p-4 border-l-2 border-cyber-cyan shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-2 text-cyber-cyan/10 group-hover:text-cyber-cyan/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-mono mb-1">Total Asset Value</p>
                <p className="text-2xl font-mono text-white tracking-tighter font-bold">${totalUsd.toFixed(2)}</p>
                <p className="text-[10px] text-cyber-cyan mt-1 font-mono">≈ {(totalUsd / dotPrice).toFixed(2)} DOT</p>
            </div>
            <div className="bg-cyber-panel p-4 border-l-2 border-cyber-green shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-2 text-cyber-green/10 group-hover:text-cyber-green/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-mono mb-1">Data Yield</p>
                <p className="text-xl font-mono text-cyber-green font-bold">+{daoEarningsDot.toFixed(4)} DOT</p>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">APY: 4.2%</p>
            </div>
        </div>

        {/* Token Balances */}
        <div className="flex items-center justify-between mb-4 border-b border-cyber-dim pb-2">
             <h3 className="text-xs font-bold uppercase text-gray-400 tracking-[0.2em]">Wallet_Inventory</h3>
             <span className="text-[9px] font-mono text-cyber-dim">SYNCED</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
             {[
                { icon: LikeIcon, color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/5', border: 'border-cyber-cyan/20', count: wallet.balances[TokenType.LIKE], label: 'Like' },
                { icon: HeartIcon, color: 'text-cyber-pink', bg: 'bg-cyber-pink/5', border: 'border-cyber-pink/20', count: wallet.balances[TokenType.LOVE], label: 'Love' },
                { icon: CareIcon, color: 'text-cyber-yellow', bg: 'bg-cyber-yellow/5', border: 'border-cyber-yellow/20', count: wallet.balances[TokenType.CARE], label: 'Care' },
                { icon: CreepIcon, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/20', count: wallet.balances[TokenType.CREEP], label: 'Creep' },
             ].map((item, idx) => (
                <div key={idx} className={`bg-cyber-black border ${item.border} p-3 flex items-center justify-between relative overflow-hidden group`}>
                    <div className={`absolute -right-4 -top-4 w-12 h-12 ${item.bg} rounded-full blur-xl group-hover:scale-150 transition-transform`}></div>
                    <div className="flex items-center space-x-3 z-10">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{item.label}</span>
                    </div>
                    <span className={`block text-lg font-bold font-mono leading-none ${item.color} z-10`}>{item.count}</span>
                </div>
             ))}
        </div>

        {/* Data DAO Section */}
        <div className="bg-cyber-panel border border-cyber-dim p-1 relative overflow-hidden rounded-sm group">
            {/* Active Stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${isSellingData ? 'bg-cyber-green shadow-[0_0_10px_#39FF14]' : 'bg-red-500'}`}></div>
            
            <div className="bg-cyber-black/80 p-4 pl-6 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center tracking-wide uppercase">
                        <span className="text-cyber-cyan mr-2">⟁</span> Liquidity Pool
                    </h3>
                    {isSellingData && <span className="animate-pulse text-[10px] text-cyber-green font-mono">UPLOADING...</span>}
                </div>
                
                <p className="text-xs text-gray-500 mb-5 leading-relaxed font-light">
                    Protocol authorized to anonymize interaction history. Yield paid in DOT per block.
                </p>

                <div className="flex items-center justify-between bg-cyber-dim/10 p-1 rounded-full border border-cyber-dim/30">
                    <div className="px-4">
                        <p className="font-bold text-[10px] text-white uppercase font-mono">Link Status</p>
                        <p className={`text-[9px] tracking-widest ${isSellingData ? 'text-cyber-green' : 'text-red-500'}`}>
                            {isSellingData ? '● SECURE' : '○ OFFLINE'}
                        </p>
                    </div>
                    <button 
                        onClick={toggleSellingData}
                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full shadow-lg
                            ${isSellingData 
                                ? 'bg-cyber-green text-black hover:bg-white hover:shadow-[0_0_15px_#39FF14]' 
                                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-600'}
                        `}
                    >
                        {isSellingData ? 'TERMINATE' : 'INITIALIZE'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};