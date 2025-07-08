'use client';

import { useState, useEffect } from 'react';
import { Home, List, Plus, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'nextjs-toploader/app';

type TabType = 'home' | 'subscriptions' | 'invites' | 'profile';

export function BottomNavigation() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Set active tab based on current page
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/subscriptions')) {
      setActiveTab('subscriptions');
    } else if (path.includes('/invites')) {
      setActiveTab('invites');
    } else if (path.includes('/profile')) {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  }, []);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    // Add navigation logic here
    switch (tab) {
      case 'home':
        router.push('/dashboard');
        break;
      case 'subscriptions':
        router.push('/subscriptions');
        break;
      case 'invites':
        router.push('/invites');
        break;
      case 'profile':
        router.push('/profile');
        break;
    }
  };

  const handlePlusClick = () => {
    router.push('/create-subscription');
  };

  return (
    <div className="safe-area-pb fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex min-w-0 flex-col items-center space-y-1 ${
            activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <Home className={`h-5 w-5 ${activeTab === 'home' ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Subscriptions */}
        <button
          onClick={() => handleTabClick('subscriptions')}
          className={`flex min-w-0 flex-col items-center space-y-1 ${
            activeTab === 'subscriptions' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <List className={`h-5 w-5 ${activeTab === 'subscriptions' ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Subscriptions</span>
        </button>

        {/* Plus Button */}
        <Button
          onClick={handlePlusClick}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
          size="sm"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>

        {/* Invites */}
        <button
          onClick={() => handleTabClick('invites')}
          className={`relative flex min-w-0 flex-col items-center space-y-1 ${
            activeTab === 'invites' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <Mail className={`h-5 w-5 ${activeTab === 'invites' ? 'fill-current' : ''}`} />
            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
          </div>
          <span className="text-xs font-medium">Invites</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex min-w-0 flex-col items-center space-y-1 ${
            activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <User className={`h-5 w-5 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
