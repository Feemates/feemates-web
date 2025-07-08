import React from 'react';
import { Loader2 } from 'lucide-react';
import { TabCardContent } from './tab-card-content';
import { useGetSubscriptionsList } from '@/app/modules/subscriptions/api/useGetSubscriptionsList';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function JoinedTab() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useGetSubscriptionsList({
      type: 'member',
      limit: 10,
    });

  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const subscriptions = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-red-600">Failed to load bundle</div>;
  }

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4">
        <Image src="/dashboard/invited.svg" alt="No subscriptions" width={150} height={150} />
        <h2 className="mb-2 text-center text-lg font-semibold text-gray-900">
          No bundle joined yet.
        </h2>
        <p className="mb-3 text-center text-sm text-gray-500">
          Once you accept an invite from a friend, your shared bundle will appear here
        </p>
      </div>
    );
  }

  return (
    <TabCardContent
      subscriptions={subscriptions}
      fetchNextPageRef={ref}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
