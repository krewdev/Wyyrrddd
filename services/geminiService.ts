/**
 * Gemini AI Service
 * Powers AI-generated feed content
 */

import { Post, TokenType } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

/**
 * Generate feed content using Gemini AI
 */
export async function generateFeedContent(): Promise<Post[]> {
  // If no API key, return mock data
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using mock feed content.');
    return getMockFeedContent();
  }

  try {
    // You can implement actual Gemini API calls here
    // For now, returning mock data
    return getMockFeedContent();
  } catch (error) {
    console.error('Error generating feed content:', error);
    return getMockFeedContent();
  }
}

/**
 * Mock feed content for development/fallback
 */
function getMockFeedContent(): Post[] {
  const mockPosts: Post[] = [
    {
      id: '1',
      userId: 'user1',
      username: 'CryptoExplorer',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=CryptoExplorer',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=1000&fit=crop',
      caption: 'Just discovered the amazing world of Polkadot parachains! 🚀 The future of blockchain interoperability is here. #Polkadot #Web3',
      tokens: {
        [TokenType.LIKE]: 42,
        [TokenType.LOVE]: 18,
        [TokenType.CARE]: 7,
        [TokenType.CREEP]: 2,
      },
      isSponsored: false,
    },
    {
      id: '2',
      userId: 'user2',
      username: 'DeFiQueen',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=DeFiQueen',
      imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&h=1000&fit=crop',
      caption: 'Staking rewards looking good this week! 💰 Love the passive income from my DOT holdings. Who else is staking? #DeFi #Staking',
      tokens: {
        [TokenType.LIKE]: 89,
        [TokenType.LOVE]: 34,
        [TokenType.CARE]: 12,
        [TokenType.CREEP]: 5,
      },
      isSponsored: false,
    },
    {
      id: '3',
      userId: 'user3',
      username: 'NFTCollector',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=NFTCollector',
      imageUrl: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&h=1000&fit=crop',
      caption: 'My latest NFT collection drop is live! 🎨 Check out these unique pieces on the Polkadot ecosystem. Link in bio! #NFT #DigitalArt',
      tokens: {
        [TokenType.LIKE]: 156,
        [TokenType.LOVE]: 67,
        [TokenType.CARE]: 23,
        [TokenType.CREEP]: 8,
      },
      isSponsored: true,
      boostLevel: 3,
    },
    {
      id: '4',
      userId: 'user4',
      username: 'BlockchainDev',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=BlockchainDev',
      imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=1000&fit=crop',
      caption: 'Just deployed my first smart contract on Polkadot! 🎉 The developer experience is incredible. Tutorial coming soon! #Blockchain #Coding',
      tokens: {
        [TokenType.LIKE]: 203,
        [TokenType.LOVE]: 45,
        [TokenType.CARE]: 31,
        [TokenType.CREEP]: 3,
      },
      isSponsored: false,
    },
    {
      id: '5',
      userId: 'user5',
      username: 'Web3Educator',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Web3Educator',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: '5 things you need to know about decentralized finance! 📚 Swipe to learn the basics of DeFi. #Education #Web3 #DeFi',
      tokens: {
        [TokenType.LIKE]: 312,
        [TokenType.LOVE]: 89,
        [TokenType.CARE]: 156,
        [TokenType.CREEP]: 12,
      },
      isSponsored: false,
    },
    {
      id: '6',
      userId: 'user6',
      username: 'MetaverseBuilder',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=MetaverseBuilder',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=1000&fit=crop',
      caption: 'Building the future of virtual worlds on Polkadot 🌐 Join our metaverse community! #Metaverse #VR #Web3',
      tokens: {
        [TokenType.LIKE]: 178,
        [TokenType.LOVE]: 56,
        [TokenType.CARE]: 34,
        [TokenType.CREEP]: 21,
      },
      isSponsored: true,
      boostLevel: 2,
    },
    {
      id: '7',
      userId: 'user7',
      username: 'DAOLeader',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=DAOLeader',
      imageUrl: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&h=1000&fit=crop',
      caption: 'Our DAO just passed a major governance proposal! 🗳️ Democracy in action. This is what Web3 is all about! #DAO #Governance',
      tokens: {
        [TokenType.LIKE]: 267,
        [TokenType.LOVE]: 92,
        [TokenType.CARE]: 78,
        [TokenType.CREEP]: 6,
      },
      isSponsored: false,
    },
    {
      id: '8',
      userId: 'user8',
      username: 'TokenomicsExpert',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=TokenomicsExpert',
      imageUrl: 'https://images.unsplash.com/photo-1621416894627-b2f4c1441eb6?w=800&h=1000&fit=crop',
      caption: 'Deep dive into Polkadot\'s tokenomics 📊 Why DOT is positioned for long-term growth. Thread below 🧵 #Tokenomics #Analysis',
      tokens: {
        [TokenType.LIKE]: 445,
        [TokenType.LOVE]: 123,
        [TokenType.CARE]: 89,
        [TokenType.CREEP]: 15,
      },
      isSponsored: false,
    },
  ];

  return mockPosts;
}

/**
 * Generate a single post with AI (placeholder for future implementation)
 */
export async function generatePost(prompt: string): Promise<Post | null> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found.');
    return null;
  }

  try {
    // Implement Gemini API call here
    return null;
  } catch (error) {
    console.error('Error generating post:', error);
    return null;
  }
}

/**
 * Generate captions for images using AI
 */
export async function generateCaption(imageUrl: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return 'Check out this amazing moment! 🌟 #Wyyrrddd';
  }

  try {
    // Implement Gemini Vision API call here
    return 'Check out this amazing moment! 🌟 #Wyyrrddd';
  } catch (error) {
    console.error('Error generating caption:', error);
    return 'Check out this amazing moment! 🌟 #Wyyrrddd';
  }
}

