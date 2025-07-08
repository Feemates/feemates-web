'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Music, Monitor, Tv, Gamepad2 } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

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
  {
    id: 3,
    name: 'TV Streaming',
    icon: Tv,
    createdDate: 'Jan 15, 2023',
    monthlyCost: 12.99,
    members: 4,
    yourShare: 3.25,
    status: 'Active',
    slotsAvailable: 1,
    type: 'joined',
  },
  {
    id: 4,
    name: 'Gaming Plus',
    icon: Gamepad2,
    createdDate: 'Dec 5, 2022',
    monthlyCost: 9.99,
    members: 2,
    yourShare: 5.0,
    status: 'Active',
    slotsAvailable: 3,
    type: 'joined',
  },
];

export function SubscriptionsList() {
  const handleBackClick = () => {
    window.location.href = '/dashboard';
  };

  const handleSubscriptionClick = (id: number) => {
    window.location.href = `/subscription/${id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Subscriptions</h1>
            <p className="text-sm text-gray-500">{subscriptions.length} active subscriptions</p>
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
          <Input placeholder="Search subscriptions..." className="h-12 bg-white pr-12 pl-10" />
          <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Subscription Cards */}
        <div className="space-y-4">
          {subscriptions.map((subscription) => {
            const IconComponent = subscription.icon;
            return (
              <Card
                key={subscription.id}
                className="cursor-pointer border-0 bg-white shadow-sm transition-shadow hover:shadow-md"
                onClick={() => handleSubscriptionClick(subscription.id)}
              >
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
                      className={`${
                        subscription.type === 'owned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      } hover:bg-current`}
                    >
                      {subscription.type === 'owned' ? 'Owner' : 'Member'}
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
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      {subscription.status}
                    </Badge>
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
