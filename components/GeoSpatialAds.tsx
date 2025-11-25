import React, { useState, useEffect, useRef } from 'react';
import { GeocacheCampaign, CreatorStream, LocationDataPoint } from '../types';
import { useWallet } from '../contexts/WalletContext';
import { TokenType } from '../types';

interface GeoSpatialAdsProps {
  onAdInteraction?: (campaignId: string) => void;
}

// Simulated location data point generator (privacy-preserving)
const generateLocationDataPoint = (): LocationDataPoint => {
  // Never use actual coordinates - only category and zone hash
  const categories = ['grocery', 'retail', 'restaurant', 'entertainment', 'services'];
  const zones = ['zone_1', 'zone_2', 'zone_3', 'zone_4', 'zone_5'];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const zone = zones[Math.floor(Math.random() * zones.length)];
  
  // Hash the zone to ensure privacy
  const zoneHash = btoa(`${category}_${zone}`).substring(0, 16);
  
  return {
    id: Date.now().toString(),
    zoneHash,
    category,
    timestamp: Date.now()
  };
};

// Simulated active campaigns (in production, these come from the DAO/blockchain)
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

interface GeoSpatialAdsProps {
  onAdInteraction?: (campaignId: string) => void;
  onStreamInteraction?: (streamId: string) => void;
}

export const GeoSpatialAds: React.FC<GeoSpatialAdsProps> = ({ onAdInteraction, onStreamInteraction }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationDataPoint | null>(null);
  const [activeAds, setActiveAds] = useState<GeocacheCampaign[]>([]);
  const [activeStreams, setActiveStreams] = useState<CreatorStream[]>([]);
  const [showAd, setShowAd] = useState<GeocacheCampaign | null>(null);
  const [showStream, setShowStream] = useState<CreatorStream | null>(null);
  const { earnToken, isSellingData } = useWallet();

  // Mock creator streams (in production, from DAO/blockchain)
  const mockStreams: CreatorStream[] = [
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

  // Simulate location updates (privacy-preserving)
  useEffect(() => {
    if (!isSellingData) {
      setActiveAds([]);
      setActiveStreams([]);
      setShowAd(null);
      setShowStream(null);
      return;
    }

    // Generate initial location
    const location = generateLocationDataPoint();
    setCurrentLocation(location);

    // Check for matching ads
    const matchingAds = mockCampaigns.filter(campaign => {
      if (!campaign.isActive) return false;
      const zoneMatch = campaign.targetZones.includes(location.zoneHash);
      const categoryMatch = campaign.targetCategories.includes(location.category);
      return zoneMatch || categoryMatch;
    });

    // Check for matching streams
    const matchingStreams = mockStreams.filter(stream => {
      if (!stream.isActive) return false;
      const zoneMatch = stream.targetZones.includes(location.zoneHash);
      const categoryMatch = stream.targetCategories.includes(location.category);
      return zoneMatch || categoryMatch;
    });

    setActiveAds(matchingAds);
    setActiveStreams(matchingStreams);

    // Simulate periodic location updates (every 30 seconds)
    const locationInterval = setInterval(() => {
      const newLocation = generateLocationDataPoint();
      setCurrentLocation(newLocation);
      
      const newMatchingAds = mockCampaigns.filter(campaign => {
        if (!campaign.isActive) return false;
        const zoneMatch = campaign.targetZones.includes(newLocation.zoneHash);
        const categoryMatch = campaign.targetCategories.includes(newLocation.category);
        return zoneMatch || categoryMatch;
      });
      
      const newMatchingStreams = mockStreams.filter(stream => {
        if (!stream.isActive) return false;
        const zoneMatch = stream.targetZones.includes(newLocation.zoneHash);
        const categoryMatch = stream.targetCategories.includes(newLocation.category);
        return zoneMatch || categoryMatch;
      });
      
      setActiveAds(newMatchingAds);
      setActiveStreams(newMatchingStreams);
      
      // Show ad or stream if new match found
      if (newMatchingAds.length > 0 && Math.random() > 0.7) {
        setShowAd(newMatchingAds[0]);
      } else if (newMatchingStreams.length > 0 && Math.random() > 0.7) {
        setShowStream(newMatchingStreams[0]);
      }
    }, 30000);

    return () => clearInterval(locationInterval);
  }, [isSellingData]);

  const handleAdInteraction = (campaign: GeocacheCampaign) => {
    earnToken(TokenType.CARE, campaign.reward);
    if (onAdInteraction) {
      onAdInteraction(campaign.id);
    }
    setShowAd(null);
  };

  const handleStreamInteraction = (stream: CreatorStream) => {
    earnToken(TokenType.CARE, stream.reward);
    if (onStreamInteraction) {
      onStreamInteraction(stream.id);
    }
    setShowStream(null);
  };

  const handleDismissAd = () => {
    setShowAd(null);
  };

  return (
    <>
      {/* Active Ads/Streams Indicator */}
      {isSellingData && (activeAds.length > 0 || activeStreams.length > 0) && (
        <div className="fixed bottom-24 left-4 z-50 glass border border-cyber-green/40 p-3 neon-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse shadow-neon-green"></div>
            <span className="text-[10px] font-mono text-cyber-green uppercase tracking-wider">
              {activeAds.length + activeStreams.length} Active
            </span>
          </div>
        </div>
      )}

      {/* Geocache Ad Popup */}
      {showAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cyber-black/80 backdrop-blur-sm">
          <div className="glass-strong border border-cyber-cyan/60 p-6 max-w-md w-full neon-border relative overflow-hidden energy-flow">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyber-cyan"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyber-pink"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyber-green"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyber-yellow"></div>

            {/* Ad Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] font-mono text-cyber-cyan uppercase tracking-wider mb-1">
                    Geocache Ad
                  </div>
                  <h3 className="text-xl font-black text-white mb-1">{showAd.brand}</h3>
                  <p className="text-sm text-gray-400">{showAd.title}</p>
                </div>
                <button
                  onClick={handleDismissAd}
                  className="text-cyber-dim hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-3">{showAd.adContent.message}</p>
                {showAd.adContent.couponCode && (
                  <div className="glass border border-cyber-pink/40 p-3 mb-3">
                    <div className="text-[10px] font-mono text-cyber-pink uppercase tracking-wider mb-1">
                      Coupon Code
                    </div>
                    <div className="text-lg font-mono text-white font-bold">{showAd.adContent.couponCode}</div>
                    {showAd.adContent.discount && (
                      <div className="text-xs text-cyber-green mt-1">{showAd.adContent.discount}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAdInteraction(showAd)}
                  className="flex-1 glass-strong border border-cyber-green/60 bg-cyber-green/10 text-cyber-green px-4 py-3 text-sm font-mono uppercase tracking-wider hover:bg-cyber-green hover:text-black transition-all shadow-neon-green"
                >
                  Claim +{showAd.reward} CARE
                </button>
                <button
                  onClick={handleDismissAd}
                  className="glass border border-cyber-dim text-gray-400 px-4 py-3 text-sm font-mono uppercase tracking-wider hover:border-cyber-cyan hover:text-white transition-all"
                >
                  Dismiss
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-cyber-dim/30">
                <div className="text-[9px] font-mono text-cyber-dim">
                  Privacy: Location data anonymized. No actual coordinates shared.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creator Stream Popup */}
      {showStream && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cyber-black/80 backdrop-blur-sm">
          <div className="glass-strong border border-cyber-green/60 p-6 max-w-md w-full neon-border relative overflow-hidden energy-flow">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyber-green"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyber-pink"></div>

            {/* Stream Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={showStream.creatorAvatar} 
                    alt={showStream.creatorName}
                    className="w-12 h-12 rounded-full border-2 border-cyber-green"
                  />
                  <div>
                    <div className="text-[10px] font-mono text-cyber-green uppercase tracking-wider mb-1">
                      Creator Stream
                    </div>
                    <h3 className="text-lg font-black text-white">{showStream.creatorName}</h3>
                    <p className="text-sm text-gray-400">{showStream.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStream(null)}
                  className="text-cyber-dim hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {showStream.thumbnailUrl && (
                <div className="mb-4 relative">
                  <img 
                    src={showStream.thumbnailUrl} 
                    alt={showStream.title}
                    className="w-full h-48 object-cover rounded border border-cyber-green/40"
                  />
                  <div className="absolute top-2 right-2 glass border border-red-500/60 text-red-400 px-2 py-1 text-[9px] font-mono uppercase">
                    LIVE
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-300 mb-4">{showStream.description}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStreamInteraction(showStream)}
                  className="flex-1 glass-strong border border-cyber-green/60 bg-cyber-green/10 text-cyber-green px-4 py-3 text-sm font-mono uppercase tracking-wider hover:bg-cyber-green hover:text-black transition-all shadow-neon-green"
                >
                  Watch +{showStream.reward} CARE
                </button>
                <button
                  onClick={() => setShowStream(null)}
                  className="glass border border-cyber-dim text-gray-400 px-4 py-3 text-sm font-mono uppercase tracking-wider hover:border-cyber-cyan hover:text-white transition-all"
                >
                  Dismiss
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-cyber-dim/30">
                <div className="text-[9px] font-mono text-cyber-dim">
                  Privacy: Location data anonymized. No actual coordinates shared.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

