'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Tv, Gamepad2, Users, DollarSign } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

// Mock invites data
const invites = [
  {
    id: 1,
    subscriptionName: 'Music Premium',
    icon: Music,
    inviterName: 'Sarah Wilson',
    inviterAvatar: 'SW',
    monthlyShare: 3.75,
    totalMembers: 4,
    maxMembers: 5,
    inviteDate: '2 days ago',
    status: 'pending',
  },
  {
    id: 2,
    subscriptionName: 'Gaming Plus',
    icon: Gamepad2,
    inviterName: 'Mike Chen',
    inviterAvatar: 'MC',
    monthlyShare: 2.5,
    totalMembers: 3,
    maxMembers: 4,
    inviteDate: '1 week ago',
    status: 'pending',
  },
  {
    id: 3,
    subscriptionName: 'Streaming TV',
    icon: Tv,
    inviterName: 'Emma Davis',
    inviterAvatar: 'ED',
    monthlyShare: 4.0,
    totalMembers: 2,
    maxMembers: 6,
    inviteDate: '3 days ago',
    status: 'pending',
  },
];

export function InvitesList() {
  const handleBackClick = () => {
    window.location.href = '/dashboard';
  };

  const handleJoinSubscription = (inviteId: number) => {
    console.log('Joining subscription:', inviteId);
    alert('Successfully joined the subscription!');
  };

  const handleDeclineInvite = (inviteId: number) => {
    console.log('Declining invite:', inviteId);
    alert('Invitation declined');
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
            <h1 className="text-xl font-bold text-gray-900">Invitations</h1>
            <p className="text-sm text-gray-500">{invites.length} pending invitations</p>
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {invites.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No invitations yet</h3>
              <p className="text-gray-600">
                When someone invites you to join their subscription, it will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => {
              const IconComponent = invite.icon;
              return (
                <Card key={invite.id} className="border-0 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{invite.subscriptionName}</h4>
                          <p className="text-sm text-gray-500">Invited by {invite.inviterName}</p>
                          <p className="text-xs text-gray-400">{invite.inviteDate}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Your share</p>
                          <p className="font-semibold text-green-600">
                            ${invite.monthlyShare}/month
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Members</p>
                          <p className="font-semibold text-gray-900">
                            {invite.totalMembers}/{invite.maxMembers}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                          <span className="text-xs font-medium text-gray-600">
                            {invite.inviterAvatar}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{invite.inviterName}</span>
                      </div>
                      <span className="text-sm text-gray-400">wants you to join</span>
                    </div>

                    <div className="mt-4 flex space-x-3">
                      <Button
                        onClick={() => handleJoinSubscription(invite.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Join & Pay
                      </Button>
                      <Button
                        onClick={() => handleDeclineInvite(invite.id)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
