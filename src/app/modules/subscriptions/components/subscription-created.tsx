'use client';
import { useState, useEffect } from 'react';
import { useInviteByEmail } from '../api/useInviteByEmail';
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
import { truncateToTwoDecimals } from '@/lib/helper-functions';
import { toast } from '@/lib/toast';

interface SubscriptionCreatedProps {
  id: string;
}

export function SubscriptionCreated({ id }: SubscriptionCreatedProps) {
  const router = useRouter();
  const { data: subscriptionResponse, isLoading, error } = useGetSubscription(id);

  // All hooks must be called unconditionally before any return
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [inviteEmailErrors, setInviteEmailErrors] = useState<string[]>(['']);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sendingInvites, setSendingInvites] = useState(false);
  const { mutateAsync: inviteByEmail } = useInviteByEmail();
  const [notOwner, setNotOwner] = useState(false);

  useEffect(() => {
    if (subscriptionResponse?.data && !subscriptionResponse.data.is_owner) {
      setNotOwner(true);
    }
  }, [subscriptionResponse]);

  useEffect(() => {
    if (notOwner) {
      router.push('/subscriptions');
    }
  }, [notOwner, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !subscriptionResponse?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Failed to load bundle details</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (notOwner) {
    return null;
  }

  const subscriptionData = subscriptionResponse.data;

  const subscription = {
    name: subscriptionData.name,
    shareLink: `${window.location.origin}/invites/${subscriptionData.id}`,
    monthlyShare: truncateToTwoDecimals(subscriptionData.per_person_price),
    maxMembers: subscriptionData.max_no_of_participants,
    currentMembers: subscriptionData.members_count,
    totalPrice: truncateToTwoDecimals(subscriptionData.price),
    description: subscriptionData.description,
  };

  const availableSlots = subscription.maxMembers - subscription.currentMembers;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(subscription.shareLink);
    toast.success('Share link copied to clipboard!');
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
    // Simple email regex for demonstration
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
      await inviteByEmail({
        subscription_id: Number(id),
        emails: validEmails,
      });
      setIsEmailSent(true);
      resetInviteForm();
      setTimeout(() => {
        setIsEmailSent(false);
      }, 3000);
    } catch (e) {
      // error handled by mutation
    } finally {
      setSendingInvites(false);
    }
  };

  // Utility to reset invite form fields and errors
  const resetInviteForm = () => {
    setInviteEmails(['']);
    setInviteEmailErrors(['']);
  };

  const handleDone = () => {
    router.push('/subscriptions');
  };

  const isFormValid = inviteEmails.some((email, idx) => email.trim() && !inviteEmailErrors[idx]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Bundle Created!</h1>
          <p className="line-clamp-2 text-gray-600">
            Your {subscription.name} bundle is ready to share
          </p>
        </div>

        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">{subscription.name}</h3>
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
            <CardTitle className="text-lg">Share Your Bundle</CardTitle>
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

            {/* <div className="flex space-x-2">
              <Button onClick={handleShare} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div> */}
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
                  <div key={index} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder="Enter email address"
                        className={`h-12 flex-1 ${inviteEmailErrors[index] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        aria-invalid={!!inviteEmailErrors[index]}
                        aria-describedby={
                          inviteEmailErrors[index] ? `email-error-${index}` : undefined
                        }
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
                    {inviteEmailErrors[index] && (
                      <p id={`email-error-${index}`} className="mt-1 text-xs text-red-600">
                        {inviteEmailErrors[index]}
                      </p>
                    )}
                  </div>
                ))}

                {/* {inviteEmails.length < availableSlots && (
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
                )} */}
              </div>

              <div className="space-y-2"></div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <h4 className="mb-1 text-sm font-medium text-blue-900">Invitation Preview</h4>
                <p className="line-clamp-2 overflow-hidden text-xs break-all text-blue-800">
                  &quot;Join my {subscription.name} bundle and pay only ${subscription.monthlyShare}
                  /month!&quot;
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
