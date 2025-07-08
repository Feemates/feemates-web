import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentTabContentProps {
  members: any[];
  subscription: any;
}

export function PaymentTabContent({ members, subscription }: PaymentTabContentProps) {
  const getPaymentStatusIcon = (status: string | null) => {
    switch (status) {
      case 'paid':
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
      case 'paid':
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
      <Card className="border-0 bg-white shadow-sm">
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
                    <p className="text-sm text-gray-500">${subscription.yourShare}</p>
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
      </Card>
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
              <div>
                <p className="font-medium text-gray-900">February 2024</p>
                <p className="text-sm text-gray-500">All members paid</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Completed
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
              <div>
                <p className="font-medium text-gray-900">January 2024</p>
                <p className="text-sm text-gray-500">All members paid</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Completed
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
