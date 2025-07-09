import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Loader2, Monitor, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Link key={subscription.id} href={`/subscription/${subscription.id}`} className="block">
          <Card className="cursor-pointer border-0 bg-white py-0 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div> */}
                  <div>
                    <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                    <p className="text-secondary-text text-sm">
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
              <div className="mb-3 flex items-center justify-between space-x-4">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <p className="font-semibold text-gray-900">
                      ${Number(subscription.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="mx-auto h-4 w-4 text-blue-600" />
                    <p className="font-semibold text-gray-900">
                      {subscription.members_count + '/' + subscription.max_no_of_participants}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    <div className="flex-shrink-0">
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-gray-100">
                        {subscription.thumbnail ? (
                          <Image
                            src={subscription.thumbnail || '/placeholder.svg'}
                            alt={`${subscription.name} logo`}
                            fill
                            className="object-fit"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
                            <Monitor className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div>
                <p className="mb-1 text-sm text-gray-500">Your share</p>
                <p className="font-semibold text-green-600">
                  $
                  {Number(
                    subscription.is_owner ? subscription.owner_share : subscription.per_person_price
                  ).toFixed(2)}
                </p>
              </div> */}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-secondary-text text-sm">
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
        </Link>
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
