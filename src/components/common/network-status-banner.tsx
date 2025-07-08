'use client';
import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NetworkStatusBanner() {
  const { isOnline, isOffline } = useNetworkStatus();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (isOffline && !wasOffline) {
      // Just went offline
      setShowOfflineBanner(true);
      setWasOffline(true);
      setShowReconnectedBanner(false);
    } else if (isOnline && wasOffline) {
      // Just reconnected
      setShowOfflineBanner(false);
      setShowReconnectedBanner(true);
      setWasOffline(false);

      // Auto-hide reconnected banner after 3 seconds
      setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 3000);
    }
  }, [isOnline, isOffline, wasOffline]);

  const handleDismissOffline = () => {
    setShowOfflineBanner(false);
  };

  const handleDismissReconnected = () => {
    setShowReconnectedBanner(false);
  };

  if (showOfflineBanner) {
    return (
      <div className="fixed top-0 right-0 left-0 z-50 bg-red-600 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">You're offline</span>
            <span className="text-red-100">Check your internet connection</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissOffline}
            className="text-white hover:bg-red-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (showReconnectedBanner) {
    return (
      <div className="fixed top-0 right-0 left-0 z-50 bg-green-600 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            <span className="font-medium">You're back online</span>
            <span className="text-green-100">Connection restored</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissReconnected}
            className="text-white hover:bg-green-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
