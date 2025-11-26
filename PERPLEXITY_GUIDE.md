# Perplexity AI Integration Guide

## 🔮 Overview

Your Wyyrrddd app now includes powerful AI-powered search through Perplexity AI! This feature provides intelligent answers, Web3 information, and help with platform features.

---

## 🎯 Features

### 4 Search Modes

1. **🔍 General Search**
   - Search for anything
   - Get accurate, up-to-date answers
   - Perfect for general questions

2. **💡 Help Mode**
   - Get assistance with Wyyrrddd features
   - Learn how to use different view modes
   - Understand the token economy

3. **⛓️ Web3 Search**
   - Search for crypto and blockchain info
   - Get latest Web3 news and trends
   - Research DeFi, NFTs, and more

4. **📚 Explain Mode**
   - Get simple explanations of complex concepts
   - Perfect for learning about Web3
   - Beginner-friendly explanations

---

## 🚀 How to Use

### Access the Search

1. **Look at the top center** of the screen - you'll see a floating AI search bar
2. **Click the search bar** to activate it and see example queries float out
3. **Choose a mode** using the emoji buttons (🔍 💡 ⛓️ 📚)
4. **Type your question** or click an example query
5. **Press Enter** to search!

### Example Questions

**General Search:**
- "What's happening in crypto today?"
- "Who is Vitalik Buterin?"
- "Explain proof of stake"

**Help Mode:**
- "How do I switch to carousel view?"
- "What are LIKE tokens?"
- "How do I connect my wallet?"

**Web3 Search:**
- "What is Polkadot?"
- "Latest DeFi trends"
- "How does staking work?"

**Explain Mode:**
- "blockchain"
- "smart contracts"
- "decentralized apps"

---

## 🔑 Setup (Required)

### Get Your API Key

1. Visit [Perplexity AI Settings](https://www.perplexity.ai/settings/api)
2. Sign up or log in
3. Generate an API key
4. Copy the key (starts with `pplx-`)

### Add to Your Project

1. Create a file named `.env.local` in the project root
2. Add this line:
   ```env
   VITE_PERPLEXITY_API_KEY=pplx-your-actual-key-here
   PERPLEXITY_API_KEY=pplx-your-actual-key-here
   ```
3. Restart your dev server: `npm run dev`

### Verify It Works

1. Click the purple floating button
2. Type a question
3. You should get an AI-powered answer!

---

## 💡 UI Features

### Visual Elements

- **Floating Search Bar**: Always visible at the top center with gradient glow on focus
- **Example Queries**: 6 beautiful cards that float out when you click the search bar
- **Mode Selector**: 4 emoji buttons for quick mode switching
- **Smart Icons**: Each example has its own color gradient and icon
- **Loading Animation**: Elegant spinner while searching
- **Response Cards**: Expandable results with smooth animations
- **Auto-Complete**: Click examples to instantly search

### Interactions

- **Click Search Bar**: Shows example queries
- **Click Example**: Instantly searches that query
- **Enter**: Submit search
- **Click Outside**: Closes examples/results
- **Mode Buttons**: Switch search context

### Mobile Support

- ✅ Touch-optimized
- ✅ Bottom sheet on mobile
- ✅ Swipe-friendly mode selector
- ✅ Responsive design

---

## 🎨 Customization

### Change Search Bar Position

Edit `components/PerplexitySearch.tsx`:
```typescript
// Change from top-4 to your preference (top-4, bottom-4, etc.)
className="fixed top-4 left-1/2 -translate-x-1/2 z-50 ..."
```

### Modify Example Queries

Edit the `exampleQueries` array in `PerplexitySearch.tsx`:
```typescript
const exampleQueries: ExampleQuery[] = [
  { 
    text: 'Your custom question',
    mode: 'general',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-500'
  },
  // ... more examples
];
```

### Adjust AI Behavior

Edit `services/perplexityService.ts`:
```typescript
// Change temperature for more/less creative responses
temperature: 0.2, // Lower = more factual, Higher = more creative

// Change model
model: 'llama-3.1-sonar-small-128k-online', // or other available models
```

---

## 🔧 Technical Details

### API Configuration

- **Model**: `llama-3.1-sonar-small-128k-online`
- **Temperature**: 0.2 (factual responses)
- **Citations**: Enabled
- **Related Questions**: Enabled
- **Recency Filter**: Last month
- **Streaming**: Disabled (for simplicity)

### Service Functions

```typescript
// General query
queryPerplexity(query: string, context?: string)

// Web3 specific
searchWeb3Info(query: string)

// Help with Wyyrrddd
getWyyrrdddHelp(question: string)

// Explain concepts
explainConcept(concept: string)

// Content recommendations
getContentRecommendations(interests: string[])
```

### Error Handling

- Graceful fallbacks if API key is missing
- User-friendly error messages
- Console warnings for debugging

---

## 📊 Usage Limits

### Perplexity API Limits

- Check your plan at https://www.perplexity.ai/settings/api
- Monitor usage in the dashboard
- Consider rate limiting for production

### Optimization Tips

1. Cache frequent queries
2. Implement debouncing for typing
3. Add request deduplication
4. Consider server-side proxy for API key security

---

## 🎯 Best Practices

### For Users

- ✅ Be specific with questions
- ✅ Use the right search mode
- ✅ Check your search history
- ✅ Rephrase if results aren't helpful

### For Developers

- ✅ Keep API key secure (never commit to git)
- ✅ Use environment variables
- ✅ Implement rate limiting
- ✅ Add loading states
- ✅ Handle errors gracefully
- ✅ Consider caching responses

---

## 🚧 Future Enhancements

Potential features to add:

1. **Voice Search**: Speak your questions
2. **Image Search**: Search with images
3. **Advanced Filters**: Date range, sources, etc.
4. **Saved Searches**: Bookmark favorite queries
5. **Search Analytics**: Track popular searches
6. **Multi-language**: Support for other languages
7. **Streaming Responses**: Real-time answer generation
8. **Chat Mode**: Conversational follow-ups

---

## 🐛 Troubleshooting

### Search Bar Not Appearing

1. Check that `PerplexitySearch` is imported in `App.tsx`
2. Verify no CSS conflicts with `z-50` or higher
3. Make sure the page has scrolled to top
4. Clear browser cache

### No Response / Error Message

1. Check API key is set correctly in `.env.local`
2. Verify API key starts with `pplx-`
3. Restart dev server after adding key
4. Check browser console for errors
5. Verify you have API credits remaining

### Slow Responses

1. Check your internet connection
2. Verify Perplexity API status
3. Try simpler queries
4. Consider implementing caching

### Examples Won't Show

1. Click directly in the search bar input
2. Make sure you don't have an active search result
3. Clear any existing search first
4. Try refreshing the page

---

## 📱 Examples in Action

### Example 1: Learning About Polkadot
```
Mode: Web3 Search
Query: "What is Polkadot and how does it work?"
Result: Detailed explanation of Polkadot's architecture
```

### Example 2: Getting Help
```
Mode: Help
Query: "How do I switch to carousel mode?"
Result: Step-by-step instructions with screenshots
```

### Example 3: Explaining Concepts
```
Mode: Explain
Query: "smart contracts"
Result: Simple, beginner-friendly explanation
```

---

## 🌟 Tips & Tricks

1. **Use specific queries** for better results
2. **Try different modes** for different types of questions
3. **Check history** to avoid repeating searches
4. **Rephrase** if you don't get good results
5. **Use Help mode** to learn about Wyyrrddd features

---

## 📚 Resources

- [Perplexity AI Docs](https://docs.perplexity.ai/)
- [API Reference](https://docs.perplexity.ai/reference/post_chat_completions)
- [Pricing](https://www.perplexity.ai/settings/api)

---

**Need Help?** Check [ENV_SETUP.md](./ENV_SETUP.md) for API key setup or open an issue on GitHub.

---

**Last Updated**: November 25, 2025  
**Version**: 2.0.0


