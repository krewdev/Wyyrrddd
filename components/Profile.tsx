import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { TokenType } from '../types';
import { HeartIcon, LikeIcon, CareIcon, CreepIcon } from './Icons';
import { WalletConnector } from './WalletConnector';
import { TodoList } from './TodoList';
import { WalletRecovery } from './WalletRecovery';

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
    dotBalance
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
    } catch {
      // Ignore storage errors in browser
    }
  }, []);

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
    try {
      // @ts-expect-error intentional negative adjustment for debit
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // Type system expects positive, but runtime supports negative numbers.
      // We guard above to avoid going below zero.
      (useWallet().earnToken)(TokenType.LIKE, -totalCost);
    } catch {
      // Fallback: do nothing if context shape changes.
    }

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
            const next = [result, ...prev].slice(0, 30); // cap to 30 images
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
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full bg-gray-800 p-1"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-cyber-black flex items-center justify-center rounded-full border border-cyber-cyan">
                    <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="z-10 flex-1">
                <h2 className="text-2xl font-black tracking-tight">@USER_8921</h2>
                <p className="text-cyber-cyan font-mono text-xs">0x8f71...3A2b</p>
                <div className="flex items-center space-x-2 mt-3">
                    <span className="bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                        Tier 3 Access
                    </span>
                </div>
                {/* Avatar controls */}
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1 text-[10px] font-mono uppercase tracking-wide border border-cyber-dim text-gray-300 hover:border-cyber-cyan hover:text-white transition-colors"
                    >
                      Upload Avatar
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <span className="text-[9px] text-cyber-dim font-mono">
                      or choose a Viking identity:
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {vikingAvatars.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => handleSelectVikingAvatar(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border ${
                          avatarUrl === url
                            ? 'border-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                            : 'border-cyber-dim hover:border-cyber-cyan/60'
                        }`}
                      >
                        <img src={url} alt="Viking avatar" className="w-full h-full" />
                      </button>
                    ))}
                  </div>
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

        {/* Wallet Recovery Helper */}
        <WalletRecovery />

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
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative bg-cyber-panel/80 border border-cyber-dim/70 overflow-hidden group"
                >
                  {/* Algiz watermark per relic */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] text-7xl text-cyber-cyan font-mono pointer-events-none">
                    ᛉ
                  </div>
                  <div className="relative">
                    <img
                      src={src}
                      alt="Saga relic"
                      className="w-full h-28 object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 border border-cyber-dim/40 pointer-events-none mix-blend-soft-light" />
                  </div>
                  <div className="relative border-t border-cyber-dim/60 px-2 py-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-gray-400">
                      Relic #{gallery.length - idx}
                    </span>
                    <span className="text-[9px] font-mono text-cyber-dim">
                      Bound to Wyrd
                    </span>
                  </div>
                </div>
              ))}
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