import { motion, AnimatePresence } from 'framer-motion';
import { Music } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NowPlayingProps {
  data: any;
  isLoading: boolean;
  error: Error | null;
  hideDetails: boolean;
  isOffline?: boolean;
}

export default function NowPlaying({
  data,
  isLoading,
  error,
  hideDetails,
  isOffline = false,
}: NowPlayingProps) {
  // CRITICAL: ALWAYS render panel - never return early
  // Hook guarantees data is never null/undefined once loaded (uses hasEverLoadedRef)
  // Only show loading skeleton on VERY FIRST mount before ANY data has EVER been loaded
  
  const track = data?.recenttracks?.track?.[0] 
    || data?.track?.[0] 
    || data?.data?.recenttracks?.track?.[0]
    || data?.data?.track?.[0]
    || null;
  // DEFENSIVE: Track if we've ever rendered with data (prevents disappearing)
  // Use sessionStorage to persist across React StrictMode remounts
  const storageKey = 'now_playing_rendered';
  const [hasEverRendered, setHasEverRendered] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });
  
  const hasEverLoaded = data !== null && data !== undefined; // Has hook returned anything?
  
  // Update hasEverRendered if we have data prop (don't require track to exist)
  // CRITICAL: Don't require track to exist - data prop existence is enough
  useEffect(() => {
    if (hasEverLoaded && !hasEverRendered) {
      console.log('[NowPlaying] Marking as rendered - data received');
      setHasEverRendered(true);
      try {
        sessionStorage.setItem(storageKey, 'true');
      } catch (e) {
        console.warn('[NowPlaying] Failed to save to sessionStorage:', e);
      }
    }
  }, [hasEverLoaded, hasEverRendered, storageKey]);
  
  // DEBUG: Log component render state
  console.log('[NowPlaying] Render:', {
    data: data !== null && data !== undefined,
    track: !!track,
    hasEverLoaded,
    hasEverRendered,
    isLoading,
    isInitialLoad: !hasEverRendered,
    timestamp: new Date().toISOString()
  });
  
  // CRITICAL: Only show loading if we've NEVER rendered with data before
  // DEFENSIVE: Once we've rendered once, ALWAYS render the panel (even if track is temporarily null)
  if (!hasEverRendered) {
    console.log('[NowPlaying] Showing loading skeleton (no data yet)');
    return (
      <div className="glass rounded-2xl p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // CRITICAL: If we've received data before (even if current fetch failed), ALWAYS render
  // The hook guarantees data exists once loaded, so we should always have something to show
  console.log('[NowPlaying] Rendering with data (hasEverReceivedData=true)');

  // ALWAYS render panel structure - hook guarantees data exists once loaded
  // Use fallbacks for missing track, but panel NEVER disappears
  // Even if offline or no track, show placeholder content - never "No music playing"
  const isNowPlaying = !isOffline && track?.['@attr']?.nowplaying === 'true';

  return (
    <motion.div
      layout
      className={`glass glass-hover rounded-2xl p-6 h-full ${isOffline && !track ? 'opacity-80' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Music className="w-5 h-5 text-quantum-glow" />
        <h3 className="font-mono text-lg font-semibold">
          {isNowPlaying ? 'Now Playing' : 'Last Music Activity'}
        </h3>
        {isNowPlaying && (
          <span className="ml-auto">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {hideDetails ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-500 text-sm text-center py-8"
          >
            Details hidden (idle mode)
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Album Art - ALWAYS show something */}
            {track?.image?.[3]?.['#text'] ? (
              <motion.img
                src={track.image[3]['#text']}
                alt="Album Art"
                className={`w-full aspect-square rounded-xl object-cover ring-2 ring-quantum-glow ring-opacity-20 ${isOffline && !isNowPlaying ? 'opacity-70 grayscale-[30%]' : ''}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                key={track.image[3]['#text']}
              />
            ) : (
              <div className="w-full aspect-square rounded-xl bg-dark-700 ring-2 ring-quantum-glow ring-opacity-20 flex items-center justify-center">
                <Music className="w-16 h-16 text-gray-600 opacity-50" />
              </div>
            )}

            {/* Track Info - ALWAYS show content, even if track is missing */}
            <div>
              <p className={`font-semibold text-lg truncate mb-1 ${isOffline && !isNowPlaying ? 'opacity-80' : ''}`}>
                {track?.name || (isOffline ? 'Last played track: Loading...' : 'Loading music data...')}
              </p>
              <p className={`text-gray-400 text-sm truncate ${isOffline && !isNowPlaying ? 'opacity-70' : ''}`}>
                {track?.artist?.['#text'] || track?.artist || (track ? 'Unknown artist' : 'Fetching artist...')}
              </p>
              {(track?.album?.['#text'] || track?.album) && (
                <p className={`text-gray-500 text-xs truncate mt-1 ${isOffline && !isNowPlaying ? 'opacity-60' : ''}`}>
                  {track.album['#text'] || track.album}
                </p>
              )}
            </div>

            {/* Status Badge - ALWAYS visible */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={isNowPlaying ? 'text-green-400' : 'text-gray-500'}>
                {isNowPlaying ? 'Playing now' : track?.date ? 'Last played track' : (isOffline ? 'Last played track' : 'Loading...')}
              </span>
              {!isNowPlaying && track?.date && (
                <span className="text-gray-600 italic">
                  {(() => {
                    const playDate = new Date(parseInt(track.date.uts) * 1000);
                    const now = new Date();
                    const diffMs = now.getTime() - playDate.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);
                    
                    if (diffMins < 1) return 'just now';
                    if (diffMins < 60) return `${diffMins}m ago`;
                    if (diffHours < 24) return `${diffHours}h ago`;
                    return `${diffDays}d ago`;
                  })()}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


