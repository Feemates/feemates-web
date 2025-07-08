'use client';

import { useGetBankDetails } from '@/app/modules/kyc/api/useGetBankDetails';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function BankDetailsPage() {
  const { data, isLoading, error } = useGetBankDetails();

  console.log(data);

  useEffect(() => {
    if (data?.data) {
      if (
        data.is_user_kyc_exists === false ||
        (data.data?.status && data.data.status !== 'approved')
      ) {
        window.location.href = '/profile';
      }
    }
  }, [data]);

  if (isLoading) return <div>Loading bank details...</div>;
  if (error) return <div className="mb-4 text-red-500">Failed to load bank details.</div>;

  if (!data?.data) {
    return <Card className="p-6">No bank details found.</Card>;
  }

  const handleBackClick = () => {
    window.location.href = '/profile';
  };

  const bank = data.data;

  return (
    <div className="min-h-screen bg-gray-50 pb-5">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900"> Banking Details</h1>
            <p className="text-sm text-gray-500">Enter your bank account information</p>
          </div>
        </div>
      </header>
      <Card className="mx-auto mt-8 max-w-xl p-6">
        <h2 className="mb-4 text-xl font-semibold">Bank Details</h2>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-1 block text-sm font-medium">Account Holder Name</label>
            <input
              type="text"
              value={bank.account_holder_name || ''}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-sm font-medium">Bank Name</label>
            <input
              type="text"
              value={bank.bank_name || ''}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-sm font-medium">Account Number</label>
            <input
              type="text"
              value={bank.account_number || ''}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-sm font-medium">Transit Number</label>
            <input
              type="text"
              value={bank.transit_number || ''}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-sm font-medium">Institution Number</label>
            <input
              type="text"
              value={bank.institution_number || ''}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-sm font-medium">Status</label>
            <input
              type="text"
              value={bank.status || ''}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>
          {bank.note && (
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Note</label>
              <input
                type="text"
                value={bank.note}
                disabled
                className="w-full rounded border bg-gray-100 px-3 py-2"
              />
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
