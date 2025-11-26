/**
 * Perplexity AI Service
 * Powers intelligent search and Q&A functionality
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Query Perplexity AI with a search or question
 */
export async function queryPerplexity(
  query: string,
  context?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.warn('Perplexity API key not found. Using fallback response.');
    return 'To use Perplexity AI search, please add your PERPLEXITY_API_KEY to the environment variables.';
  }

  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: context || 'You are a helpful assistant for the Wyyrrddd decentralized social network. Provide concise, accurate answers about Web3, blockchain, social media, and related topics.'
    },
    {
      role: 'user',
      content: query
    }
  ];

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: 0.2,
        top_p: 0.9,
        return_citations: true,
        search_domain_filter: ['perplexity.ai'],
        return_images: false,
        return_related_questions: true,
        search_recency_filter: 'month',
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0]?.message?.content || 'No response received.';
  } catch (error) {
    console.error('Error querying Perplexity:', error);
    return 'Sorry, I encountered an error while searching. Please try again.';
  }
}

/**
 * Search for crypto/Web3 related information
 */
export async function searchWeb3Info(query: string): Promise<string> {
  return queryPerplexity(
    query,
    'You are a Web3 and cryptocurrency expert. Provide accurate, up-to-date information about blockchain technology, cryptocurrencies, DeFi, NFTs, and related topics. Include relevant statistics and sources when available.'
  );
}

/**
 * Get help with Wyyrrddd features
 */
export async function getWyyrrdddHelp(question: string): Promise<string> {
  const context = `You are a helpful guide for Wyyrrddd, a decentralized social network built on Polkadot. 
  
Key features include:
- Tokenized interactions (LIKE, LOVE, CARE, CREEP tokens)
- Multiple view modes (Grid, Horizontal Scroll, Carousel, Web Network, 3D Space)
- Privacy-first geo-spatial advertising
- Wallet integration with Polkadot
- Visual effects and particle systems
- Mobile-optimized with PWA support

Provide clear, friendly answers about how to use these features.`;

  return queryPerplexity(question, context);
}

/**
 * Search for content recommendations
 */
export async function getContentRecommendations(interests: string[]): Promise<string> {
  const query = `Based on interests in ${interests.join(', ')}, suggest trending topics and content ideas for a decentralized social network.`;
  
  return queryPerplexity(
    query,
    'You are a content recommendation engine. Suggest engaging topics, trending conversations, and content ideas based on user interests.'
  );
}

/**
 * Explain blockchain/crypto concepts
 */
export async function explainConcept(concept: string): Promise<string> {
  return queryPerplexity(
    `Explain ${concept} in simple terms for someone new to Web3 and blockchain technology.`,
    'You are a patient educator explaining Web3 concepts. Use simple language, analogies, and examples. Be concise but thorough.'
  );
}

/**
 * Generate contextual ad messages based on location
 */
export async function generateGeoAd(lat: number, lng: number): Promise<string> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    // Fallback to mock ads if no API key
    const mockAds = [
      'CryptoExchange: Trade DOT with zero fees for the next 24 hours!',
      'Web3Wallet: Secure your crypto assets with military-grade encryption.',
      'NFTMarketplace: Discover exclusive Polkadot NFT drops near you.',
      'DeFiProtocol: Earn up to 15% APY on your DOT holdings.',
      'BlockchainCafe: First Web3 café in your area - Pay with crypto!'
    ];
    return mockAds[Math.floor(Math.random() * mockAds.length)];
  }

  try {
    const result = await queryPerplexity(
      `Generate a short, engaging advertisement message (brand name followed by colon, then message) for a Web3/crypto business that could be targeting users near coordinates ${lat}, ${lng}. Keep it under 100 characters total. Format: "BrandName: Message"`,
      'You are a creative advertising copywriter for Web3 and blockchain companies. Create concise, engaging ad messages.'
    );
    return result;
  } catch (error) {
    // Fallback to mock ad on error
    const mockAds = [
      'CryptoExchange: Trade DOT with zero fees for the next 24 hours!',
      'Web3Wallet: Secure your crypto assets with military-grade encryption.',
      'NFTMarketplace: Discover exclusive Polkadot NFT drops near you.'
    ];
    return mockAds[Math.floor(Math.random() * mockAds.length)];
  }
}


