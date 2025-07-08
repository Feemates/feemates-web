'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Bell,
  Briefcase,
  Users,
  Music,
  Monitor,
  TrendingUp,
  User,
  AlertTriangle,
  X,
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useAuthStore } from '@/store/auth-store';
import { EngagespotNotification } from '@/lib/engagespot-notification';

// Mock data for subscriptions
const subscriptions = [
  {
    id: 1,
    name: 'Music Premium',
    icon: Music,
    createdDate: 'Mar 10, 2023',
    monthlyCost: 14.99,
    members: 3,
    yourShare: 5.0,
    status: 'Active',
    slotsAvailable: 2,
    type: 'owned',
  },
  {
    id: 2,
    name: 'Streaming Plus',
    icon: Monitor,
    createdDate: 'Feb 20, 2023',
    monthlyCost: 19.99,
    members: 5,
    yourShare: 4.0,
    status: 'Active',
    slotsAvailable: 0,
    type: 'owned',
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'owned' | 'joined'>('owned');
  const [searchQuery, setSearchQuery] = useState('');
  const [showKycBanner, setShowKycBanner] = useState(true);

  // Get user details from auth store
  const { userDetails } = useAuthStore();

  const ownedCount = 8;
  const joinedCount = 12;

  const handleKycVerification = () => {
    // Navigate to KYC verification page
    window.location.href = '/kyc-verification';
  };

  const dismissKycBanner = () => {
    setShowKycBanner(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Feemates</h1>
          </div>
          <div className="flex items-center space-x-3">
            {userDetails?.email && <EngagespotNotification userId={userDetails?.email} />}
            {/* <div className="relative">
              <Bell className="h-6 w-6 text-gray-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></div>
            </div> */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <User className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {/* Bank Account Verification Banner */}
        {showKycBanner && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-medium text-orange-900">
                      Bank Account Verification Pending
                    </h3>
                    <p className="mb-3 text-sm text-orange-800">
                      Verify your bank account to enable secure payments and withdrawals. This helps
                      us process your subscription payments safely.
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleKycVerification}
                        size="sm"
                        className="bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Verify Bank Account
                      </Button>
                      <Button
                        onClick={dismissKycBanner}
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-700"
                      >
                        Later
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={dismissKycBanner}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-orange-600 hover:bg-orange-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-bold text-gray-900">
            Hello, {userDetails?.name || 'User'}!
          </h2>
          <p className="text-gray-600">Manage your subscription fees and sharing</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 bg-white pr-12 pl-10"
          />
          <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Owned</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="mb-1 text-2xl font-bold text-gray-900">{ownedCount}</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                12% this month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Joined</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="mb-1 text-2xl font-bold text-gray-900">{joinedCount}</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                5% this month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Subscriptions Section */}
        <div className="mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">My Subscriptions</h3>
            <Button variant="ghost" className="p-0 text-blue-600 hover:text-blue-800">
              See All
            </Button>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('owned')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'owned'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Owned ({ownedCount})
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'joined'
                  ? 'bg-white text-gray-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Joined ({joinedCount})
            </button>
          </div>
        </div>

        {/* Subscription Cards */}
        <div className="space-y-4">
          {subscriptions.map((subscription) => {
            const IconComponent = subscription.icon;
            return (
              <Card key={subscription.id} className="border-0 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                        <p className="text-sm text-gray-500">
                          Created on {subscription.createdDate}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      {subscription.status}
                    </Badge>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Monthly cost</p>
                      <p className="font-semibold text-gray-900">${subscription.monthlyCost}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Members</p>
                      <p className="font-semibold text-gray-900">{subscription.members}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Your share</p>
                      <p className="font-semibold text-green-600">
                        ${subscription.yourShare.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {subscription.slotsAvailable > 0
                        ? `${subscription.slotsAvailable} slots available`
                        : 'Bundle full'}
                    </p>
                    <Button variant="ghost" className="p-0 text-blue-600 hover:text-blue-800">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
