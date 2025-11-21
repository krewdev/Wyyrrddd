import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

// NOTE: This is a helper UI only. It cannot actually recover a non-custodial wallet.
// Real recovery always relies on the user's seed phrase / hardware device.

export const WalletRecovery: React.FC = () => {
  const { connectedAccount } = useWallet();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const saved = window.localStorage.getItem('wyyrrddd-recovery-email');
    if (saved) setEmail(saved);
  }, []);

  const handleSaveEmail = () => {
    window.localStorage.setItem('wyyrrddd-recovery-email', email.trim());
  };

  const mailtoHref = () => {
    const to = email || 'support@wyyrrddd.app';
    const subject = encodeURIComponent('Wyyrrddd – Wallet Recovery Help');
    const addr = connectedAccount?.address || '';
    const body = encodeURIComponent(
      [
        'Hi Wyyrrddd team,',
        '',
        'I need help understanding wallet recovery for my Polkadot wallet.',
        addr ? `My current connected address is: ${addr}` : 'No address is currently connected.',
        '',
        'I understand that only my seed phrase / hardware device can actually restore funds, but I would like guidance on:',
        '- Exporting my account from the Polkadot{.js} browser extension',
        '- Importing it again on a new device',
        '- Best practices for backing up my seed phrase securely',
        '',
        'Thanks,',
        '',
      ].join('\n')
    );
    return `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="mt-6 bg-cyber-panel border border-cyber-dim/70 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-grid-pattern bg-[length:32px_32px] pointer-events-none" />

      <div className="relative flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
            Wallet Recovery
          </h3>
          <p className="text-[10px] text-cyber-dim font-mono mt-1">
            Non-custodial. Recovery is done via your seed phrase / hardware key.
          </p>
        </div>
      </div>

      <div className="relative space-y-3 text-[11px] text-gray-300 font-mono leading-relaxed">
        <p>
          1. Open your <span className="text-cyber-cyan">Polkadot{'.'}js</span> browser
          extension.
        </p>
        <p>2. Click your account → “Export account” and follow the prompts.</p>
        <p>
          3. Store the exported JSON file and your{' '}
          <span className="text-cyber-yellow font-bold">seed phrase</span> in at least two
          offline, safe locations.
        </p>
        <p>
          4. On a new device, install the same wallet extension and use&nbsp;
          <span className="text-cyber-cyan">“Import account”</span> to restore from JSON or
          seed phrase.
        </p>
      </div>

      <div className="relative mt-4 space-y-2">
        <div className="flex gap-2 items-center">
          <input
            type="email"
            placeholder="Optional: your email for recovery notes"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleSaveEmail}
            className="flex-1 bg-cyber-black border border-cyber-dim px-3 py-1.5 text-[11px] text-cyber-cyan font-mono placeholder-cyber-dim focus:outline-none focus:border-cyber-cyan"
          />
          <button
            type="button"
            onClick={handleSaveEmail}
            className="px-2 py-1 text-[10px] border border-cyber-dim text-gray-400 hover:text-white hover:border-cyber-cyan transition-colors font-mono"
          >
            Save
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <a
            href="https://support.polkadot.network/support/solutions/folders/65000148700"
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center px-3 py-2 text-[10px] border border-cyber-dim text-gray-300 hover:border-cyber-cyan hover:text-white transition-colors font-mono uppercase tracking-wide"
          >
            Polkadot Wallet Docs
          </a>
          <a
            href={mailtoHref()}
            className="flex-1 text-center px-3 py-2 text-[10px] bg-cyber-cyan text-black font-mono uppercase tracking-wide hover:bg-white transition-colors"
          >
            Email Recovery Guide
          </a>
        </div>
      </div>
    </div>
  );
};


