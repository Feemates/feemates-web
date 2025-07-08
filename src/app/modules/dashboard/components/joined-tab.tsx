import React from 'react';
import { Loader2 } from 'lucide-react';
import { TabCardContent } from './tab-card-content';

export function JoinedTab({
  subscriptions,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPageRef,
}: {
  subscriptions: any[];
  isLoading: boolean;
  error: any;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPageRef: (node?: Element | null) => void;
}) {
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
    return <div className="py-8 text-center text-gray-500">No joined subscriptions found.</div>;
  }

  return (
    <TabCardContent
      subscriptions={subscriptions}
      fetchNextPageRef={fetchNextPageRef}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
