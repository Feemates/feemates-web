import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Send, AlertCircle, CheckCircle, Mail, XCircle, Clock } from 'lucide-react';

interface MemberTabContentProps {
  members: any[];
  subscription: any;
  availableSlots: number;
  resendingInvite: number | null;
  handleResendInvite: (memberId: number, memberName: string, memberEmail: string) => void;
  handleInviteMembers: () => void;
}

export function MemberTabContent({
  members,
  subscription,
  availableSlots,
  resendingInvite,
  handleResendInvite,
  handleInviteMembers,
}: MemberTabContentProps) {
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
                <Badge variant="secondary" className={getMemberStatusColor(member.memberStatus)}>
                  {getMemberStatusIcon(member.memberStatus)}
                  <span className="ml-1 capitalize">{member.memberStatus}</span>
                </Badge>
              </div>
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
  );
}
