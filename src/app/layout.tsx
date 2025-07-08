import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from './QueryProvider';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import NextTopLoader from 'nextjs-toploader';
import { NetworkStatusBanner } from '@/components/common/network-status-banner';
import { PWAInstallPrompt } from '@/components/layout/pwa-install-prompt';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Feemates - Subscription Fee Sharing',
  description: 'Share subscription fees with friends and family easily',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Feemates',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <NextTopLoader
          color="#3b82f6"
          initialPosition={0.08}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
          template={
            '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          }
          zIndex={1600}
        />
        <NetworkStatusBanner />
        <ServiceWorkerRegister />
        <PWAInstallPrompt />
        <QueryProvider>
          <Suspense>{children}</Suspense>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
