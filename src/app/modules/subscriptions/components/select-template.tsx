'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTemplateList } from '../api/useTemplateList';
import Image from 'next/image';
import Link from 'next/link';

export const SelectTemplate = () => {
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useTemplateList();

  // Flatten paginated data
  const templates = data?.pages.flatMap((page) => page.data) || [];

  // Intersection Observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    router.prefetch('/create-subscription'); // Preload create subscription page
  }, [router]);

  const handleBackClick = () => {
    router.back();
  };

  const handleSelectTemplate = (template: any) => {
    // Navigate to create subscription with template data
    const templateData = encodeURIComponent(JSON.stringify(template));
    router.push(`/create-subscription?template=${templateData}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-red-500">Failed to load templates. Please try again.</div>
        </div>
      );
    }

    return (
      <main className="px-8 pt-10 pb-8">
        {/* Create Custom Bundle Section */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-lg font-semibold">Create a custom bundle</h2>
          <p className="text-secondary-text mb-6">Add your own bundle</p>
          <Link href="/create-subscription">
            <Button className="h-12 w-full max-w-sm text-[16px] font-medium text-white">
              Create Bundle
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="mb-8 text-center">
          <span className="text-secondary-text">or</span>
        </div>

        {/* Templates Section */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold">Choose from the templates</h2>
        </div>

        {/* Template Grid */}
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="aspect-video cursor-pointer overflow-hidden border-0 bg-white py-0 transition-all hover:scale-105 hover:shadow-md"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardContent className="h-full p-0">
                <div className="relative h-full w-full">
                  {/* Template Thumbnail */}
                  <Image
                    src={template.thumbnail}
                    alt={template.name}
                    fill
                    // className="object-fill"
                    // onError={(e) => {
                    //   const target = e.target as HTMLImageElement;
                    //   target.src = '/placeholder-template.png';
                    // }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading indicator for pagination */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        )}

        {/* Intersection observer trigger for infinite scroll */}
        {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}

        {/* Show message when no templates found */}
        {!isLoading && templates.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-secondary-text">No templates available at the moment.</p>
          </div>
        )}
      </main>
    );
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
            <p className="text-secondary-text text-sm">Set up a new bundle to share</p>
          </div>
        </div>
      </header>

      {renderContent()}
    </div>
  );
};
