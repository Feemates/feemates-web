'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CANADIAN_BANKS } from '../constants/constant';

import { useCreateKyc } from '../api/useCreateKyc';

const bankingSchema = z
  .object({
    fullName: z.string().min(2, {
      message: 'Full name must be at least 2 characters.',
    }),
    bankAccountNumber: z
      .string()
      .min(7, { message: 'Bank account number must be at least 7 digits.' })
      .max(12, { message: 'Bank account number must not exceed 12 digits.' })
      .regex(/^\d+$/, { message: 'Bank account number must contain only digits.' }),
    confirmBankAccountNumber: z
      .string()
      .min(7, { message: 'Please confirm your bank account number.' }),
    transitNumber: z
      .string()
      .length(5, { message: 'Transit number must be exactly 5 digits.' })
      .regex(/^\d+$/, { message: 'Transit number must contain only digits.' }),
    institutionNumber: z
      .string()
      .length(3, { message: 'Institution number must be exactly 3 digits.' })
      .regex(/^\d+$/, { message: 'Institution number must contain only digits.' }),
    bankName: z.string().min(2, {
      message: 'Bank name is required.',
    }),
  })
  .refine((data) => data.bankAccountNumber === data.confirmBankAccountNumber, {
    message: "Bank account numbers don't match",
    path: ['confirmBankAccountNumber'],
  });

export const NewKycForm = () => {
  const router = useRouter();
  const { mutateAsync, isPending, isOffline } = useCreateKyc();

  const form = useForm<z.infer<typeof bankingSchema>>({
    resolver: zodResolver(bankingSchema),
    defaultValues: {
      fullName: '',
      bankAccountNumber: '',
      confirmBankAccountNumber: '',
      transitNumber: '',
      institutionNumber: '',
      bankName: '',
    },
  });

  const institutionNumber = form.watch('institutionNumber');

  // Auto-fill bank name based on institution number
  useEffect(() => {
    if (institutionNumber && institutionNumber.length === 3) {
      const bankName = CANADIAN_BANKS[institutionNumber as keyof typeof CANADIAN_BANKS];
      if (bankName) {
        form.setValue('bankName', bankName);
      } else {
        // Clear bank name if institution number doesn't match any bank
        form.setValue('bankName', '');
      }
    } else if (institutionNumber && institutionNumber.length < 3) {
      // Clear bank name if institution number is incomplete
      form.setValue('bankName', '');
    }
  }, [institutionNumber, form]);

  const handleBackClick = () => {
    router.push('/profile');
  };

  const handleSubmit = async (values: z.infer<typeof bankingSchema>) => {
    try {
      await mutateAsync({
        account_holder_name: values.fullName,
        bank_name: values.bankName,
        account_number: values.bankAccountNumber,
        confirm_account_number: values.confirmBankAccountNumber,
        institution_number: values.institutionNumber,
        transit_number: values.transitNumber,
      });
      router.push('/dashboard');
    } catch (error) {
      // Error handling is managed in the mutation
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="px-4 py-6">
        <Card className="mx-auto max-w-2xl border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Building className="mr-2 h-5 w-5" />
              Bank Account Information
            </CardTitle>
            <p className="text-sm text-gray-500">
              Please provide your bank account details for verification
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name as it appears on your bank account"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="mt-1 text-xs text-gray-500">
                        Must match the name on your official ID and bank account
                      </p>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="institutionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 004"
                            className="h-12"
                            maxLength={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="mt-1 text-xs text-gray-500">
                          3-digit code identifying your financial institution
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transitNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transit Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 12345"
                            className="h-12"
                            maxLength={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="mt-1 text-xs text-gray-500">
                          5-digit code identifying your specific bank branch
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter or edit bank name" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="mt-1 text-xs text-gray-500">
                        Auto-filled based on institution number, but you can edit if needed
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your bank account number"
                          className="h-12"
                          maxLength={12}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="mt-1 text-xs text-gray-500">
                        Typically 7-12 digits, found on your bank statement or cheque
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmBankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Bank Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Re-enter your bank account number"
                          className="h-12"
                          maxLength={12}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="mt-1 text-xs text-gray-500">
                        Please type your account number again for verification
                      </p>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-12 w-full text-base font-medium"
                  disabled={isPending || isOffline}
                >
                  {isPending ? 'Submitting...' : isOffline ? 'Offline' : 'Submit Banking Details'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
