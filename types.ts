export enum TokenType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  CARE = 'CARE',
  CREEP = 'CREEP',
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  walletAddress: string;
  isDataSellingEnabled: boolean;
  reputationScore: number;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  tokens: {
    [key in TokenType]: number;
  };
  isSponsored?: boolean; // Paid for reach
  boostLevel?: number;
}

export interface AdLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  reward: number;
  description: string;
  brand: string;
}

export interface WalletState {
  balances: {
    [key in TokenType]: number;
  };
  usdcBalance: number;
}
