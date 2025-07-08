import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';

import { useTransactionList } from '../api/useTransactionList';
import { useInView } from 'react-intersection-observer';

type PaymentTabContentProps = {
  subscriptionId: number;
};

// Mock members data with different statuses
const members = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'Owner',
    joinDate: 'Mar 10, 2023',
    paymentStatus: 'paid',
    memberStatus: 'active', // active, invited, declined
    avatar: 'AJ',
    invitedDate: null,
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'Member',
    joinDate: 'Mar 15, 2023',
    paymentStatus: 'paid',
    memberStatus: 'active',
    avatar: 'SW',
    invitedDate: null,
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'Member',
    joinDate: 'Mar 20, 2023',
    paymentStatus: 'pending',
    memberStatus: 'active',
    avatar: 'MC',
    invitedDate: null,
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma@example.com',
    role: 'Member',
    joinDate: null,
    paymentStatus: null,
    memberStatus: 'invited',
    avatar: 'ED',
    invitedDate: 'Mar 25, 2024',
  },
  {
    id: 5,
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Member',
    joinDate: null,
    paymentStatus: null,
    memberStatus: 'invited',
    avatar: 'JS',
    invitedDate: 'Mar 22, 2024',
  },
];

export function PaymentTabContent({ subscriptionId }: PaymentTabContentProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useTransactionList(subscriptionId, { limit: 10 });

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Infinite scroll
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages of transactions
  const transactions = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const getPaymentStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Payment Status - March 2024</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {members
            .filter((member) => member.memberStatus === 'active')
            .map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-xs font-medium text-blue-600">{member.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPaymentStatusIcon(member.paymentStatus)}
                  <Badge
                    variant="secondary"
                    className={getPaymentStatusColor(member.paymentStatus)}
                  >
                    {member.paymentStatus || 'N/A'}
                  </Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card> */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading && (
              <div className="flex justify-center py-8">
                <span>Loading...</span>
              </div>
            )}
            {error && (
              <div className="flex justify-center py-8 text-red-600">
                Failed to load transactions
              </div>
            )}
            {transactions.length === 0 && !isLoading && (
              <div className="flex justify-center py-8 text-gray-500">No transactions found.</div>
            )}
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between rounded-lg bg-green-50 p-3"
              >
                <div>
                  <p className="line-clamp-1 overflow-hidden font-medium break-all text-gray-900">
                    {txn.user?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {txn.payment_date
                      ? new Date(txn.payment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'UTC',
                        })
                      : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getPaymentStatusIcon(txn.status)}
                  <Badge variant="secondary" className={getPaymentStatusColor(txn.status)}>
                    {txn.status || 'N/A'}
                  </Badge>
                </div>
              </div>
            ))}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
