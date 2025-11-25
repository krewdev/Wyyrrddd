import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
}

interface ParticleSystemProps {
  trigger?: boolean;
  count?: number;
  colors?: string[];
  size?: number;
  speed?: number;
  lifetime?: number;
  shape?: 'circle' | 'square' | 'triangle';
  gravity?: number;
  spread?: number;
  position?: { x: number; y: number };
  className?: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  trigger = false,
  count = 20,
  colors = ['#00F0FF', '#FF003C', '#39FF14', '#FCEE0A'],
  size = 4,
  speed = 5,
  lifetime = 2000,
  shape = 'circle',
  gravity = 0.1,
  spread = 0.5,
  position = { x: 0, y: 0 },
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastTrigger = useRef<number>(0);

  const createParticle = (x: number, y: number, index: number): Particle => {
    const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * spread;
    const velocity = speed * (0.5 + Math.random() * 0.5);

    return {
      id: Date.now() + index,
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: lifetime,
      maxLife: lifetime,
      size: size * (0.5 + Math.random() * 0.5),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape
    };
  };

  const updateParticles = () => {
    setParticles(prevParticles =>
      prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + gravity,
          life: particle.life - 16, // Assuming 60fps
          vx: particle.vx * 0.99, // Air resistance
        }))
        .filter(particle => particle.life > 0)
    );
  };

  const drawParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 10;

      switch (particle.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(
            particle.x - particle.size / 2,
            particle.y - particle.size / 2,
            particle.size,
            particle.size
          );
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y - particle.size);
          ctx.lineTo(particle.x - particle.size, particle.y + particle.size);
          ctx.lineTo(particle.x + particle.size, particle.y + particle.size);
          ctx.closePath();
          ctx.fill();
          break;
      }
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  const animate = () => {
    updateParticles();
    drawParticles();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (trigger && Date.now() - lastTrigger.current > 100) {
      lastTrigger.current = Date.now();
      const newParticles = Array.from({ length: count }, (_, i) =>
        createParticle(position.x, position.y, i)
      );
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [trigger, count, position, createParticle]);

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  );
};

// Specialized particle effects
export const TokenSpendEffect: React.FC<{ trigger: boolean; position: { x: number; y: number } }> = ({ trigger, position }) => (
  <ParticleSystem
    trigger={trigger}
    count={15}
    colors={['#FF003C', '#FCEE0A', '#00F0FF']}
    size={6}
    speed={8}
    lifetime={1000}
    shape="circle"
    gravity={0.2}
    position={position}
  />
);

export const SuccessEffect: React.FC<{ trigger: boolean; position: { x: number; y: number } }> = ({ trigger, position }) => (
  <ParticleSystem
    trigger={trigger}
    count={25}
    colors={['#39FF14', '#00F0FF', '#FCEE0A']}
    size={8}
    speed={6}
    lifetime={1500}
    shape="circle"
    gravity={-0.05}
    position={position}
  />
);

export const CyberGlitchEffect: React.FC<{ active: boolean }> = ({ active }) => {
  const [glitchOffset, setGlitchOffset] = useState(0);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setGlitchOffset(Math.random() * 4 - 2);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setGlitchOffset(0);
    }
  }, [active]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 ${active ? 'opacity-30' : 'opacity-0'} transition-opacity duration-200`}
      style={{
        background: `repeating-linear-gradient(
          90deg,
          rgba(0, 240, 255, 0.1) 0px,
          rgba(0, 240, 255, 0.1) 2px,
          transparent 2px,
          transparent 4px
        )`,
        transform: `translateX(${glitchOffset}px)`,
        animation: active ? 'glitch 0.1s infinite' : 'none'
      }}
    />
  );
};

// Enhanced burst effect with more particles
export const BurstEffect: React.FC<{ trigger: boolean; position: { x: number; y: number }; color?: string }> = ({ 
  trigger, 
  position,
  color = '#3B82F6'
}) => (
  <ParticleSystem
    trigger={trigger}
    count={30}
    colors={[color, `${color}AA`, `${color}77`]}
    size={8}
    speed={10}
    lifetime={1200}
    shape="circle"
    gravity={0.15}
    spread={1}
    position={position}
  />
);

// Confetti effect for special interactions
export const ConfettiEffect: React.FC<{ trigger: boolean; position: { x: number; y: number } }> = ({ trigger, position }) => (
  <ParticleSystem
    trigger={trigger}
    count={40}
    colors={['#FF003C', '#FCEE0A', '#00F0FF', '#39FF14', '#FF69B4', '#9D4EDD']}
    size={6}
    speed={12}
    lifetime={2000}
    shape="square"
    gravity={0.3}
    spread={2}
    position={position}
  />
);

// Ripple effect for button presses
export const RippleEffect: React.FC<{ active: boolean }> = ({ active }) => {
  return active ? (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
    </div>
  ) : null;
};
