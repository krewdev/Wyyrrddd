import React, { useState, useRef, useEffect } from 'react';
import { queryPerplexity, getWyyrrdddHelp, searchWeb3Info, explainConcept } from '../services/perplexityService';

interface SearchMode {
  id: 'general' | 'help' | 'web3' | 'explain';
  label: string;
  icon: string;
  placeholder: string;
}

interface ExampleQuery {
  text: string;
  mode: SearchMode['id'];
  icon: string;
  color: string;
}

const searchModes: SearchMode[] = [
  { id: 'general', label: 'Search', icon: '🔍', placeholder: 'Search anything...' },
  { id: 'help', label: 'Help', icon: '💡', placeholder: 'Ask about Wyyrrddd features...' },
  { id: 'web3', label: 'Web3', icon: '⛓️', placeholder: 'Search Web3 & crypto info...' },
  { id: 'explain', label: 'Explain', icon: '📚', placeholder: 'What concept should I explain?' },
];

const exampleQueries: ExampleQuery[] = [
  { text: 'What is Polkadot?', mode: 'web3', icon: '⛓️', color: 'from-blue-500 to-cyan-500' },
  { text: 'How do I use tokens?', mode: 'help', icon: '💡', color: 'from-purple-500 to-pink-500' },
  { text: 'Explain smart contracts', mode: 'explain', icon: '📚', color: 'from-green-500 to-emerald-500' },
  { text: 'Latest crypto trends', mode: 'web3', icon: '🔍', color: 'from-orange-500 to-red-500' },
  { text: 'Switch to carousel mode', mode: 'help', icon: '💡', color: 'from-indigo-500 to-purple-500' },
  { text: 'What is DeFi?', mode: 'explain', icon: '📚', color: 'from-pink-500 to-rose-500' },
];

export const PerplexitySearch: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<SearchMode['id']>('general');
  const [showExamples, setShowExamples] = useState(false);
  const [history, setHistory] = useState<Array<{ query: string; response: string; mode: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const currentMode = searchModes.find(m => m.id === mode) || searchModes[0];

  useEffect(() => {
    if (isFocused) {
      setShowExamples(true);
    } else {
      // Delay hiding to allow clicking examples
      const timer = setTimeout(() => setShowExamples(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [response]);

  // Handle clicks outside search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e?: React.FormEvent, exampleQuery?: string) => {
    e?.preventDefault();
    const searchQuery = exampleQuery || query;
    if (!searchQuery.trim() || isLoading) return;

    setQuery(searchQuery);
    setIsLoading(true);
    setResponse('');
    setIsFocused(false);
    setShowExamples(false);

    try {
      let result = '';
      switch (mode) {
        case 'help':
          result = await getWyyrrdddHelp(searchQuery);
          break;
        case 'web3':
          result = await searchWeb3Info(searchQuery);
          break;
        case 'explain':
          result = await explainConcept(searchQuery);
          break;
        default:
          result = await queryPerplexity(searchQuery);
      }

      setResponse(result);
      setHistory(prev => [...prev, { query: searchQuery, response: result, mode }]);
    } catch (error) {
      setResponse('Sorry, an error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: ExampleQuery) => {
    setMode(example.mode);
    handleSearch(undefined, example.text);
  };

  const clearSearch = () => {
    setQuery('');
    setResponse('');
  };

  return (
    <>
      {/* Floating Search Bar */}
      <div 
        ref={searchBarRef}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
      >
        <form onSubmit={handleSearch} className="relative">
          {/* Main Search Input */}
          <div className={`relative transition-all duration-300 ${
            isFocused || response ? 'transform scale-100 opacity-100' : 'transform scale-100 opacity-10 hover:opacity-20'
          }`}>
            <div className="relative">
              {/* Glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-0 transition-opacity duration-300 ${
                isFocused ? 'opacity-30' : 'opacity-0'
              }`} />
              
              {/* Search bar */}
              <div className={`relative backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 ${
                isFocused || response
                  ? 'bg-white/70 dark:bg-slate-900/70 shadow-2xl border border-slate-200/50 dark:border-slate-700/50'
                  : 'bg-white/5 dark:bg-slate-900/5 shadow-none border border-slate-200/10 dark:border-slate-700/10'
              }`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* AI Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isFocused || response
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30'
                      : 'bg-purple-500/20 dark:bg-purple-500/10'
                  }`}>
                    <span className="text-base">🔮</span>
                  </div>
                  
                  {/* Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={currentMode.placeholder}
                    className={`flex-1 bg-transparent text-sm focus:outline-none transition-colors duration-300 ${
                      isFocused || response
                        ? 'text-slate-900 dark:text-white placeholder-slate-400'
                        : 'text-slate-400 dark:text-slate-500 placeholder-slate-300 dark:placeholder-slate-600'
                    }`}
                    disabled={isLoading}
                  />
                  
                  {/* Mode Selector */}
                  {isFocused && (
                    <div className="flex items-center gap-1">
                      {searchModes.map((searchMode) => (
                        <button
                          key={searchMode.id}
                          type="button"
                          onClick={() => setMode(searchMode.id)}
                          className={`p-2 rounded-lg transition-all ${
                            mode === searchMode.id
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={searchMode.label}
                        >
                          <span className="text-base">{searchMode.icon}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Search/Clear Button */}
                  {query && !isLoading ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : isLoading ? (
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Example Queries - Text Only */}
          {showExamples && !response && (
            <div className="absolute bottom-full left-0 right-0 mb-2 space-y-1 animate-fadeIn">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left px-2 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 hover:translate-x-1 group"
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <span className="inline-block mr-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    {example.icon}
                  </span>
                  <span>{example.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Response Card */}
          {response && (
            <div ref={responseRef} className="absolute bottom-full left-0 right-0 mb-3 animate-fadeIn">
              <div className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                {/* Query Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{currentMode.icon}</span>
                    <span>{query}</span>
                  </p>
                </div>
                
                {/* Response Content */}
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {response}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Powered by Perplexity AI</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Response Modal Backdrop (when response is showing) */}
      {response && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={clearSearch}
        />
      )}
    </>
  );
};


