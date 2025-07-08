'use client';
import React, { useState } from 'react';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useUpdateSubscription } from '../api/useUpdateSubscription';
import { useGetSubscription } from '../api/useGetSubscription';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Subscription name must be at least 2 characters.',
  }),
  description: z.string().optional(),
});

interface EditSubscriptionProps {
  id: string;
}

export function EditSubscription({ id }: EditSubscriptionProps) {
  const router = useRouter();
  const {
    data: subscriptionResponse,
    isLoading: isLoadingSubscription,
    error,
  } = useGetSubscription(id);
  const updateSubscriptionMutation = useUpdateSubscription(id);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Always call useForm at the top
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', // placeholder
      description: '',
    },
  });

  // When subscription data loads, reset form values
  React.useEffect(() => {
    if (subscriptionResponse?.data) {
      form.reset({
        name: subscriptionResponse.data.name,
        description: subscriptionResponse.data.description || '',
      });
    }
  }, [subscriptionResponse?.data, form]);

  // Show loading state while fetching subscription data
  if (isLoadingSubscription) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !subscriptionResponse?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to load bundle details</p>
          <Button onClick={() => router.push(`/subscription/${id}`)}>Back to Bundle</Button>
        </div>
      </div>
    );
  }

  const subscriptionData = subscriptionResponse.data;

  // Check if user is owner
  if (!subscriptionData.is_owner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">You don&apos;t have permission to edit this bundle</p>
          <Button onClick={() => router.push(`/subscription/${id}`)}>Back to Subscription</Button>
        </div>
      </div>
    );
  }

  const handleBackClick = () => {
    router.push(`/subscription/${id}`);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload = {
      name: values.name,
      description: values.description || '',
    };

    // Set redirecting state when mutation starts
    setIsRedirecting(true);
    updateSubscriptionMutation.mutate(payload, {
      onSettled: () => {
        // Reset redirecting state if mutation completes (success or error)
        // Note: On success, user will be redirected, so this mainly handles errors
        if (updateSubscriptionMutation.isError) {
          setIsRedirecting(false);
        }
      },
    });
  };

  const handleCancel = () => {
    router.push(`/subscription/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 className="text-xl font-bold text-gray-900">Edit Bundle</h1>
            <p className="line-clamp-1 overflow-hidden text-sm break-all text-gray-500">
              Update {subscriptionData.name}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Bundle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Editable Fields */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bundle Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Netflix Premium, Spotify Family"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Add any additional details about this bundle..."
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-24 w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">
                        Optional details about the bundle or sharing arrangement
                      </p>
                    </FormItem>
                  )}
                />

                {/* Read-only Fields */}
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <h3 className="text-md font-semibold text-gray-900">
                    Current Settings (Read-only)
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FormLabel className="text-gray-500">Total Cost</FormLabel>
                      <Input
                        value={`$${Number(subscriptionData.price).toFixed(2)}`}
                        disabled
                        className="h-12 bg-gray-100"
                      />
                    </div>

                    <div>
                      <FormLabel className="text-gray-500">Per Person Cost</FormLabel>
                      <Input
                        value={`$${Number(subscriptionData.per_person_price).toFixed(2)}`}
                        disabled
                        className="h-12 bg-gray-100"
                      />
                    </div>

                    <div>
                      <FormLabel className="text-gray-500">Maximum Participants</FormLabel>
                      <Input
                        value={subscriptionData.max_no_of_participants.toString()}
                        disabled
                        className="h-12 bg-gray-100"
                      />
                    </div>

                    <div>
                      <FormLabel className="text-gray-500">Current Members</FormLabel>
                      <Input
                        value={subscriptionData.members_count.toString()}
                        disabled
                        className="h-12 bg-gray-100"
                      />
                    </div>

                    <div>
                      <FormLabel className="text-gray-500">Start Date</FormLabel>
                      <Input
                        value={formatDate(subscriptionData.startDate)}
                        disabled
                        className="h-12 bg-gray-100"
                      />
                    </div>

                    <div>
                      <FormLabel className="text-gray-500">End Date</FormLabel>
                      <Input
                        value={formatDate(subscriptionData.endDate)}
                        disabled
                        className="h-12 bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-12 flex-1"
                    disabled={updateSubscriptionMutation.isPending || isRedirecting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 text-base font-medium"
                    disabled={updateSubscriptionMutation.isPending || isRedirecting}
                  >
                    {updateSubscriptionMutation.isPending || isRedirecting ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isRedirecting && 'Saving...'}
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
