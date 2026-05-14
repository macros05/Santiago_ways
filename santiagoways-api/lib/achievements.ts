import { prisma } from '@lib/prisma';

// Trigger events drive which conditions are worth re-evaluating. Treat them
// as hints — evaluateAchievements always reads fresh aggregates from the DB
// so re-running on the wrong trigger is at worst wasted work, not a bug.
export type AchievementTrigger =
  | 'stage_completed'
  | 'post_created'
  | 'diary_entry_created'
  | 'credential_stamp_added';

type Condition =
  | { type: 'totalKm'; value: number }
  | { type: 'percentage'; value: number }
  | { type: 'stagesRange'; route: string; from: number; to: number }
  | { type: 'stageCompleted'; endpoint: string }
  | { type: 'postsCount'; value: number }
  | { type: 'imagesCount'; value: number }
  | { type: 'elevationGain'; value: number }
  | { type: 'routesCompleted'; value: number };

function parseCondition(raw: unknown): Condition | null {
  if (!raw || typeof raw !== 'object') return null;
  return raw as Condition;
}

// Returns the slugs newly unlocked in this call so callers can surface them
// (push notification, toast, etc.).
export async function evaluateAchievements(
  userId: string,
  _trigger: AchievementTrigger,
): Promise<string[]> {
  const [user, achievements, already, pilgrimages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { totalKm: true },
    }),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    prisma.pilgrimage.findMany({
      where: { userId },
      include: {
        route: { select: { slug: true } },
        stages: {
          include: {
            stage: { select: { number: true, endPoint: true, elevationGain: true, routeId: true } },
          },
        },
      },
    }),
  ]);

  if (!user) return [];

  const ownedIds = new Set(already.map((a) => a.achievementId));

  const completedStages = pilgrimages.flatMap((p) =>
    p.stages
      .filter((s) => s.status === 'completed')
      .map((s) => ({
        routeSlug: p.route.slug,
        number: s.stage.number,
        endPoint: s.stage.endPoint,
        elevationGain: s.stage.elevationGain,
      })),
  );
  const completedRoutes = new Set(
    pilgrimages.filter((p) => p.status === 'completed').map((p) => p.route.slug),
  );
  const totalElevation = completedStages.reduce((acc, s) => acc + s.elevationGain, 0);
  const completedEndpoints = new Set(completedStages.map((s) => s.endPoint.toLowerCase()));

  const [postsCount, imagesAgg] = await Promise.all([
    prisma.post.count({ where: { userId } }),
    prisma.post.findMany({ where: { userId }, select: { images: true } }),
  ]);
  const imagesCount = imagesAgg.reduce((n, p) => n + (p.images?.length ?? 0), 0);

  const unlocked: string[] = [];

  for (const ach of achievements) {
    if (ownedIds.has(ach.id)) continue;
    const cond = parseCondition(ach.condition);
    if (!cond) continue;

    let qualifies = false;
    switch (cond.type) {
      case 'totalKm':
        qualifies = user.totalKm >= cond.value;
        break;
      case 'percentage': {
        const halfway = pilgrimages.some((p) => {
          const total = p.stages.length;
          if (total === 0) return false;
          const done = p.stages.filter((s) => s.status === 'completed').length;
          return done / total >= cond.value;
        });
        qualifies = halfway;
        break;
      }
      case 'stagesRange': {
        const inRange = completedStages.filter(
          (s) => s.routeSlug === cond.route && s.number >= cond.from && s.number <= cond.to,
        );
        qualifies = inRange.length >= cond.to - cond.from + 1;
        break;
      }
      case 'stageCompleted':
        qualifies = completedEndpoints.has(cond.endpoint.toLowerCase());
        break;
      case 'postsCount':
        qualifies = postsCount >= cond.value;
        break;
      case 'imagesCount':
        qualifies = imagesCount >= cond.value;
        break;
      case 'elevationGain':
        qualifies = totalElevation >= cond.value;
        break;
      case 'routesCompleted':
        qualifies = completedRoutes.size >= cond.value;
        break;
    }

    if (qualifies) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      await prisma.notification.create({
        data: {
          userId,
          type: 'achievement',
          title: ach.name,
          body: ach.description,
          data: { achievementId: ach.id, slug: ach.slug, icon: ach.icon },
        },
      });
      unlocked.push(ach.slug);
    }
  }

  return unlocked;
}
