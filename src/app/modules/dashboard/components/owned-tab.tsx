import React from 'react';
import { Loader2 } from 'lucide-react';
import { TabCardContent } from './tab-card-content';
import { useGetSubscriptionsList } from '@/app/modules/subscriptions/api/useGetSubscriptionsList';
import { useInView } from 'react-intersection-observer';

export function OwnedTab() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useGetSubscriptionsList({
      type: 'owner',
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
    return <div className="py-8 text-center text-red-600">Failed to load subscriptions</div>;
  }

  if (subscriptions.length === 0) {
    return <div className="py-8 text-center text-gray-500">No owned subscriptions found.</div>;
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
