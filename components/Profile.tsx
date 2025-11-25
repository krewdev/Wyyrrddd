import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { TokenType } from '../types';
import { HeartIcon, LikeIcon, CareIcon, CreepIcon } from './Icons';
import { WalletConnector } from './WalletConnector';
import { TodoList } from './TodoList';
import { WalletRecovery } from './WalletRecovery';
import { TechStack } from './TechStack';
import { CreatePostSection } from './CreatePostSection';

interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  address: string;
}

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
    dotBalance,
    earnToken
  } = useWallet();

  // Profile avatar + gallery (local-only, per-device)
  const defaultAvatar =
    'https://api.dicebear.com/9.x/avataaars/svg?seed=You';

  const vikingAvatars = [
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Viking+Ragnar',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Shieldmaiden+Lagertha',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Odin+OneEye',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Freyja+Valkyrie'
  ];

  const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatar);
  const [gallery, setGallery] = useState<string[]>([]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('USER_8921');
  const [username, setUsername] = useState('@user_8921');
  const [bio, setBio] = useState('Decentralized social coordination layer. Building the future of Web3 social.');
  const [walletAddress, setWalletAddress] = useState('0x8f71...3A2b');

  // Kin ledger (friends) – static seed data for MVP
  const friends: Friend[] = [
    {
      id: 'f1',
      name: 'Runa Frost',
      handle: '@runa',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Runa+Frost',
      address: '15CwY...Rune',
    },
    {
      id: 'f2',
      name: 'Bjorn Signal',
      handle: '@bjorn',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bjorn+Signal',
      address: '16Pdr...Bjrn',
    },
    {
      id: 'f3',
      name: 'Astrid Node',
      handle: '@astrid',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Astrid+Node',
      address: '13Hjk...Astr',
    },
  ];

  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [likePerFriend, setLikePerFriend] = useState<number>(1);
  const [dotPerFriend, setDotPerFriend] = useState<number>(0.01);

  useEffect(() => {
    try {
      const savedAvatar = window.localStorage.getItem('wyyrrddd-profile-avatar');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
      const savedGallery = window.localStorage.getItem('wyyrrddd-profile-gallery');
      if (savedGallery) {
        const parsed = JSON.parse(savedGallery);
        if (Array.isArray(parsed)) {
          setGallery(parsed);
        }
      }
      // Load profile data
      const savedProfile = window.localStorage.getItem('wyyrrddd-profile-data');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setDisplayName(profile.displayName || 'USER_8921');
        setUsername(profile.username || '@user_8921');
        setBio(profile.bio || 'Decentralized social coordination layer. Building the future of Web3 social.');
        setWalletAddress(profile.walletAddress || '0x8f71...3A2b');
      }
    } catch {
      // Ignore storage errors in browser
    }
  }, []);

  const saveProfile = () => {
    try {
      window.localStorage.setItem('wyyrrddd-profile-data', JSON.stringify({
        displayName,
        username,
        bio,
        walletAddress
      }));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch {
      alert('Failed to save profile');
    }
  };

  const toggleFriendSelection = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleBulkLikeSend = () => {
    const count = selectedFriendIds.length;
    if (count === 0) {
      alert('Select at least one friend to send LIKE.');
      return;
    }
    if (likePerFriend <= 0) {
      alert('LIKE per friend must be greater than zero.');
      return;
    }

    const totalCost = likePerFriend * count;
    const currentLike = wallet.balances[TokenType.LIKE];

    if (currentLike < totalCost) {
      alert(`Insufficient LIKE. You need ${totalCost} LIKE but only have ${currentLike}.`);
      return;
    }

    // Use earnToken with a negative amount to debit LIKE in one go.
    // All other impression tokens are still granted only via post card engagement.
    // @ts-expect-error intentional negative adjustment for debit
    // Type system expects positive, but runtime supports negative numbers.
    // We guard above to avoid going below zero.
    earnToken(TokenType.LIKE, -totalCost);

    alert(`Sent ${likePerFriend} LIKE to ${count} friend(s) (simulated in-app).`);
  };

  const handleBulkDotSend = () => {
    const count = selectedFriendIds.length;
    if (count === 0) {
      alert('Select at least one friend to prepare a DOT send.');
      return;
    }
    if (dotPerFriend <= 0) {
      alert('DOT per friend must be greater than zero.');
      return;
    }
    if (!isWalletConnected) {
      alert('Connect your Polkadot wallet first to prepare DOT sends.');
      return;
    }

    const totalDot = dotPerFriend * count;
    alert(
      `Prepared DOT send of ~${totalDot} DOT to ${count} friend(s).\n` +
        'In this MVP, DOT transfers are not signed on-chain yet – this models the intent only.'
    );
  };

  const persistAvatar = (url: string) => {
    setAvatarUrl(url);
    try {
      window.localStorage.setItem('wyyrrddd-profile-avatar', url);
    } catch {
      // ignore
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        persistAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectVikingAvatar = (url: string) => {
    persistAvatar(url);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === 'string') {
          setGallery((prev) => {
            const next = [result, ...prev].slice(0, 30); // cap to 30 items
            try {
              window.localStorage.setItem(
                'wyyrrddd-profile-gallery',
                JSON.stringify(next)
              );
            } catch {
              // ignore
            }
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Calculate Total Net Worth in USD
  const tokenValueUsd = 
    (wallet.balances[TokenType.LIKE] * tokenRates[TokenType.LIKE] * dotPrice) +
    (wallet.balances[TokenType.LOVE] * tokenRates[TokenType.LOVE] * dotPrice) +
    (wallet.balances[TokenType.CARE] * tokenRates[TokenType.CARE] * dotPrice) +
    (wallet.balances[TokenType.CREEP] * tokenRates[TokenType.CREEP] * dotPrice);
  
  const daoValueUsd = daoEarningsDot * dotPrice;
  const totalUsd = tokenValueUsd + daoValueUsd;

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-4 pb-24 relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-0 w-px h-1/2 bg-gradient-to-b from-transparent via-cyber-cyan to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-px h-1/2 bg-gradient-to-b from-transparent via-cyber-pink to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-0 left-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyber-green to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
        
        {/* Enhanced Profile Header - Futuristic */}
        <div className="relative glass-strong border border-cyber-cyan/40 mt-6 mb-10 p-6 neon-border overflow-hidden energy-flow">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyber-cyan"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyber-pink"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyber-green"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyber-yellow"></div>
            
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 text-[200px] font-mono text-cyber-dim/5 -translate-y-10 translate-x-10 pointer-events-none">ID</div>
            
            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 glass border border-cyber-cyan/40 text-cyber-cyan px-3 py-1 text-[10px] font-mono uppercase tracking-wider hover:bg-cyber-cyan hover:text-black transition-all z-20"
            >
              {isEditing ? 'CANCEL' : 'EDIT'}
            </button>

            <div className="relative flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar Section - Enhanced */}
                <div className="relative group">
                    <div className="relative w-24 h-24 md:w-28 md:h-28">
                        <div className="absolute inset-0 border-2 border-cyber-cyan rounded-full border-dashed animate-spin-slow shadow-neon-cyan"></div>
                        <div className="absolute -inset-2 border border-cyber-pink/50 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/20 via-transparent to-cyber-pink/20 rounded-full blur-xl"></div>
                        <img 
                            src={avatarUrl} 
                            alt="Profile" 
                            className="w-full h-full rounded-full bg-gray-800 p-1 relative z-10 border-2 border-cyber-dark"
                        />
                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-cyber-black flex items-center justify-center rounded-full border-2 border-cyber-cyan shadow-neon-cyan z-20">
                            <div className="w-2.5 h-2.5 bg-cyber-cyan rounded-full animate-pulse"></div>
                        </div>
                        {/* Upload Overlay */}
                        <div className="absolute inset-0 bg-cyber-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center z-30 cursor-pointer"
                             onClick={() => avatarInputRef.current?.click()}>
                            <span className="text-cyber-cyan text-[10px] font-mono uppercase tracking-wider">EDIT</span>
                        </div>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                </div>
                
                {/* Profile Info - Enhanced */}
                <div className="z-10 flex-1 w-full">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-1">Display Name</label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                            placeholder="Your display name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-1">Username</label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-cyber-cyan font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-1">Bio</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-xs text-gray-300 font-sans focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan resize-none"
                            placeholder="Tell the saga about yourself..."
                          />
                        </div>
                        <button
                          onClick={saveProfile}
                          className="w-full glass border border-cyber-green/60 bg-cyber-green/10 text-cyber-green px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-cyber-green hover:text-black transition-all shadow-neon-green"
                        >
                          SAVE PROFILE
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-black tracking-tight holographic-text mb-1">
                            {displayName}
                        </h2>
                        <p className="text-cyber-cyan font-mono text-sm mb-2">{username}</p>
                        <p className="text-gray-400 font-mono text-xs mb-3">{walletAddress}</p>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4 font-light">{bio}</p>
                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <span className="glass border border-cyber-cyan/40 text-cyber-cyan px-3 py-1 text-[9px] font-bold uppercase tracking-wider shadow-neon-cyan">
                                Tier 3 Access
                            </span>
                            <span className="glass border border-cyber-pink/40 text-cyber-pink px-3 py-1 text-[9px] font-bold uppercase tracking-wider">
                                Verified
                            </span>
                        </div>
                      </>
                    )}
                    
                    {/* Avatar Selection - Enhanced */}
                    {!isEditing && (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="glass border border-cyber-cyan/60 text-cyber-cyan px-4 py-1.5 text-[10px] font-mono uppercase tracking-wide hover:bg-cyber-cyan hover:text-black transition-all shadow-neon-cyan"
                          >
                            Upload Avatar
                          </button>
                          <span className="text-[9px] text-cyber-dim font-mono">or choose identity:</span>
                        </div>
                        <div className="flex gap-2">
                          {vikingAvatars.map((url) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => handleSelectVikingAvatar(url)}
                              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                                avatarUrl === url
                                  ? 'border-cyber-cyan shadow-neon-cyan scale-110'
                                  : 'border-cyber-dim/50 hover:border-cyber-cyan/60 hover:scale-105'
                              }`}
                            >
                              <img src={url} alt="Viking avatar" className="w-full h-full" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>

        {/* Wallet Connection - Enhanced */}
        <div className="mb-6 glass-strong border border-cyber-cyan/40 p-4 neon-border relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
          <WalletConnector
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            isConnected={isWalletConnected}
            currentAccount={connectedAccount}
          />
          {isWalletConnected && (
            <div className="mt-4 glass border border-cyber-cyan/30 p-4 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-cyber-cyan/50"></div>
              <div className="text-xs text-gray-400 font-mono mb-1 uppercase tracking-wider">DOT Balance</div>
              <div className="text-2xl font-mono text-cyber-cyan font-bold holographic-text">{dotBalance}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse"></div>
                <span className="text-[9px] text-cyber-green font-mono">SYNCED</span>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Recovery Helper */}
        <WalletRecovery />

        {/* Net Worth Card - Enhanced Futuristic */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-strong border border-cyber-cyan/40 p-5 shadow-neon-cyan relative overflow-hidden group neon-border">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-cyan/10 blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="absolute top-0 left-0 w-2 h-full bg-cyber-cyan/50"></div>
                <div className="relative z-10">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-mono mb-2">Total Asset Value</p>
                  <p className="text-3xl font-mono text-white tracking-tighter font-black holographic-text mb-1">${totalUsd.toFixed(2)}</p>
                  <p className="text-[10px] text-cyber-cyan font-mono flex items-center gap-1">
                    <span>≈</span>
                    <span className="font-bold">{(totalUsd / dotPrice).toFixed(2)} DOT</span>
                  </p>
                </div>
            </div>
            <div className="glass-strong border border-cyber-green/40 p-5 shadow-neon-green relative overflow-hidden group neon-border">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-green/10 blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="absolute top-0 left-0 w-2 h-full bg-cyber-green/50"></div>
                <div className="relative z-10">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-mono mb-2">Data Yield</p>
                  <p className="text-2xl font-mono text-cyber-green font-black mb-1 animate-neon-flicker">+{daoEarningsDot.toFixed(4)} DOT</p>
                  <p className="text-[10px] text-gray-500 font-mono">APY: <span className="text-cyber-green font-bold">4.2%</span></p>
                </div>
            </div>
        </div>

        {/* Token Balances - Enhanced Futuristic */}
        <div className="flex items-center justify-between mb-4 border-b border-cyber-cyan/30 pb-3 relative">
             <h3 className="text-xs font-bold uppercase text-white tracking-[0.2em] font-mono holographic-text">Wallet_Inventory</h3>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse shadow-neon-green"></div>
               <span className="text-[9px] font-mono text-cyber-green animate-neon-flicker">SYNCED</span>
             </div>
             <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
             {[
                { icon: LikeIcon, color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/5', border: 'border-cyber-cyan/40', count: wallet.balances[TokenType.LIKE], label: 'Like', shadow: 'shadow-neon-cyan' },
                { icon: HeartIcon, color: 'text-cyber-pink', bg: 'bg-cyber-pink/5', border: 'border-cyber-pink/40', count: wallet.balances[TokenType.LOVE], label: 'Love', shadow: 'shadow-neon-pink' },
                { icon: CareIcon, color: 'text-cyber-yellow', bg: 'bg-cyber-yellow/5', border: 'border-cyber-yellow/40', count: wallet.balances[TokenType.CARE], label: 'Care', shadow: 'shadow-neon-green' },
                { icon: CreepIcon, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/40', count: wallet.balances[TokenType.CREEP], label: 'Creep', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.6)]' },
             ].map((item, idx) => (
                <div key={idx} className={`glass border ${item.border} p-4 flex items-center justify-between relative overflow-hidden group neon-border hover:${item.shadow} transition-all`}>
                    <div className={`absolute -right-4 -top-4 w-16 h-16 ${item.bg} rounded-full blur-xl group-hover:scale-150 transition-transform`}></div>
                    <div className="absolute top-0 left-0 w-2 h-full bg-current opacity-30"></div>
                    <div className="flex items-center space-x-3 z-10">
                        <div className={`p-2 glass border border-current/30 rounded ${item.shadow}`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold font-mono">{item.label}</span>
                    </div>
                    <span className={`block text-xl font-black font-mono leading-none ${item.color} z-10 animate-neon-flicker`}>{item.count}</span>
                </div>
             ))}
        </div>

        {/* Data DAO Section - Enhanced Futuristic */}
        <div className="glass-strong border border-cyber-cyan/40 p-1 relative overflow-hidden neon-border group energy-flow">
            {/* Active Stripe - Enhanced */}
            <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-300 ${isSellingData ? 'bg-cyber-green shadow-neon-green animate-pulse' : 'bg-red-500/50'}`}></div>
            
            <div className="glass p-5 pl-7 relative">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
                
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center tracking-wide uppercase font-mono">
                        <span className="text-cyber-cyan mr-2 text-lg">⟁</span> Liquidity Pool
                    </h3>
                    {isSellingData && (
                      <span className="glass border border-cyber-green/60 text-cyber-green px-2 py-1 text-[9px] font-mono uppercase animate-neon-flicker">
                        UPLOADING...
                      </span>
                    )}
                </div>
                
                <p className="text-xs text-gray-400 mb-5 leading-relaxed font-light">
                    Protocol authorized to anonymize interaction history. Yield paid in DOT per block.
                </p>

                <div className="flex items-center justify-between glass border border-cyber-dim/40 p-2 rounded-full">
                    <div className="px-4">
                        <p className="font-bold text-[10px] text-white uppercase font-mono mb-1">Link Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isSellingData ? 'bg-cyber-green shadow-neon-green animate-pulse' : 'bg-red-500'}`}></div>
                          <p className={`text-[9px] tracking-widest font-mono ${isSellingData ? 'text-cyber-green' : 'text-red-400'}`}>
                              {isSellingData ? '● SECURE' : '○ OFFLINE'}
                          </p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleSellingData}
                        className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full font-mono
                            ${isSellingData 
                                ? 'glass-strong border border-cyber-green/60 bg-cyber-green/20 text-cyber-green hover:bg-cyber-green hover:text-black shadow-neon-green' 
                                : 'glass border border-cyber-dim/60 text-gray-400 hover:text-white hover:border-cyber-cyan'}
                        `}
                    >
                        {isSellingData ? 'TERMINATE' : 'INITIALIZE'}
                    </button>
                </div>
            </div>
        </div>

        {/* Kin Ledger – friends + bulk appreciation */}
        <div className="mt-8 bg-cyber-panel border border-cyber-dim/70 p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-grid-pattern bg-[length:32px_32px] pointer-events-none" />
          <div className="relative flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                Kin Ledger
              </h3>
              <p className="text-[10px] text-cyber-dim font-mono mt-1">
                Bless your circle with DOT and LIKE. Deeper impressions still flow through posts.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-3 mb-4">
            {friends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => toggleFriendSelection(friend.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded border bg-cyber-black/60 text-left transition-colors ${
                  selectedFriendIds.includes(friend.id)
                    ? 'border-cyber-cyan shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'border-cyber-dim hover:border-cyber-cyan/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyber-dim">
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-100">{friend.name}</div>
                    <div className="text-[10px] text-cyber-dim font-mono">
                      {friend.handle} · {friend.address}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center text-[9px] font-mono ${
                    selectedFriendIds.includes(friend.id)
                      ? 'bg-cyber-cyan border-cyber-cyan text-black'
                      : 'border-cyber-dim text-cyber-dim'
                  }`}
                >
                  {selectedFriendIds.includes(friend.id) ? '✓' : '·'}
                </div>
              </button>
            ))}
          </div>

          <div className="relative flex flex-col gap-3 border-t border-cyber-dim/60 pt-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 font-mono mb-1">
                  LIKE per kin
                </label>
                <input
                  type="number"
                  min={0}
                  value={likePerFriend}
                  onChange={(e) => setLikePerFriend(Number(e.target.value))}
                  className="w-full bg-cyber-black border border-cyber-dim px-2 py-1.5 text-[11px] text-cyber-cyan font-mono focus:outline-none focus:border-cyber-cyan"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 font-mono mb-1">
                  DOT per kin (intent only)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={dotPerFriend}
                  onChange={(e) => setDotPerFriend(Number(e.target.value))}
                  className="w-full bg-cyber-black border border-cyber-dim px-2 py-1.5 text-[11px] text-cyber-cyan font-mono focus:outline-none focus:border-cyber-cyan"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleBulkLikeSend}
                className="flex-1 px-3 py-2 text-[10px] font-mono uppercase tracking-wide bg-cyber-cyan text-black hover:bg-white transition-colors"
              >
                Send LIKE to Selected
              </button>
              <button
                type="button"
                onClick={handleBulkDotSend}
                className="flex-1 px-3 py-2 text-[10px] font-mono uppercase tracking-wide border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
              >
                Prepare DOT Send
              </button>
            </div>

            <p className="text-[9px] text-cyber-dim font-mono">
              LOVE, CARE, and CREEP can only be granted by engaging with posts – the weave of
              the saga itself.
            </p>
          </div>
        </div>

        {/* Create Post Section - Futuristic */}
        <div className="mt-8 glass-strong border border-cyber-cyan/40 p-6 neon-border relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white font-mono flex items-center gap-2">
                <span className="text-cyber-pink">⚡</span> CREATE POST
              </h3>
              <p className="text-[10px] text-cyber-dim font-mono mt-1">
                Share images or videos to start your web
              </p>
            </div>
          </div>

          <CreatePostSection />
        </div>

        {/* Tech Stack */}
        <TechStack />

        {/* ApplyPolkadot-1 roadmap todos */}
        <TodoList />

        {/* Saga Archive – Norse-flavoured profile feed */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                Saga Archive
              </h3>
              <p className="text-[10px] text-cyber-dim font-mono mt-1">
                Carve moments into stone. Each relic lives only on this device.
              </p>
            </div>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="px-3 py-1 text-[10px] font-mono uppercase tracking-wide border border-cyber-cyan/60 text-cyber-cyan hover:bg-cyber-cyan hover:text-black transition-colors"
            >
              + Inscribe Memory
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((src, idx) => {
                const isVideo = src.startsWith('data:video/');
                return (
                  <div
                    key={`${src}-${idx}`}
                    className="relative glass border border-cyber-cyan/30 overflow-hidden group neon-border"
                  >
                    {/* Algiz watermark per relic */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] text-7xl text-cyber-cyan font-mono pointer-events-none">
                      ᛉ
                    </div>
                    <div className="relative">
                      {isVideo ? (
                        <video
                          src={src}
                          className="w-full h-28 object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          muted
                        />
                      ) : (
                        <img
                          src={src}
                          alt="Saga relic"
                          className="w-full h-28 object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      )}
                      <div className="absolute inset-0 border border-cyber-cyan/40 pointer-events-none mix-blend-soft-light" />
                      {isVideo && (
                        <div className="absolute top-2 left-2 glass border border-cyber-pink/60 text-cyber-pink px-1.5 py-0.5 text-[8px] font-mono uppercase">
                          VIDEO
                        </div>
                      )}
                    </div>
                    <div className="relative border-t border-cyber-cyan/40 px-2 py-1.5 flex items-center justify-between glass">
                      <span className="text-[9px] font-mono uppercase text-cyber-cyan">
                        Relic #{gallery.length - idx}
                      </span>
                      <span className="text-[9px] font-mono text-cyber-dim">
                        Bound to Wyrd
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-cyber-dim font-mono mt-1">
              No relics in your saga yet. Capture from the camera or inscribe a memory to begin
              your chronicle.
            </p>
          )}
        </div>
    </div>
  );
};