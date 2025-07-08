'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Award,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Lock,
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { getInitials } from '@/lib/helper-functions';
import { useGetDashboard } from '@/api/dashboard-data';

// Mock user data
const userData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 123-4567',
  joinDate: 'March 2023',
  avatar: 'AJ',
  bankAccountStatus: 'pending', // pending, verified, rejected
  memberSince: '8 months',
  totalSavings: 247.5,
  activeSubscriptions: 12,
  trustScore: 4.8,
};

// Mock payout data
const payoutData = {
  totalEarnings: 1247.5,
  pendingPayouts: 89.25,
  lastPayout: {
    amount: 156.75,
    date: 'March 15, 2024',
    status: 'completed',
  },
  monthlyEarnings: 312.4,
  payoutHistory: [
    { id: 1, amount: 156.75, date: 'Mar 15, 2024', status: 'completed', subscriptions: 3 },
    { id: 2, amount: 203.5, date: 'Feb 15, 2024', status: 'completed', subscriptions: 4 },
    { id: 3, amount: 178.25, date: 'Jan 15, 2024', status: 'completed', subscriptions: 3 },
    { id: 4, amount: 145.8, date: 'Dec 15, 2023', status: 'completed', subscriptions: 2 },
  ],
  nextPayoutDate: 'April 15, 2024',
  payoutMethod: 'Bank Account ****1234',
};

export function Profile() {
  const { reset, userDetails } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboard();

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleBankVerification = () => {
    router.push('/kyc-verification');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleSupport = () => {
    router.push('/support');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Clear auth store state
      reset();

      // Clear all localStorage data for complete logout
      localStorage.clear();

      // Clear sessionStorage as well for complete cleanup
      sessionStorage.clear();

      // Small delay to ensure state cleanup
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect to login page
      window.location.href = '/'; // Force reload to clear any cached state
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still redirect to login
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleTermsConditions = () => {
    router.push('/terms-conditions');
  };

  const getBankStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBankStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const bankRedirection = () => {
    if (dashboardData?.kyc && dashboardData.kyc.status === 'pending') {
      return null;
    } else if (dashboardData?.is_kyc_verified === false) {
      handleBankVerification();
    } else if (dashboardData?.is_kyc_verified === true) {
      router.push('/bank-details');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500">Manage your account and preferences</p>
        </div>
      </header>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {/* Profile Header Card */}
        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={userDetails?.avatar || ''}
                    alt={userDetails?.name || 'Profile'}
                    className="object-fit"
                  />
                  <AvatarFallback className="bg-blue-100 text-2xl font-bold text-blue-600">
                    {getInitials(userDetails?.name)}
                  </AvatarFallback>
                </Avatar>
                {/* <button className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                </button> */}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">{userDetails?.name || 'User'}</h2>
                  <Button onClick={handleEditProfile} variant="ghost" size="sm" className="p-1">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mb-1 text-gray-600">{userDetails?.email || 'No email'}</p>
                <p className="text-sm text-gray-500">
                  Member since{' '}
                  {userDetails?.createdAt
                    ? new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>

            {/* Bank Account Status */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">KYC Status</span>
              </div>
              <div className="flex items-center space-x-2">
                {dashboardData?.kyc && dashboardData.kyc.status === 'pending' ? (
                  <Badge variant="secondary" className={getBankStatusColor('pending')}>
                    {getBankStatusIcon('pending')}
                    <span className="ml-1 capitalize">Pending</span>
                  </Badge>
                ) : dashboardData?.is_kyc_verified === false ? (
                  <Button onClick={handleBankVerification} size="sm" variant="outline">
                    Verify
                  </Button>
                ) : dashboardData?.is_kyc_verified === true ? (
                  <Badge variant="secondary" className={getBankStatusColor('verified')}>
                    {getBankStatusIcon('verified')}
                    <span className="ml-1 capitalize">Verified</span>
                  </Badge>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Total Earnings</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="mb-1 text-2xl font-bold text-green-900">
                ${payoutData.totalEarnings.toFixed(2)}
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                All time earnings
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">This Month</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="mb-1 text-2xl font-bold text-blue-900">
                ${payoutData.monthlyEarnings.toFixed(2)}
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                March earnings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Details Card */}
        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-semibold">
              <CreditCard className="mr-2 h-5 w-5" />
              Payout Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pending Payouts */}
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pending Payouts</p>
                  <p className="text-sm text-gray-500">
                    Will be paid on {payoutData.nextPayoutDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-yellow-700">${payoutData.pendingPayouts.toFixed(2)}</p>
                <p className="text-xs text-yellow-600">Processing</p>
              </div>
            </div>

            {/* Last Payout */}
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Last Payout</p>
                  <p className="text-sm text-gray-500">{payoutData.lastPayout.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-700">
                  ${payoutData.lastPayout.amount.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 capitalize">{payoutData.lastPayout.status}</p>
              </div>
            </div>

            {/* Payout Method */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Payout Method</p>
                  <p className="text-sm text-gray-500">{payoutData.payoutMethod}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Payouts</CardTitle>
              <Button variant="ghost" className="p-0 text-blue-600 hover:text-blue-800">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {payoutData.payoutHistory.slice(0, 3).map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">${payout.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {payout.date} • {payout.subscriptions} subscriptions
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {payout.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button
              onClick={handleEditProfile}
              className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">Edit Profile</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={handleChangePassword}
              className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">Change Password</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={bankRedirection}
              className={`flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 ${dashboardData?.kyc && dashboardData.kyc.status === 'pending' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Bank Account</p>
                  {/* <p className="text-sm text-gray-500">Verify your bank account for payments</p> */}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {dashboardData?.kyc && dashboardData.kyc.status === 'pending' ? (
                  <Badge variant="secondary" className={getBankStatusColor('pending')}>
                    {getBankStatusIcon('pending')}
                    <span className="ml-1 capitalize">Pending</span>
                  </Badge>
                ) : dashboardData?.is_kyc_verified === false ? (
                  <Badge variant="secondary" className={getBankStatusColor('rejected')}>
                    Not Verified
                  </Badge>
                ) : dashboardData?.is_kyc_verified === true ? (
                  <Badge variant="secondary" className={getBankStatusColor('verified')}>
                    {getBankStatusIcon('verified')}
                    <span className="ml-1 capitalize">Verified</span>
                  </Badge>
                ) : null}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </button>
          </CardContent>
        </Card>

        {/* More Options */}
        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">More</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button
              onClick={handleSettings}
              className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={handleSupport}
              className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">Help & Support</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={handlePrivacyPolicy}
              className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">Privacy Policy</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={handleTermsConditions}
              className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">Terms & Conditions</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        {/* Achievement Badge */}
        <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900">Trusted Member</h3>
                <p className="text-sm text-purple-700">
                  You&apos;ve been a reliable member for {userData.memberSince}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="mb-6 h-12 w-full border-red-200 text-red-600 hover:bg-red-50"
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[90vw] max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center justify-center text-lg font-semibold">
                <LogOut className="mr-2 h-5 w-5 text-red-600" />
                Confirm Logout
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Are you sure you want to log out of your account? You will need to sign in again to
                access your profile and subscriptions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-600 sm:w-auto"
              >
                {isLoggingOut ? 'Logging out...' : 'Yes, Log Out'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
