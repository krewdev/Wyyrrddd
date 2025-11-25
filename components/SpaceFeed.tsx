import React, { useRef, useMemo, useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Post, TokenType } from '../types';
import { useWallet } from '../contexts/WalletContext';
import * as THREE from 'three';

// Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Space Feed Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Lazy load Three.js components - load synchronously to avoid context issues
let Canvas: any = null;
let useFrame: any = null;
let OrbitControls: any = null;
let Html: any = null;
let MeshDistortMaterial: any = null;
let r3fLoaded = false;

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
    Html = drei.Html;
    MeshDistortMaterial = drei.MeshDistortMaterial;
    r3fLoaded = true;
  } catch (e) {
    console.error('Failed to load React Three Fiber:', e);
    throw e;
  }
};

// Preload on component mount (like BleedingEdge)
if (typeof window !== 'undefined') {
  loadR3F();
}

interface SpaceFeedProps {
  posts: Post[];
}

// Floating Post Card - components must be defined inside Canvas
// useFrame is available through React Three Fiber context when rendered inside Canvas
const PostCard3D: React.FC<{ post: Post; position: [number, number, number]; index: number }> = ({ 
  post, 
  position, 
  index 
}) => {
  // Check if useFrame is available - if not, component shouldn't render
  if (!useFrame) return null;
  
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { earnToken } = useWallet();

  // useFrame is available - call it unconditionally
  useFrame((state: any) => {
    if (meshRef.current && state && state.clock) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.3;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
      
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (material) {
        material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
      }
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Holographic frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.2, 3.2]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={hovered ? 0.8 : 0.3}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Main card */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => earnToken(TokenType.LIKE, 1)}
        scale={hovered ? 1.15 : 1}
      >
        <planeGeometry args={[2, 3]} />
        {MeshDistortMaterial ? (
          <MeshDistortMaterial
            color={hovered ? '#00f0ff' : '#ffffff'}
            emissive={hovered ? '#00f0ff' : '#000000'}
            emissiveIntensity={hovered ? 0.6 : 0.2}
            metalness={0.95}
            roughness={0.1}
            distort={hovered ? 0.3 : 0.1}
            speed={2}
            transparent
            opacity={0.95}
          />
        ) : (
          <meshStandardMaterial
            color={hovered ? '#00f0ff' : '#ffffff'}
            emissive={hovered ? '#00f0ff' : '#000000'}
            emissiveIntensity={hovered ? 0.6 : 0.2}
            metalness={0.95}
            roughness={0.1}
            transparent
            opacity={0.95}
          />
        )}
      </mesh>
      
      {/* Energy particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.3, Math.sin(angle) * 1.8, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={1}
            />
          </mesh>
        );
      })}
      
      {Html && (
        <Html position={[0, 0, 0.01]} center transform occlude style={{ pointerEvents: 'none' }}>
          <div className="w-[200px] h-[300px] bg-cyber-black/95 border-2 border-cyber-cyan/60 p-2 rounded overflow-hidden relative"
               style={{
                 boxShadow: hovered ? '0 0 30px rgba(0, 240, 255, 0.8)' : '0 0 10px rgba(0, 240, 255, 0.3)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-cyan/10 to-transparent animate-pulse pointer-events-none"></div>
            
            {post.imageUrl && (
              <img src={post.imageUrl} alt={post.caption} className="w-full h-32 object-cover mb-2 rounded" />
            )}
            {post.videoUrl && (
              <video src={post.videoUrl} className="w-full h-32 object-cover mb-2 rounded" muted autoPlay loop />
            )}
            <div className="text-xs text-cyber-cyan font-mono mb-1 font-bold">{post.username}</div>
            <div className="text-[10px] text-gray-300 line-clamp-3">{post.caption}</div>
            
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyber-cyan"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyber-pink"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyber-green"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyber-yellow"></div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Interactive Token Orb
const TokenOrb: React.FC<{ 
  position: [number, number, number]; 
  tokenType: TokenType;
  logo: string;
  color: string;
  reward: number;
}> = ({ position, tokenType, logo, color, reward }) => {
  // Check if useFrame is available - if not, component shouldn't render
  if (!useFrame) return null;
  
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);
  const { earnToken } = useWallet();

  // useFrame is available - call it unconditionally
  useFrame((state: any) => {
    if (meshRef.current && !collected && state && state.clock) {
      meshRef.current.rotation.x = state.clock.elapsedTime;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (material) {
        material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      }
    }
    if (outerRingRef.current && !collected) {
      outerRingRef.current.rotation.y = -state.clock.elapsedTime * 0.5;
    }
  });

  if (collected) return null;

  return (
    <group position={position}>
      {/* Outer energy ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[0.7, 0.02, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.8}
          metalness={1}
          roughness={0}
        />
      </mesh>
      
      {/* Main orb */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          earnToken(tokenType, reward);
          setCollected(true);
          setTimeout(() => setCollected(false), 5000);
        }}
      >
        <icosahedronGeometry args={[0.5, 1]} />
        {MeshDistortMaterial ? (
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 1.2 : 0.6}
            metalness={0.95}
            roughness={0.05}
            distort={0.4}
            speed={3}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 1.2 : 0.6}
            metalness={0.95}
            roughness={0.05}
          />
        )}
      </mesh>
      
      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Energy particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
            />
          </mesh>
        );
      })}
      
      {Html && (
        <>
          <Html position={[0, 0, 0.8]} center transform style={{ pointerEvents: 'none' }}>
            <div className="text-3xl filter drop-shadow-[0_0_10px_currentColor]" style={{ color }}>
              {logo}
            </div>
          </Html>
          {hovered && (
            <Html position={[0, 1.2, 0]} center>
              <div className="glass-strong border border-cyber-cyan/60 text-cyber-cyan px-3 py-2 text-xs font-mono uppercase tracking-wider shadow-neon-cyan">
                +{reward} {tokenType}
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
};

// Advanced starfield
const Starfield: React.FC = () => {
  // Check if useFrame is available - if not, component shouldn't render
  if (!useFrame) return null;
  
  const starsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Mesh>(null);

  const stars = useMemo(() => {
    const positions = new Float32Array(10000 * 3);
    const colors = new Float32Array(10000 * 3);
    for (let i = 0; i < 10000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.6) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 0.6;
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
      }
    }
    return { positions, colors };
  }, []);

  // useFrame is available - call it unconditionally
  useFrame((state: any) => {
    if (starsRef.current && state && state.clock) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
    if (nebulaRef.current && state) {
      nebulaRef.current.rotation.z = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <>
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={10000}
            array={stars.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={10000}
            array={stars.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.8} vertexColors={true} />
      </points>
      
      {/* Nebula clouds */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const distance = 50 + i * 20;
        return (
          <mesh
            key={i}
            ref={i === 0 ? nebulaRef : undefined}
            position={[Math.cos(angle) * distance, Math.sin(angle) * distance, -100]}
          >
            <sphereGeometry args={[15, 32, 32]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#00f0ff' : '#ff0096'}
              emissive={i % 2 === 0 ? '#00f0ff' : '#ff0096'}
              emissiveIntensity={0.3}
              transparent
              opacity={0.1}
            />
          </mesh>
        );
      })}
    </>
  );
};

// Energy flow lines
const EnergyFlow: React.FC<{ posts: Post[]; scrollOffset: number }> = ({ posts, scrollOffset }) => {
  const lines = useMemo(() => {
    const linePoints: number[][] = [];
    posts.forEach((_, index) => {
      const z = -scrollOffset - (index * 4);
      if (index < posts.length - 1) {
        const nextZ = -scrollOffset - ((index + 1) * 4);
        linePoints.push([0, 0, z, 0, 0, nextZ]);
      }
    });
    return linePoints;
  }, [posts, scrollOffset]);

  return (
    <>
      {lines.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(points)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.4}
          />
        </line>
      ))}
    </>
  );
};

// Main Space Scene
const SpaceScene: React.FC<SpaceFeedProps> = ({ posts }) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const controlsRef = useRef<any>(null);

  const tokenOrbs = useMemo(() => [
    { tokenType: TokenType.LIKE, logo: '👍', color: '#00f0ff', reward: 5, position: [6, 3, -5] as [number, number, number] },
    { tokenType: TokenType.LOVE, logo: '❤️', color: '#ff0096', reward: 10, position: [-6, 4, -8] as [number, number, number] },
    { tokenType: TokenType.CARE, logo: '🤗', color: '#39ff14', reward: 15, position: [9, -3, -6] as [number, number, number] },
    { tokenType: TokenType.CREEP, logo: '👀', color: '#a855f7', reward: 20, position: [-9, -4, -7] as [number, number, number] },
    { tokenType: TokenType.LIKE, logo: '👍', color: '#00f0ff', reward: 5, position: [4, 6, -10] as [number, number, number] },
    { tokenType: TokenType.LOVE, logo: '❤️', color: '#ff0096', reward: 10, position: [-4, -6, -9] as [number, number, number] },
    { tokenType: TokenType.CARE, logo: '🤗', color: '#39ff14', reward: 15, position: [7, 1, -12] as [number, number, number] },
    { tokenType: TokenType.CREEP, logo: '👀', color: '#a855f7', reward: 20, position: [-7, -1, -11] as [number, number, number] },
  ], []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      setScrollOffset(prev => {
        const newOffset = prev + e.deltaY * 0.01;
        return Math.max(0, Math.min(posts.length * 4, newOffset));
      });
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [posts.length]);

  return (
    <>
      <Starfield />
      
      {/* Advanced lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" distance={50} decay={2} />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff0096" distance={50} decay={2} />
      <pointLight position={[0, 10, -20]} intensity={1} color="#39ff14" distance={50} decay={2} />
      <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={0.5} color="#ffffff" />
      
      <EnergyFlow posts={posts} scrollOffset={scrollOffset} />

      {posts.map((post, index) => {
        const z = -scrollOffset - (index * 4);
        return (
          <PostCard3D
            key={post.id}
            post={post}
            position={[0, 0, z]}
            index={index}
          />
        );
      })}

      {tokenOrbs.map((orb, index) => (
        <TokenOrb
          key={index}
          position={orb.position}
          tokenType={orb.tokenType}
          logo={orb.logo}
          color={orb.color}
          reward={orb.reward}
        />
      ))}

      {OrbitControls && (
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={100}
        />
      )}
    </>
  );
};

// Main Component
export const SpaceFeed: React.FC<SpaceFeedProps> = ({ posts }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadR3F()
      .then(() => {
        if (mounted) {
          // Ensure React is fully loaded
          setTimeout(() => {
            if (mounted && Canvas && useFrame) {
              setLoaded(true);
            }
          }, 200);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError('Failed to load 3D engine: ' + (e as Error).message);
          console.error('SpaceFeed load error:', e);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-cyber-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyber-pink font-mono mb-2">3D Engine Error</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <div className="text-xs text-gray-500">Falling back to grid view</div>
        </div>
      </div>
    );
  }

  if (!loaded || !Canvas || !useFrame) {
    return (
      <div className="min-h-screen bg-cyber-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyber-cyan/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyber-pink/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-neon-cyan"></div>
          <div className="text-cyber-pink font-mono mb-2 text-lg">INITIALIZING SPACE ENVIRONMENT</div>
          <div className="text-[10px] text-gray-500 font-mono mt-2">
            {!Canvas && 'Loading Canvas...'}
            {Canvas && !useFrame && 'Loading hooks...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-cyber-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-cyber-pink font-mono mb-2">3D Scene Error</div>
            <div className="text-gray-400 text-sm">Falling back to grid view</div>
          </div>
        </div>
      }
    >
      <div className="fixed inset-0 bg-cyber-black" style={{ zIndex: 9999 }}>
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 75 }} 
          gl={{ 
            antialias: true, 
            alpha: false,
            powerPreference: "high-performance"
          }}
          dpr={[1, 2]}
        >
          <SpaceScene posts={posts} />
        </Canvas>

        {/* High-tech UI Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top HUD */}
          <div className="absolute top-4 left-4 glass-strong border border-cyber-cyan/60 p-4 z-50 neon-border pointer-events-auto">
            <div className="text-xs font-mono text-cyber-cyan uppercase tracking-wider mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse shadow-neon-cyan"></div>
              <span>SPACE FEED</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono space-y-1">
              <div>Posts: {posts.length}</div>
              <div>Mode: 3D IMMERSIVE</div>
            </div>
          </div>

          {/* Right side stats */}
          <div className="absolute top-4 right-4 glass border border-cyber-pink/60 p-3 z-50 pointer-events-auto">
            <div className="text-[9px] font-mono text-cyber-pink uppercase tracking-wider mb-2">SYSTEM STATUS</div>
            <div className="text-[10px] text-gray-400 font-mono space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse"></div>
                <span>RENDER: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-pulse"></div>
                <span>WEBGL: ENABLED</span>
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass border border-cyber-dim/40 p-3 z-50 pointer-events-auto">
            <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wider text-center space-y-1">
              <div>SCROLL: Navigate • CLICK: Interact • ORBS: Collect Tokens</div>
              <div className="text-cyber-cyan">Drag to rotate • Scroll to zoom</div>
            </div>
          </div>

          {/* Corner tech accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyber-cyan/50"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyber-pink/50"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyber-green/50"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyber-yellow/50"></div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
