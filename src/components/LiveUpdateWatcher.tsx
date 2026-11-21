'use client';

import { useEffect, useRef } from 'react';

/**
 * LiveUpdateWatcher
 * Checks for live OTA updates from Vercel whenever app loads or resumes.
 * Unregisters stale Service Workers and reloads if a new version is detected.
 */
export default function LiveUpdateWatcher() {
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Unregister any lingering legacy Service Workers & clear old caches
    const purgeStaleCacheAndWorkers = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
            console.log('[LiveUpdate] Unregistered legacy Service Worker:', reg.scope);
          }
        }
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          for (const key of cacheKeys) {
            await caches.delete(key);
            console.log('[LiveUpdate] Cleared legacy cache:', key);
          }
        }
      } catch (err) {
        console.warn('[LiveUpdate] Cache/SW purge warning:', err);
      }
    };

    // 2. Check remote version against local version
    const checkLiveVersion = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        // Loop safety guard: Never reload more than once per 30 seconds
        const lastReload = Number(sessionStorage.getItem('rythemx_last_reload') || '0');
        const now = Date.now();
        if (now - lastReload < 30000) {
          isCheckingRef.current = false;
          return;
        }

        const res = await fetch(`/version.json?t=${now}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache'
          }
        });

        if (!res.ok) {
          isCheckingRef.current = false;
          return;
        }

        const data = await res.json();
        const remoteVersion = data?.version;
        if (!remoteVersion) {
          isCheckingRef.current = false;
          return;
        }

        const localVersion = localStorage.getItem('rythemx_app_version');

        if (!localVersion) {
          // First run on device: store current remote version
          localStorage.setItem('rythemx_app_version', remoteVersion);
          console.log('[LiveUpdate] Initialized app version to:', remoteVersion);
        } else if (localVersion !== remoteVersion) {
          console.log(`[LiveUpdate] OTA Update detected! Old: ${localVersion} -> New: ${remoteVersion}`);
          localStorage.setItem('rythemx_app_version', remoteVersion);
          sessionStorage.setItem('rythemx_last_reload', String(now));

          // Purge stale caches before reloading
          await purgeStaleCacheAndWorkers();

          // Smooth reload to apply live Vercel updates immediately
          window.location.reload();
          return;
        }
      } catch (err) {
        // Offline or network error: continue gracefully
        console.warn('[LiveUpdate] Version check warning:', err);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Initial check on mount
    purgeStaleCacheAndWorkers().then(() => {
      checkLiveVersion();
    });

    // Check again when user brings app back from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLiveVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkLiveVersion);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkLiveVersion);
    };
  }, []);

  return null;
}
