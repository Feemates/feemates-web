'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  Copy,
  Share2,
  Mail,
  MessageSquare,
  Plus,
  X,
  Clock,
  Loader2,
} from 'lucide-react';
import { useGetSubscription } from '../api/useGetSubscription';
import { useRouter } from 'nextjs-toploader/app';

interface SubscriptionCreatedProps {
  id: string;
}

export function SubscriptionCreated({ id }: SubscriptionCreatedProps) {
  const router = useRouter();
  const { data: subscriptionResponse, isLoading, error } = useGetSubscription(id);
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sendingInvites, setSendingInvites] = useState(false);

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
          <p className="text-red-600">Failed to load subscription details</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const subscriptionData = subscriptionResponse.data;
  const subscription = {
    name: subscriptionData.name,
    shareLink: `https://feemates.app/join/${subscriptionData.id}`,
    monthlyShare: Number(subscriptionData.per_person_price.toFixed(2)),
    maxMembers: subscriptionData.max_no_of_participants,
    currentMembers: subscriptionData.members_count,
    totalPrice: Number(subscriptionData.price.toFixed(2)),
    description: subscriptionData.description,
  };

  const availableSlots = subscription.maxMembers - subscription.currentMembers;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(subscription.shareLink);
    alert('Link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join my ${subscription.name} subscription`,
        text: `Join my ${subscription.name} subscription and pay only $${subscription.monthlyShare}/month!`,
        url: subscription.shareLink,
      });
    } else {
      handleCopyLink();
    }
  };

  const addEmailField = () => {
    if (inviteEmails.length < availableSlots) {
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
  };

  const handleSendInvites = async () => {
    const validEmails = inviteEmails.filter((email) => email.trim() && email.includes('@'));

    if (validEmails.length === 0) {
      alert('Please enter at least one valid email address');
      return;
    }

    setSendingInvites(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Sending invites to:', validEmails);
    console.log('Custom message:', inviteMessage);

    setIsEmailSent(true);
    setSendingInvites(false);

    setTimeout(() => {
      setIsEmailSent(false);
      setInviteEmails(['']);
      setInviteMessage('');
    }, 3000);
  };

  const handleDone = () => {
    router.push('/subscriptions');
  };

  const isFormValid = inviteEmails.some((email) => email.trim() && email.includes('@'));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Subscription Created!</h1>
          <p className="text-gray-600">Your {subscription.name} subscription is ready to share</p>
        </div>

        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 font-semibold text-gray-900">{subscription.name}</h3>
            <div className="mb-3">
              <p className="mb-1 text-2xl font-bold text-green-600">
                ${subscription.monthlyShare}/month
              </p>
              <p className="text-sm text-gray-500">per person when shared</p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                Total Price: <span className="font-medium">${subscription.totalPrice}</span>
              </p>
              <p className="mb-1">
                Max Participants: <span className="font-medium">{subscription.maxMembers}</span>
              </p>
              <p>
                Current Members: <span className="font-medium">{subscription.currentMembers}</span>
              </p>
            </div>
            {subscription.description && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-600">{subscription.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Share Your Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex space-x-2">
                <Input value={subscription.shareLink} readOnly className="flex-1" />
                <Button onClick={handleCopyLink} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleShare} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Invite by Email</CardTitle>
            <p className="text-sm text-gray-500">
              {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Email Addresses</Label>
                {inviteEmails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="Enter email address"
                      className="h-12 flex-1"
                    />
                    {inviteEmails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmailField(index)}
                        className="p-2 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {inviteEmails.length < availableSlots && (
                  <Button
                    type="button"
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

              <div className="space-y-2">
                <Label htmlFor="inviteMessage">Custom Message (Optional)</Label>
                <textarea
                  id="inviteMessage"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-20 w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <h4 className="mb-1 text-sm font-medium text-blue-900">Invitation Preview</h4>
                <p className="text-xs text-blue-800">
                  &quot;Join my {subscription.name} subscription and pay only $
                  {subscription.monthlyShare}/month!&quot;
                </p>
              </div>

              <Button
                onClick={handleSendInvites}
                className="w-full"
                disabled={sendingInvites || !isFormValid}
              >
                {sendingInvites ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invitations...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send{' '}
                    {inviteEmails.filter((email) => email.trim()).length > 1
                      ? 'Invitations'
                      : 'Invitation'}
                  </>
                )}
              </Button>

              {isEmailSent && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">
                      Invitations sent successfully to{' '}
                      {inviteEmails.filter((email) => email.trim() && email.includes('@')).length}{' '}
                      recipient
                      {inviteEmails.filter((email) => email.trim() && email.includes('@')).length >
                      1
                        ? 's'
                        : ''}
                      !
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleDone} variant="outline" className="h-12 w-full">
          Done
        </Button>
      </div>
    </div>
  );
}
