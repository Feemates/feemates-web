import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, UserPlus } from 'lucide-react';

export interface OverviewSubscription {
  id: number;
  name: string;
  description: string;
  monthlyCost: string;
  members: number;
  maxMembers: number;
  yourShare: string;
  status: string;
  owner: string;
  isOwner: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface OverviewTabContentProps {
  subscription: OverviewSubscription;
  formatDate: (dateString: string) => string;
  handleInviteMembers: () => void;
  handleShareLink: () => void;
  availableSlots: number;
}

export function OverviewTabContent({
  subscription,
  formatDate,
  handleInviteMembers,
  handleShareLink,
  availableSlots,
}: OverviewTabContentProps) {
  return (
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
                  : subscription.status === 'expired'
                    ? 'bg-orange-100 text-orange-800'
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
      {subscription.isOwner && subscription.status !== 'expired' && availableSlots > 0 && (
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
  );
}
