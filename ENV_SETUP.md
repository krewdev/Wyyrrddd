# Environment Variables Setup

## Required API Keys

### Perplexity API Key (AI-Powered Search)

Get your API key from: https://www.perplexity.ai/settings/api

Add to `.env.local`:
```env
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Setup Instructions

1. Create a file named `.env.local` in the root directory
2. Add your Perplexity API key as shown above
3. Restart your development server

## Example .env.local file

```env
# Perplexity API Key for AI-powered search and content
VITE_PERPLEXITY_API_KEY=pplx-your_actual_key_here
PERPLEXITY_API_KEY=pplx-your_actual_key_here
```

## Features Enabled

- **Perplexity API**: Powers intelligent search with 4 modes:
  - 🔍 General Search - Search anything
  - 💡 Help - Get help with Wyyrrddd features
  - ⛓️ Web3 - Search Web3 & crypto information
  - 📚 Explain - Get simple explanations of concepts

## Testing Without API Keys

The app will work without API keys, but with limited functionality:
- Perplexity: Will show a message to add API key
- Feed content: Will use fallback mock content

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ `.env.local` is already in `.gitignore`
- ✅ Use `VITE_` prefix for client-side environment variables
- ✅ Keep API keys secure and rotate them regularly

## Troubleshooting

### API Key Not Working
1. Make sure the file is named exactly `.env.local`
2. Restart the dev server after adding keys
3. Check that keys don't have extra spaces or quotes

### Still Not Working?
- Check browser console for error messages
- Verify API keys are valid and not expired
- Ensure you have credits/quota remaining



