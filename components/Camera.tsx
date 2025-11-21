import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, XMarkIcon, BoltIcon, ArrowPathIcon } from './Icons';

interface Filter {
  name: string;
  css: string;
  icon: string;
}

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string>('none');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const [brushColor, setBrushColor] = useState('#00F0FF');
  const [brushSize, setBrushSize] = useState(5);
  const [textOverlays, setTextOverlays] = useState<{ id: string; text: string; x: number; y: number; color: string; fontSize: number }[]>([]);
  const [showControls, setShowControls] = useState(true);

  const filters: Filter[] = [
    { name: 'none', css: 'none', icon: '👁️' },
    { name: 'cyberpunk', css: 'contrast(1.2) brightness(1.1) saturate(1.3) hue-rotate(180deg)', icon: '🌆' },
    { name: 'neon', css: 'brightness(1.2) contrast(1.3) saturate(2)', icon: '⚡' },
    { name: 'matrix', css: 'grayscale(1) contrast(1.5) brightness(0.8)', icon: '💚' },
    { name: 'retro', css: 'sepia(0.3) contrast(1.1) brightness(1.1)', icon: '📼' },
    { name: 'glitch', css: 'hue-rotate(90deg) contrast(1.5)', icon: '💥' },
    { name: 'dream', css: 'blur(0.5px) brightness(1.2) saturate(1.5)', icon: '✨' },
    { name: 'night', css: 'brightness(0.3) contrast(1.4)', icon: '🌙' },
  ];

  const stickerOptions = ['😀', '🔥', '💎', '🚀', '👾', '⚡', '🌟', '💀', '🎭', '🤖'];

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
      }
    }
  }, [flashEnabled]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply filter to canvas
    if (currentFilter !== 'none') {
      ctx.filter = filters.find(f => f.name === currentFilter)?.css || 'none';
    } else {
      ctx.filter = 'none';
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Draw stickers
    stickers.forEach(sticker => {
      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.rotate(sticker.rotation * Math.PI / 180);
      ctx.scale(sticker.scale, sticker.scale);
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    });

    // Draw text overlays
    textOverlays.forEach(overlay => {
      ctx.save();
      ctx.fillStyle = overlay.color;
      ctx.font = `${overlay.fontSize}px 'Rajdhani', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(overlay.text, overlay.x, overlay.y);
      ctx.restore();
    });

    // Draw drawing path
    if (drawingPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
      drawingPath.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.stroke();
      ctx.restore();
    }

    // Convert to blob and create download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wyyrrddd-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }, [currentFilter, stickers, textOverlays, drawingPath, brushColor, brushSize, filters]);

  const addSticker = useCallback((emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
      scale: 1,
      rotation: Math.random() * 30 - 15,
    };
    setStickers(prev => [...prev, newSticker]);
  }, []);

  const addText = useCallback(() => {
    const text = prompt('Enter text for overlay:');
    if (text) {
      const newText = {
        id: Date.now().toString(),
        text,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        color: brushColor,
        fontSize: 32,
      };
      setTextOverlays(prev => [...prev, newText]);
    }
  }, [brushColor]);

  const handleCanvasTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setDrawingPath(prev => [...prev, { x, y }]);
  }, [isDrawing]);

  useEffect(() => {
    if (facingMode && !isActive) {
      startCamera();
    }
  }, [facingMode, isActive, startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Camera View */}
      <div className="relative w-full h-screen">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            filter: filters.find(f => f.name === currentFilter)?.css || 'none',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
          }}
        />

        {/* Canvas for overlays */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto"
          onTouchStart={(e) => {
            if (isDrawing) {
              e.preventDefault();
              handleCanvasTouch(e);
            }
          }}
          onTouchMove={(e) => {
            if (isDrawing) {
              e.preventDefault();
              handleCanvasTouch(e);
            }
          }}
          onTouchEnd={() => {
            if (isDrawing) {
              setDrawingPath([]);
            }
          }}
        />

        {/* Drawing path preview */}
        {drawingPath.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={`M ${drawingPath.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              stroke={brushColor}
              strokeWidth={brushSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Stickers */}
        {stickers.map(sticker => (
          <div
            key={sticker.id}
            className="absolute text-4xl cursor-move animate-bounce"
            style={{
              left: sticker.x,
              top: sticker.y,
              transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))'
            }}
          >
            {sticker.emoji}
          </div>
        ))}

        {/* Text Overlays */}
        {textOverlays.map(overlay => (
          <div
            key={overlay.id}
            className="absolute font-bold text-stroke cursor-move"
            style={{
              left: overlay.x,
              top: overlay.y,
              color: overlay.color,
              fontSize: overlay.fontSize,
              transform: 'translate(-50%, -50%)',
              textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
              WebkitTextStroke: '1px rgba(0,0,0,0.5)'
            }}
          >
            {overlay.text}
          </div>
        ))}

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
              <button
                onClick={() => window.history.back()}
                className="w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={switchCamera}
                  className="w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
                >
                  <ArrowPathIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={toggleFlash}
                  className={`w-12 h-12 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all ${
                    flashEnabled
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400'
                      : 'bg-black/50 border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <BoltIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Filter Strip */}
            <div className="absolute bottom-32 left-4 right-4 pointer-events-auto">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map(filter => (
                  <button
                    key={filter.name}
                    onClick={() => setCurrentFilter(filter.name)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all flex items-center justify-center text-2xl ${
                      currentFilter === filter.name
                        ? 'border-cyber-cyan bg-cyber-cyan/20 shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                        : 'border-white/20 bg-black/30 hover:border-white/40'
                    }`}
                  >
                    {filter.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Sticker Bar */}
            <div className="absolute bottom-20 left-4 right-4 pointer-events-auto">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {stickerOptions.map(sticker => (
                  <button
                    key={sticker}
                    onClick={() => addSticker(sticker)}
                    className="flex-shrink-0 w-12 h-12 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-2xl hover:bg-white/10 transition-all"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 pointer-events-auto">
              {/* Drawing Toggle */}
              <button
                onClick={() => setIsDrawing(!isDrawing)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isDrawing
                    ? 'bg-cyber-cyan text-black shadow-[0_0_20px_rgba(0,240,255,0.8)]'
                    : 'bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                ✏️
              </button>

              {/* Text Button */}
              <button
                onClick={addText}
                className="w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
              >
                Aa
              </button>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white border-4 border-white/20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </button>

              {/* Brush Color */}
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-12 h-12 rounded-full border-2 border-white/20 cursor-pointer"
              />

              {/* Brush Size */}
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Hide Controls Toggle */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="absolute top-1/2 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white text-xs pointer-events-auto"
        >
          {showControls ? '👁️' : '🙈'}
        </button>
      </div>
    </div>
  );
};