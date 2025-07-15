'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Tv, Gamepad2, Users, DollarSign, Loader2, X } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useRouter } from 'nextjs-toploader/app';

import { useInviteList } from '../api/useInviteList';
import { useDeclineInvite } from '../api/useDeclineInvite';
import { useJoinInvite } from '../api/useJoinInvite';
import { useState, useEffect } from 'react';

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
import Image from 'next/image';
import { useInvitationView } from '../api/useInvitationView';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useInvitationAccept } from '../api/useInvitationAccept';
import { truncateToTwoDecimals } from '@/lib/helper-functions';

export function SubscriptionInvitationModule({ id }: { id: string }) {
  const router = useRouter();
  const searchParam = useSearchParams();
  const token = searchParam.get('token');
  const queryClient = useQueryClient();
  const { data: inviteData, isLoading, isError } = useInvitationView(Number(id), token);

  const invite = inviteData?.data;

  useEffect(() => {
    router.prefetch('/dashboard'); // Preload dashboard page
  }, [router]);

  // Decline dialog state and mutation
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState<number | null>(null);

  const declineMutation = useDeclineInvite(() => {
    router.replace('/dashboard');
  });

  const joinInviteMutation = useInvitationAccept();

  const handleJoinSubscription = (inviteId: number, subscriptionId: number) => {
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment-success?subscription_id=${subscriptionId}`;
    const cancelUrl = `${baseUrl}/payment-failed`;
    joinInviteMutation.mutate({ inviteId, baseUrl, successUrl, cancelUrl, subscriptionId });
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-red-500">Failed to load invitation. Please try again.</div>
        </div>
      );
    }

    if (!invite) {
      return (
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-8 text-center">
            {/* <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <X className="h-10 w-10 text-red-600" />
            </div> */}
            {/* <h3 className="mb-2 text-lg font-semibold text-gray-900">N</h3> */}
            <p className="text-secondary-text text-lg">
              {inviteData?.message ||
                'No invitation found. Please check your link or try again later.'}
            </p>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <div className="space-y-4">
          <Card key={invite.id} className="border-0 bg-white py-0 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div> */}
                  <div>
                    <h4 className="font-semibold text-gray-900">{invite.name}</h4>
                    <p className="text-secondary-text line-clamp-2 overflow-hidden text-sm break-all">
                      Invited by {invite.owner.name}
                    </p>
                    <p className="text-secondary-text text-xs">
                      {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
                {(() => {
                  // Check for cancelled invite status first
                  if (invite.status === 'cancelled') {
                    return (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Cancelled
                      </Badge>
                    );
                  }

                  if (invite.status === 'expired') {
                    return (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Expired
                      </Badge>
                    );
                  }

                  // Check member status
                  const memberStatus = invite?.member?.status;

                  if (memberStatus === 'invited') {
                    return (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Invited
                      </Badge>
                    );
                  }

                  if (memberStatus === 'declined') {
                    return (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Declined
                      </Badge>
                    );
                  }

                  if (memberStatus === 'active') {
                    return (
                      <Badge variant="secondary" className="bg-blue-100 text-green-800">
                        Active
                      </Badge>
                    );
                  }

                  // If member exists but has other status
                  if (invite.member && memberStatus) {
                    return (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {memberStatus.charAt(0).toUpperCase() + memberStatus.slice(1)}
                      </Badge>
                    );
                  }

                  // Default case - no member (treat as invited)
                  return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Invited
                    </Badge>
                  );
                })()}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-secondary-text text-sm">Your share</p>
                    <p className="font-semibold text-green-600">
                      ${truncateToTwoDecimals(invite?.per_person_price)}/ month
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-secondary-text text-sm">Members</p>
                    <p className="text-primary-text font-semibold">
                      {invite.members_count}/{invite.max_no_of_participants}
                    </p>
                  </div>
                </div>
              </div>

              {(() => {
                // Check for cancelled status first
                if (invite.status === 'cancelled') {
                  return (
                    <div className="mb-4 rounded bg-red-50 p-3 text-center text-sm text-red-800">
                      This bundle has been cancelled and is no longer available.
                    </div>
                  );
                }

                // Check for expired status
                if (invite.status === 'expired') {
                  return (
                    <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-center text-sm text-yellow-800">
                      This subscription has expired. Please contact the inviter for more
                      information.
                    </div>
                  );
                }

                // Check if user is already an active member
                if (invite?.member?.status === 'active') {
                  return (
                    <div className="mb-4 rounded bg-green-50 p-3 text-center text-sm text-green-800">
                      You are already a member of this bundle.
                    </div>
                  );
                }

                // Check if user has declined the invitation
                if (invite?.member?.status === 'declined') {
                  return (
                    <div className="mb-4 rounded bg-red-50 p-3 text-center text-sm text-red-800">
                      You have declined this invitation. You cannot join this bundle.
                    </div>
                  );
                }

                // Check if bundle is full
                if (invite.max_no_of_participants - invite.members_count <= 0) {
                  return (
                    <div className="mt-4 rounded bg-gray-100 p-3 text-center text-sm text-gray-600">
                      This bundle has reached the maximum number of participants. You cannot join
                      this bundle.
                    </div>
                  );
                }

                // Show join buttons for invited users with available slots
                if (invite?.member?.status === 'invited') {
                  return (
                    <div className="mt-4 flex space-x-3">
                      <Button
                        onClick={() =>
                          handleJoinSubscription(invite.subscription_invite_id, invite.id)
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Join & Pay
                      </Button>
                      <Button
                        onClick={() => handleDeclineInvite(invite.subscription_invite_id)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                    </div>
                  );
                }

                // Show join button for non-members with available slots
                if (!invite.member) {
                  return (
                    <div className="mt-4 flex space-x-3">
                      <Button
                        onClick={() =>
                          handleJoinSubscription(invite.subscription_invite_id, invite.id)
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Join & Pay
                      </Button>
                    </div>
                  );
                }

                // Default case - return nothing
                return null;
              })()}
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Invitations</h1>
            {/* <p className="text-secondary-text text-sm">{invites.length} invitations</p> */}
          </div>
        </div>
      </header>

      {/* Main Content  */}
      <main className="px-4 py-6 pb-24">{renderContent()}</main>

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
