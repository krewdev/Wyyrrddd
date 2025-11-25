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
  imageUrl?: string;
  videoUrl?: string;
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

// Privacy-preserving location data point (never actual coordinates)
export interface LocationDataPoint {
  id: string;
  zoneHash: string; // Hashed zone identifier (e.g., "grocery_store_zone_5")
  category: string; // "grocery", "retail", "restaurant", etc.
  timestamp: number;
  userId?: string; // Optional, only if user opted in
}

// Geocaching Ad Campaign
export interface GeocacheCampaign {
  id: string;
  advertiserId: string;
  advertiserName: string;
  brand: string;
  title: string;
  description: string;
  targetZones: string[]; // Array of zone hashes
  targetCategories: string[]; // Categories to target
  targetInterests: string[]; // User interests/preferences
  adContent: {
    imageUrl?: string;
    videoUrl?: string;
    couponCode?: string;
    discount?: string;
    message: string;
  };
  reward: number; // Token reward for interaction
  budget: number; // Total campaign budget in DOT
  spent: number; // Amount spent so far
  startDate: number;
  endDate: number;
  isActive: boolean;
  impressions: number;
  interactions: number;
}

// Advertiser Account
export interface Advertiser {
  id: string;
  name: string;
  brand: string;
  walletAddress: string;
  totalSpent: number;
  activeCampaigns: number;
  totalImpressions: number;
  totalInteractions: number;
}

// Content Creator Stream to Location
export interface CreatorStream {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  streamUrl: string; // Video stream URL
  thumbnailUrl?: string;
  targetZones: string[]; // Array of zone hashes
  targetCategories: string[]; // Categories to target
  startDate: number;
  endDate: number;
  isActive: boolean;
  views: number;
  interactions: number;
  reward: number; // Token reward for watching/interacting
}

export interface WalletState {
  balances: {
    [key in TokenType]: number;
  };
  usdcBalance: number;
}
