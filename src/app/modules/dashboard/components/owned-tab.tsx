import React from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TabCardContent } from './tab-card-content';
import { useGetSubscriptionsList } from '@/app/modules/subscriptions/api/useGetSubscriptionsList';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';

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
    return (
      <div className="flex flex-col items-center justify-center px-4">
        <Image src="/dashboard/owned.svg" alt="No subscriptions" width={150} height={150} />
        <h2 className="mb-2 text-center text-lg font-semibold">
          You haven&apos;t created any bundle yet
        </h2>
        <p className="text-secondary-text mb-3 text-center text-sm">
          Start a group bundle and invite friends to split the cost easily
        </p>
        <Button asChild>
          <Link href="/select-template">Create Bundle</Link>
        </Button>
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
