import React, { useState } from 'react';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  phase: 'MVP' | 'Next' | 'Later';
  done: boolean;
}

const ROADMAP_TODOS: TodoItem[] = [
  {
    id: 'wallet-connect',
    phase: 'MVP',
    title: 'Polkadot Wallet Connect',
    description: 'Enable users to connect a Polkadot extension wallet and read DOT balance.',
    done: true,
  },
  {
    id: 'social-tokens',
    phase: 'MVP',
    title: 'Social Token Ledger',
    description: 'Track LIKE, LOVE, CARE, CREEP balances and spending for interactions.',
    done: true,
  },
  {
    id: 'radar-mvp',
    phase: 'MVP',
    title: 'Raven Radar',
    description: 'Scan surroundings and surface location-based broadcasts and drops.',
    done: true,
  },
  {
    id: 'camera-mvp',
    phase: 'MVP',
    title: 'Camera + Filters',
    description: 'Provide Snapchat-style camera with filters, stickers, and drawing tools.',
    done: true,
  },
  {
    id: 'onboarding',
    phase: 'MVP',
    title: 'Onboarding Tutorial',
    description: 'Walk new users through wallet, feed, radar, and camera flows.',
    done: true,
  },
  {
    id: 'onchain-events',
    phase: 'Next',
    title: 'On-chain Event Logging',
    description: 'Record key social actions (boosts, major drops) on a Polkadot chain.',
    done: false,
  },
  {
    id: 'dao-rewards',
    phase: 'Next',
    title: 'DAO Reward Streams',
    description: 'Wire simulated DAO earnings to real on-chain reward mechanisms.',
    done: false,
  },
  {
    id: 'geo-nfts',
    phase: 'Later',
    title: 'Geo-bound Collectibles',
    description: 'Mint location-locked NFTs when users claim special drops.',
    done: false,
  },
];

const phaseLabelStyles: Record<TodoItem['phase'], string> = {
  MVP: 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/40',
  Next: 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/40',
  Later: 'bg-cyber-pink/10 text-cyber-pink border-cyber-pink/40',
};

export const TodoList: React.FC = () => {
  const [items, setItems] = useState<TodoItem[]>(ROADMAP_TODOS);

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  return (
    <div className="mt-8 bg-cyber-panel border border-cyber-dim/60 p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-grid-pattern bg-[length:28px_28px]" />

      <div className="relative flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
            ApplyPolkadot-1 Roadmap
          </h3>
          <p className="text-[10px] text-cyber-dim font-mono mt-1">
            Client-side checklist mirroring the core Polkadot v1 milestones.
          </p>
        </div>
        <span className="text-[10px] font-mono text-cyber-cyan">
          {items.filter(i => i.done).length}/{items.length} DONE
        </span>
      </div>

      <div className="relative space-y-2 max-h-64 overflow-y-auto no-scrollbar">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleItem(item.id)}
            className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded border bg-cyber-black/60 hover:bg-cyber-black/90 transition-colors ${
              item.done ? 'border-cyber-green/50' : 'border-cyber-dim/60'
            }`}
          >
            <div className="mt-0.5">
              <div
                className={`w-4 h-4 rounded-sm border flex items-center justify-center text-[9px] font-mono ${
                  item.done
                    ? 'bg-cyber-green border-cyber-green text-black'
                    : 'border-cyber-dim text-cyber-dim'
                }`}
              >
                {item.done ? '✓' : '·'}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs font-bold tracking-wide ${
                    item.done ? 'text-cyber-green' : 'text-gray-100'
                  }`}
                >
                  {item.title}
                </p>
                <span
                  className={
                    'ml-2 px-2 py-[2px] rounded-full border text-[9px] font-mono ' +
                    phaseLabelStyles[item.phase]
                  }
                >
                  {item.phase}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};


