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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Subscription name must be at least 2 characters.',
  }),
  type: z.string().min(1, {
    message: 'Please select a subscription type.',
  }),
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
        return !isNaN(num) && num >= 2 && num <= 10;
      },
      {
        message: 'Maximum participants must be between 2 and 10.',
      }
    ),
  startDate: z.string().min(1, {
    message: 'Start date is required.',
  }),
  endDate: z.string().min(1, {
    message: 'End date is required.',
  }),
  description: z.string().optional(),
});

export function CreateSubscription() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: '',
      price: '',
      maxParticipants: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  const handleBackClick = () => {
    window.location.href = '/dashboard';
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Creating subscription:', values);
    window.location.href = '/subscription-created';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Subscription</h1>
            <p className="text-sm text-gray-500">Set up a new subscription to share</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Name</FormLabel>
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select subscription type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="streaming">Streaming Services</SelectItem>
                          <SelectItem value="music">Music Services</SelectItem>
                          <SelectItem value="gaming">Gaming Services</SelectItem>
                          <SelectItem value="productivity">Productivity Tools</SelectItem>
                          <SelectItem value="cloud">Cloud Storage</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute top-3 left-3 text-gray-500">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="h-12 pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-12"
                          min={form.watch('startDate')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">
                        When this subscription sharing will end
                      </p>
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
                          placeholder="Add any additional details about this subscription..."
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-24 w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">
                        Optional details about the subscription or sharing arrangement
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Number of Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="10"
                          placeholder="e.g., 5"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">
                        Including yourself (2-10 participants)
                      </p>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="h-12 w-full text-base font-medium">
                  Create Subscription
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
