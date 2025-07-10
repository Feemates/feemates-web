'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Register PWA service worker
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('PWA Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('PWA Service Worker registration failed:', error);
          });

        // Register Engagespot service worker with different scope
        navigator.serviceWorker
          .register('/service-worker.js', { scope: '/engagespot/' })
          .then((registration) => {
            console.log('Engagespot Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Engagespot Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null; // This component does not render anything
}
