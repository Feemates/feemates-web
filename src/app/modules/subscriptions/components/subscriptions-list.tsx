'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Loader2, Monitor, X } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useGetSubscriptionsList } from '../api/useGetSubscriptionsList';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from '@/lib/toast';
import Image from 'next/image';
import Link from 'next/link';

export function SubscriptionsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useGetSubscriptionsList({
      name: debouncedSearchTerm || undefined,
      limit: 15,
      type: 'all',
    });

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages of data
  const subscriptions = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const totalCount = data?.pages?.[0]?.meta?.total || 0;

  const handleBackClick = () => {
    router.push('/dashboard');
  };

  const handleSubscriptionClick = (id: number) => {
    router.push(`/subscription/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to load bundle</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Bundles</h1>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : `${totalCount} bundle${totalCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for navigation */}
      <main className="px-4 py-6 pb-24">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search bundles..."
            className="h-12 bg-white pr-12 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => setSearchTerm('')}
              tabIndex={-1}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {/* Subscription Cards */}
        <div className="space-y-4">
          {subscriptions.map((subscription) => {
            const availableSlots = subscription.max_no_of_participants - subscription.members_count;

            return (
              <Card
                key={subscription.id}
                className="cursor-pointer border-0 bg-white py-0 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => handleSubscriptionClick(subscription.id)}
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                        <Monitor className="h-6 w-6 text-blue-600" />
                      </div> */}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h4 className="line-clamp-1 overflow-hidden font-semibold break-all text-gray-900">
                          {subscription.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Created on {formatDate(subscription.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${
                        subscription.is_owner
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      } `}
                    >
                      {subscription.is_owner ? 'Owner' : 'Member'}
                    </Badge>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Total price</p>
                      <p className="font-semibold text-gray-900">
                        ${Number(subscription.price).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Members</p>
                      <p className="font-semibold text-gray-900">
                        {subscription.members_count}/{subscription.max_no_of_participants}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Your share</p>
                      <p className="font-semibold text-green-600">
                        $
                        {Number(
                          subscription.is_owner
                            ? subscription.owner_share
                            : subscription.per_person_price
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* {subscription.description && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">{subscription.description}</p>
                    </div>
                  )} */}

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {availableSlots > 0
                        ? `${availableSlots} slot${availableSlots !== 1 ? 's' : ''} available`
                        : 'Bundle full'}
                    </p>
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {!isLoading && subscriptions.length === 0 && (
          <div className="text-center">
            <div className="mb-4 text-gray-500">
              {searchTerm ? (
                'No subscriptions found matching your search'
              ) : (
                <div className="flex flex-col items-center justify-center px-4">
                  <Image
                    src="/dashboard/owned.svg"
                    alt="No subscriptions"
                    width={150}
                    height={150}
                  />
                  <h2 className="mb-2 text-center text-lg font-semibold text-gray-900">
                    You haven&apos;t created any bundle yet
                  </h2>
                  <p className="mb-3 text-center text-sm text-gray-500">
                    Start a group bundle and invite friends to split the cost easily
                  </p>
                  <Button asChild>
                    <Link href="/create-subscription">Create Bundle</Link>
                  </Button>
                </div>
              )}
            </div>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        )}

        {/* Intersection observer target */}
        {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
