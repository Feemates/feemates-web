import type { NextConfig } from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  disable: false,
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
