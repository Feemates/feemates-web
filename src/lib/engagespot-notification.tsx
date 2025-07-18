'use client';

import { Engagespot } from '@engagespot/react-component';
import { Bell } from 'lucide-react';
import { env } from '@/config/env';

const CustomIcon = () => <Bell className="h-6 w-6 text-gray-600" />;

export const EngagespotNotification = ({ userId }: { userId: string }) => {
  const key = env?.NEXT_PUBLIC_ENGAGESPOT_KEY;

  return (
    key && userId && <Engagespot apiKey={key} userId={userId} renderNotificationIcon={CustomIcon} />
  );
};
