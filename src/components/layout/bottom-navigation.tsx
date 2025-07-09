'use client';

import { useState, useEffect } from 'react';
import { Home, List, Plus, Mail, User, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'nextjs-toploader/app';
import { useGetDashboard } from '@/api/dashboard-data';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'home' | 'subscriptions' | 'invites' | 'profile';

export function BottomNavigation() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { data: dashboardData } = useGetDashboard();
  const invitedCount = dashboardData?.invited_subscriptions || 0;

  // Set active tab based on current page
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/subscriptions') || path.includes('/subscription/')) {
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
    // Navigation is now handled by Link components
  };

  return (
    <div className="safe-area-pb fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Home */}
        <Link href="/dashboard">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex min-w-0 flex-col items-center space-y-1 ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Home className={`h-5 w-5 ${activeTab === 'home' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Home</span>
          </button>
        </Link>

        {/* Subscriptions */}
        <Link href="/subscriptions">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex min-w-0 flex-col items-center space-y-1 ${
              activeTab === 'subscriptions' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <List className={`h-5 w-5 ${activeTab === 'subscriptions' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Bundle</span>
          </button>
        </Link>

        {/* Plus Button */}
        <Link href="/select-template">
          <Button
            className="-mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
            size="sm"
          >
            {/* <Image src="/plus-square.svg" alt="+" height={30} width={30} /> */}
            <PlusIcon className="text-white" style={{ width: '25px', height: '25px' }} />
          </Button>
        </Link>

        {/* Invites */}
        <Link href="/invites">
          <button
            onClick={() => setActiveTab('invites')}
            className={`relative flex min-w-0 flex-col items-center space-y-1 ${
              activeTab === 'invites' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <Mail className={`h-5 w-5 ${activeTab === 'invites' ? 'fill-current' : ''}`} />
              {invitedCount > 0 && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
              )}
            </div>
            <span className="text-xs font-medium">Invites</span>
          </button>
        </Link>

        {/* Profile */}
        <Link href="/profile">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex min-w-0 flex-col items-center space-y-1 ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <User className={`h-5 w-5 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
