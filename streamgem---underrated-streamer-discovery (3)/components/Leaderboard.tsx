import React from 'react';
import { Streamer, VoteRecord } from '../types';
import { ExternalLink, Trophy, Flame } from 'lucide-react';

interface LeaderboardProps {
  streamers: Streamer[];
  votes: Record<string, number>;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ streamers, votes }) => {
  // Sort streamers by votes descending
  const sortedStreamers = [...streamers].sort((a, b) => {
    const votesA = votes[a.id] || 0;
    const votesB = votes[b.id] || 0;
    return votesB - votesA;
  }).filter(s => (votes[s.id] || 0) > 0); // Only show positively voted streamers

  if (sortedStreamers.length === 0) {
    return (
      <div className="text-center p-12 glass-panel rounded-xl border-dashed border-2 border-zinc-800 text-zinc-500">
        <Trophy className="mx-auto mb-4 opacity-20" size={48} />
        <p>No favorites yet. Start discovering!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-6 border border-zinc-800 w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-orange-500" />
        <h2 className="text-xl font-bold text-white">Community Favorites</h2>
      </div>
      
      <div className="space-y-4">
        {sortedStreamers.slice(0, 5).map((streamer, index) => (
          <div key={streamer.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
            <div className={`
              w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
              ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                index === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                index === 2 ? 'bg-orange-700/20 text-orange-700' : 'bg-zinc-800 text-zinc-500'}
            `}>
              {index + 1}
            </div>
            
            <img 
              src={`https://picsum.photos/seed/${streamer.name}/50/50`} 
              alt={streamer.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-900" 
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                {streamer.name}
              </h4>
              <p className="text-xs text-zinc-500 truncate">{streamer.game}</p>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-sm font-bold text-emerald-500">
                +{votes[streamer.id]}
              </span>
              <a 
                href={streamer.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
