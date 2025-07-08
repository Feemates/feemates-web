'use client';

import { useGetSubscriptionsList } from '@/app/modules/subscriptions/api/useGetSubscriptionsList';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EngagespotNotification } from '@/lib/engagespot-notification';
import { useAuthStore } from '@/store/auth-store';
import { AlertTriangle, Briefcase, User, Users, X } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { JoinedTab } from './joined-tab';
import { OwnedTab } from './owned-tab';
import { useGetDashboard } from '@/api/dashboard-data';

export function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showKycBanner, setShowKycBanner] = useState(false);
  const [kycPendingBanner, setKycPendingBanner] = useState(false);
  const [tab, setTab] = useState<'owned' | 'joined'>('owned');

  // Dashboard counts
  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboard();
  const dashboardCounts = {
    owned_subscriptions: dashboardData?.owned_subscriptions ?? 0,
    member_subscriptions: dashboardData?.member_subscriptions ?? 0,
    invited_subscriptions: dashboardData?.invited_subscriptions ?? 0,
  };

  // Get user details from auth store
  const { userDetails } = useAuthStore();

  useEffect(() => {
    if (dashboardData && dashboardData?.kyc && dashboardData?.kyc.status === 'pending') {
      setKycPendingBanner(true);
      setShowKycBanner(false);
    } else if (dashboardData && dashboardData?.is_kyc_verified) {
      setShowKycBanner(false);
      setKycPendingBanner(false);
    } else if (dashboardData && !dashboardData?.is_kyc_verified) {
      setShowKycBanner(true);
      setKycPendingBanner(false);
    }
  }, [dashboardData]);

  // (Owned/joined subscriptions logic removed; now handled in tab components)
  const ownedCount = dashboardCounts.owned_subscriptions;
  const joinedCount = dashboardCounts.member_subscriptions;

  const handleKycVerification = () => {
    router.push('/kyc-verification');
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
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <User className="h-6 w-6 text-gray-600" />
            </div> */}
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {/* Bank Account Verification Banner */}
        {showKycBanner && (
          <Card className="relative mb-6 border-orange-200 bg-orange-50 py-0">
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-medium text-orange-900">Verification Pending</h3>
                    <p className="mb-3 text-sm text-orange-800">
                      Verify your bank account to create bundles and enable secure payments and
                      withdrawals
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                <div className="absolute top-1 right-0">
                  <Button
                    onClick={dismissKycBanner}
                    variant="ghost"
                    size="sm"
                    className="h-auto shrink-0 p-1 text-orange-600 hover:bg-orange-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kycPendingBanner && (
          <Card className="relative mb-6 border-yellow-200 bg-yellow-50 py-0">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium text-yellow-900">Approval Pending</h3>
                    <p className="text-sm text-yellow-800">KYC details pending approval.</p>
                  </div>
                </div>
                <div className="absolute top-1 right-0">
                  <Button
                    onClick={() => setKycPendingBanner(false)}
                    variant="ghost"
                    size="sm"
                    className="h-auto shrink-0 p-1 text-yellow-600 hover:bg-yellow-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-bold text-gray-900">
            Hello, {userDetails?.name || 'User'}!
          </h2>
          <p className="text-gray-600">Manage your bundle fees and sharing</p>
        </div>

        {/* Search Bar */}
        {/* <div className="relative mb-6">
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
        </div> */}

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <Card className="border-0 bg-white py-3 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                    Owned
                  </span>
                  <span className="text-3xl font-bold text-blue-600 transition-colors duration-200">
                    {ownedCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white py-3 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                    Joined
                  </span>
                  <span className="text-3xl font-bold text-purple-600 transition-colors duration-200">
                    {joinedCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Subscriptions Section */}
        <div className="mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">My Bundles</h3>
            <Button
              variant="ghost"
              className="p-0 text-blue-600 hover:text-blue-800"
              onClick={() => router.push('/subscriptions')}
            >
              See All
            </Button>
          </div>

          {/* Shadcn Tabs */}
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'owned' | 'joined')}
            className="flex flex-col gap-2"
          >
            <TabsList className="mb-4 flex h-10 w-full space-x-1 rounded-lg bg-gray-100 p-1">
              <TabsTrigger
                value="owned"
                className="flex-1 rounded-md px-3 py-4 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Owned ({ownedCount})
              </TabsTrigger>
              <TabsTrigger
                value="joined"
                className="flex-1 rounded-md px-3 py-4 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Joined ({joinedCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="owned">
              <OwnedTab />
            </TabsContent>
            <TabsContent value="joined">
              <JoinedTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
