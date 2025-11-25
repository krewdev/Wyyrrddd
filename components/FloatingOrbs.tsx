import React, { useEffect, useState } from 'react';

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface FloatingOrbsProps {
  count?: number;
  colors?: string[];
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({ 
  count = 5,
  colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-cyan-400 to-cyan-600',
    'from-green-400 to-green-600',
  ]
}) => {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    const newOrbs: Orb[] = [];
    for (let i = 0; i < count; i++) {
      newOrbs.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 100 + 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
      });
    }
    setOrbs(newOrbs);
  }, [count, colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} opacity-10 blur-3xl`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            animation: `float-orb ${orb.duration}s ease-in-out ${orb.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-orb {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(10px, -10px) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Interactive sparkle effect on hover
export const Sparkles: React.FC<{ active?: boolean }> = ({ active = false }) => {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    const interval = setInterval(() => {
      const newSparkle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setSparkles(prev => [...prev, newSparkle]);

      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 1000);
    }, 200);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-ping"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
    </div>
  );
};


