import React, { useEffect, useState, useRef } from 'react';
import { generateFeedContent } from '../services/geminiService';
import { Post } from '../types';
import { PostCard } from './PostCard';
import { useWallet } from '../contexts/WalletContext';
import { TokenType } from '../types';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const { spendToken, dotPrice, tokenRates } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const newPosts = await generateFeedContent();
      setPosts(newPosts);
      setLoading(false);
    };
    loadPosts();
  }, []);

  const handlePayForReach = () => {
     if (spendToken(TokenType.LIKE)) {
         alert("Boost Activated. Your content has been prioritized in the algorithm.");
     } else {
         alert("Insufficient LIKE credits.");
     }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            const newPost: Post = {
                id: Date.now().toString(),
                userId: 'me',
                username: 'You',
                userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=You',
                imageUrl: ev.target?.result as string,
                caption: "Just dropped on Wyyrrddd. #New",
                tokens: { LIKE: 0, LOVE: 0, CARE: 0, CREEP: 0 },
                isSponsored: true
            };
            setPosts([newPost, ...posts]);
        }
        reader.readAsDataURL(file);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-black text-white space-y-6 relative overflow-hidden">
            {/* Loading Animation */}
            <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-t-2 border-cyber-cyan rounded-full animate-spin"></div>
                 <div className="absolute inset-2 border-r-2 border-cyber-pink rounded-full animate-spin-slow"></div>
                 <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-cyber-cyan animate-pulse">
                    LOADING
                 </div>
            </div>
            <p className="text-xs tracking-[0.5em] font-mono text-gray-500">INITIALIZING FEED_PROTOCOL</p>
        </div>
    );
  }

  return (
    <div className="pb-28 bg-cyber-dark min-h-screen">
      
      {/* Command Header */}
      <div className="sticky top-0 z-40 bg-cyber-black/90 backdrop-blur-xl border-b border-cyber-dim/50 shadow-2xl">
        <div className="p-4 flex justify-between items-end border-b border-cyber-dim/30 pb-3">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-white italic" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                    WYYRRDDD
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-cyber-green font-mono tracking-widest">SYSTEM ONLINE</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-cyber-dim/20 border border-cyber-cyan/50 text-cyber-cyan px-4 py-1 text-xs font-bold hover:bg-cyber-cyan hover:text-black transition-all tracking-wide uppercase clip-path-button"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                    + UPLOAD
                </button>
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*"
                    onChange={handleUpload}
                />
            </div>
        </div>
        
        {/* Cyber Financial Ticker */}
        <div className="bg-cyber-black/50 border-b border-cyber-cyan/20 overflow-hidden py-1 relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-cyber-black to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-cyber-black to-transparent z-10"></div>
            <div className="animate-marquee whitespace-nowrap flex space-x-8 text-[10px] font-mono font-medium text-gray-400 px-4 uppercase items-center">
                <span className="text-white font-bold">DOT: <span className="text-cyber-cyan">${dotPrice.toFixed(2)}</span> <span className="text-cyber-green">▲ 1.2%</span></span>
                <span className="text-cyber-dim">///</span>
                <span className="text-cyber-cyan">LIKE: <span className="text-gray-300">${(tokenRates.LIKE * dotPrice).toFixed(4)}</span></span>
                <span className="text-cyber-pink">LOVE: <span className="text-gray-300">${(tokenRates.LOVE * dotPrice).toFixed(4)}</span></span>
                <span className="text-cyber-yellow">CARE: <span className="text-gray-300">${(tokenRates.CARE * dotPrice).toFixed(4)}</span></span>
                <span className="text-cyber-dim">///</span>
                <span className="text-purple-400">CREEP: <span className="text-gray-300">${(tokenRates.CREEP * dotPrice).toFixed(4)}</span></span>
            </div>
        </div>

        {/* Terminal Search */}
        <div className="px-4 py-3 border-b border-cyber-dim/30 bg-gradient-to-b from-cyber-black/50 to-transparent">
            <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-dim group-focus-within:text-cyber-cyan font-mono text-xs transition-colors">{'>'}</span>
                <input 
                    type="text"
                    placeholder="QUERY_DATABASE..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-cyber-panel border border-cyber-dim rounded-none px-8 py-2 text-xs text-cyber-cyan focus:outline-none focus:border-cyber-cyan focus:bg-cyber-dim/20 font-mono tracking-wide uppercase placeholder-cyber-dim transition-all"
                />
            </div>
        </div>
      </div>

      {/* Boost Module */}
      <div className="mx-4 mt-6 mb-6 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-sm opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
        <div className="relative p-4 bg-cyber-panel border border-cyber-dim rounded-sm">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xs font-bold text-white flex items-center tracking-widest uppercase font-mono">
                    <span className="text-cyber-pink mr-2">⚡</span> SIGNAL_BOOST
                </h3>
                <span className="text-[9px] text-cyber-black bg-cyber-green px-1.5 py-0.5 font-bold uppercase tracking-wider">ACTIVE</span>
            </div>
            
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 font-mono">CREDITS</span>
                    <input 
                    type="number" 
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(Number(e.target.value))}
                    className="bg-cyber-black border border-cyber-dim px-3 py-2 text-sm w-full text-cyber-cyan focus:outline-none focus:border-cyber-cyan font-mono"
                    />
                </div>
                <button 
                onClick={handlePayForReach}
                className="bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan text-xs font-bold px-6 py-2 hover:bg-cyber-cyan hover:text-black transition-all tracking-wider uppercase shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                >
                    EXECUTE
                </button>
            </div>
        </div>
      </div>

      {/* Posts Stream */}
      <div className="max-w-md mx-auto px-0 md:px-4 space-y-8">
        {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
            ))
        ) : (
            <div className="text-center py-20 border-t border-cyber-dim mt-4 relative overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <div className="w-40 h-40 border border-white rotate-45"></div>
                 </div>
                <div className="text-cyber-pink font-mono text-sm tracking-[0.2em] animate-pulse">NO_DATA_FOUND</div>
                <div className="text-gray-600 font-mono text-[10px] mt-2">ADJUST SEARCH PARAMETERS</div>
            </div>
        )}
      </div>
    </div>
  );
};