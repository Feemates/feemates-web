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
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useUpdateSubscription } from '../api/useUpdateSubscription';
import { useGetSubscription } from '../api/useGetSubscription';
import { useUploadFile } from '@/api/s3-operations';
import Image from 'next/image';

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Subscription name must be at least 2 characters.',
    }),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().min(1, {
      message: 'End date is required.',
    }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return data.endDate > data.startDate;
    },
    {
      message: 'End date must be after start date.',
      path: ['endDate'],
    }
  );

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
  const uploadFile = useUploadFile();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Always call useForm at the top
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', // placeholder
      description: '',
      startDate: '',
      endDate: '',
    },
  });

  // When subscription data loads, reset form values
  React.useEffect(() => {
    if (subscriptionResponse?.data) {
      form.reset({
        name: subscriptionResponse.data.name,
        description: subscriptionResponse.data.description || '',
        startDate: new Date(subscriptionResponse.data.startDate).toISOString().split('T')[0],
        endDate: new Date(subscriptionResponse.data.endDate).toISOString().split('T')[0],
      });
      // Set thumbnail preview if exists
      if (subscriptionResponse.data.thumbnail) {
        setThumbnailImage(subscriptionResponse.data.thumbnail);
      }
    }
  }, [subscriptionResponse?.data, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Show error message
        form.setError('root', {
          type: 'manual',
          message: 'Image size must be less than 5MB. Please choose a smaller image.',
        });
        return;
      }

      // Clear any previous error
      form.clearErrors('root');

      setSelectedFile(file);
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setThumbnailImage(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setThumbnailImage(null);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    // Prevent multiple submissions
    if (updateSubscriptionMutation.isPending || isRedirecting) {
      return;
    }

    try {
      // Set redirecting state immediately to disable button
      setIsRedirecting(true);

      let thumbnail = undefined;

      // If there's a new image file, upload it first
      if (selectedFile) {
        const uploadResult = await uploadFile.mutateAsync({ file: selectedFile });
        thumbnail = uploadResult.key;
      } else if (thumbnailImage === null) {
        // If thumbnail was removed (set to null), pass null to remove it
        thumbnail = null;
      }
      // If thumbnailImage exists and no new file selected, don't pass thumbnail (keep existing)

      const payload = {
        name: values.name,
        description: values.description || '',
        endDate: new Date(values.endDate).toISOString(),
        ...(thumbnail !== undefined && { thumbnail }),
      };

      updateSubscriptionMutation.mutate(payload, {
        onError: () => {
          setIsRedirecting(false);
        },
        onSuccess: () => {
          // Keep isRedirecting true until navigation completes
          // It will be reset when component unmounts
        },
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      setIsRedirecting(false);
    }
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

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-12"
                          min={
                            form.getValues('startDate') > new Date().toISOString().split('T')[0]
                              ? form.getValues('startDate')
                              : new Date().toISOString().split('T')[0]
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">Must be after start date</p>
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Thumbnail Image (Max size: 5MB)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="placeholder:text-muted-foreground"
                      ref={fileInputRef}
                    />
                  </FormControl>
                  {thumbnailImage && (
                    <div className="relative flex-shrink-0 pt-3">
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={thumbnailImage}
                          alt={`Thumbnail preview`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="absolute top-1 left-20 h-6 w-6 rounded-full bg-red-500 p-0 hover:bg-red-600"
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  )}

                  {/* Show file size error */}
                  {form.formState.errors.root && (
                    <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
                  )}

                  <p className="text-sm text-gray-500">Upload a thumbnail image for your bundle</p>
                </FormItem>

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
                      <FormLabel className="text-gray-500">Current End Date</FormLabel>
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
                        {updateSubscriptionMutation.isPending ? 'Saving...' : 'Saving...'}
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
