import React, { useState, useRef } from 'react';
import { Post, TokenType } from '../types';
import { CareIcon, CreepIcon, HeartIcon, LikeIcon, ShareIcon } from './Icons';
import { useWallet } from '../contexts/WalletContext';
import { TokenSpendEffect, SuccessEffect } from './ParticleSystem';
import { FloatingOrbs, Sparkles } from './FloatingOrbs';

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
  const [isHovered, setIsHovered] = useState(false);
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
    <div 
      ref={cardRef} 
      className="relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/40 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Orbs Background */}
      <FloatingOrbs count={3} />
      
      {/* Ambient Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10" />
      
      {/* Sparkles on Hover */}
      <Sparkles active={isHovered} />
      
      {/* Media Container */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {post.videoUrl ? (
          <video
            src={post.videoUrl}
            controls
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
          />
        ) : post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={post.caption} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-slate-400 dark:text-slate-500 text-sm">No media</span>
          </div>
        )}
        
        {/* Video Badge */}
        {post.videoUrl && (
          <div className="absolute top-3 left-3">
            <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 text-xs font-medium rounded-lg">
              ▶ Video
            </div>
          </div>
        )}
        
        {/* Sponsored Badge */}
        {post.isSponsored && (
          <div className="absolute top-3 right-3">
            <div className="bg-blue-600 text-white px-2 py-1 text-xs font-medium rounded-lg shadow-lg">
              Sponsored
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={post.userAvatar} 
            alt={post.username} 
            className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700" 
          />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">
              @{post.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {post.userId}
            </p>
          </div>
        </div>
        
        {/* Caption */}
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
          {post.caption}
        </p>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          {[
            { type: TokenType.LIKE, icon: LikeIcon, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', glowColor: 'shadow-blue-500/50', rune: RUNE_MAPPING[TokenType.LIKE], label: 'Like' },
            { type: TokenType.LOVE, icon: HeartIcon, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-50 dark:bg-pink-900/20', glowColor: 'shadow-pink-500/50', rune: RUNE_MAPPING[TokenType.LOVE], label: 'Love' },
            { type: TokenType.CARE, icon: CareIcon, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', glowColor: 'shadow-yellow-500/50', rune: RUNE_MAPPING[TokenType.CARE], label: 'Care' },
            { type: TokenType.CREEP, icon: CreepIcon, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20', glowColor: 'shadow-purple-500/50', rune: RUNE_MAPPING[TokenType.CREEP], label: 'Creep' }
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={(e) => handleInteraction(btn.type, e)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all active:scale-95 hover:scale-105 hover:shadow-lg ${btn.glowColor} ${btn.bgColor} group/btn`}
            >
              {/* Animation */}
              {animations.filter(a => a.symbol === btn.rune).map(anim => (
                <div key={anim.id} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-bounce">
                  <span className={`${btn.color} font-black text-xl`}>{anim.symbol}</span>
                  {anim.cost && (
                    <span className="absolute top-full mt-1 text-red-500 text-xs font-bold">-{anim.cost}</span>
                  )}
                </div>
              ))}

              <btn.icon className={`w-5 h-5 ${btn.color}`} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{localTokens[btn.type]}</span>
            </button>
          ))}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-lg shadow-green-500/50 transition-all active:scale-95 ml-auto"
          >
            {/* Share Animation */}
            {animations.filter(a => a.symbol === 'ᛃ' && !a.cost).map(anim => (
              <div key={anim.id} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-bounce">
                <span className="text-green-600 dark:text-green-400 font-black text-xl">ᛃ</span>
                <span className="absolute top-full mt-1 text-green-600 dark:text-green-400 text-xs font-bold">+5</span>
              </div>
            ))}
            <ShareIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
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
