import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

export const dynamic = 'force-dynamic';

// Aggregates the user's lifetime numbers in one round trip so the profile
// stats screen does not need to fan out into 5 separate queries.
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);

    const [user, completedStages, posts, diaryCount, stampsCount, achievements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.sub },
        select: { totalKm: true, timesCompleted: true },
      }),
      prisma.pilgrimageStage.findMany({
        where: { pilgrimage: { userId: auth.sub }, status: 'completed' },
        include: { stage: { select: { elevationGain: true } } },
        orderBy: { completedAt: 'asc' },
      }),
      prisma.post.findMany({
        where: { userId: auth.sub },
        select: { images: true },
      }),
      prisma.diaryEntry.count({ where: { userId: auth.sub } }),
      prisma.credentialStamp.count({ where: { userId: auth.sub } }),
      prisma.userAchievement.findMany({
        where: { userId: auth.sub },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      }),
    ]);

    const photosCount = posts.reduce((n, p) => n + (p.images?.length ?? 0), 0);
    const elevationGain = completedStages.reduce((acc, s) => acc + s.stage.elevationGain, 0);
    const stagesCompleted = completedStages.length;

    // Streak: consecutive distinct calendar days with at least one completed
    // stage, walking back from the most recent completion. Days without a
    // completion break the chain.
    const days = new Set(
      completedStages
        .map((s) => s.completedAt)
        .filter((d): d is Date => d != null)
        .map((d) => d.toISOString().slice(0, 10)),
    );
    let streak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return ok({
      totalKm: user?.totalKm ?? 0,
      timesCompleted: user?.timesCompleted ?? 0,
      stagesCompleted,
      elevationGain,
      photosCount,
      diaryCount,
      stampsCount,
      streak,
      achievements: achievements.map((a) => ({
        slug: a.achievement.slug,
        name: a.achievement.name,
        description: a.achievement.description,
        icon: a.achievement.icon,
        unlockedAt: a.unlockedAt,
      })),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
