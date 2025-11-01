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

// Hook for polling data at intervals with persistent caching
// CRITICAL: displayData is NEVER cleared once set - it only updates with new valid data
// Components always render with last known data, never blank/null during fetches
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = 1000,
  enabled: boolean = true,
  persistOnError: boolean = true // Keep last successful data when errors occur
) {
  // Display data will be initialized from sessionStorage if available (see below)
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  // Track loading state separately (only true on very first load)
  const [isLoading, setIsLoading] = useState(true);
  
  // CRITICAL: Generate UNIQUE storage keys per hook instance to prevent collisions
  // Multiple hooks with same interval would otherwise overwrite each other's data
  const hookIdRef = useRef<string | null>(null);
  if (!hookIdRef.current) {
    // Create stable unique ID based on function name/string (but same across remounts)
    // Use the first part of fetchFn.toString() to create a hash
    const fnStr = fetchFn.toString();
    // Create a simple hash from function string
    let hash = 0;
    for (let i = 0; i < Math.min(fnStr.length, 100); i++) {
      const char = fnStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Use interval to differentiate hooks that might have similar functions
    hookIdRef.current = `poll_${Math.abs(hash)}_${interval}`;
  }
  
  const dataStorageKey = `usePolling_data_${hookIdRef.current}`;
  const hasLoadedStorageKey = `usePolling_hasEverLoaded_${hookIdRef.current}`;
  
  const getPersistedData = (): T | null => {
    try {
      const stored = sessionStorage.getItem(dataStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[usePolling] Restored persisted data from sessionStorage');
        return parsed;
      }
    } catch (e) {
      console.warn('[usePolling] Failed to parse persisted data:', e);
    }
    return null;
  };
  
  const persistedData = getPersistedData();
  const lastValidDataRef = useRef<T | null>(persistedData);
  
  // CRITICAL: Use sessionStorage to persist hasEverLoaded across React StrictMode remounts
  // This ensures hook remembers it has loaded data even if component unmounts/remounts
  const getHasEverLoaded = () => {
    try {
      return sessionStorage.getItem(hasLoadedStorageKey) === 'true';
    } catch {
      return false;
    }
  };
  const hasEverLoadedFromStorage = getHasEverLoaded(); // Call the function!
  const hasEverLoadedRef = useRef(hasEverLoadedFromStorage);
  
  // CRITICAL: Initialize displayData from sessionStorage IMMEDIATELY (not in useEffect)
  // This prevents any brief moment where displayData is null
  const [displayData, setDisplayData] = useState<T | null>(() => {
    if (hasEverLoadedFromStorage && persistedData) {
      console.log('[usePolling] Initializing displayData from sessionStorage');
      return persistedData;
    }
    return null;
  });
  
  const fetchFnRef = useRef(fetchFn);
  
  // CRITICAL: Ref to track displayData for async functions (prevents stale closure)
  const displayDataRef = useRef<T | null>(null);
  
  // CRITICAL: Track consecutive network failures to avoid brief interruptions showing offline
  const consecutiveNetworkFailuresRef = useRef(0);
  const offlineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // CRITICAL: Store intervalId in ref to prevent React StrictMode from clearing it
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update displayDataRef whenever displayData changes
  useEffect(() => {
    displayDataRef.current = displayData;
    console.log('[usePolling] displayData changed:', {
      displayData,
      hasEverLoaded: hasEverLoadedRef.current,
      cachedData: lastValidDataRef.current !== null,
      timestamp: new Date().toISOString()
    });
  }, [displayData]);

  // Update fetchFn ref when it changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    console.log('[usePolling] useEffect triggered:', {
      enabled,
      hasEverLoaded: hasEverLoadedRef.current,
      interval,
      fetchFnExists: !!fetchFnRef.current
    });
    
    if (!enabled) {
      console.log('[usePolling] Polling disabled, skipping');
      return;
    }

    const fetchData = async () => {
      console.log('[usePolling] fetchData() called');
      // CRITICAL: Do NOT set isLoading=true during fetches if we already have data
      // This prevents flickering - components always see data during fetches
      // Only show loading on very first mount before any data exists
      if (!hasEverLoadedRef.current) {
        setIsLoading(true);
        console.log('[usePolling] Starting initial fetch');
      } else {
        console.log('[usePolling] Background fetch started (has data):', {
          currentDisplayData: displayDataRef.current !== null,
          cachedData: lastValidDataRef.current !== null,
          hasEverLoaded: hasEverLoadedRef.current
        });
      }
      
      try {
        console.log('[usePolling] About to call fetchFn - fetchFnRef:', !!fetchFnRef.current, 'type:', typeof fetchFnRef.current);
        const result = await fetchFnRef.current();
        console.log('[usePolling] fetchFn completed, result received');
        const anyResult = result as any;
        
               console.log('[usePolling] Fetch result received:', {
                 resultType: typeof result,
                 isNull: result === null,
                 isUndefined: result === undefined,
                 keys: typeof result === 'object' && result !== null ? Object.keys(result).length : 0
               });
        
        // Simplified: Accept any non-null result (errors are caught above by axios)
        // If axios didn't throw, the result is valid data from the API
        const isValidData = result !== null && result !== undefined;
        
        console.log('[usePolling] isValidData check:', {
            isValidData,
            hasEverLoaded: hasEverLoadedRef.current,
            currentDisplayData: displayDataRef.current !== null,
            resultKeys: typeof result === 'object' && result !== null ? Object.keys(result).length : 0
          });
        
        if (isValidData) {
          // CRITICAL: Valid data received - update cache FIRST, then update display
          // displayData is ONLY updated when we have new valid data - never cleared
          console.log('[usePolling] ✅ Valid data received, updating cache and display', {
            hasRecenttracks: !!(result as any)?.recenttracks,
            hasData: !!(result as any)?.data,
            hasSuccess: !!(result as any)?.success,
            keys: Object.keys(result as any || {})
          });
          lastValidDataRef.current = result;
          hasEverLoadedRef.current = true;
          // CRITICAL: Persist hasEverLoaded AND cached data to sessionStorage to survive remounts
          try {
            sessionStorage.setItem(hasLoadedStorageKey, 'true');
            sessionStorage.setItem(dataStorageKey, JSON.stringify(result));
            console.log('[usePolling] Persisted data to sessionStorage');
          } catch (e) {
            console.warn('[usePolling] Failed to save to sessionStorage:', e);
          }
          setDisplayData(result); // Only updates with valid data
          setError(null);
          
          // CRITICAL: Reset failure counter and clear offline immediately when we get valid data
          consecutiveNetworkFailuresRef.current = 0;
          if (offlineTimeoutRef.current) {
            clearTimeout(offlineTimeoutRef.current);
            offlineTimeoutRef.current = null;
          }
          setIsOffline(false); // User is online - got valid data
          setIsLoading(false); // Mark as loaded
        } else {
          // Invalid/empty result - DO NOT update displayData
          // Keep showing last valid data (already in displayData state)
          console.log('[usePolling] Invalid/empty result, keeping cached data');
          if (hasEverLoadedRef.current && lastValidDataRef.current) {
            // CRITICAL: ALWAYS restore cached data if displayData is null/undefined or empty object
            // This prevents components from seeing empty states
            const isEmptyObject = displayDataRef.current !== null && 
                                  displayDataRef.current !== undefined && 
                                  typeof displayDataRef.current === 'object' && 
                                  Object.keys(displayDataRef.current).length === 0;
            
            if (displayDataRef.current === null || 
                displayDataRef.current === undefined || 
                isEmptyObject) {
              console.log('[usePolling] WARNING: displayData is null/undefined/empty but we have cached data - restoring!', {
                isNull: displayDataRef.current === null,
                isUndefined: displayDataRef.current === undefined,
                isEmptyObject
              });
              setDisplayData(lastValidDataRef.current);
            } else {
              console.log('[usePolling] displayData already has cached value, no update needed');
            }
            // CRITICAL: Don't set offline for temporary API issues when we have cached data
            // Invalid/empty responses don't mean user is offline - API might be temporarily down
            // setIsOffline(true); // REMOVED - temporary API issues don't mean offline
          }
        }
      } catch (err) {
        console.error('[usePolling] Fetch error:', {
          error: err instanceof Error ? err.message : String(err),
          hasEverLoaded: hasEverLoadedRef.current,
          hasCachedData: lastValidDataRef.current !== null,
          currentDisplayData: displayDataRef.current !== null
        });
        
        // CRITICAL: On error, DO NOT clear displayData - keep showing last valid data
        setError(err as Error);
        
        // CRITICAL: Only set offline for ACTUAL network failures, not temporary API errors
        // Check if error is a real network error (no connection, timeout, DNS failure)
        const errorMsg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
        const isActualNetworkError = 
          errorMsg.includes('network error') ||
          errorMsg.includes('failed to fetch') ||
          errorMsg.includes('timeout') ||
          errorMsg.includes('networkerror') ||
          errorMsg.includes('network request failed') ||
          errorMsg.includes('load failed');
        
        if (persistOnError && hasEverLoadedRef.current && lastValidDataRef.current) {
          // CRITICAL: Only set offline after MULTIPLE consecutive network failures
          // This prevents brief interruptions (1-2 seconds) from showing offline
          if (isActualNetworkError) {
            consecutiveNetworkFailuresRef.current += 1;
            console.log('[usePolling] Network error detected, consecutive failures:', consecutiveNetworkFailuresRef.current);
            
            // Require 2+ consecutive failures before showing offline (debounce brief interruptions)
            const shouldShowOffline = consecutiveNetworkFailuresRef.current >= 2;
            
            if (shouldShowOffline) {
              console.log('[usePolling] Multiple consecutive network failures, setting offline');
              setIsOffline(true);
              
              // Auto-clear offline after 5 seconds if network recovers (failsafe)
              if (offlineTimeoutRef.current) {
                clearTimeout(offlineTimeoutRef.current);
              }
              offlineTimeoutRef.current = setTimeout(() => {
                console.log('[usePolling] Auto-clearing offline state after timeout (network may have recovered)');
                setIsOffline(false);
                consecutiveNetworkFailuresRef.current = 0;
              }, 5000);
            } else {
              // Not enough failures yet, keep showing cached data without offline label
              console.log('[usePolling] Network error but only', consecutiveNetworkFailuresRef.current, 'failure(s) - not showing offline yet');
              setIsOffline(false);
            }
          } else {
            // Not a network error (API error), reset counter and don't show offline
            consecutiveNetworkFailuresRef.current = 0;
            setIsOffline(false);
          }
          
          // CRITICAL FIX: Use displayDataRef.current instead of displayData (fixes stale closure)
          // Only update displayData if it's somehow null/undefined (shouldn't happen)
          if (displayDataRef.current === null || displayDataRef.current === undefined) {
            console.log('[usePolling] ERROR: displayData is null on error but we have cached data - restoring!');
            setDisplayData(lastValidDataRef.current);
          } else {
            console.log('[usePolling] displayData has cached value, no restore needed on error');
          }
        } else {
          // If no cached data, show offline for any error (first load failed)
          setIsOffline(true);
        }
        
        // Mark as loaded if we have cached data (don't show loading on errors)
        if (hasEverLoadedRef.current) {
          setIsLoading(false);
        }
      } finally {
        // Once we've loaded data once, never show loading again
        if (hasEverLoadedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // CRITICAL: Fetch immediately on mount/enable
    console.log('[usePolling] Calling fetchData() immediately on mount');
    fetchData();
    
    // CRITICAL: Use setInterval with error handling to ensure polling never stops
    console.log('[usePolling] Setting up polling interval:', interval, 'ms');
    
    // CRITICAL: Clear any existing interval first (React StrictMode protection)
    if (intervalIdRef.current) {
      console.log('[usePolling] ⚠️ Clearing existing interval before setting up new one');
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    // Set up new interval and store in ref
    intervalIdRef.current = setInterval(() => {
      // CRITICAL: Don't use async/await in setInterval - it can cause issues
      // Instead, call fetchData and let it handle itself (it's already async)
      console.log('[usePolling] ⏰ Interval triggered, calling fetchData()');
      
      // Wrap in try-catch to ensure interval NEVER stops, even on errors
      try {
        // Call fetchData without await - it handles errors internally
        fetchData().catch((error) => {
          // fetchData's internal error handling already handles this,
          // but add extra safety to ensure interval continues
          console.error('[usePolling] ⚠️ fetchData promise rejected (interval continues):', error);
        });
      } catch (error) {
        // Even if something unexpected happens, keep polling
        console.error('[usePolling] ❌ Unexpected error in interval (continuing anyway):', error);
      }
    }, interval);
    
    console.log('[usePolling] ✅ Interval set up successfully, ID stored in ref');

    return () => {
      console.log('[usePolling] 🧹 Cleanup: clearing interval');
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

  // CRITICAL RETURN LOGIC: Always return displayData (which never clears once set)
  // Components always receive data during fetches - never null/undefined after first load
  // ABSOLUTE GUARANTEE: Once data has loaded, NEVER return null/undefined/empty - ALWAYS return cached data
  let finalData: T | null = null;
  
  // CRITICAL: Check sessionStorage EVERY TIME we return (ultimate fallback)
  // This ensures even if React StrictMode resets state, we always return persisted data
  const checkSessionStorage = () => {
    try {
      if (sessionStorage.getItem(hasLoadedStorageKey) === 'true') {
        const stored = sessionStorage.getItem(dataStorageKey);
        if (stored) {
          return JSON.parse(stored) as T;
        }
      }
    } catch (e) {
      console.warn('[usePolling] Failed to read from sessionStorage in return:', e);
    }
    return null;
  };
  
  // CRITICAL: If we've ever loaded data, we MUST return valid data - never null/undefined
  // Even if displayData is null due to React re-render/remount, use cached data
  if (hasEverLoadedRef.current) {
    // We've had data before - MUST return displayData or cached data (never null, never empty object)
    // displayData should always be set at this point, but use cache as ultimate fallback
    finalData = displayData ?? lastValidDataRef.current;
    
    // CRITICAL: Check if finalData is an empty object - if so, use cached data
    const isEmptyObject = finalData !== null && 
                          finalData !== undefined && 
                          typeof finalData === 'object' && 
                          Object.keys(finalData).length === 0;
    
    if (isEmptyObject && lastValidDataRef.current) {
      console.warn('[usePolling] CRITICAL: finalData is empty object but we have cached data - using cache!');
      finalData = lastValidDataRef.current;
      setDisplayData(lastValidDataRef.current);
    }
    
    // ABSOLUTE SAFETY: If finalData is null/undefined but we have cached data, ALWAYS use cached
    // This is the ultimate fallback - components should NEVER receive null once data has loaded
    if ((finalData === null || finalData === undefined) && lastValidDataRef.current) {
      console.warn('[usePolling] CRITICAL: finalData is null/undefined but hasEverLoaded=true and we have cached data - FORCING cache!');
      finalData = lastValidDataRef.current;
      // CRITICAL: Immediately restore cached data to displayData to prevent this from happening again
      setDisplayData(lastValidDataRef.current);
    }
    
    // ULTIMATE GUARANTEE: If STILL null, check sessionStorage directly
    if ((finalData === null || finalData === undefined)) {
      const fromStorage = checkSessionStorage();
      if (fromStorage) {
        console.warn('[usePolling] ULTIMATE FALLBACK: Using sessionStorage data directly!');
        finalData = fromStorage;
        lastValidDataRef.current = fromStorage;
        setDisplayData(fromStorage);
      } else if (lastValidDataRef.current) {
        console.error('[usePolling] FATAL: finalData is STILL null after ALL checks including sessionStorage!');
        finalData = lastValidDataRef.current;
      }
    }
    
    console.log('[usePolling] Returning data (hasEverLoaded=true):', {
      finalData: finalData !== null && finalData !== undefined,
      displayData: displayData !== null && displayData !== undefined,
      cachedData: lastValidDataRef.current !== null && lastValidDataRef.current !== undefined,
      fromSessionStorage: checkSessionStorage() !== null
    });
  } else {
    // First load - check sessionStorage first, then displayData
    const fromStorage = checkSessionStorage();
    if (fromStorage) {
      console.log('[usePolling] First load but found persisted data in sessionStorage - using it!');
      finalData = fromStorage;
      hasEverLoadedRef.current = true;
      lastValidDataRef.current = fromStorage;
      setDisplayData(fromStorage);
    } else {
      finalData = displayData;
    }
    console.log('[usePolling] Returning data (first load):', {
      finalData: finalData !== null,
      fromStorage: fromStorage !== null,
      isLoading
    });
  }

  return { data: finalData, error, isLoading, isOffline };
}


