import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Send,
  AlertCircle,
  CheckCircle,
  Mail,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';

import { useMemo, useEffect, useState } from 'react';
import { useMemberList } from '../api/useMemberList';
import { useInView } from 'react-intersection-observer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/helper-functions';
import { useResentInvite } from '../api/useResentInvite';

interface MemberTabContentProps {
  subscriptionId: number;
  subscription: any;
  availableSlots: number;
  handleInviteMembers: () => void;
}

export function MemberTabContent({
  subscriptionId,
  subscription,
  availableSlots,
  handleInviteMembers,
}: MemberTabContentProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useMemberList(subscriptionId);

  const [resendingInvite, setResendingInvite] = useState<number | null>(null);
  const { mutate: resendInvite } = useResentInvite();

  const handleResendInvite = (memberId: number) => {
    setResendingInvite(memberId);
    resendInvite(memberId, {
      onSettled: () => setResendingInvite(null),
    });
  };

  // Flatten paginated data
  const members = data?.pages.flatMap((page) => page.data) || [];

  // Intersection Observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-yellow-700" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <svg
          className="h-8 w-8 animate-spin text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500">Failed to load members.</div>;
  }

  return (
    <div className="space-y-4">
      {members.map((member, idx) => {
        // Map API response to UI shape
        const name = member?.user?.name || '';
        const email = member?.user?.email || member?.invited_email;
        // Fallback: show initials (e.g., "Joy Boy" => "JB")

        const avatar = (
          <Avatar className="h-10 w-10">
            {member.user?.avatar ? <AvatarImage src={member?.user?.avatar} alt={name} /> : null}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        );
        const role = member?.user_type === 'owner' ? 'Owner' : 'Member';
        const memberStatus = member?.status;
        const formatDate = (dateString: string) =>
          new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          });
        const joinDate = member?.joined_at ? formatDate(member?.joined_at) : null;
        const invitedDate =
          !member?.joined_at && member?.createdAt ? formatDate(member?.createdAt) : null;

        return (
          <Card key={member.id} className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>{avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-500">{email}</p>
                    {memberStatus === 'active' && joinDate && (
                      <p className="text-xs text-gray-400">Joined {joinDate}</p>
                    )}
                    {memberStatus === 'invited' && invitedDate && (
                      <p className="text-xs text-gray-400">Invited {invitedDate}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className={
                      role === 'Owner' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={getMemberStatusColor(memberStatus)}>
                    {getMemberStatusIcon(memberStatus)}
                    <span className="ml-1 capitalize">{memberStatus}</span>
                  </Badge>
                </div>
                {subscription.isOwner && role !== 'Owner' && (
                  <div className="flex items-center space-x-2">
                    {memberStatus === 'invited' && subscription.status !== 'expired' && (
                      <Button
                        onClick={() => handleResendInvite(member.id)}
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
              {memberStatus === 'invited' && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Waiting for {name} to accept the invitation
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}

      {subscription.isOwner && subscription.status !== 'expired' && availableSlots > 0 && (
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
  );
}
