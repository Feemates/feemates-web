import { SubscriptionsModule } from '@/app/modules/subscriptions';

export default async function SubscriptionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubscriptionsModule.SubscriptionDetails id={id} />;
}
