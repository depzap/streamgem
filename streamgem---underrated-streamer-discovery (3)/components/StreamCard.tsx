import React, { useState } from 'react';
import { Streamer } from '../types';
import { ExternalLink, Heart, User, ArrowRight, Twitch, AlertCircle, Eye, Flag } from 'lucide-react';

interface StreamCardProps {
  streamer: Streamer;
  onLike: (streamerId: string) => void;
  onNext: () => void;
  onReportOffline: (streamerId: string) => void;
  isLiked: boolean;
}

const StreamCard: React.FC<StreamCardProps> = ({ streamer, onLike, onNext, onReportOffline, isLiked }) => {
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden shadow-2xl animate-fade-in transition-all duration-300 border border-zinc-800">
      {/* Video Embed Section */}
      <div className="relative aspect-video bg-black group">
        {!iframeError ? (
          <>
            <iframe
              src={streamer.embedUrl}
              height="100%"
              width="100%"
              allowFullScreen
              className="w-full h-full relative z-10"
              title={`${streamer.name} live stream`}
              onError={() => setIframeError(true)}
              // Critical: Do NOT use sandbox attribute for Twitch embeds. 
              // Twitch requires access to the parent window to verify the domain.
            />
             {/* Overlay for manual fallback if visual errors occur (like 'refused to connect' which doesn't trigger onError) */}
             <div className="absolute top-0 right-0 z-50 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => onReportOffline(streamer.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-white text-xs rounded border border-red-500/30 backdrop-blur-md shadow-lg"
                >
                  <Flag size={12} />
                  Stream Offline?
                </button>
                <a 
                  href={streamer.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs rounded border border-white/20 backdrop-blur-md shadow-lg"
                >
                  <AlertCircle size={12} className="text-yellow-400" />
                  Open on Twitch
                </a>
             </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative">
            <img 
              src={streamer.thumbnail} 
              alt={streamer.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-30" 
            />
            <div className="z-10 text-center p-6">
              <User size={64} className="mx-auto text-zinc-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Preview Unavailable</h3>
              <p className="text-zinc-400 mb-6">
                Unable to load stream embed.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                   onClick={() => onReportOffline(streamer.id)}
                   className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900 text-white rounded-lg text-sm transition-colors border border-red-800"
                >
                  Report Offline
                </button>
                <a 
                  href={streamer.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold transition-colors"
                >
                  Watch on Twitch <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* Platform Badge Overlay */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg bg-violet-600 text-white">
            <Twitch size={12} />
            Twitch
          </span>
          <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold backdrop-blur-sm border border-red-500/50 animate-pulse flex items-center gap-1.5 shadow-lg">
             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
             LIVE
          </span>
          {streamer.viewerCount && (
            <span className="px-3 py-1 rounded-full bg-black/60 text-zinc-200 text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1.5 shadow-lg">
               <Eye size={12} className="text-zinc-400" />
               {streamer.viewerCount}
            </span>
          )}
        </div>
      </div>

      {/* Info & Controls */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start justify-between bg-zinc-900/50">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
             <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{streamer.name}</h2>
             <span className="text-sm px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">
               Playing {streamer.game}
             </span>
          </div>
          <p className="text-zinc-400 leading-relaxed max-w-xl">
            {streamer.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {streamer.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Mobile-only Report Offline (shown below on mobile) */}
          <button
             onClick={() => onReportOffline(streamer.id)}
             className="md:hidden w-full px-6 py-3.5 rounded-xl bg-zinc-900/50 text-red-400 text-sm font-medium border border-zinc-800 hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
          >
             <Flag size={14} /> Report Offline
          </button>

          <button
            onClick={onNext}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 group"
          >
            <span>Next Stream</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onLike(streamer.id)}
            className={`w-full md:w-auto p-3.5 rounded-xl transition-all duration-200 flex items-center justify-center border ${
              isLiked 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30'
            }`}
            title="Vote for this streamer"
          >
            <Heart size={24} className={isLiked ? 'fill-current animate-pulse' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamCard;