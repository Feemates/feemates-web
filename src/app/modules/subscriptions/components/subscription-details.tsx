'use client';

import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  LogOut,
  Loader2,
  MoreVertical,
  Plus,
  Send,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useRef, useState } from 'react';
import { useGetSubscription } from '../api/useGetSubscription';
import { useInviteByEmail } from '../api/useInviteByEmail';
import { useLeaveBundle } from '../api/useLeaveBundle';
import { MemberTabContent } from './MemberTabContent';
import { OverviewTabContent } from './OverviewTabContent';
import { PaymentTabContent } from './PaymentTabContent';
import { useQueryClient } from '@tanstack/react-query';

interface SubscriptionDetailsProps {
  id: string;
}

export function SubscriptionDetails({ id }: SubscriptionDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: subscriptionResponse, isLoading, error } = useGetSubscription(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'payments'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [inviteEmailErrors, setInviteEmailErrors] = useState<string[]>(['']);
  const [sendingInvites, setSendingInvites] = useState(false);
  const { mutateAsync: inviteByEmail, isOffline } = useInviteByEmail();
  const { mutateAsync: leaveBundle } = useLeaveBundle();
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !subscriptionResponse?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to load subscription details</p>
          <Button onClick={() => router.push('/subscriptions')}>Back to Subscriptions</Button>
        </div>
      </div>
    );
  }

  const subscriptionData = subscriptionResponse.data;
  const subscription = {
    id: subscriptionData.id,
    name: subscriptionData.name,
    description: subscriptionData.description,
    monthlyCost: Number(subscriptionData.price).toFixed(2),
    members: subscriptionData.members_count,
    maxMembers: subscriptionData.max_no_of_participants,
    yourShare: Number(
      subscriptionData.is_owner ? subscriptionData.owner_share : subscriptionData.per_person_price
    ).toFixed(2),
    status: subscriptionData.status,
    owner: subscriptionData.owner.name,
    isOwner: subscriptionData.is_owner,
    startDate: subscriptionData.startDate,
    endDate: subscriptionData.endDate,
    createdAt: subscriptionData.createdAt,
    nextPaymentDate: subscriptionData.member?.next_due_date,
  };

  const handleBackClick = () => {
    router.push('/subscriptions');
  };

  const handleEditClick = () => {
    setShowMoreMenu(false);
    router.push(`/subscription/${id}/edit`);
  };

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleLeaveClick = () => {
    setShowMoreMenu(false);
    setShowLeaveDialog(true);
  };

  const handleLeaveBundleConfirm = async () => {
    try {
      await leaveBundle({
        subscriptionId: Number(id),
        memberId: subscriptionData.member?.id,
      });
      router.push('/subscriptions');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleInviteMembers = () => {
    setShowInviteModal(true);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/invites`;
    if (navigator.share) {
      navigator.share({
        title: `Join ${subscription.name} subscription`,
        text: `Join my ${subscription.name} subscription and split the cost!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Invitation link copied to clipboard!');
    }
  };

  const addEmailField = () => {
    if (inviteEmails.length < Number(subscription.maxMembers) - Number(subscription.members)) {
      setInviteEmails([...inviteEmails, '']);
    }
  };

  const removeEmailField = (index: number) => {
    if (inviteEmails.length > 1) {
      const newEmails = inviteEmails.filter((_, i) => i !== index);
      setInviteEmails(newEmails);

      // Recalculate errors for the new email list
      const normalizedEmails = newEmails.map((email) => email.trim().toLowerCase());
      const newErrors = newEmails.map((email, idx) => {
        if (!email.trim()) return 'Email is required';
        if (!validateEmail(email)) return 'Invalid email address';
        if (normalizedEmails.filter((e) => e === normalizedEmails[idx]).length > 1) {
          return 'Duplicate email';
        }
        return '';
      });
      setInviteEmailErrors(newErrors);
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);

    // Recalculate errors for the new email list
    const normalizedEmails = newEmails.map((email) => email.trim().toLowerCase());
    const newErrors = newEmails.map((email, idx) => {
      if (!email.trim()) return 'Email is required';
      if (!validateEmail(email)) return 'Invalid email address';
      if (normalizedEmails.filter((e) => e === normalizedEmails[idx]).length > 1) {
        return 'Duplicate email';
      }
      return '';
    });
    setInviteEmailErrors(newErrors);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSendInvites = async () => {
    // Prepare lowercased, trimmed emails for duplicate check
    const normalizedEmails = inviteEmails.map((email) => email.trim().toLowerCase());
    const errors = inviteEmails.map((email, idx) => {
      if (!email.trim()) return 'Email is required';
      if (!validateEmail(email)) return 'Invalid email address';
      // Check for duplicates (case-insensitive)
      if (normalizedEmails.filter((e) => e === normalizedEmails[idx]).length > 1) {
        return 'Duplicate email';
      }
      return '';
    });

    setInviteEmailErrors(errors);

    const hasError = errors.some((err) => err);
    if (hasError) {
      return;
    }

    setSendingInvites(true);

    try {
      const validEmails = inviteEmails
        .map((email) => email.trim())
        .filter(
          (email, idx, arr) =>
            validateEmail(email) &&
            email &&
            arr.findIndex((e) => e.toLowerCase() === email.toLowerCase()) === idx
        );
      await inviteByEmail(
        {
          subscription_id: Number(id),
          emails: validEmails,
        },
        {
          onSuccess: () => {
            console.log('hello', id);
            queryClient.invalidateQueries({ queryKey: ['member-list', Number(id), 10] });
          },
        }
      );

      setInviteEmails(['']);
      setInviteEmailErrors(['']);
      setShowInviteModal(false);
    } catch (e) {
      // error handled by mutation
    } finally {
      setSendingInvites(false);
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmails(['']);
    setInviteEmailErrors(['']);
  };

  const availableSlots = Number(subscription.maxMembers) - Number(subscription.members);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex min-w-0 flex-1 items-center space-x-3">
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Monitor className="h-5 w-5 text-blue-600" />
              </div> */}
              <div className="min-w-0 flex-1 overflow-hidden">
                <h1 className="line-clamp-1 overflow-hidden text-xl font-bold break-all text-gray-900">
                  {subscription.name}
                </h1>
                <p className="line-clamp-1 overflow-hidden text-sm break-all text-gray-500">
                  Owned by {subscription.owner}
                </p>
              </div>
            </div>
          </div>

          <div className="relative" ref={moreMenuRef}>
            <Button variant="ghost" size="sm" className="p-2" onClick={handleMoreClick}>
              <MoreVertical className="h-5 w-5" />
            </Button>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div className="absolute top-10 right-0 z-50 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                {subscription.isOwner ? (
                  <button
                    onClick={handleEditClick}
                    className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Bundle</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveClick}
                    className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Leave Bundle</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Invite Members</CardTitle>
                <Button variant="ghost" size="sm" onClick={closeInviteModal} className="p-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Email Addresses</Label>
                {inviteEmails.map((email, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder="Enter email address"
                        className={`flex-1 ${inviteEmailErrors[index] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        aria-invalid={!!inviteEmailErrors[index]}
                        aria-describedby={
                          inviteEmailErrors[index] ? `email-error-${index}` : undefined
                        }
                      />
                      {inviteEmails.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmailField(index)}
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {inviteEmailErrors[index] && (
                      <p id={`email-error-${index}`} className="mt-1 text-xs text-red-600">
                        {inviteEmailErrors[index]}
                      </p>
                    )}
                  </div>
                ))}

                {inviteEmails.length < availableSlots && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addEmailField}
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Email
                  </Button>
                )}
              </div>

              <div className="space-y-2"></div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <h4 className="mb-1 text-sm font-medium text-blue-900">Invitation Preview</h4>
                <p className="text-xs text-blue-800">
                  &quot;Join my {subscription.name} bundle and pay only $
                  {Number(subscriptionData.per_person_price).toFixed(2)}
                  /month!&quot;
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={closeInviteModal}
                  className="flex-1"
                  disabled={sendingInvites}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendInvites} className="flex-1" disabled={sendingInvites}>
                  {sendingInvites ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invites
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Bundle Alert Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {subscription.name}?</AlertDialogTitle>
            <AlertDialogDescription>You will lose access immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveBundleConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <DollarSign className="mx-auto mb-2 h-6 w-6 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">${subscription.yourShare}</p>
              <p className="text-sm text-gray-500">Your share</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900">
                {subscription.members}/{subscription.maxMembers}
              </p>
              <p className="text-sm text-gray-500">Members</p>
            </CardContent>
          </Card>
          {subscription?.nextPaymentDate && (
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <Calendar className="mx-auto mb-2 h-6 w-6 text-purple-600" />
                <p className="text-sm font-bold text-gray-900">
                  {new Date(subscription.nextPaymentDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">Next payment</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'payments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payments
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTabContent
            subscription={subscription}
            formatDate={formatDate}
            handleInviteMembers={handleInviteMembers}
            handleShareLink={handleShareLink}
            availableSlots={availableSlots}
          />
        )}

        {activeTab === 'members' && (
          <MemberTabContent
            subscriptionId={Number(id)}
            subscription={subscription}
            availableSlots={availableSlots}
            handleInviteMembers={handleInviteMembers}
          />
        )}

        {activeTab === 'payments' && <PaymentTabContent subscriptionId={Number(id)} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
