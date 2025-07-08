import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Monitor } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';

interface TabCardContentProps {
  subscriptions: any[];
  fetchNextPageRef: (node?: Element | null) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function TabCardContent({
  subscriptions,
  fetchNextPageRef,
  hasNextPage,
  isFetchingNextPage,
}: TabCardContentProps) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card
          key={subscription.id}
          className="border-0 bg-white py-0 shadow-sm"
          onClick={() => router.push(`/subscription/${subscription.id}`)}
        >
          <CardContent className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div> */}
                <div>
                  <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                  <p className="text-sm text-gray-500">
                    Created on{' '}
                    {new Date(subscription.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`capitalize ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : subscription.status === 'expired'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                } `}
              >
                {subscription.status}
              </Badge>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-4">
              <div>
                <p className="mb-1 text-sm text-gray-500">Monthly cost</p>
                <p className="font-semibold text-gray-900">
                  ${Number(subscription.price).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">Members</p>
                <p className="font-semibold text-gray-900">{subscription.members_count}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">Your share</p>
                <p className="font-semibold text-green-600">
                  $
                  {Number(
                    subscription.is_owner ? subscription.owner_share : subscription.per_person_price
                  ).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {subscription.max_no_of_participants - subscription.members_count > 0
                  ? `${subscription.max_no_of_participants - subscription.members_count} slots available`
                  : 'Bundle full'}
              </p>
              {/* <Button variant="ghost" className="p-0 text-blue-600 hover:text-blue-800">
                Manage
              </Button> */}
            </div>
          </CardContent>
        </Card>
      ))}
      {hasNextPage && !isFetchingNextPage && <div ref={fetchNextPageRef} className="h-4" />}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
