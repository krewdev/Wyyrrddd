import React, { useState, useEffect, useRef } from 'react';
import { GeocacheCampaign, CreatorStream, LocationDataPoint } from '../types';

interface GeocacheMapProps {
  side: 'left' | 'right';
  campaigns: GeocacheCampaign[];
  creatorStreams: CreatorStream[];
  currentLocation?: LocationDataPoint | null;
}

export const GeocacheMap: React.FC<GeocacheMapProps> = ({ 
  side, 
  campaigns, 
  creatorStreams,
  currentLocation 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCache, setSelectedCache] = useState<{ type: 'campaign' | 'stream'; id: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Combine all active caches
  const activeCaches = [
    ...campaigns.filter(c => c.isActive).map(c => ({ type: 'campaign' as const, data: c })),
    ...creatorStreams.filter(s => s.isActive).map(s => ({ type: 'stream' as const, data: s }))
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      if (width === 0 || height === 0) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw grid background
      ctx.strokeStyle = side === 'left' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 0, 150, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 20 * zoom;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + pan.x % gridSize, 0);
        ctx.lineTo(x + pan.x % gridSize, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + pan.y % gridSize);
        ctx.lineTo(width, y + pan.y % gridSize);
        ctx.stroke();
      }

      // Draw active caches - ensure they're always visible
      if (activeCaches.length > 0) {
        activeCaches.forEach((cache, index) => {
          // Position markers in a circle around center, but keep them visible
          const angle = (index / activeCaches.length) * Math.PI * 2;
          const radius = Math.min(width, height) * 0.25; // Smaller radius to keep visible
          const x = (width / 2) + Math.cos(angle) * radius + pan.x;
          const y = (height / 2) + Math.sin(angle) * radius + pan.y;

          // Clamp to visible area
          const clampedX = Math.max(10, Math.min(width - 10, x));
          const clampedY = Math.max(10, Math.min(height - 10, y));

          const isSelected = selectedCache?.type === cache.type && selectedCache?.id === cache.data.id;
          const color = cache.type === 'campaign' 
            ? (side === 'left' ? 'rgba(0, 240, 255, 1)' : 'rgba(255, 0, 150, 1)')
            : (side === 'left' ? 'rgba(57, 255, 20, 1)' : 'rgba(255, 200, 0, 1)');

          // Draw pulse ring
          const pulseSize = 8 + Math.sin(Date.now() / 500 + index) * 3;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(clampedX, clampedY, pulseSize, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Draw cache marker - larger and more visible
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(clampedX, clampedY, isSelected ? 10 : 8, 0, Math.PI * 2);
          ctx.fill();

          // Draw glow effect
          if (isSelected) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Draw type indicator - larger text
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cache.type === 'campaign' ? 'AD' : 'ST', clampedX, clampedY);
        });
      } else {
        // Show "No active caches" message
        ctx.fillStyle = side === 'left' ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 0, 150, 0.3)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No active caches', width / 2, height / 2);
      }

      // Draw current location if available
      if (currentLocation) {
        const locX = width / 2 + pan.x;
        const locY = height / 2 + pan.y;
        
        ctx.fillStyle = side === 'left' ? 'rgba(57, 255, 20, 0.9)' : 'rgba(255, 200, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(locX, locY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw location pulse
        ctx.strokeStyle = side === 'left' ? 'rgba(57, 255, 20, 0.5)' : 'rgba(255, 200, 0, 0.5)';
        ctx.lineWidth = 2;
        const pulseRadius = 4 + Math.sin(Date.now() / 300) * 8;
        ctx.beginPath();
        ctx.arc(locX, locY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw connection lines from current location to nearby caches
      if (currentLocation && activeCaches.length > 0) {
        activeCaches.forEach((cache, index) => {
          const angle = (index / activeCaches.length) * Math.PI * 2;
          const radius = Math.min(width, height) * 0.25;
          const cacheX = (width / 2) + Math.cos(angle) * radius + pan.x;
          const cacheY = (height / 2) + Math.sin(angle) * radius + pan.y;
          const clampedCacheX = Math.max(10, Math.min(width - 10, cacheX));
          const clampedCacheY = Math.max(10, Math.min(height - 10, cacheY));
          const locX = width / 2 + pan.x;
          const locY = height / 2 + pan.y;
          const clampedLocX = Math.max(10, Math.min(width - 10, locX));
          const clampedLocY = Math.max(10, Math.min(height - 10, locY));

          // Check if cache matches current location
          const zoneMatch = cache.data.targetZones?.includes(currentLocation.zoneHash);
          const categoryMatch = cache.data.targetCategories?.includes(currentLocation.category);

          if (zoneMatch || categoryMatch) {
            ctx.strokeStyle = side === 'left' 
              ? 'rgba(0, 240, 255, 0.4)' 
              : 'rgba(255, 0, 150, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(clampedLocX, clampedLocY);
            ctx.lineTo(clampedCacheX, clampedCacheY);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [activeCaches, selectedCache, zoom, pan, currentLocation, side]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a cache
    const width = canvas.width;
    const height = canvas.height;

    activeCaches.forEach((cache, index) => {
      const cacheX = (width / 2) + Math.cos((index / activeCaches.length) * Math.PI * 2) * (width * 0.3) + pan.x;
      const cacheY = (height / 2) + Math.sin((index / activeCaches.length) * Math.PI * 2) * (height * 0.3) + pan.y;
      
      const distance = Math.sqrt(Math.pow(x - cacheX, 2) + Math.pow(y - cacheY, 2));
      if (distance < 15) {
        setSelectedCache({ type: cache.type, id: cache.data.id });
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)));
  };

  const selectedCacheData = selectedCache 
    ? activeCaches.find(c => c.type === selectedCache.type && c.data.id === selectedCache.id)?.data
    : null;

  return (
    <div className="relative w-full h-full bg-cyber-black/40">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move block"
        style={{ minHeight: '200px' }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Cache Info Panel */}
      {selectedCacheData && (
        <div className={`absolute ${side === 'left' ? 'left-2 top-2' : 'right-2 top-2'} glass-strong border ${
          selectedCache.type === 'campaign' 
            ? (side === 'left' ? 'border-cyber-cyan' : 'border-cyber-pink')
            : 'border-cyber-green'
        } p-3 max-w-[200px] z-10 neon-border`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider mb-1 text-cyber-dim">
                {selectedCache.type === 'campaign' ? 'Geocache Ad' : 'Creator Stream'}
              </div>
              <h4 className="text-sm font-bold text-white">
                {selectedCache.type === 'campaign' 
                  ? (selectedCacheData as GeocacheCampaign).brand
                  : (selectedCacheData as CreatorStream).creatorName}
              </h4>
            </div>
            <button
              onClick={() => setSelectedCache(null)}
              className="text-cyber-dim hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          
          {selectedCache.type === 'campaign' ? (
            <>
              <p className="text-xs text-gray-400 mb-2">
                {(selectedCacheData as GeocacheCampaign).title}
              </p>
              <div className="text-[9px] font-mono text-cyber-cyan">
                Reward: +{(selectedCacheData as GeocacheCampaign).reward} CARE
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-2">
                {(selectedCacheData as CreatorStream).title}
              </p>
              <div className="text-[9px] font-mono text-cyber-green">
                Reward: +{(selectedCacheData as CreatorStream).reward} CARE
              </div>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div className={`absolute ${side === 'left' ? 'left-2 bottom-2' : 'right-2 bottom-2'} glass border border-cyber-dim/40 p-2 text-[8px] font-mono space-y-1`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-cyan"></div>
          <span className="text-gray-400">Ads</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-green"></div>
          <span className="text-gray-400">Streams</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse"></div>
          <span className="text-gray-400">You</span>
        </div>
      </div>
    </div>
  );
};

