import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';

interface CreatePostSectionProps {
  onPostCreated?: (post: Post) => void;
}

export const CreatePostSection: React.FC<CreatePostSectionProps> = ({ onPostCreated }) => {
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideoFile = file.type.startsWith('video/');
    setIsVideo(isVideoFile);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setPreview(result);
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!preview) {
      alert('Please select an image or video first');
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      userId: 'me',
      username: 'You',
      userAvatar: localStorage.getItem('wyyrrddd-profile-avatar') || 'https://api.dicebear.com/9.x/avataaars/svg?seed=You',
      imageUrl: isVideo ? undefined : preview,
      videoUrl: isVideo ? preview : undefined,
      caption: caption || 'Just dropped on Wyyrrddd. #New',
      tokens: { LIKE: 0, LOVE: 0, CARE: 0, CREEP: 0 },
      isSponsored: false
    };

    // Save to localStorage for feed to pick up
    try {
      const existingPosts = JSON.parse(localStorage.getItem('wyyrrddd-user-posts') || '[]');
      existingPosts.unshift(newPost);
      localStorage.setItem('wyyrrddd-user-posts', JSON.stringify(existingPosts.slice(0, 50))); // Keep last 50
    } catch (e) {
      console.error('Failed to save post:', e);
    }

    if (onPostCreated) {
      onPostCreated(newPost);
    }

    // Reset form
    setCaption('');
    setPreview(null);
    setIsVideo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Show success message
    alert('Post published! Check your feed.');
    
    // Optionally navigate to feed
    try {
      navigate('/');
    } catch {
      // If navigation fails, just reload the page
      window.location.href = '/';
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setIsVideo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Caption Input */}
      <div>
        <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
          Caption
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind? #Wyyrrddd"
          rows={3}
          className="w-full glass border border-cyber-cyan/40 px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyber-cyan focus:shadow-neon-cyan resize-none placeholder-cyber-dim"
        />
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-wider mb-2">
          Media (Image or Video)
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 glass border border-cyber-cyan/60 text-cyber-cyan px-4 py-3 text-xs font-mono uppercase tracking-wide hover:bg-cyber-cyan hover:text-black transition-all shadow-neon-cyan relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>📷</span>
              <span>{preview ? 'CHANGE' : 'UPLOAD'}</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/0 via-cyber-cyan/20 to-cyber-cyan/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          {preview && (
            <button
              type="button"
              onClick={clearPreview}
              className="glass border border-cyber-pink/60 text-cyber-pink px-4 py-3 text-xs font-mono uppercase tracking-wide hover:bg-cyber-pink hover:text-black transition-all"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {isUploading && (
        <div className="glass border border-cyber-cyan/40 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-cyber-cyan font-mono text-xs">Processing media...</p>
          </div>
        </div>
      )}

      {preview && !isUploading && (
        <div className="glass border border-cyber-cyan/40 p-4 relative group">
          <div className="absolute top-2 right-2 z-10">
            <span className="glass border border-cyber-pink/60 text-cyber-pink px-2 py-1 text-[9px] font-mono uppercase">
              {isVideo ? 'VIDEO' : 'IMAGE'}
            </span>
          </div>
          {isVideo ? (
            <video
              src={preview}
              controls
              className="w-full max-h-64 object-cover rounded"
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded"
            />
          )}
        </div>
      )}

      {/* Post Button */}
      <button
        type="button"
        onClick={handlePost}
        disabled={!preview || isUploading}
        className="w-full glass-strong border border-cyber-green/60 bg-cyber-green/10 text-cyber-green px-6 py-4 text-sm font-mono uppercase tracking-wider hover:bg-cyber-green hover:text-black transition-all shadow-neon-green disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span>🚀</span>
          <span>PUBLISH TO WEB</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-green/0 via-cyber-green/30 to-cyber-green/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </button>
    </div>
  );
};

