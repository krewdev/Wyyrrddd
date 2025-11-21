import React, { useState, useRef } from 'react';
import { Post, TokenType } from '../types';
import { CareIcon, CreepIcon, HeartIcon, LikeIcon, ShareIcon } from './Icons';
import { useWallet } from '../contexts/WalletContext';
import { TokenSpendEffect, SuccessEffect } from './ParticleSystem';

interface PostCardProps {
  post: Post;
}

// Runic mappings for the tokens
const RUNE_MAPPING = {
  [TokenType.LIKE]: 'ᚠ',   // Fehu
  [TokenType.LOVE]: 'ᛒ',   // Berkano
  [TokenType.CARE]: 'ᛃ',   // Jera
  [TokenType.CREEP]: 'ᚦ',  // Thurisaz
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { spendToken, earnToken, tokenRates } = useWallet();
  const [localTokens, setLocalTokens] = useState(post.tokens);
  const [animations, setAnimations] = useState<{ id: string; symbol: string; isPositive: boolean; cost?: number }[]>([]);
  const [particleEffects, setParticleEffects] = useState<{ id: string; type: 'spend' | 'success'; position: { x: number; y: number } }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (type: TokenType, event: React.MouseEvent) => {
    if (spendToken(type)) {
      const id = Math.random().toString(36).substr(2, 9);
      const symbol = RUNE_MAPPING[type];
      const cost = tokenRates[type];

      // Get button position for particle effect
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const cardRect = cardRef.current?.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2 - (cardRect?.left || 0),
        y: rect.top + rect.height / 2 - (cardRect?.top || 0)
      };

      setAnimations(prev => [...prev, { id, symbol, isPositive: true, cost }]);
      setParticleEffects(prev => [...prev, { id, type: 'spend', position }]);

      setTimeout(() => {
        setLocalTokens(prev => ({
          ...prev,
          [type]: prev[type] + 1
        }));
      }, 400);

      setTimeout(() => {
        setAnimations(prev => prev.filter(a => a.id !== id));
        setParticleEffects(prev => prev.filter(p => p.id !== id));
      }, 1000);
    } else {
      alert(`Insufficient ${type} credits!`);
    }
  };

  const handleShare = async (event: React.MouseEvent) => {
    earnToken(TokenType.CARE, 5);

    const id = Math.random().toString(36).substr(2, 9);

    // Get button position for particle effect
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2 - (cardRect?.left || 0),
      y: rect.top + rect.height / 2 - (cardRect?.top || 0)
    };

    setAnimations(prev => [...prev, { id, symbol: 'ᛃ', isPositive: true }]);
    setParticleEffects(prev => [...prev, { id, type: 'success', position }]);

    setTimeout(() => {
       setAnimations(prev => prev.filter(a => a.id !== id));
       setParticleEffects(prev => prev.filter(p => p.id !== id));
    }, 1000);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Wyyrrddd: @${post.username}`,
          text: post.caption,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${post.caption} - via Wyyrrddd`);
    }
  };

  return (
    <div ref={cardRef} className="relative w-full bg-cyber-panel mb-8 group shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] tech-border-b">
      
      {/* Decorative Frame Elements */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyber-cyan z-20"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyber-cyan z-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-dim to-transparent z-20"></div>

      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <img src={post.imageUrl} alt={post.caption} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 filter contrast-110 saturate-50 group-hover:saturate-100" />
        
        {/* Holographic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cyber-black/90 z-10" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-10 pointer-events-none"></div>
        
        {/* Scanline on Hover */}
        <div className="absolute inset-0 bg-cyber-cyan/10 transform -translate-y-full group-hover:animate-scan pointer-events-none z-10"></div>

        {/* Boost/Sponsored Badge */}
        {post.isSponsored && (
          <div className="absolute top-4 right-4 z-20">
             <div className="bg-cyber-pink/90 text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest clip-path-polygon shadow-[0_0_10px_#FF003C]">
               Sponsored
             </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-6 pt-4 bg-cyber-panel border-x border-cyber-dim/20 z-20 -mt-12 bg-gradient-to-t from-cyber-panel via-cyber-panel to-transparent">
        
        <div className="flex justify-between items-end mb-3 border-b border-cyber-dim/30 pb-3">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full border border-cyber-cyan/50 animate-pulse"></div>
                    <img src={post.userAvatar} alt={post.username} className="w-10 h-10 rounded-full border-2 border-cyber-dark relative z-10 bg-black" />
                </div>
                <div>
                    <p className="text-cyber-cyan font-bold text-sm tracking-wide flex items-center font-mono">
                        @{post.username}
                    </p>
                    <div className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-cyber-green rounded-full"></span>
                        <p className="text-gray-500 text-[9px] font-mono uppercase tracking-wider">ID: {post.userId.toUpperCase()}</p>
                    </div>
                </div>
            </div>
            <div className="text-[9px] font-mono text-cyber-dim text-right">
                <div>BLK: 18,293</div>
                <div>HASH: 0x7A...9F</div>
            </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-6 font-light leading-relaxed font-sans tracking-wide">
            {post.caption}
        </p>

        {/* Interaction Grid */}
        <div className="grid grid-cols-5 gap-2">
          
          {/* Button Component */}
          {[
              { type: TokenType.LIKE, icon: LikeIcon, color: 'text-cyber-cyan', borderColor: 'border-cyber-cyan/30', rune: RUNE_MAPPING[TokenType.LIKE], label: 'LIKE' },
              { type: TokenType.LOVE, icon: HeartIcon, color: 'text-cyber-pink', borderColor: 'border-cyber-pink/30', rune: RUNE_MAPPING[TokenType.LOVE], label: 'LOVE' },
              { type: TokenType.CARE, icon: CareIcon, color: 'text-cyber-yellow', borderColor: 'border-cyber-yellow/30', rune: RUNE_MAPPING[TokenType.CARE], label: 'CARE' },
              { type: TokenType.CREEP, icon: CreepIcon, color: 'text-purple-400', borderColor: 'border-purple-400/30', rune: RUNE_MAPPING[TokenType.CREEP], label: 'CREEP' }
          ].map((btn) => (
            <button
                key={btn.type}
                onClick={(e) => handleInteraction(btn.type, e)}
                className={`relative flex flex-col items-center justify-center p-2 bg-cyber-black border ${btn.borderColor} rounded-sm group/btn transition-all active:scale-95 hover:bg-white/5`}
            >
                {/* Cost Tooltip */}
                <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-cyber-panel border border-cyber-dim text-[9px] opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 font-mono flex flex-col items-center shadow-[0_4px_15px_rgba(0,0,0,0.5)] rounded-sm">
                   <span className={`${btn.color} font-bold tracking-[0.1em] mb-0.5`}>{btn.label}</span>
                   <span className="text-red-400 drop-shadow-[0_0_3px_rgba(248,113,113,0.5)]">-{tokenRates[btn.type]} DOT</span>
                   <div className="absolute -bottom-1 w-2 h-2 bg-cyber-panel border-r border-b border-cyber-dim transform rotate-45"></div>
                </div>

                {/* Animation */}
                {animations.filter(a => a.symbol === btn.rune).map(anim => (
                    <div key={anim.id} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-float-out z-50">
                        <span className={`${btn.color} font-black text-2xl drop-shadow-[0_0_5px_currentColor]`}>{anim.symbol}</span>
                        {anim.cost && (
                            <span className="animate-spend-effect text-red-500 bg-cyber-black/90 px-1 text-[9px] font-bold font-mono border border-red-500/30 mt-1 shadow-[0_0_8px_rgba(255,0,0,0.6)]">-{anim.cost}</span>
                        )}
                    </div>
                ))}

                <btn.icon className={`w-5 h-5 ${btn.color} opacity-70 group-hover/btn:opacity-100 transition-opacity`} />
                <span className="text-[8px] font-mono text-gray-500 mt-1">{localTokens[btn.type]}</span>
            </button>
          ))}

            {/* Share Button */}
            <button
                onClick={handleShare}
                className="relative flex flex-col items-center justify-center p-2 bg-cyber-green/10 border border-cyber-green/30 rounded-sm group/btn hover:bg-cyber-green/20 transition-all"
            >
                {/* Share Tooltip */}
                <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-cyber-black border border-cyber-green/50 text-[9px] opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 font-mono flex flex-col items-center shadow-[0_0_15px_rgba(57,255,20,0.3)] rounded-sm">
                    <span className="text-cyber-green font-bold tracking-wider">SHARE POST</span>
                    <span className="text-gray-400 text-[8px] mt-0.5">& Earn <span className="text-cyber-yellow font-bold">CARE</span></span>
                    <div className="absolute -bottom-1 w-2 h-2 bg-cyber-black border-r border-b border-cyber-green/50 transform rotate-45"></div>
                </div>

                 {/* Enhanced Share Reward Animation */}
                {animations.filter(a => a.symbol === 'ᛃ' && !a.cost).map(anim => (
                    <div key={anim.id} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50 -translate-y-10">
                        <div className="absolute w-16 h-16 bg-cyber-green/20 rounded-full animate-ping"></div>
                        <span className="text-cyber-green font-black text-3xl drop-shadow-[0_0_10px_#39FF14]">{anim.symbol}</span>
                        <span className="mt-1 text-[9px] font-black bg-cyber-green text-black px-1 rounded whitespace-nowrap">+5 CARE</span>
                    </div>
                ))}
                <ShareIcon className="w-5 h-5 text-cyber-green opacity-80 group-hover/btn:opacity-100" />
                <span className="text-[8px] font-mono text-cyber-green mt-1">SHARE</span>
            </button>
        </div>
      </div>

      {/* Particle Effects */}
      {particleEffects.map(effect => (
        <div key={effect.id} className="absolute inset-0 pointer-events-none">
          {effect.type === 'spend' ? (
            <TokenSpendEffect trigger={true} position={effect.position} />
          ) : (
            <SuccessEffect trigger={true} position={effect.position} />
          )}
        </div>
      ))}
    </div>
  );
};