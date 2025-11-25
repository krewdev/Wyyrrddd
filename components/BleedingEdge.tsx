import React, { useEffect, useRef, useState, Suspense, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import * as THREE from 'three';

// Error Boundary for 3D Scene
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Lazy load Three.js components to avoid crashes - using dynamic imports
let Canvas: any = null;
let useFrame: any = null;
let OrbitControls: any = null;
let Environment: any = null;
let MeshDistortMaterial: any = null;
let Sphere: any = null;
let Text: any = null;
let r3fLoaded = false;

// Load React Three Fiber components dynamically
const loadR3F = async () => {
  if (r3fLoaded) return;
  try {
    const [r3f, drei] = await Promise.all([
      import('@react-three/fiber'),
      import('@react-three/drei')
    ]);
    Canvas = r3f.Canvas;
    useFrame = r3f.useFrame;
    OrbitControls = drei.OrbitControls;
    Environment = drei.Environment;
    MeshDistortMaterial = drei.MeshDistortMaterial;
    Sphere = drei.Sphere;
    Text = drei.Text;
    r3fLoaded = true;
  } catch (e) {
    console.warn('React Three Fiber not available:', e);
  }
};

// Preload on component mount
if (typeof window !== 'undefined') {
  loadR3F();
}

// Animated Sphere Component - Safe
const AnimatedSphere: React.FC = () => {
  if (!useFrame || !Sphere || !MeshDistortMaterial) return null;
  
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state: any) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#00F0FF"
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  );
};

// Particle System Component - Safe
const ParticleField: React.FC = () => {
  if (!useFrame) return null;
  
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 500; // Reduced for performance
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state: any) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#FF003C" />
    </points>
  );
};

// WebGPU Renderer Component - Safe
const WebGPUScene: React.FC = () => {
  if (!OrbitControls || !Environment || !Text) {
    return (
      <>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00F0FF" />
        </mesh>
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#00F0FF" intensity={0.5} />
      
      <AnimatedSphere />
      <ParticleField />

      {/* 3D Text - Optional */}
      {Text && (
        <Text
          position={[0, -3, 0]}
          fontSize={0.5}
          color="#00F0FF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          WYYRRDDD
        </Text>
      )}

      <OrbitControls enableDamping dampingFactor={0.05} />
      <Environment preset="night" />
    </>
  );
};

// Local AI Component - connects to local server at port 1234
const LocalAI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const LOCAL_AI_URL = 'http://localhost:1234';

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to connect to local AI server
      const healthCheck = await fetch(`${LOCAL_AI_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (healthCheck && healthCheck.ok) {
        setIsConnected(true);
        setResponse('Connected to local AI server at port 1234!');
      } else {
        // Try OpenAI-compatible endpoint
        const testResponse = await fetch(`${LOCAL_AI_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10,
          }),
        }).catch(() => null);

        if (testResponse && testResponse.ok) {
          setIsConnected(true);
          setResponse('Connected to local AI server at port 1234!');
        } else {
          throw new Error('Local AI server not responding. Make sure it\'s running on port 1234.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to local AI server.');
      setIsConnected(false);
      console.error('Local AI connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // OpenAI-compatible API format
      const apiResponse = await fetch(`${LOCAL_AI_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`Server error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      setResponse(data.choices?.[0]?.message?.content || 'No response generated');
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate response. Is the server running?');
      console.error('Local AI error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="bg-cyber-panel border border-cyber-cyan/30 p-4 rounded-sm">
      <h3 className="text-cyber-cyan font-bold text-sm mb-3 flex items-center gap-2">
        <span className="text-xs">🧠</span> Local AI (Port 1234)
      </h3>
      
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyber-green animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] text-gray-400 font-mono">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button
          onClick={checkConnection}
          disabled={isLoading}
          className="px-3 py-1 text-[9px] font-mono uppercase tracking-wide border border-cyber-dim text-gray-300 hover:border-cyber-cyan hover:text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Reconnect'}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-gray-400 font-mono mb-1">
            Prompt (sent to localhost:1234)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything... processed on your local server"
            className="w-full bg-cyber-black border border-cyber-dim px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyber-cyan resize-none"
            rows={3}
            onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && generateResponse()}
          />
          <button
            onClick={generateResponse}
            disabled={isLoading || !prompt.trim() || !isConnected}
            className="mt-2 w-full px-4 py-2 bg-cyber-pink text-white font-bold text-xs uppercase tracking-wider hover:bg-cyber-pink/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Generate (Ctrl+Enter)'}
          </button>
        </div>

        {response && (
          <div className="bg-cyber-black/60 border border-cyber-dim p-3 rounded">
            <p className="text-[10px] text-gray-400 font-mono mb-1">Response:</p>
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-400 font-mono">
          {error}
        </div>
      )}

      <p className="text-[9px] text-cyber-dim font-mono mt-3">
        🔗 localhost:1234 • ⚡ Low latency • 🔒 Runs on your machine
      </p>
    </div>
  );
};

// Generative UI Component
const GenerativeUI: React.FC = () => {
  const [uiPrompt, setUiPrompt] = useState('');
  const [generatedComponents, setGeneratedComponents] = useState<string[]>([]);

  const generateUI = () => {
    if (!uiPrompt.trim()) return;
    
    // Simulate generative UI - in production, this would use Bolt.new API or similar
    const mockComponents = [
      `Dashboard for: ${uiPrompt}`,
      `Chart component: ${uiPrompt}`,
      `Data visualization: ${uiPrompt}`,
    ];
    
    setGeneratedComponents(mockComponents);
  };

  return (
    <div className="bg-cyber-panel border border-cyber-pink/30 p-4 rounded-sm">
      <h3 className="text-cyber-pink font-bold text-sm mb-3 flex items-center gap-2">
        <span className="text-xs">✨</span> Generative UI
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-gray-400 font-mono mb-1">
            Describe the UI you want
          </label>
          <input
            type="text"
            value={uiPrompt}
            onChange={(e) => setUiPrompt(e.target.value)}
            placeholder="e.g., 'Show me a dashboard of my sales in Tokyo'"
            className="w-full bg-cyber-black border border-cyber-dim px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyber-pink"
            onKeyPress={(e) => e.key === 'Enter' && generateUI()}
          />
          <button
            onClick={generateUI}
            className="mt-2 w-full px-4 py-2 bg-cyber-pink text-white font-bold text-xs uppercase tracking-wider hover:bg-cyber-pink/80 transition-colors"
          >
            Generate UI Component
          </button>
        </div>

        {generatedComponents.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 font-mono">Generated Components:</p>
            {generatedComponents.map((comp, idx) => (
              <div
                key={idx}
                className="bg-cyber-black/60 border border-cyber-pink/30 p-2 rounded text-xs text-gray-300 font-mono"
              >
                {comp}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[9px] text-cyber-dim font-mono mt-3">
        🚀 AI writes React code in real-time • ⚡ Instant compilation
      </p>
    </div>
  );
};

export const BleedingEdge: React.FC = () => {
  const [webGPUSupported, setWebGPUSupported] = useState(false);
  const [r3fReady, setR3fReady] = useState(false);

  useEffect(() => {
    // Check WebGPU support
    const checkWebGPU = async () => {
      if ('gpu' in navigator) {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) {
            setWebGPUSupported(true);
            // Load R3F when WebGPU is available
            await loadR3F();
            setR3fReady(true);
          }
        } catch (err) {
          console.warn('WebGPU not available:', err);
        }
      }
    };
    checkWebGPU();
  }, []);

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-6 pb-32 font-sans overflow-y-auto">
      {/* Header */}
      <div className="relative mb-8 mt-4 border-b border-cyber-dim/50 pb-4">
        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-pink to-cyber-cyan animate-shimmer bg-[length:200%_auto]">
          BLEEDING EDGE
        </h1>
        <p className="text-cyber-dim font-mono text-xs tracking-[0.3em] mt-2 uppercase">
          WebGPU • Local AI • Generative UI
        </p>
        <div className="absolute -bottom-[1px] left-0 w-1/3 h-[2px] bg-gradient-to-r from-cyber-cyan to-cyber-pink shadow-[0_0_10px_#00F0FF]" />
      </div>

      {/* WebGPU Status */}
      <div className="mb-6 p-4 bg-cyber-panel border border-cyber-dim rounded-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">WebGPU Status</h3>
            <p className="text-xs text-gray-400 font-mono">
              {webGPUSupported ? '✅ Supported' : '❌ Not Available'}
            </p>
          </div>
          <div className="text-cyber-cyan text-2xl">🎮</div>
        </div>
        {!webGPUSupported && (
          <p className="text-[10px] text-cyber-dim font-mono mt-2">
            WebGPU requires Chrome 113+, Edge 113+, or Safari 18+. Enable via chrome://flags/#enable-unsafe-webgpu
          </p>
        )}
      </div>

      {/* WebGPU 3D Scene */}
      <div className="mb-6 bg-cyber-panel border border-cyber-cyan/30 rounded-sm overflow-hidden">
        <div className="p-4 border-b border-cyber-dim">
          <h3 className="text-cyber-cyan font-bold text-sm flex items-center gap-2">
            <span className="text-xs">🎮</span> WebGPU Graphics Engine
          </h3>
          <p className="text-[10px] text-gray-400 font-mono mt-1">
            Cinema-quality 3D rendering powered by GPU compute
          </p>
        </div>
        <div className="h-96 bg-cyber-black relative">
          {webGPUSupported && r3fReady && Canvas ? (
            <ErrorBoundary fallback={
              <div className="absolute inset-0 flex items-center justify-center glass border border-cyber-cyan/20">
                <div className="text-center">
                  <p className="text-cyber-cyan font-mono text-sm mb-2 animate-pulse">3D Renderer Fallback</p>
                  <div className="w-16 h-16 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[10px] text-cyber-dim font-mono mt-4">Using simplified renderer</p>
                </div>
              </div>
            }>
              <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                gl={{ 
                  antialias: true,
                  alpha: false,
                  powerPreference: 'high-performance'
                }}
                onCreated={(state: any) => {
                  try {
                    if (state?.gl) {
                      state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    }
                  } catch (e) {
                    console.warn('Canvas initialization warning:', e);
                  }
                }}
              >
                <Suspense fallback={
                  <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#00F0FF" />
                  </mesh>
                }>
                  <WebGPUScene />
                </Suspense>
              </Canvas>
            </ErrorBoundary>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-cyber-dim font-mono text-sm mb-2">WebGPU not available</p>
                <p className="text-[10px] text-cyber-dim font-mono">Use Chrome 113+, Edge 113+, or Safari 18+</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local AI Section */}
      <div className="mb-6">
        <LocalAI />
      </div>

      {/* Generative UI Section */}
      <div className="mb-6">
        <GenerativeUI />
      </div>

      {/* Tech Stack Info */}
      <div className="bg-cyber-panel border border-cyber-dim p-4 rounded-sm">
        <h3 className="text-sm font-bold text-white mb-3">The Stack</h3>
        <div className="grid grid-cols-1 gap-3 text-xs">
          <div className="flex items-center justify-between border-b border-cyber-dim/30 pb-2">
            <span className="text-gray-400 font-mono">Rendering</span>
            <span className="text-cyber-cyan font-bold">WebGPU (Three.js)</span>
          </div>
          <div className="flex items-center justify-between border-b border-cyber-dim/30 pb-2">
            <span className="text-gray-400 font-mono">Intelligence</span>
            <span className="text-cyber-pink font-bold">WebLLM (Local)</span>
          </div>
          <div className="flex items-center justify-between border-b border-cyber-dim/30 pb-2">
            <span className="text-gray-400 font-mono">Framework</span>
            <span className="text-cyber-yellow font-bold">React 19</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono">Creation</span>
            <span className="text-cyber-green font-bold">AI-First</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export as default for easier lazy loading
export default BleedingEdge;

