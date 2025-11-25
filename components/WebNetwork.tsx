import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Post } from '../types';
import { PostCard } from './PostCard';

interface WebNetworkProps {
  posts: Post[];
}

interface Node {
  id: string;
  post: Post;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

export const WebNetwork: React.FC<WebNetworkProps> = ({ posts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Calculate connections between posts (strings that intersect)
  const connections = useMemo<Connection[]>(() => {
    const conns: Connection[] = [];
    // Connect posts based on similar content, users, or random connections
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        // Connect if same user, similar captions, or random chance
        const sameUser = posts[i].userId === posts[j].userId;
        const similarCaption = posts[i].caption.toLowerCase().split(' ').some(word => 
          posts[j].caption.toLowerCase().includes(word) && word.length > 3
        );
        const randomConnection = Math.random() < 0.15; // 15% chance for random connections
        
        if (sameUser || similarCaption || randomConnection) {
          conns.push({
            from: posts[i].id,
            to: posts[j].id,
            strength: sameUser ? 1.0 : similarCaption ? 0.7 : 0.3
          });
        }
      }
    }
    return conns;
  }, [posts]);

  // Initialize nodes with force-directed positions
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && posts.length > 0) {
      const initialNodes = posts.map((post, index) => {
        // Start with a circular layout, then let physics take over
        const angle = (index / posts.length) * Math.PI * 2;
        const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
        return {
          id: post.id,
          post,
          x: dimensions.width / 2 + Math.cos(angle) * radius,
          y: dimensions.height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0
        };
      });
      setNodes(initialNodes);
    }
  }, [posts, dimensions]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Force-directed graph simulation
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0 || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let animationFrame: number;
    let currentNodes = [...nodes]; // Working copy

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Force simulation
      const repulsion = 2000;
      const attraction = 0.01;
      const damping = 0.85;

      // Repulsion between all nodes
      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const dx = currentNodes[j].x - currentNodes[i].x;
          const dy = currentNodes[j].y - currentNodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          currentNodes[i].vx -= fx;
          currentNodes[i].vy -= fy;
          currentNodes[j].vx += fx;
          currentNodes[j].vy += fy;
        }
      }

      // Attraction along connections (strings)
      connections.forEach(conn => {
        const from = currentNodes.find(n => n.id === conn.from);
        const to = currentNodes.find(n => n.id === conn.to);
        if (!from || !to) return;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction * conn.strength;

        from.vx += (dx / dist) * force;
        from.vy += (dy / dist) * force;
        to.vx -= (dx / dist) * force;
        to.vy -= (dy / dist) * force;
      });

      // Update positions and apply damping
      currentNodes.forEach(node => {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        const margin = 100;
        if (node.x < margin) { node.x = margin; node.vx *= -0.5; }
        if (node.x > dimensions.width - margin) { node.x = dimensions.width - margin; node.vx *= -0.5; }
        if (node.y < margin) { node.y = margin; node.vy *= -0.5; }
        if (node.y > dimensions.height - margin) { node.y = dimensions.height - margin; node.vy *= -0.5; }
      });

      // Draw connections (strings)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      connections.forEach(conn => {
        const from = currentNodes.find(n => n.id === conn.from);
        const to = currentNodes.find(n => n.id === conn.to);
        if (!from || !to) return;

        const isHighlighted = selectedNode === from.id || selectedNode === to.id || 
                              hoveredNode === from.id || hoveredNode === to.id;

        ctx.strokeStyle = isHighlighted 
          ? `rgba(0, 240, 255, ${0.4 + conn.strength * 0.4})` 
          : `rgba(0, 240, 255, ${0.1 + conn.strength * 0.1})`;
        ctx.lineWidth = isHighlighted ? 2 : 1;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Add glow effect for highlighted connections
        if (isHighlighted) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // Draw intersection points (where strings cross)
      connections.forEach((conn1, i) => {
        connections.slice(i + 1).forEach(conn2 => {
          const line1 = {
            from: currentNodes.find(n => n.id === conn1.from),
            to: currentNodes.find(n => n.id === conn1.to)
          };
          const line2 = {
            from: currentNodes.find(n => n.id === conn2.from),
            to: currentNodes.find(n => n.id === conn2.to)
          };

          if (!line1.from || !line1.to || !line2.from || !line2.to) return;

          // Check if lines intersect
          const intersection = lineIntersection(
            line1.from.x, line1.from.y, line1.to.x, line1.to.y,
            line2.from.x, line2.from.y, line2.to.x, line2.to.y
          );

          if (intersection) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(intersection.x, intersection.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // Update state periodically (every 10 frames for performance)
      if (Math.random() < 0.1) {
        setNodes([...currentNodes]);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [nodes.length, connections, dimensions, selectedNode, hoveredNode]);

  // Helper function to calculate line intersection
  const lineIntersection = (
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): { x: number; y: number } | null => {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.001) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    return null;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-cyber-black"
      style={{ minHeight: '100vh' }}
    >
      {/* Canvas for drawing strings/connections */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Post Cards positioned at node locations */}
      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: '280px',
              transform: `translate(-50%, -50%) ${selectedNode === node.id ? 'scale(1.1)' : hoveredNode === node.id ? 'scale(1.05)' : 'scale(1)'}`,
              zIndex: selectedNode === node.id ? 100 : hoveredNode === node.id ? 50 : 10,
              opacity: selectedNode && selectedNode !== node.id ? 0.3 : 1
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
          >
            <div className="relative">
              {/* Node indicator */}
              <div 
                className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-cyber-cyan bg-cyber-black z-30 animate-pulse"
                style={{
                  boxShadow: selectedNode === node.id 
                    ? '0 0 20px rgba(0, 240, 255, 1)' 
                    : hoveredNode === node.id 
                    ? '0 0 10px rgba(0, 240, 255, 0.6)'
                    : '0 0 5px rgba(0, 240, 255, 0.3)'
                }}
              />
              <PostCard post={node.post} />
            </div>
          </div>
        ))}
      </div>

      {/* Info overlay */}
      <div className="absolute top-4 left-4 glass border border-cyber-cyan/40 p-3 z-50">
        <div className="text-xs font-mono text-cyber-cyan uppercase tracking-wider mb-1">
          THE WEB
        </div>
        <div className="text-[10px] text-gray-400 font-mono">
          {posts.length} Posts · {connections.length} Connections
        </div>
        <div className="text-[9px] text-cyber-dim font-mono mt-2">
          Click posts to explore connections
        </div>
      </div>
    </div>
  );
};

