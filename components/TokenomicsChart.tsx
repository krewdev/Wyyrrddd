import React from 'react';

export const TokenomicsChart: React.FC = () => {
  return (
    <div className="relative w-full h-64 bg-cyber-black/40 border border-cyber-dim/50 rounded-sm p-4 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-cyan via-transparent to-transparent" />
      
      {/* Chart Grid */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-[1px] pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="border-r border-b border-cyber-dim/10" />
        ))}
      </div>

      {/* Token Distribution Bars */}
      <div className="relative z-10 h-full flex flex-col justify-center gap-4 font-mono text-[10px]">
        
        <div className="w-full">
          <div className="flex justify-between text-cyber-cyan mb-1">
            <span>COMMUNITY_REWARDS</span>
            <span>45%</span>
          </div>
          <div className="h-2 w-full bg-cyber-dim/30 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-cyan w-[45%] shadow-[0_0_10px_#00F0FF]" />
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-cyber-pink mb-1">
            <span>PROTOCOL_DEV</span>
            <span>25%</span>
          </div>
          <div className="h-2 w-full bg-cyber-dim/30 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-pink w-[25%] shadow-[0_0_10px_#FF003C]" />
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-cyber-yellow mb-1">
            <span>DATA_DAO_TREASURY</span>
            <span>20%</span>
          </div>
          <div className="h-2 w-full bg-cyber-dim/30 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-yellow w-[20%] shadow-[0_0_10px_#FCEE0A]" />
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-purple-400 mb-1">
            <span>LIQUIDITY_LOCKED</span>
            <span>10%</span>
          </div>
          <div className="h-2 w-full bg-cyber-dim/30 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 w-[10%] shadow-[0_0_10px_#A78BFA]" />
          </div>
        </div>

      </div>
    </div>
  );
};

