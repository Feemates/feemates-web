'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Camera, Loader2, User } from 'lucide-react';
import { useGetMe } from '@/api/get-user';
import { useUploadFile } from '@/api/s3-operations';
import { useUpdateProfile } from '@/app/modules/profile/api/useUpdateProfile';
import { toast } from '@/lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';
import { useAuthStore } from '@/store/auth-store';

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(50, {
      message: 'Name cannot be more than 50 characters.',
    })
    .regex(/^[A-Za-z\s]+$/, {
      message: 'Name can only contain letters and spaces.',
    }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

export function EditProfile() {
  const router = useRouter();
  const authToken = useAuthStore.getState().authToken;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);

  const { data: userData, isLoading } = useGetMe(authToken);
  const uploadFile = useUploadFile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Prefill form with user data when loaded
  useEffect(() => {
    if (userData?.user) {
      form.reset({
        name: userData.user.name || '',
        email: userData.user.email || '',
      });

      if (userData.user.avatar) {
        setProfileImage(userData.user.avatar);
        setIsImageLoading(false); // Don't show loading for existing images
        setImageLoadError(false);

        // Preload the image for faster display
        const img = new Image();
        img.onload = () => setIsImageLoading(false);
        img.onerror = () => setImageLoadError(true);
        img.src = userData.user.avatar;
      }
    }
  }, [userData, form]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleBackClick = () => {
    router.push('/profile');
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size >= maxSize) {
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

      // Cleanup previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create new object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setProfileImage(objectUrl);
      setIsImageLoading(false); // Object URLs load immediately
      setImageLoadError(false);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageLoadError(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageLoadError(true);
  };

  const handleImageLoadStart = () => {
    // Only show loading for new uploads, not existing images
    if (selectedFile) {
      setIsImageLoading(true);
    }
    setImageLoadError(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let avatarUrl = undefined;

      // If there's a new image file, upload it first
      if (selectedFile) {
        const uploadResult = await uploadFile.mutateAsync({ file: selectedFile });
        avatarUrl = uploadResult.key;

        // Immediately update the profile image with the new URL
        // Note: uploadResult.key might be a full URL or just a key
        // Since your API returns full URLs, use it directly
        setProfileImage(uploadResult.key);
        setIsImageLoading(true); // New image will need to load
      }

      // Update profile
      await updateProfile.mutateAsync({
        name: values.name,
        ...(avatarUrl && { avatar: avatarUrl }),
      });

      // Update auth store with new avatar URL for immediate UI update
      if (avatarUrl) {
        const currentUserDetails = useAuthStore.getState().userDetails;
        if (currentUserDetails) {
          useAuthStore.getState().setUserDetails({
            ...currentUserDetails,
            avatar: avatarUrl,
          });
        }
      }

      toast.success('Profile updated successfully!');

      // Invalidate and refetch queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['me'] });

      // Cleanup preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      setSelectedFile(null);
      router.push('/profile');
    } catch (error) {
      console.log(error);
      // toast.error('Failed to update profile. Please try again.');
    }
  };

  const displayImage = profileImage;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Edit Profile</h1>
            <p className="text-secondary-text text-sm">Update your personal information</p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <main className="px-4 py-6">
          <Card className="mb-6 border-0 bg-white shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="relative mb-4 inline-block">
                <Avatar className="h-32 w-32">
                  {displayImage && !imageLoadError && (
                    <AvatarImage
                      src={displayImage}
                      alt="Profile"
                      className="object-cover object-center"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      onLoadStart={handleImageLoadStart}
                      key={displayImage} // Force re-render when image changes
                      loading="eager"
                      fetchPriority="high"
                    />
                  )}
                  <AvatarFallback className="bg-blue-100 text-3xl font-bold text-blue-600">
                    {isImageLoading && displayImage && !imageLoadError ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      userData?.user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-colors hover:bg-blue-700"
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Show file size error */}
              {form.formState.errors.root && (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.root.message}</p>
              )}

              <p className="text-secondary-text mt-2 text-sm">
                Upload a profile picture (Max size: 5MB)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input className="h-12" {...field} />
                        </FormControl>
                        <div className="text-secondary-text text-right text-xs">
                          {field.value.length} / 50
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" className="h-12" disabled {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackClick}
                      className="text-primary-text flex-1"
                      disabled={uploadFile.isPending || updateProfile.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={uploadFile.isPending || updateProfile.isPending || isLoading}
                    >
                      {uploadFile.isPending || updateProfile.isPending
                        ? 'Saving...'
                        : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      )}
    </div>
  );
}
