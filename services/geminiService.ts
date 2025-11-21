import { GoogleGenAI, Type } from "@google/genai";
import { Post, TokenType } from "../types";

// Initialize the Gemini API client safely (so missing key doesn't crash the app in browser)
const apiKey = (process.env.API_KEY as string | undefined) || (process.env.GEMINI_API_KEY as string | undefined);

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn(
    "[Wyyrrddd] Gemini API key not set; falling back to local/mock content. " +
      "Set GEMINI_API_KEY in your environment if you want live AI content."
  );
}

export const generateFeedContent = async (): Promise<Post[]> => {
  try {
    // If no API client, immediately return fallback content
    if (!ai) {
      throw new Error("Gemini client not initialized");
    }

    const model = "gemini-2.5-flash";
    const prompt = `
      Generate 5 realistic social media posts for a high-tech Web3 platform called "Wyyrrddd".
      The tone should be modern, trendy, and influential.
      Each post should have a username, a short caption (max 20 words), and a realistic placeholder image URL using https://picsum.photos/seed/{seed}/600/800.
      Captions should cover topics like: Streetwear drops, Crypto markets, Art exhibitions, Nightlife, or Tech reviews.
      Return a JSON array.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              username: { type: Type.STRING },
              caption: { type: Type.STRING },
              seed: { type: Type.STRING },
            },
            required: ["id", "username", "caption", "seed"],
          },
        },
      },
    });

    const generatedData = JSON.parse(response.text || "[]");

    // Enrich with default data
    return generatedData.map((item: any) => ({
      id: item.id,
      userId: `user-${item.id}`,
      username: item.username,
      userAvatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${item.username}`,
      imageUrl: `https://picsum.photos/seed/${item.seed}/600/800`,
      caption: item.caption,
      tokens: {
        [TokenType.LIKE]: Math.floor(Math.random() * 100),
        [TokenType.LOVE]: Math.floor(Math.random() * 50),
        [TokenType.CARE]: Math.floor(Math.random() * 20),
        [TokenType.CREEP]: Math.floor(Math.random() * 10),
      },
      isSponsored: Math.random() > 0.8,
    }));
  } catch (error) {
    console.error("Failed to generate feed:", error);
    // Fallback content
    return [
      {
        id: "fallback-1",
        userId: "u1",
        username: "Alex_Chen",
        userAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AlexChen",
        imageUrl: "https://picsum.photos/seed/tech1/600/800",
        caption: "Checking out the new AR installation downtown. The graphics are insane. #FutureArt",
        tokens: { LIKE: 120, LOVE: 45, CARE: 10, CREEP: 5 },
      },
      {
        id: "fallback-2",
        userId: "u2",
        username: "CryptoChloe",
        userAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=CryptoChloe",
        imageUrl: "https://picsum.photos/seed/tech2/600/800",
        caption: "Market volatility is high today. Remember to monetize your data streams.",
        tokens: { LIKE: 89, LOVE: 120, CARE: 5, CREEP: 55 },
      },
    ];
  }
};

export const analyzeSurroundings = async (lat: number, lng: number): Promise<string> => {
  try {
    if (!ai) {
      throw new Error("Gemini client not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an ad server for a location-based app. 
      Generate a short, punchy broadcast advertisement for a fictional brand (like a coffee shop, sneaker store, or tech brand) at coordinates ${lat}, ${lng}. 
      Format it like a notification: "Brand Name: Short Offer". Max 10 words.`,
    });
    return response.text || "Network Node: Signal clear.";
  } catch (e) {
    return "Signal interference detected. Rescanning.";
  }
};