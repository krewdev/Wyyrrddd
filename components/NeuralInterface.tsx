import React, { useState, useEffect, useRef } from 'react';
import { webLlmService } from '../services/webLlmService';
import { InitProgressReport } from '@mlc-ai/web-llm';

export const NeuralInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInit = async () => {
      try {
        setIsLoading(true);
        await webLlmService.initialize((report: InitProgressReport) => {
            setProgress(report.text);
        });
        setIsLoading(false);
      } catch (e) {
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'system', content: 'Initialization failed.' }]);
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
       // Initialize if needed with progress callback if not already done
       // (But we usually want to handle init explicitly or implicitly)
       // We can't pass the callback to generateResponse easily if it's already running, 
       // so we rely on the service handling initialization internally, but we might miss progress updates if we didn't call init first.
       
       // If not initialized, let's show a "connecting..." message
       if (progress === '') {
           setProgress('Establishing Neural Link...');
       }

       const response = await webLlmService.generateResponse(userMsg.content);
       setMessages(prev => [...prev, { role: 'assistant', content: response }]);
       setProgress('');
    } catch (err) {
       setMessages(prev => [...prev, { role: 'system', content: 'Neural Link Failure.' }]);
    } finally {
       setIsLoading(false);
    }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => { setIsOpen(true); handleInit(); }}
            className="fixed bottom-20 right-4 z-50 p-3 bg-cyber-cyan text-black rounded-full shadow-lg shadow-cyber-cyan/50 hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
      );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ease-out bg-cyber-black/90 backdrop-blur-md border border-cyber-cyan/30 shadow-2xl
        ${isExpanded ? 'inset-4' : 'bottom-20 right-4 w-80 h-96 rounded-lg'}
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-cyber-dim/30">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                <span className="font-mono text-xs text-cyber-cyan uppercase">Local AI Node (Llama-3)</span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white">
                    {isExpanded ? '↘' : '↖'}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyber-dim">
            {progress && (
                <div className="text-center py-4">
                    <div className="font-mono text-xs text-cyber-dim animate-pulse">{progress}</div>
                </div>
            )}
            
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.role === 'user' 
                        ? 'bg-cyber-dim/20 border border-cyber-cyan/20 text-gray-100' 
                        : 'bg-black/40 border border-purple-500/20 text-purple-200'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-cyber-dim/30">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={isLoading ? "Processing..." : "Enter command..."}
                    disabled={isLoading}
                    className="w-full bg-black/50 border border-cyber-dim rounded px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyber-cyan placeholder-gray-600"
                />
                <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-cyber-cyan hover:text-white disabled:opacity-50"
                >
                    →
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
