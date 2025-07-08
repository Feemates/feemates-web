import { SubscriptionsModule } from '@/app/modules/subscriptions';

export default async function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubscriptionsModule.EditSubscription id={id} />;
}
