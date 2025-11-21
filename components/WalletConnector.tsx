import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface WalletConnectorProps {
  onConnect: (account: InjectedAccountWithMeta, api: ApiPromise) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  currentAccount?: InjectedAccountWithMeta;
  className?: string;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  onConnect,
  onDisconnect,
  isConnected,
  currentAccount,
  className = ''
}) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  // Initialize Polkadot API
  useEffect(() => {
    const initApi = async () => {
      try {
        const provider = new WsProvider('wss://rpc.polkadot.io');
        const apiInstance = await ApiPromise.create({ provider });
        setApi(apiInstance);
      } catch (error) {
        console.error('Failed to connect to Polkadot API:', error);
      }
    };

    initApi();

    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Enable the extension
      const extensions = await web3Enable('Wyyrrddd');
      if (extensions.length === 0) {
        alert('No Polkadot wallet extension found. Please install Polkadot{.js} extension.');
        setLoading(false);
        return;
      }

      // Get accounts
      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        alert('No accounts found in wallet. Please create or import an account.');
        setLoading(false);
        return;
      }

      setAccounts(allAccounts);
      setShowAccountSelector(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
    setLoading(false);
  };

  const selectAccount = async (account: InjectedAccountWithMeta) => {
    if (!api) {
      alert('API not initialized. Please try again.');
      return;
    }

    try {
      setLoading(true);
      onConnect(account, api);
      setShowAccountSelector(false);
    } catch (error) {
      console.error('Failed to select account:', error);
      alert('Failed to select account. Please try again.');
    }
    setLoading(false);
  };

  const disconnectWallet = () => {
    onDisconnect();
    setAccounts([]);
    setShowAccountSelector(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`relative ${className}`}>
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan px-4 py-2 text-sm font-bold hover:bg-cyber-cyan hover:text-black transition-all tracking-wider uppercase shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(0,240,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="bg-cyber-green/20 border border-cyber-green text-cyber-green px-3 py-1 text-xs font-mono rounded">
            {formatAddress(currentAccount?.address || '')}
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500/10 border border-red-500 text-red-400 px-3 py-1 text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            DISCONNECT
          </button>
        </div>
      )}

      {/* Account Selector Modal */}
      {showAccountSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cyber-panel border border-cyber-cyan/50 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4 text-center">Select Account</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account.address}
                  onClick={() => selectAccount(account)}
                  disabled={loading}
                  className="w-full p-3 bg-cyber-dim/50 border border-cyber-dim rounded hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all text-left disabled:opacity-50"
                >
                  <div className="text-sm text-white font-mono">
                    {account.meta.name || 'Unnamed Account'}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {formatAddress(account.address)}
                  </div>
                  <div className="text-xs text-cyber-dim mt-1">
                    via {account.meta.source}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAccountSelector(false)}
              className="w-full mt-4 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};