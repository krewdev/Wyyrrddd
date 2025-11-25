import React, { useState } from 'react';
import { GeocacheCampaign } from '../types';

interface AdvertiserDashboardProps {
  onCampaignCreate?: (campaign: GeocacheCampaign) => void;
}

export const AdvertiserDashboard: React.FC<AdvertiserDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics'>('create');
  const [campaigns, setCampaigns] = useState<GeocacheCampaign[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    advertiserName: '',
    brand: '',
    title: '',
    description: '',
    targetCategories: [] as string[],
    targetInterests: [] as string[],
    message: '',
    couponCode: '',
    discount: '',
    reward: 10,
    budget: 100,
    duration: 7 // days
  });

  const categories = ['grocery', 'retail', 'restaurant', 'entertainment', 'services', 'healthcare', 'education'];
  const interests = ['organic', 'healthy', 'fresh', 'technology', 'gadgets', 'electronics', 'fashion', 'fitness', 'travel'];

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      targetCategories: prev.targetCategories.includes(category)
        ? prev.targetCategories.filter(c => c !== category)
        : [...prev.targetCategories, category]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      targetInterests: prev.targetInterests.includes(interest)
        ? prev.targetInterests.filter(i => i !== interest)
        : [...prev.targetInterests, interest]
    }));
  };

  const handleCreateCampaign = () => {
    // Generate zone hashes based on selected categories
    const targetZones = formData.targetCategories.map(cat => {
      const zones = ['zone_1', 'zone_2', 'zone_3', 'zone_4', 'zone_5'];
      return zones.map(zone => btoa(`${cat}_${zone}`).substring(0, 16));
    }).flat();

    const newCampaign: GeocacheCampaign = {
      id: `camp_${Date.now()}`,
      advertiserId: 'adv_' + Date.now(),
      advertiserName: formData.advertiserName,
      brand: formData.brand,
      title: formData.title,
      description: formData.description,
      targetZones,
      targetCategories: formData.targetCategories,
      targetInterests: formData.targetInterests,
      adContent: {
        message: formData.message,
        couponCode: formData.couponCode || undefined,
        discount: formData.discount || undefined
      },
      reward: formData.reward,
      budget: formData.budget,
      spent: 0,
      startDate: Date.now(),
      endDate: Date.now() + (formData.duration * 86400000),
      isActive: true,
      impressions: 0,
      interactions: 0
    };

    setCampaigns([...campaigns, newCampaign]);
    
    // Reset form
    setFormData({
      advertiserName: '',
      brand: '',
      title: '',
      description: '',
      targetCategories: [],
      targetInterests: [],
      message: '',
      couponCode: '',
      discount: '',
      reward: 10,
      budget: 100,
      duration: 7
    });

    alert('Geocache Campaign Created! Your ads will be distributed to matching zones.');
  };

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalInteractions = campaigns.reduce((sum, c) => sum + c.interactions, 0);
  const activeCampaigns = campaigns.filter(c => c.isActive).length;

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-4 pb-24">
      {/* Header */}
      <div className="glass-strong border border-cyber-cyan/40 p-6 mb-6 neon-border relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
        <h1 className="text-3xl font-black tracking-tight holographic-text mb-2">
          Advertiser Dashboard
        </h1>
        <p className="text-gray-400 font-mono text-sm">
          Launch privacy-preserving geocaching ad campaigns
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass border border-cyber-cyan/40 p-4">
          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-1">Active Campaigns</div>
          <div className="text-2xl font-mono text-cyber-cyan font-bold">{activeCampaigns}</div>
        </div>
        <div className="glass border border-cyber-pink/40 p-4">
          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-1">Total Spent</div>
          <div className="text-2xl font-mono text-cyber-pink font-bold">{totalSpent.toFixed(2)} DOT</div>
        </div>
        <div className="glass border border-cyber-green/40 p-4">
          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-1">Impressions</div>
          <div className="text-2xl font-mono text-cyber-green font-bold">{totalImpressions.toLocaleString()}</div>
        </div>
        <div className="glass border border-cyber-yellow/40 p-4">
          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-1">Interactions</div>
          <div className="text-2xl font-mono text-cyber-yellow font-bold">{totalInteractions}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
            activeTab === 'create'
              ? 'glass-strong border border-cyber-cyan bg-cyber-cyan text-black shadow-neon-cyan'
              : 'glass border border-cyber-dim text-gray-400 hover:border-cyber-cyan hover:text-white'
          }`}
        >
          Create Campaign
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
            activeTab === 'manage'
              ? 'glass-strong border border-cyber-cyan bg-cyber-cyan text-black shadow-neon-cyan'
              : 'glass border border-cyber-dim text-gray-400 hover:border-cyber-cyan hover:text-white'
          }`}
        >
          Manage Campaigns
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
            activeTab === 'analytics'
              ? 'glass-strong border border-cyber-cyan bg-cyber-cyan text-black shadow-neon-cyan'
              : 'glass border border-cyber-dim text-gray-400 hover:border-cyber-cyan hover:text-white'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Create Campaign Tab */}
      {activeTab === 'create' && (
        <div className="glass-strong border border-cyber-cyan/40 p-6 neon-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
                Advertiser Name
              </label>
              <input
                type="text"
                value={formData.advertiserName}
                onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                placeholder="Brand Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
              Campaign Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
              placeholder="Weekly Specials"
            />
          </div>

          <div>
            <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-gray-300 font-sans focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan resize-none"
              placeholder="Describe your campaign..."
            />
          </div>

          <div>
            <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
              Target Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryToggle(cat)}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all ${
                    formData.targetCategories.includes(cat)
                      ? 'glass-strong border border-cyber-cyan bg-cyber-cyan text-black shadow-neon-cyan'
                      : 'glass border border-cyber-dim text-gray-400 hover:border-cyber-cyan hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
              Target Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all ${
                    formData.targetInterests.includes(interest)
                      ? 'glass-strong border border-cyber-pink bg-cyber-pink text-black shadow-neon-pink'
                      : 'glass border border-cyber-dim text-gray-400 hover:border-cyber-pink hover:text-white'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
              Ad Message
            </label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
              placeholder="Your ad message here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
                Coupon Code (Optional)
              </label>
              <input
                type="text"
                value={formData.couponCode}
                onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                placeholder="SAVE20"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
                Discount (Optional)
              </label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                placeholder="20% OFF"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
                Reward (CARE tokens)
              </label>
              <input
                type="number"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: Number(e.target.value) })}
                className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-cyber-cyan font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
                Budget (DOT)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-cyber-cyan font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                min="1"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full glass border border-cyber-cyan/40 px-3 py-2 text-sm text-cyber-cyan font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan"
                min="1"
              />
            </div>
          </div>

          <button
            onClick={handleCreateCampaign}
            disabled={!formData.advertiserName || !formData.brand || !formData.title || formData.targetCategories.length === 0}
            className="w-full glass-strong border border-cyber-green/60 bg-cyber-green/10 text-cyber-green px-6 py-4 text-sm font-mono uppercase tracking-wider hover:bg-cyber-green hover:text-black transition-all shadow-neon-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Launch Geocache Campaign
          </button>

          <div className="pt-4 border-t border-cyber-dim/30">
            <div className="text-[9px] font-mono text-cyber-dim">
              <strong className="text-cyber-cyan">Privacy Note:</strong> Location data is anonymized using zone hashes. 
              No actual GPS coordinates are ever stored or shared. Users opt-in to data sharing through the DAO.
            </div>
          </div>
        </div>
      )}

      {/* Manage Campaigns Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="glass border border-cyber-dim p-8 text-center">
              <p className="text-gray-400 font-mono text-sm">No campaigns created yet.</p>
            </div>
          ) : (
            campaigns.map(campaign => (
              <div key={campaign.id} className="glass-strong border border-cyber-cyan/40 p-5 neon-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{campaign.brand}</h3>
                    <p className="text-sm text-gray-400">{campaign.title}</p>
                  </div>
                  <span className={`px-2 py-1 text-[9px] font-mono uppercase ${
                    campaign.isActive 
                      ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/40'
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}>
                    {campaign.isActive ? 'ACTIVE' : 'ENDED'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Impressions</div>
                    <div className="text-sm font-mono text-cyber-cyan">{campaign.impressions}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Interactions</div>
                    <div className="text-sm font-mono text-cyber-pink">{campaign.interactions}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Spent</div>
                    <div className="text-sm font-mono text-cyber-yellow">{campaign.spent.toFixed(2)} DOT</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Budget</div>
                    <div className="text-sm font-mono text-white">{campaign.budget} DOT</div>
                  </div>
                </div>
                <button
                  onClick={() => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, isActive: !c.isActive } : c))}
                  className={`w-full px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                    campaign.isActive
                      ? 'glass border border-red-500/40 text-red-400 hover:bg-red-500/10'
                      : 'glass border border-cyber-green/40 text-cyber-green hover:bg-cyber-green/10'
                  }`}
                >
                  {campaign.isActive ? 'Pause Campaign' : 'Resume Campaign'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="glass-strong border border-cyber-cyan/40 p-6 neon-border">
          <h3 className="text-lg font-bold mb-4">Campaign Analytics</h3>
          {campaigns.length === 0 ? (
            <p className="text-gray-400 font-mono text-sm">No data available. Create a campaign to see analytics.</p>
          ) : (
            <div className="space-y-4">
              <div className="glass border border-cyber-dim p-4">
                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-2">Overall Performance</div>
                <div className="text-2xl font-mono text-cyber-cyan font-bold mb-1">
                  {totalInteractions > 0 ? ((totalInteractions / totalImpressions) * 100).toFixed(2) : '0.00'}%
                </div>
                <div className="text-xs text-gray-500 font-mono">Interaction Rate</div>
              </div>
              <div className="text-[9px] font-mono text-cyber-dim">
                Analytics are calculated from anonymized location data points. 
                No individual user tracking or personal data is stored.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};





