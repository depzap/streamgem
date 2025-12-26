import React, { useState, useEffect, useCallback } from 'react';
import { Streamer, CATEGORIES, Category } from './types';
import { fetchUnderratedStreamers } from './services/streamService';
import StreamCard from './components/StreamCard';
import Leaderboard from './components/Leaderboard';
import { Shuffle, Search, Sparkles, Loader2, Info } from 'lucide-react';

const App: React.FC = () => {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Gaming');
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [totalVotes, setTotalVotes] = useState<Record<string, number>>({});
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    } else {
      loadStreamers(selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStreamers = async (category: string) => {
    setLoading(true);
    setStreamers([]); // Clear current list to show loading state cleanly
    try {
      const results = await fetchUnderratedStreamers(category);
      setStreamers(results);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < streamers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // If we reach the end, fetch more
      loadStreamers(selectedCategory);
    }
  };

  const handleReportOffline = (streamerId: string) => {
    // Remove the reported streamer from the list
    setStreamers(prev => {
        const newList = prev.filter(s => s.id !== streamerId);
        return newList;
    });
    
    // Logic to handle index if the current one is removed
    // If we removed the last item, fetch new ones
    if (streamers.length <= 1) {
        loadStreamers(selectedCategory);
    } else if (currentIndex >= streamers.length - 1) {
        // If we were at the end, just decrement index so we show the previous one (which is now last)
        // Or cleaner: reset to 0 if list is refreshed, but here we just want to ensure index is valid.
        setCurrentIndex(prev => Math.max(0, prev - 1));
    }
    // If we were in the middle, the next item slides into the current index, so no index change needed.
  };

  const handleLike = (streamerId: string) => {
    if (userVotes[streamerId] === 'up') return;

    // Update user personal vote state
    setUserVotes(prev => ({
      ...prev,
      [streamerId]: 'up'
    }));

    // Update global leaderboard count (simulated)
    setTotalVotes(prev => {
      const current = prev[streamerId] || 0;
      return {
        ...prev,
        [streamerId]: current + 1
      };
    });
  };

  const handleCategoryChange = (cat: Category) => {
    if (cat === selectedCategory) return;
    setSelectedCategory(cat);
    loadStreamers(cat);
  };

  if (apiKeyMissing) {
     return (
       <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
         <div className="max-w-md text-center space-y-4">
           <h1 className="text-3xl font-bold text-red-500">Configuration Error</h1>
           <p className="text-zinc-400">The <code>API_KEY</code> environment variable is missing. This app requires a Gemini API key to function.</p>
         </div>
       </div>
     );
  }

  const currentStreamer = streamers[currentIndex];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-violet-500/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-500 fill-violet-500" size={24} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              StreamGem
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-full border border-zinc-800">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            onClick={() => loadStreamers(selectedCategory)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-black font-semibold text-sm hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span className="hidden sm:inline">Find Random</span>
          </button>
        </div>
        
        {/* Mobile Categories */}
        <div className="md:hidden overflow-x-auto pb-2 px-4 flex gap-2 no-scrollbar">
           {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-zinc-800 border-zinc-700 text-white' 
                    : 'bg-zinc-900/50 border-transparent text-zinc-400'
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid lg:grid-cols-[1fr_350px] gap-8 items-start">
        
        {/* Stream Viewer Area */}
        <section className="flex flex-col gap-6 min-h-[500px]">
          {loading ? (
             <div className="w-full h-96 glass-panel rounded-2xl flex flex-col items-center justify-center animate-pulse">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                <p className="text-zinc-400 font-medium">Scouting for hidden gems...</p>
                <p className="text-zinc-600 text-sm mt-2">Checking for live status...</p>
             </div>
          ) : currentStreamer ? (
            <div className="space-y-4">
               <StreamCard 
                 streamer={currentStreamer} 
                 onLike={handleLike}
                 onNext={handleNext}
                 onReportOffline={handleReportOffline}
                 isLiked={userVotes[currentStreamer.id] === 'up'}
               />
            </div>
          ) : (
            <div className="w-full h-96 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-8">
               <Search className="w-16 h-16 text-zinc-700 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">No Streams Found</h3>
               <p className="text-zinc-500 mb-6 max-w-md">We couldn't find any underrated streams for this category right now. Try another category or shuffle again.</p>
               <button 
                  onClick={() => loadStreamers(selectedCategory)}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
               >
                 Try Again
               </button>
            </div>
          )}

          {!loading && currentStreamer && (
             <div className="glass-panel p-4 rounded-xl flex items-start gap-3 border border-violet-500/20 bg-violet-500/5">
                <Info className="text-violet-400 shrink-0 mt-1" size={18} />
                <p className="text-sm text-zinc-300">
                  <span className="font-semibold text-violet-300">How it works:</span> We use AI to search for live channels. Viewer counts are estimates from the search time. 
                  If a stream is offline, please use the "Report Offline" flag to skip it.
                </p>
             </div>
          )}
        </section>

        {/* Sidebar / Leaderboard */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          <Leaderboard streamers={streamers.concat()} votes={totalVotes} />
          
          <div className="glass-panel p-6 rounded-xl border border-zinc-800">
             <h3 className="font-bold text-white mb-2">About StreamGem</h3>
             <p className="text-sm text-zinc-400 leading-relaxed">
               StreamGem helps you break out of the algorithm bubble. 
               We specifically hunt for streams with low viewer counts (~30) but high potential.
               Vote to help others find them too.
             </p>
          </div>
        </aside>

      </main>
    </div>
  );
};

export default App;