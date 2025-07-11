import { InvitesModule } from '@/app/modules/invites';
import { SubscriptionsModule } from '@/app/modules/subscriptions';

export default async function SubscriptionInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvitesModule.SubscriptionInvitationModule id={id} />;
}
