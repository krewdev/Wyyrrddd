import React from 'react';

interface TechItem {
  name: string;
  category: string;
  color: string;
  description?: string;
}

const TECH_STACK: TechItem[] = [
  // Blockchain
  { name: 'Polkadot', category: 'Blockchain', color: 'cyber-pink', description: 'Substrate Runtime' },
  { name: 'Substrate', category: 'Blockchain', color: 'cyber-cyan', description: 'Blockchain Framework' },
  { name: 'Web3', category: 'Blockchain', color: 'cyber-yellow', description: 'Wallet Integration' },
  
  // Frontend
  { name: 'React 19', category: 'Frontend', color: 'cyber-cyan', description: 'UI Framework' },
  { name: 'TypeScript', category: 'Frontend', color: 'cyber-cyan', description: 'Type Safety' },
  { name: 'Vite', category: 'Frontend', color: 'cyber-pink', description: 'Build Tool' },
  { name: 'Tailwind CSS', category: 'Frontend', color: 'cyber-cyan', description: 'Styling' },
  
  // 3D & Graphics
  { name: 'Three.js', category: 'Graphics', color: 'cyber-pink', description: 'WebGPU Renderer' },
  { name: 'React Three Fiber', category: 'Graphics', color: 'cyber-cyan', description: '3D Framework' },
  { name: 'WebGPU', category: 'Graphics', color: 'cyber-green', description: 'GPU Compute' },
  
  // AI
  { name: 'Gemini AI', category: 'AI', color: 'cyber-yellow', description: 'Content Generation' },
  { name: 'Local AI', category: 'AI', color: 'cyber-green', description: 'Port 1234' },
  
  // Infrastructure
  { name: 'Node.js', category: 'Infrastructure', color: 'cyber-green', description: 'Runtime' },
  { name: 'ES Modules', category: 'Infrastructure', color: 'cyber-cyan', description: 'Module System' },
];

const CATEGORIES = ['Blockchain', 'Frontend', 'Graphics', 'AI', 'Infrastructure'];

export const TechStack: React.FC = () => {
  const getTechByCategory = (category: string) => {
    return TECH_STACK.filter(tech => tech.category === category);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      'cyber-cyan': 'border-cyber-cyan/40 text-cyber-cyan hover:border-cyber-cyan hover:shadow-neon-cyan bg-cyber-cyan/5',
      'cyber-pink': 'border-cyber-pink/40 text-cyber-pink hover:border-cyber-pink hover:shadow-neon-pink bg-cyber-pink/5',
      'cyber-green': 'border-cyber-green/40 text-cyber-green hover:border-cyber-green hover:shadow-neon-green bg-cyber-green/5',
      'cyber-yellow': 'border-cyber-yellow/40 text-cyber-yellow hover:border-cyber-yellow bg-cyber-yellow/5',
    };
    return colorMap[color] || colorMap['cyber-cyan'];
  };

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-2">
          Tech Stack
        </h3>
        <p className="text-[10px] text-cyber-dim font-mono">
          Built with bleeding-edge technologies
        </p>
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const techs = getTechByCategory(category);
          if (techs.length === 0) return null;

          return (
            <div key={category} className="glass border border-cyber-cyan/20 p-4 relative overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyber-cyan/20">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {category}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-cyber-cyan rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-cyber-dim font-mono">{techs.length} technologies</span>
                </div>
              </div>

              {/* Tech Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {techs.map((tech, idx) => (
                  <div
                    key={`${tech.name}-${idx}`}
                    className={`group relative glass border ${getColorClasses(tech.color)} rounded-sm p-3 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden`}
                  >
                    {/* Energy Flow Effect */}
                    <div className="absolute inset-0 energy-flow opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-current opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-current opacity-50"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-bold font-mono tracking-wide">
                          {tech.name}
                        </h5>
                        <div className="w-1.5 h-1.5 bg-current rounded-full opacity-50 group-hover:opacity-100 group-hover:animate-pulse"></div>
                      </div>
                      {tech.description && (
                        <p className="text-[9px] text-gray-500 font-mono mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {tech.description}
                        </p>
                      )}
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 blur-xl transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 glass border border-cyber-cyan/20 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyber-cyan font-mono mb-1">
              {TECH_STACK.length}
            </div>
            <div className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
              Technologies
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyber-pink font-mono mb-1">
              {CATEGORIES.length}
            </div>
            <div className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
              Categories
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyber-green font-mono mb-1">
              2025
            </div>
            <div className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
              Stack Year
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};











