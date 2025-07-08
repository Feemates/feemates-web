'use client';

import { useState, useEffect, useRef } from 'react';
import { useInviteByEmail } from '../api/useInviteByEmail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Monitor,
  Users,
  DollarSign,
  Calendar,
  Share2,
  UserPlus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  AlertCircle,
  Send,
  X,
  Plus,
  Loader2,
  Edit,
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useGetSubscription } from '../api/useGetSubscription';
import { useRouter } from 'nextjs-toploader/app';

interface SubscriptionDetailsProps {
  id: string;
}

// Mock members data with different statuses
const members = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'Owner',
    joinDate: 'Mar 10, 2023',
    paymentStatus: 'paid',
    memberStatus: 'active', // active, invited, declined
    avatar: 'AJ',
    invitedDate: null,
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'Member',
    joinDate: 'Mar 15, 2023',
    paymentStatus: 'paid',
    memberStatus: 'active',
    avatar: 'SW',
    invitedDate: null,
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'Member',
    joinDate: 'Mar 20, 2023',
    paymentStatus: 'pending',
    memberStatus: 'active',
    avatar: 'MC',
    invitedDate: null,
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma@example.com',
    role: 'Member',
    joinDate: null,
    paymentStatus: null,
    memberStatus: 'invited',
    avatar: 'ED',
    invitedDate: 'Mar 25, 2024',
  },
  {
    id: 5,
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Member',
    joinDate: null,
    paymentStatus: null,
    memberStatus: 'invited',
    avatar: 'JS',
    invitedDate: 'Mar 22, 2024',
  },
];

export function SubscriptionDetails({ id }: SubscriptionDetailsProps) {
  const router = useRouter();
  const { data: subscriptionResponse, isLoading, error } = useGetSubscription(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'payments'>('overview');
  const [resendingInvite, setResendingInvite] = useState<number | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [inviteEmailErrors, setInviteEmailErrors] = useState<string[]>(['']);
  const [sendingInvites, setSendingInvites] = useState(false);
  const { mutateAsync: inviteByEmail, isOffline } = useInviteByEmail();
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

  const handleResendInvite = async (memberId: number, memberName: string, memberEmail: string) => {
    setResendingInvite(memberId);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log(`Resending invite to ${memberName} (${memberEmail})`);
    alert(`Invitation resent to ${memberName}!`);

    setResendingInvite(null);
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
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);

    // Clear error for this field on change
    const newErrors = [...inviteEmailErrors];
    newErrors[index] = '';
    setInviteEmailErrors(newErrors);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSendInvites = async () => {
    const errors = inviteEmails.map((email) => {
      if (!email.trim()) return 'Email is required';
      if (!validateEmail(email)) return 'Invalid email address';
      return '';
    });

    setInviteEmailErrors(errors);

    const hasError = errors.some((err) => err);
    if (hasError) {
      return;
    }

    setSendingInvites(true);

    try {
      const validEmails = inviteEmails.filter((email) => email.trim() && validateEmail(email));
      await inviteByEmail({
        subscription_id: Number(id),
        emails: validEmails,
      });
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
  };

  const availableSlots = Number(subscription.maxMembers) - Number(subscription.members);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentStatusIcon = (status: string | null) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'invited':
        return <Mail className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
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
          {subscription.isOwner && (
            <div className="relative" ref={moreMenuRef}>
              <Button variant="ghost" size="sm" className="p-2" onClick={handleMoreClick}>
                <MoreVertical className="h-5 w-5" />
              </Button>

              {/* Dropdown Menu */}
              {showMoreMenu && (
                <div className="absolute top-10 right-0 z-50 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                  <button
                    onClick={handleEditClick}
                    className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Subscription</span>
                  </button>
                </div>
              )}
            </div>
          )}
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
                  &quot;Join my {subscription.name} subscription and pay only $
                  {subscription.yourShare}
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
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-2 h-6 w-6 text-purple-600" />
              <p className="text-sm font-bold text-gray-900">Apr 10</p>
              <p className="text-sm text-gray-500">Next payment</p>
            </CardContent>
          </Card>
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
          <div className="space-y-6">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Cost</span>
                  <span className="font-semibold">${subscription.monthlyCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Share</span>
                  <span className="font-semibold text-green-600">${subscription.yourShare}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant="secondary"
                    className={`capitalize ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-semibold">{formatDate(subscription.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-semibold">{formatDate(subscription.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created On</span>
                  <span className="font-semibold">{formatDate(subscription.createdAt)}</span>
                </div>
                {subscription.description && (
                  <div className="border-t pt-2">
                    <span className="mb-2 line-clamp-1 block overflow-hidden break-all text-gray-600">
                      Description
                    </span>
                    <p className="text-sm text-gray-900">{subscription.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {subscription.isOwner && (
              <div className="flex space-x-3">
                <Button onClick={handleInviteMembers} className="flex-1">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Members
                </Button>
                <Button variant="outline" onClick={handleShareLink} className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Link
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            {members.map((member) => (
              <Card key={member.id} className="border-0 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-medium text-blue-600">{member.avatar}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        {member.memberStatus === 'active' && member.joinDate && (
                          <p className="text-xs text-gray-400">Joined {member.joinDate}</p>
                        )}
                        {member.memberStatus === 'invited' && member.invitedDate && (
                          <p className="text-xs text-gray-400">Invited {member.invitedDate}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={
                          member.role === 'Owner'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={getMemberStatusColor(member.memberStatus)}
                      >
                        {getMemberStatusIcon(member.memberStatus)}
                        <span className="ml-1 capitalize">{member.memberStatus}</span>
                      </Badge>
                    </div>

                    {/* Action buttons for owner */}
                    {subscription.isOwner && member.role !== 'Owner' && (
                      <div className="flex items-center space-x-2">
                        {member.memberStatus === 'invited' && (
                          <Button
                            onClick={() => handleResendInvite(member.id, member.name, member.email)}
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            disabled={resendingInvite === member.id}
                          >
                            <Send className="mr-1 h-3 w-3" />
                            {resendingInvite === member.id ? 'Sending...' : 'Resend'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Warning for invited members */}
                  {member.memberStatus === 'invited' && (
                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-blue-800">
                          Waiting for {member.name} to accept the invitation
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {availableSlots > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <UserPlus className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                  <h3 className="mb-1 font-medium text-blue-900">
                    {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
                  </h3>
                  <p className="mb-3 text-sm text-blue-700">
                    Invite more members to reduce your monthly cost
                  </p>
                  <Button
                    onClick={handleInviteMembers}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Invite Members
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Payment Status - March 2024</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {members
                  .filter((member) => member.memberStatus === 'active')
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-xs font-medium text-blue-600">{member.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">${subscription.yourShare}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPaymentStatusIcon(member.paymentStatus)}
                        <Badge
                          variant="secondary"
                          className={getPaymentStatusColor(member.paymentStatus)}
                        >
                          {member.paymentStatus || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <div>
                      <p className="font-medium text-gray-900">February 2024</p>
                      <p className="text-sm text-gray-500">All members paid</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <div>
                      <p className="font-medium text-gray-900">January 2024</p>
                      <p className="text-sm text-gray-500">All members paid</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
