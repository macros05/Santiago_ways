import { prisma } from './prisma';
import { getPlan, type Plan, type SubscriptionLite } from './permissions';

export async function getUserWithSubscription(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
}

export async function getSubscription(userId: string): Promise<SubscriptionLite> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return null;
  return { plan: sub.plan, status: sub.status, currentPeriodEnd: sub.currentPeriodEnd };
}

export async function getPlanFor(userId: string | null | undefined): Promise<Plan> {
  if (!userId) return 'free';
  const sub = await getSubscription(userId);
  return getPlan({ subscription: sub });
}
