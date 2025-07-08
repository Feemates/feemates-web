'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Search,
  Filter,
  Loader2,
  Monitor,
  X,
  Calendar,
  Type,
  DollarSign,
  ArrowUpDown,
  Users,
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useGetSubscriptionsList } from '../api/useGetSubscriptionsList';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from '@/lib/toast';
import Image from 'next/image';
import Link from 'next/link';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SortType = 'name' | 'createdAt' | 'per_person_price';
type SortOrder = 'asc' | 'desc';

const sortOptions = [
  { value: 'createdAt' as SortType, label: 'Date Created', icon: Calendar },
  { value: 'name' as SortType, label: 'Name', icon: Type },
  { value: 'per_person_price' as SortType, label: 'Price', icon: DollarSign },
];

const orderOptions = [
  {
    value: 'asc' as SortOrder,
    label: 'Ascending',
    description: 'A–Z, Oldest to Newest, Low to High',
  },
  {
    value: 'desc' as SortOrder,
    label: 'Descending',
    description: 'Z–A, Newest to Oldest, High to Low',
  },
];

export function SubscriptionsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [popoverOpen, setPopoverOpen] = useState(false);

  // sort state
  const [sortBy, setSortBy] = useState<SortType>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    console.log(`Sorting by: ${sortBy}, Order: ${sortOrder}`);
  }, [sortBy, sortOrder]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useGetSubscriptionsList({
      name: debouncedSearchTerm || undefined,
      limit: 15,
      type: 'all',
      status: statusFilter,
      sortBy,
      sortOrder,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  //sort functionality
  const handleSortChange = (newSortBy: SortType) => {
    setSortBy(newSortBy);
  };

  const handleOrderChange = (newOrder: SortOrder) => {
    setSortOrder(newOrder);
  };

  const getCurrentSortLabel = () => {
    const sortOption = sortOptions.find((option) => option.value === sortBy);
    const orderOption = orderOptions.find((option) => option.value === sortOrder);
    return `${sortOption?.label} (${orderOption?.label})`;
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
        <div className="mb-6 flex w-full items-center justify-between gap-2">
          <div className="relative w-full">
            <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search bundles..."
              className="h-12 bg-white pr-14 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-8 h-8 w-8 p-0"
                onClick={() => setSearchTerm('')}
                tabIndex={-1}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={statusFilter === 'all' ? 'ghost' : 'secondary'}
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  aria-label="Filter status"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-0">
                <div className="flex flex-col">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Expired', value: 'expired' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={statusFilter === option.value ? 'secondary' : 'ghost'}
                      className="justify-start rounded-none px-4 py-2"
                      onClick={() => {
                        setStatusFilter(option.value as 'all' | 'active' | 'expired');
                        setPopoverOpen(false);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 justify-between bg-transparent">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-1" align="end">
              {/* Sort By Section */}
              <div className="p-1">
                <div className="px-2 py-1 text-[10px] font-medium tracking-wide text-gray-500 uppercase">
                  Sort by
                </div>
                <div className="space-y-0.5">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = sortBy === option.value;
                    return (
                      <button
                        key={option.value}
                        className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                        onClick={() => handleSortChange(option.value)}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className={`flex-1 ${isSelected ? 'font-medium' : ''}`}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="my-1 border-t border-gray-100" />

              {/* Order Section */}
              <div className="p-1">
                <div className="px-2 py-1 text-[10px] font-medium tracking-wide text-gray-500 uppercase">
                  Order
                </div>
                <div className="space-y-0.5">
                  {orderOptions.map((option) => {
                    const isSelected = sortOrder === option.value;
                    return (
                      <button
                        key={option.value}
                        className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                        onClick={() => handleOrderChange(option.value)}
                      >
                        <div className="flex-1">
                          <div className={`${isSelected ? 'font-medium' : ''}`}>{option.label}</div>
                          <div className="text-[10px] leading-tight text-gray-500">
                            {option.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <Link
                key={subscription.id}
                href={`/subscription/${subscription.id}`}
                className="block"
              >
                <Card className="cursor-pointer border-0 bg-white py-0 shadow-sm transition-shadow hover:shadow-md">
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
                        {/* <p className="mb-1 text-sm text-gray-500">Total price</p> */}
                        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-green-100">
                          <DollarSign className="h-3 w-3 text-green-600" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          ${Number(subscription.price).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        {/* <p className="mb-1 text-sm text-gray-500">Members</p> */}
                        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-green-100">
                          <Users className="mx-auto h-3 w-3 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          {subscription.members_count}/{subscription.max_no_of_participants}
                        </p>
                      </div>
                      {/* <div>
                      <p className="mb-1 text-sm text-gray-500">Your share</p>
                      <p className="font-semibold text-green-600">
                        $
                        {Number(
                          subscription.is_owner
                            ? subscription.owner_share
                            : subscription.per_person_price
                        ).toFixed(2)}
                      </p>
                    </div> */}

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

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {availableSlots > 0
                          ? `${availableSlots} slot${availableSlots !== 1 ? 's' : ''} available`
                          : 'Bundle full'}
                      </p>
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
                  </CardContent>
                </Card>
              </Link>
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
                    <Link href="/select-template">Create Bundle</Link>
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
