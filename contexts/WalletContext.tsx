import React, { createContext, useContext, useState, useEffect } from 'react';
import { TokenType, WalletState } from '../types';
import { ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface TokenRates {
  [TokenType.LIKE]: number; // Cost in DOT
  [TokenType.LOVE]: number;
  [TokenType.CARE]: number;
  [TokenType.CREEP]: number;
}

interface WalletContextType {
  wallet: WalletState;
  dotPrice: number; // Price of DOT in USD
  tokenRates: TokenRates;
  spendToken: (type: TokenType) => boolean;
  earnToken: (type: TokenType, amount: number) => void;
  isSellingData: boolean;
  toggleSellingData: () => void;
  daoEarningsDot: number;
  // Wallet connection
  isWalletConnected: boolean;
  connectedAccount: InjectedAccountWithMeta | null;
  api: ApiPromise | null;
  connectWallet: (account: InjectedAccountWithMeta, api: ApiPromise) => void;
  disconnectWallet: () => void;
  dotBalance: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    balances: {
      [TokenType.LIKE]: 500,
      [TokenType.LOVE]: 100,
      [TokenType.CARE]: 50,
      [TokenType.CREEP]: 25,
    },
    usdcBalance: 0 // We will calculate net worth dynamically
  });

  const [dotPrice, setDotPrice] = useState<number>(7.42); // Fallback initial price
  const [isSellingData, setIsSellingData] = useState(false);
  const [daoEarningsDot, setDaoEarningsDot] = useState(1.25);

  // Wallet connection state
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [dotBalance, setDotBalance] = useState('0');

  // Fixed costs in DOT for the MVP
  const tokenRates: TokenRates = {
    [TokenType.LIKE]: 0.002,
    [TokenType.LOVE]: 0.01,
    [TokenType.CARE]: 0.05,
    [TokenType.CREEP]: 0.25,
  };

  // Fetch live DOT price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coincap.io/v2/assets/polkadot');
        const data = await res.json();
        if (data.data && data.data.priceUsd) {
          setDotPrice(parseFloat(data.data.priceUsd));
        }
      } catch (e) {
        console.error("Failed to fetch DOT price, using fallback.");
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Simulate passive income from data selling (in DOT)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSellingData) {
      interval = setInterval(() => {
        setDaoEarningsDot(prev => prev + 0.0001);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSellingData]);

  const spendToken = (type: TokenType) => {
    if (wallet.balances[type] >= 1) {
      setWallet(prev => ({
        ...prev,
        balances: {
          ...prev.balances,
          [type]: prev.balances[type] - 1
        }
      }));
      return true;
    }
    return false;
  };

  const earnToken = (type: TokenType, amount: number) => {
    setWallet(prev => ({
      ...prev,
      balances: {
        ...prev.balances,
        [type]: prev.balances[type] + amount
      }
    }));
  };

  const toggleSellingData = () => setIsSellingData(!isSellingData);

  // Wallet connection functions
  const connectWallet = async (account: InjectedAccountWithMeta, apiInstance: ApiPromise) => {
    setConnectedAccount(account);
    setApi(apiInstance);
    setIsWalletConnected(true);

    // Fetch initial balance
    try {
      const { data: { free: balance } } = await apiInstance.query.system.account(account.address);
      setDotBalance(balance.toHuman());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const disconnectWallet = () => {
    setConnectedAccount(null);
    setApi(null);
    setIsWalletConnected(false);
    setDotBalance('0');
  };

  // Fetch balance periodically when connected
  useEffect(() => {
    if (isWalletConnected && api && connectedAccount) {
      const fetchBalance = async () => {
        try {
          const { data: { free: balance } } = await api.query.system.account(connectedAccount.address);
          setDotBalance(balance.toHuman());
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      };

      fetchBalance();
      const interval = setInterval(fetchBalance, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isWalletConnected, api, connectedAccount]);

  return (
    <WalletContext.Provider value={{
      wallet,
      dotPrice,
      tokenRates,
      spendToken,
      earnToken,
      isSellingData,
      toggleSellingData,
      daoEarningsDot,
      isWalletConnected,
      connectedAccount,
      api,
      connectWallet,
      disconnectWallet,
      dotBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};