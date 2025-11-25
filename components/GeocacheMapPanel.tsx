import React, { useState, useEffect } from 'react';
import { GeocacheMap } from './GeocacheMap';
import { GeocacheCampaign, CreatorStream, LocationDataPoint } from '../types';
import { useWallet } from '../contexts/WalletContext';

interface GeocacheMapPanelProps {
  side: 'left' | 'right';
}

// Mock data - in production, this would come from the DAO/blockchain
const mockCampaigns: GeocacheCampaign[] = [
  {
    id: 'camp_1',
    advertiserId: 'adv_1',
    advertiserName: 'FreshMart Grocery',
    brand: 'FreshMart',
    title: 'Weekly Specials',
    description: 'Save 20% on your favorite organic produce',
    targetZones: ['Z3JvY2VyeV96b25lXzE=', 'Z3JvY2VyeV96b25lXzI='],
    targetCategories: ['grocery'],
    targetInterests: ['organic', 'healthy', 'fresh'],
    adContent: {
      message: '🍎 Fresh organic produce - 20% OFF this week!',
      couponCode: 'FRESH20',
      discount: '20% OFF'
    },
    reward: 15,
    budget: 1000,
    spent: 245,
    startDate: Date.now() - 86400000,
    endDate: Date.now() + 604800000,
    isActive: true,
    impressions: 1250,
    interactions: 89
  },
  {
    id: 'camp_2',
    advertiserId: 'adv_2',
    advertiserName: 'TechHub Electronics',
    brand: 'TechHub',
    title: 'New Arrivals',
    description: 'Latest gadgets and accessories',
    targetZones: ['cmV0YWlsX3pvbmVfMw==', 'cmV0YWlsX3pvbmVfNA=='],
    targetCategories: ['retail'],
    targetInterests: ['technology', 'gadgets', 'electronics'],
    adContent: {
      message: '⚡ New tech arrivals! Check out our latest collection',
      couponCode: 'TECH15',
      discount: '15% OFF'
    },
    reward: 25,
    budget: 2000,
    spent: 890,
    startDate: Date.now() - 172800000,
    endDate: Date.now() + 2592000000,
    isActive: true,
    impressions: 3420,
    interactions: 156
  }
];

const mockCreatorStreams: CreatorStream[] = [
  {
    id: 'stream_1',
    creatorId: 'creator_1',
    creatorName: 'TechReviewer',
    creatorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=TechReviewer',
    title: 'Live Tech Unboxing',
    description: 'Unboxing the latest gadgets at TechHub',
    streamUrl: 'https://example.com/stream1',
    thumbnailUrl: 'https://via.placeholder.com/300',
    targetZones: ['cmV0YWlsX3pvbmVfMw=='],
    targetCategories: ['retail'],
    startDate: Date.now() - 3600000,
    endDate: Date.now() + 7200000,
    isActive: true,
    views: 450,
    interactions: 67,
    reward: 20
  },
  {
    id: 'stream_2',
    creatorId: 'creator_2',
    creatorName: 'FoodieVibes',
    creatorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=FoodieVibes',
    title: 'Grocery Haul Live',
    description: 'Shopping for organic produce at FreshMart',
    streamUrl: 'https://example.com/stream2',
    thumbnailUrl: 'https://via.placeholder.com/300',
    targetZones: ['Z3JvY2VyeV96b25lXzE='],
    targetCategories: ['grocery'],
    startDate: Date.now() - 1800000,
    endDate: Date.now() + 3600000,
    isActive: true,
    views: 320,
    interactions: 45,
    reward: 15
  }
];

export const GeocacheMapPanel: React.FC<GeocacheMapPanelProps> = ({ side }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationDataPoint | null>(null);
  const { isSellingData } = useWallet();

  // Generate privacy-preserving location data point
  const generateLocationDataPoint = (): LocationDataPoint => {
    const categories = ['grocery', 'retail', 'restaurant', 'entertainment', 'services'];
    const zones = ['zone_1', 'zone_2', 'zone_3', 'zone_4', 'zone_5'];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const zoneHash = btoa(`${category}_${zone}`).substring(0, 16);
    
    return {
      id: Date.now().toString(),
      zoneHash,
      category,
      timestamp: Date.now()
    };
  };

  useEffect(() => {
    if (!isSellingData) {
      setCurrentLocation(null);
      return;
    }

    // Generate initial location
    const location = generateLocationDataPoint();
    setCurrentLocation(location);

    // Update location periodically
    const interval = setInterval(() => {
      const newLocation = generateLocationDataPoint();
      setCurrentLocation(newLocation);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isSellingData]);

  return (
    <div className={`h-full flex flex-col ${
      side === 'left' 
        ? 'bg-gradient-to-b from-cyber-cyan/5 to-transparent' 
        : 'bg-gradient-to-b from-cyber-pink/5 to-transparent'
    }`}>
      {/* Header */}
      <div className={`p-2 border-b ${
        side === 'left' ? 'border-cyber-cyan/30' : 'border-cyber-pink/30'
      }`}>
        <div className={`text-[9px] font-mono uppercase tracking-wider ${
          side === 'left' ? 'text-cyber-cyan' : 'text-cyber-pink'
        }`}>
          {side === 'left' ? 'GEO CACHE MAP' : 'ACTIVE STREAMS'}
        </div>
        <div className="text-[8px] text-gray-500 font-mono mt-1">
          {side === 'left' 
            ? `${mockCampaigns.filter(c => c.isActive).length} Active`
            : `${mockCreatorStreams.filter(s => s.isActive).length} Live`
          }
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative overflow-hidden min-h-[300px]">
        <GeocacheMap
          side={side}
          campaigns={side === 'left' ? mockCampaigns : []}
          creatorStreams={side === 'right' ? mockCreatorStreams : []}
          currentLocation={currentLocation}
        />
      </div>

      {/* Status Footer */}
      <div className={`p-2 border-t ${
        side === 'left' ? 'border-cyber-cyan/30' : 'border-cyber-pink/30'
      }`}>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${
            isSellingData 
              ? (side === 'left' ? 'bg-cyber-cyan animate-pulse' : 'bg-cyber-pink animate-pulse')
              : 'bg-gray-600'
          }`}></div>
          <span className="text-[8px] font-mono text-gray-500">
            {isSellingData ? 'TRACKING' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};

