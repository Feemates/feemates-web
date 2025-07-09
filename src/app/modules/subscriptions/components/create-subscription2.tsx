'use client';
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
import { useCreateSubscription } from '../api/useCreateSubscription';
import { useUploadFile } from '@/api/s3-operations';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { TemplateItem } from '../api/useTemplateList';
import { useSearchParams } from 'next/navigation';

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Subscription name must be at least 2 characters.',
    }),
    description: z.string().optional(),
    price: z
      .string()
      .min(1, {
        message: 'Price is required.',
      })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Price must be a valid positive number.',
      }),
    maxParticipants: z
      .string()
      .min(1, {
        message: 'Maximum participants is required.',
      })
      .refine(
        (val) => {
          const num = Number(val);
          return !isNaN(num) && num >= 2;
        },
        {
          message: 'Maximum participants must be at least 2.',
        }
      ),
    startDate: z
      .string()
      .min(1, {
        message: 'Start date is required.',
      })
      .refine(
        (val) => {
          const selectedDate = new Date(val);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day
          return selectedDate >= today;
        },
        {
          message: 'Start date cannot be in the past.',
        }
      ),
    endDate: z.string().min(1, {
      message: 'End date is required.',
    }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: 'End date must be after start date.',
      path: ['endDate'],
    }
  );

export function CreateSubscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createSubscriptionMutation = useCreateSubscription();
  const uploadFile = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateData, setTemplateData] = useState<TemplateItem | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      maxParticipants: '',
      startDate: '',
      endDate: '',
    },
  });

  // Extract and parse template data from URL params
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      try {
        const parsedTemplate = JSON.parse(decodeURIComponent(templateParam)) as TemplateItem;
        setTemplateData(parsedTemplate);

        // Prepopulate form fields
        form.setValue('name', parsedTemplate.name);
        form.setValue('description', parsedTemplate.description || '');
        form.setValue('price', parsedTemplate.price.toString());

        // Set template thumbnail
        setThumbnailImage(parsedTemplate.thumbnail);
      } catch (error) {
        console.error('Error parsing template data:', error);
      }
    }
  }, [searchParams, form]);

  const handleBackClick = () => {
    router.back();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !templateData) {
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
    if (!templateData) {
      setSelectedFile(null);
      setThumbnailImage(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prevent multiple submissions
    if (createSubscriptionMutation.isPending || isRedirecting) {
      return;
    }

    try {
      // Set redirecting state immediately to disable button
      setIsRedirecting(true);

      // Calculate per person price by dividing total price by max participants
      const totalPrice = Number(values.price);
      const maxParticipants = Number(values.maxParticipants);

      let thumbnail = undefined;

      // If using template, use template thumbnail_key
      if (templateData) {
        thumbnail = templateData.thumbnail_key;
      } else if (selectedFile) {
        // If there's a new image file, upload it first
        const uploadResult = await uploadFile.mutateAsync({ file: selectedFile });
        thumbnail = uploadResult.key;
      }

      const payload = {
        name: values.name,
        description: values.description || '',
        status: 'active' as const,
        price: totalPrice,
        max_no_of_participants: maxParticipants,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        ...(thumbnail && { thumbnail }),
      };

      createSubscriptionMutation.mutate(payload, {
        onError: () => {
          setIsRedirecting(false);
        },
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      setIsRedirecting(false);
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
            <h1 className="text-xl font-bold">Create Bundle</h1>
            <p className="text-secondary-text text-sm">
              {templateData
                ? 'Using template: ' + templateData.name
                : 'Set up a new bundle to share'}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-primary-text text-lg">Bundle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <p className="text-secondary-text text-sm">
                        Optional details about the bundle or sharing arrangement
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Cost *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="text-secondary-text absolute top-3 left-3">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="h-12 pl-8"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty or valid number with up to 2 decimals
                              if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-secondary-text text-sm">Total bundle cost</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-12"
                          min={new Date().toISOString().split('T')[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-secondary-text text-sm">Bundle cannot start in the past</p>
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
                          min={form.watch('startDate') || new Date().toISOString().split('T')[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-secondary-text text-sm">Must be after start date</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Number of Participants *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          placeholder="e.g., 5"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-secondary-text text-sm">
                        Including yourself (minimum 2 participants)
                      </p>
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Thumbnail Image (Max size: 5MB)</FormLabel>
                  {!templateData && (
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className=""
                        disabled={!!templateData}
                        ref={fileInputRef}
                      />
                    </FormControl>
                  )}
                  {thumbnailImage && (
                    <div className="relative flex-shrink-0 pt-3">
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={thumbnailImage}
                          alt={`Thumbnail preview`}
                          fill
                          className="object-fit"
                        />
                      </div>
                      {!templateData && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute top-1 left-20 h-5 w-5 rounded-full bg-red-500 p-0 hover:bg-red-600"
                        >
                          <X className="h-3 w-3 text-white" />
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Show file size error */}
                  {form.formState.errors.root && (
                    <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
                  )}

                  <p className="text-secondary-text text-sm">
                    {templateData
                      ? 'Template thumbnail is being used'
                      : 'Upload a thumbnail image for your bundle'}
                  </p>
                </FormItem>

                <Button
                  type="submit"
                  className="h-12 w-full text-base font-medium"
                  disabled={createSubscriptionMutation.isPending || isRedirecting}
                >
                  {createSubscriptionMutation.isPending || isRedirecting ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {createSubscriptionMutation.isPending ? 'Creating...' : 'Creating...'}
                    </div>
                  ) : (
                    'Create Bundle'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
