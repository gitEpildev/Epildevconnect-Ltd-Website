import { useState, useEffect, useRef } from 'react';

// Hook for detecting user idle state
export function useIdleDetection(timeout: number = 60000) {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetTimer = () => {
      setIsIdle(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, timeout);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout]);

  return isIdle;
}

// Hook for tracking online/uptime duration
export function useUptime() {
  const [uptime, setUptime] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Date.now() - startTimeRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return { uptime, formatted: formatUptime(uptime) };
}

/**
 * Poll data at an interval with persistent caching.
 *
 * Guarantees:
 * - Once data has loaded, the hook never returns null again (last valid data is
 *   kept in memory and mirrored to sessionStorage to survive remounts).
 * - isLoading is only true before the very first successful load.
 * - isOffline only flips after two consecutive genuine network failures, so a
 *   brief blip does not flash an offline state.
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = 1000,
  enabled: boolean = true,
  persistOnError: boolean = true
) {
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stable per-hook storage key derived from the fetch function and interval,
  // so multiple usePolling instances do not overwrite each other's cache.
  const hookIdRef = useRef<string | null>(null);
  if (!hookIdRef.current) {
    const fnStr = fetchFn.toString();
    let hash = 0;
    for (let i = 0; i < Math.min(fnStr.length, 100); i++) {
      hash = (hash << 5) - hash + fnStr.charCodeAt(i);
      hash = hash & hash;
    }
    hookIdRef.current = `poll_${Math.abs(hash)}_${interval}`;
  }

  const dataStorageKey = `usePolling_data_${hookIdRef.current}`;
  const hasLoadedStorageKey = `usePolling_hasEverLoaded_${hookIdRef.current}`;

  const readCache = (): T | null => {
    try {
      if (sessionStorage.getItem(hasLoadedStorageKey) === 'true') {
        const stored = sessionStorage.getItem(dataStorageKey);
        if (stored) return JSON.parse(stored) as T;
      }
    } catch {
      // sessionStorage unavailable or corrupt entry; treat as no cache
    }
    return null;
  };

  const persistedData = readCache();
  const lastValidDataRef = useRef<T | null>(persistedData);
  const hasEverLoadedRef = useRef(persistedData !== null);

  const [displayData, setDisplayData] = useState<T | null>(persistedData);

  const fetchFnRef = useRef(fetchFn);
  const displayDataRef = useRef<T | null>(persistedData);
  const consecutiveNetworkFailuresRef = useRef(0);
  const offlineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    displayDataRef.current = displayData;
  }, [displayData]);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      if (!hasEverLoadedRef.current) {
        setIsLoading(true);
      }

      try {
        const result = await fetchFnRef.current();

        if (result !== null && result !== undefined) {
          lastValidDataRef.current = result;
          hasEverLoadedRef.current = true;
          try {
            sessionStorage.setItem(hasLoadedStorageKey, 'true');
            sessionStorage.setItem(dataStorageKey, JSON.stringify(result));
          } catch {
            // Cache write failed; in-memory data still works
          }
          setDisplayData(result);
          setError(null);
          consecutiveNetworkFailuresRef.current = 0;
          if (offlineTimeoutRef.current) {
            clearTimeout(offlineTimeoutRef.current);
            offlineTimeoutRef.current = null;
          }
          setIsOffline(false);
          setIsLoading(false);
        } else if (hasEverLoadedRef.current && lastValidDataRef.current && displayDataRef.current == null) {
          // Empty result: keep showing the last valid data
          setDisplayData(lastValidDataRef.current);
        }
      } catch (err) {
        setError(err as Error);

        const errorMsg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
        const isNetworkError =
          errorMsg.includes('network error') ||
          errorMsg.includes('failed to fetch') ||
          errorMsg.includes('timeout') ||
          errorMsg.includes('networkerror') ||
          errorMsg.includes('network request failed') ||
          errorMsg.includes('load failed');

        if (persistOnError && hasEverLoadedRef.current && lastValidDataRef.current) {
          if (isNetworkError) {
            consecutiveNetworkFailuresRef.current += 1;
            if (consecutiveNetworkFailuresRef.current >= 2) {
              setIsOffline(true);
              if (offlineTimeoutRef.current) clearTimeout(offlineTimeoutRef.current);
              offlineTimeoutRef.current = setTimeout(() => {
                setIsOffline(false);
                consecutiveNetworkFailuresRef.current = 0;
              }, 5000);
            }
          } else {
            consecutiveNetworkFailuresRef.current = 0;
            setIsOffline(false);
          }

          if (displayDataRef.current == null) {
            setDisplayData(lastValidDataRef.current);
          }
        } else {
          setIsOffline(true);
        }
      } finally {
        if (hasEverLoadedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    intervalIdRef.current = setInterval(() => {
      fetchData().catch(() => {
        // fetchData handles its own errors; never let the interval die
      });
    }, interval);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
        offlineTimeoutRef.current = null;
      }
    };
  }, [interval, enabled, persistOnError]);

  // Never return null once data has loaded: fall back to in-memory cache, then
  // sessionStorage, in that order.
  let finalData: T | null = displayData ?? lastValidDataRef.current;
  if (finalData == null) {
    const fromStorage = readCache();
    if (fromStorage) {
      finalData = fromStorage;
      lastValidDataRef.current = fromStorage;
      hasEverLoadedRef.current = true;
    }
  }

  const isEmptyObject =
    finalData !== null && typeof finalData === 'object' && Object.keys(finalData).length === 0;
  if (isEmptyObject && lastValidDataRef.current) {
    finalData = lastValidDataRef.current;
  }

  return { data: finalData, error, isLoading, isOffline };
}
