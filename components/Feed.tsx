import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { generateFeedContent } from '../services/geminiService';
import { Post } from '../types';
import { PostCard } from './PostCard';
import { WebNetwork } from './WebNetwork';
import { GeoSpatialAds } from './GeoSpatialAds';
import { useWallet } from '../contexts/WalletContext';
import { TokenType } from '../types';
import { ScrollIndicator, VerticalScrollProgress, ScrollHint } from './ScrollIndicator';

// Lazy load SpaceFeed for better performance
const SpaceFeed = lazy(() => import('./SpaceFeed').then(module => ({ default: module.SpaceFeed })));

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'web' | 'grid' | 'space' | 'horizontal' | 'carousel'>('grid');
  const [scrollDirection, setScrollDirection] = useState<'vertical' | 'horizontal'>('vertical');
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const { spendToken, dotPrice, tokenRates } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  // Track scroll position for horizontal scrolling
  useEffect(() => {
    const scrollContainer = horizontalScrollRef.current;
    if (!scrollContainer || (viewMode !== 'horizontal' && viewMode !== 'carousel')) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const itemWidth = scrollContainer.clientWidth * 0.85;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentScrollIndex(index);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  // Show scroll hint when switching to horizontal modes
  useEffect(() => {
    if (viewMode === 'horizontal' || viewMode === 'carousel') {
      setShowScrollHint(true);
      const timer = setTimeout(() => setShowScrollHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const newPosts = await generateFeedContent();
      
      // Load user-created posts from localStorage
      try {
        const userPosts = JSON.parse(localStorage.getItem('wyyrrddd-user-posts') || '[]');
        setPosts([...userPosts, ...newPosts]);
      } catch {
        setPosts(newPosts);
      }
      
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
        const isVideo = file.type.startsWith('video/');
        const reader = new FileReader();
        reader.onload = (ev) => {
            const newPost: Post = {
                id: Date.now().toString(),
                userId: 'me',
                username: 'You',
                userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=You',
                imageUrl: isVideo ? undefined : (ev.target?.result as string),
                videoUrl: isVideo ? (ev.target?.result as string) : undefined,
                caption: "Just dropped on Wyyrrddd. #New",
                tokens: { LIKE: 0, LOVE: 0, CARE: 0, CREEP: 0 },
                isSponsored: true
            };
            setPosts([newPost, ...posts]);
        };
        reader.readAsDataURL(file);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
            <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-2 border-4 border-blue-300 border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading feed...</p>
        </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      {/* Vertical Scroll Progress */}
      {viewMode === 'grid' && <VerticalScrollProgress />}
      
      {/* Scroll Hint */}
      {showScrollHint && <ScrollHint direction={scrollDirection} />}
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white glow-text">
                Wyyrrddd
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Decentralized Social Network
              </p>
            </div>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70 hover:scale-105 active:scale-95"
            >
                + Upload
            </button>
            <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*,video/*"
                onChange={handleUpload}
            />
          </div>
          
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Token Ticker */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4 text-xs whitespace-nowrap">
            <span className="font-semibold text-slate-900 dark:text-white">DOT: <span className="text-blue-600 dark:text-blue-400">${dotPrice.toFixed(2)}</span></span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">LIKE: ${(tokenRates.LIKE * dotPrice).toFixed(4)}</span>
            <span className="text-slate-600 dark:text-slate-400">LOVE: ${(tokenRates.LOVE * dotPrice).toFixed(4)}</span>
            <span className="text-slate-600 dark:text-slate-400">CARE: ${(tokenRates.CARE * dotPrice).toFixed(4)}</span>
            <span className="text-slate-600 dark:text-slate-400">CREEP: ${(tokenRates.CREEP * dotPrice).toFixed(4)}</span>
          </div>
        </div>
      </header>

      {/* Boost Module */}
      <div className="mx-4 mt-4 mb-4 relative">
        {/* Glow effect behind module */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-20 animate-pulse-glow" />
        <div className="relative p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-lg animate-pulse">⚡</span> Signal Boost
            </h3>
            <span className="text-[10px] text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full font-medium shadow-sm shadow-green-500/30">Active</span>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input 
                type="number" 
                value={contributionAmount}
                onChange={(e) => setContributionAmount(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Amount"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400">credits</span>
            </div>
            <button 
              onClick={handlePayForReach}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-purple-500/70 hover:scale-105 active:scale-95"
            >
              Boost
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mx-4 mb-4 flex gap-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-1 rounded-xl shadow-inner">
        <button
          onClick={() => { setViewMode('grid'); setScrollDirection('vertical'); }}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            viewMode === 'grid'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          📱 Grid
        </button>
        <button
          onClick={() => { setViewMode('horizontal'); setScrollDirection('horizontal'); }}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            viewMode === 'horizontal'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          ↔️ Scroll
        </button>
        <button
          onClick={() => { setViewMode('carousel'); setScrollDirection('horizontal'); }}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            viewMode === 'carousel'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-lg shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🎠 Carousel
        </button>
        <button
          onClick={() => setViewMode('web')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            viewMode === 'web'
              ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🕸️ Web
        </button>
        <button
          onClick={() => setViewMode('space')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            viewMode === 'space'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🌌 Space
        </button>
      </div>

      {/* Space View - 3D Immersive Feed */}
      {viewMode === 'space' && filteredPosts.length > 0 && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-white dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Space Environment...</p>
            </div>
          </div>
        }>
          <SpaceFeed posts={filteredPosts} />
        </Suspense>
      )}

      {/* Web Network View */}
      {viewMode === 'web' && filteredPosts.length > 0 && (
        <WebNetwork posts={filteredPosts} />
      )}

      {/* Grid View - Clean Vertical Layout with Glow */}
      {viewMode === 'grid' && (
        <div className="px-4 space-y-6 pb-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-fadeIn"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="text-slate-400 dark:text-slate-500 font-medium mb-2">No posts found</div>
              <div className="text-sm text-slate-500 dark:text-slate-600">Try adjusting your search</div>
            </div>
          )}
        </div>
      )}

      {/* Horizontal Scroll View - Side to Side */}
      {viewMode === 'horizontal' && (
        <div className="relative pb-6">
          <div 
            ref={horizontalScrollRef}
            className="flex gap-4 px-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-6"
            style={{ scrollBehavior: 'smooth' }}
          >
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="flex-shrink-0 w-[85vw] max-w-md snap-center animate-slideIn"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <PostCard post={post} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-20">
                <div className="text-slate-400 dark:text-slate-500 font-medium mb-2">No posts found</div>
                <div className="text-sm text-slate-500 dark:text-slate-600">Try adjusting your search</div>
              </div>
            )}
          </div>
          {/* Enhanced Scroll Indicators */}
          {filteredPosts.length > 0 && (
            <div className="sticky bottom-20 left-0 right-0">
              <ScrollIndicator 
                itemCount={filteredPosts.length}
                currentIndex={currentScrollIndex}
                onIndicatorClick={(index) => {
                  const scrollContainer = horizontalScrollRef.current;
                  if (scrollContainer) {
                    const itemWidth = scrollContainer.clientWidth * 0.85 + 16;
                    scrollContainer.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Carousel View - Centered Card Focus */}
      {viewMode === 'carousel' && (
        <div className="relative pb-6 min-h-screen flex items-center">
          <div 
            ref={horizontalScrollRef}
            className="flex gap-6 px-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide w-full"
            style={{ scrollBehavior: 'smooth', scrollPaddingLeft: '50%', scrollPaddingRight: '50%' }}
          >
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="flex-shrink-0 w-[90vw] max-w-md snap-center transform transition-all duration-300 hover:scale-105"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="relative">
                    {/* Glow effect behind card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10 animate-pulse" />
                    <PostCard post={post} />
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-20">
                <div className="text-slate-400 dark:text-slate-500 font-medium mb-2">No posts found</div>
                <div className="text-sm text-slate-500 dark:text-slate-600">Try adjusting your search</div>
              </div>
            )}
          </div>
          {/* Enhanced Scroll Indicators */}
          {filteredPosts.length > 0 && (
            <div className="absolute bottom-16 left-0 right-0">
              <ScrollIndicator 
                itemCount={filteredPosts.length}
                currentIndex={currentScrollIndex}
                onIndicatorClick={(index) => {
                  const scrollContainer = horizontalScrollRef.current;
                  if (scrollContainer) {
                    const itemWidth = scrollContainer.clientWidth * 0.9 + 24;
                    scrollContainer.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* GeoSpatial Ads Component */}
      <GeoSpatialAds />
    </div>
  );
};
