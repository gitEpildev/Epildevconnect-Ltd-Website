import { motion } from 'framer-motion';
import { Code2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WakaTimeStatsProps {
  data: any;
  isLoading: boolean;
  error: Error | null;
  isOffline?: boolean;
}

export default function WakaTimeStats({
  data,
  isLoading,
  error,
  isOffline = false,
}: WakaTimeStatsProps) {
  // CRITICAL: ALWAYS render panel - never return early
  // Hook guarantees data is never null/undefined once loaded (uses hasEverLoadedRef)
  // Only show loading skeleton on VERY FIRST mount before ANY data has EVER been loaded
  
  // Check data at ALL possible nested levels - cached data might be in different format
  const stats = data?.data || data?.stats || data || null;
  // DEFENSIVE: Track if we've ever rendered with data (prevents disappearing)
  // Use sessionStorage to persist across React StrictMode remounts
  const storageKey = 'wakatime_stats_rendered';
  const [hasEverRendered, setHasEverRendered] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });
  
  const hasEverLoaded = data !== null && data !== undefined; // Has hook returned anything?
  
  // Update hasEverRendered if we have data prop (don't require stats to exist)
  // CRITICAL: Don't require stats to exist - data prop existence is enough
  useEffect(() => {
    if (hasEverLoaded && !hasEverRendered) {
      console.log('[WakaTimeStats] Marking as rendered - data received');
      setHasEverRendered(true);
      try {
        sessionStorage.setItem(storageKey, 'true');
      } catch (e) {
        console.warn('[WakaTimeStats] Failed to save to sessionStorage:', e);
      }
    }
  }, [hasEverLoaded, hasEverRendered, storageKey]);
  
  // DEBUG: Log component render state
  console.log('[WakaTimeStats] Render:', {
    data: data !== null && data !== undefined,
    stats: !!stats,
    hasEverLoaded,
    hasEverRendered,
    isLoading,
    isInitialLoad: !hasEverRendered,
    timestamp: new Date().toISOString()
  });
  
  // CRITICAL: Only show loading if we've NEVER rendered with data before
  // DEFENSIVE: Once we've rendered once, ALWAYS render the panel (even if stats is temporarily null)
  if (!hasEverRendered) {
    console.log('[WakaTimeStats] Showing loading skeleton (no data yet)');
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
  console.log('[WakaTimeStats] Rendering with data (hasEverReceivedData=true)');

  // ALWAYS render panel structure - hook guarantees data exists once loaded
  // Use fallbacks for missing stats, but panel NEVER disappears
  // Extract stats from whatever structure exists - handle all possible formats
  const topLanguages = stats?.languages?.slice(0, 5) 
    || stats?.data?.languages?.slice(0, 5) 
    || data?.languages?.slice(0, 5)
    || [];
  
  const totalTime = stats?.human_readable_total 
    || stats?.data?.human_readable_total 
    || data?.human_readable_total
    || '0 hrs 0 mins';

  return (
    <motion.div
      layout
      className={`glass glass-hover rounded-2xl p-6 h-full ${isOffline ? 'opacity-90' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Code2 className={`w-5 h-5 ${isOffline ? 'text-gray-500' : 'text-quantum-glow'}`} />
        <h3 className={`font-mono text-lg font-semibold ${isOffline ? 'opacity-70' : ''}`}>
          {isOffline ? 'Last Active Session' : 'Current Coding Activity'}
        </h3>
        {isOffline && stats?.best_day?.date && (
          <span className="ml-auto text-xs text-gray-500 font-mono italic">
            Last updated {new Date(stats.best_day.date).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Total Time - always show, use fallback if stats missing */}
        <motion.div 
          className={`bg-quantum-glow bg-opacity-10 rounded-xl p-4 border border-quantum-glow border-opacity-20 ${isOffline ? 'opacity-80' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${isOffline ? 'text-gray-500' : 'text-quantum-glow'}`} />
            <span className={`text-xs font-mono ${isOffline ? 'text-gray-500' : 'text-quantum-glow'}`}>Last 7 Days</span>
          </div>
          <p className="text-2xl font-mono font-bold">{totalTime}</p>
        </motion.div>

        {/* Top Languages - always show section, even if empty */}
          <div>
            <p className="text-xs font-mono text-gray-400 mb-3">TOP LANGUAGES</p>
          {topLanguages.length > 0 ? (
            <div className="space-y-2">
              {topLanguages.map((lang: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-mono">{lang.name}</span>
                    <span className="text-gray-400 text-xs">{lang.text}</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lang.percent}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-quantum-glow to-quantum-500"
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-mono">No language data available</p>
          )}
          </div>

        {/* Best Day - always show if available */}
        {stats?.best_day && (
          <div className="text-xs">
            <p className="text-gray-400 mb-1">Best Day</p>
            <p className="font-mono">
              {new Date(stats.best_day.date).toLocaleDateString()} -{' '}
              <span className="text-quantum-glow">{stats.best_day.text}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}


