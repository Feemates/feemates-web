import { SubscriptionsModule } from '@/app/modules/subscriptions';

export default async function SubscriptionCreatedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubscriptionsModule.SubscriptionCreated id={id} />;
}
