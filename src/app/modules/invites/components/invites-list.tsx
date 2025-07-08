'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Tv, Gamepad2, Users, DollarSign } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useRouter } from 'nextjs-toploader/app';

import { useInviteList } from '../api/useInviteList';
import { useDeclineInvite } from '../api/useDeclineInvite';
import { useJoinInvite } from '../api/useJoinInvite';
import { useRef, useCallback, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

const iconMap: Record<string, any> = {
  Music,
  Tv,
  Gamepad2,
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function InvitesList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInviteList();
  const invites = data?.pages?.flatMap((page) => page.data) || [];

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Fetch next page when inView changes to true
  useCallback(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])();

  // Decline dialog state and mutation
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState<number | null>(null);

  const declineMutation = useDeclineInvite(() => {
    queryClient.invalidateQueries({ queryKey: ['invite-list'] });
    router.push('/dashboard');
  });

  const handleBackClick = () => {
    router.push('/dashboard');
  };

  const joinInviteMutation = useJoinInvite(() => {
    queryClient.invalidateQueries({ queryKey: ['invite-list'] });
  });

  const handleJoinSubscription = (inviteId: number, subscriptionId: number) => {
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment-success?subscription_id=${subscriptionId}`;
    const cancelUrl = `${baseUrl}/payment-failed`;
    joinInviteMutation.mutate({ inviteId, baseUrl, successUrl, cancelUrl });
  };

  const handleDeclineInvite = (inviteId: number) => {
    setSelectedInviteId(inviteId);
    setDeclineDialogOpen(true);
  };

  const handleConfirmDecline = () => {
    if (selectedInviteId) {
      declineMutation.mutate(selectedInviteId);
    }
    setDeclineDialogOpen(false);
    setSelectedInviteId(null);
  };

  const handleCancelDecline = () => {
    setDeclineDialogOpen(false);
    setSelectedInviteId(null);
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
            <p className="text-sm text-gray-500">{invites.length} invitations</p>
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : isError ? (
          <div className="text-center text-red-500">Failed to load invites.</div>
        ) : invites.length === 0 ? (
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
              return (
                <Card key={invite.id} className="border-0 bg-white py-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div> */}
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {invite.subscription_name}
                          </h4>
                          <p className="text-sm text-gray-500">Invited by {invite.owner_name}</p>
                          <p className="text-xs text-gray-400">
                            {invite.createdAt
                              ? new Date(invite.createdAt).toLocaleDateString()
                              : ''}
                          </p>
                        </div>
                      </div>
                      {invite.status === 'invited' ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Invited
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Your share</p>
                          <p className="font-semibold text-green-600">
                            ${Number(invite?.price).toFixed(2)}/ month
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Members</p>
                          <p className="font-semibold text-gray-900">
                            {invite.members_count}/{invite.max_members_count}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                          <span className="text-xs font-medium text-gray-600">
                            {getInitials(invite.owner_name)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{invite.owner_name}</span>
                      </div>
                      <span className="text-sm text-gray-400">wants you to join</span>
                    </div> */}

                    {invite.status === 'expired' ? (
                      <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-center text-sm text-yellow-800">
                        This subscription has expired. You cannot join or decline this invitation.
                      </div>
                    ) : invite.max_members_count - invite.members_count > 0 ? (
                      <div className="mt-4 flex space-x-3">
                        <Button
                          onClick={() => handleJoinSubscription(invite.id, invite.subscription_id)}
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
                    ) : (
                      <div className="mt-4 rounded bg-gray-100 p-3 text-center text-sm text-gray-600">
                        This subscription has reached the maximum number of participants. You cannot
                        join this bundle.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {/* Intersection observer trigger for pagination */}
            <div ref={ref} />
            {isFetchingNextPage && (
              <div className="py-2 text-center text-gray-400">Loading more...</div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
      {/* Decline Confirmation AlertDialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to decline this invitation?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDecline}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmDecline}
              disabled={status === 'pending'}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
