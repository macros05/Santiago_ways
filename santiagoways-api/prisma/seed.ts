import { PrismaClient, Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { ROUTES } from './data/routes';
import { ALBERGUES } from './data/albergues';
import { WAYPOINTS } from './data/waypoints';
import { ACHIEVEMENTS } from './data/achievements';
import {
  DEMO_USERS,
  DEMO_POSTS,
  DEMO_COMMENTS,
  DEMO_LIKES,
  DEMO_FOLLOWS,
  DEMO_USER_ACHIEVEMENTS,
  DEMO_PILGRIMAGES,
} from './data/demo';

const prisma = new PrismaClient();

const daysAgo = (n?: number) => (n == null ? new Date() : new Date(Date.now() - n * 86_400_000));

async function clear() {
  // Order matters because of FKs.
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.gpsTrack.deleteMany();
  await prisma.pilgrimageStage.deleteMany();
  await prisma.pilgrimage.deleteMany();
  await prisma.albergueReview.deleteMany();
  await prisma.stageAlbergue.deleteMany();
  await prisma.albergue.deleteMany();
  await prisma.waypoint.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.route.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.oAuthAccount.deleteMany();
  await prisma.user.deleteMany();
}

async function seedRoutes() {
  let totalStages = 0;
  for (const r of ROUTES) {
    await prisma.route.create({
      data: {
        slug: r.slug,
        name: r.name,
        nameEn: r.nameEn,
        totalKm: r.totalKm,
        difficulty: r.difficulty,
        startCity: r.startCity,
        country: r.country,
        description: r.description,
        color: r.color,
        isPopular: r.isPopular,
        stages: {
          create: r.stages.map((s) => ({
            number: s.number,
            name: s.name,
            startPoint: s.startPoint,
            endPoint: s.endPoint,
            distanceKm: s.distanceKm,
            elevationGain: s.elevationGain,
            elevationLoss: s.elevationLoss,
            difficulty: s.difficulty,
            description: s.description,
            tips: s.tips,
            coordinates: {
              type: 'LineString',
              coordinates: [s.startCoord, s.endCoord],
            } as Prisma.InputJsonValue,
          })),
        },
      },
    });
    totalStages += r.stages.length;
    console.log(`  ✓ ${r.slug} (${r.stages.length} stages)`);
  }
  console.log(`  → ${ROUTES.length} routes, ${totalStages} stages total`);
}

async function seedWaypoints() {
  let n = 0;
  for (const w of WAYPOINTS) {
    const stage = await prisma.stage.findFirst({
      where: { number: w.stageNumber, route: { slug: w.routeSlug } },
    });
    if (!stage) continue;
    await prisma.waypoint.create({
      data: {
        stageId: stage.id,
        name: w.name,
        type: w.type,
        lat: w.lat,
        lng: w.lng,
        description: w.description,
        isOfficial: !!w.isOfficial,
      },
    });
    n++;
  }
  console.log(`  → ${n} waypoints`);
}

async function seedAlbergues() {
  let n = 0;
  for (const a of ALBERGUES) {
    const stages = await prisma.stage.findMany({
      where: { number: { in: a.stageNumbers }, route: { slug: a.routeSlug } },
    });
    if (stages.length === 0) continue;

    const albergue = await prisma.albergue.create({
      data: {
        name: a.name,
        lat: a.lat,
        lng: a.lng,
        address: a.address,
        city: a.city,
        phone: a.phone,
        email: a.email,
        website: a.website,
        pricePerNight: a.pricePerNight ?? null,
        totalBeds: a.totalBeds ?? null,
        type: a.type,
        amenities: a.amenities,
        bookingPropertyId: a.bookingPropertyId,
        isOpenYearRound: !!a.isOpenYearRound,
        description: a.description,
      },
    });
    for (const stage of stages) {
      await prisma.stageAlbergue.create({
        data: { stageId: stage.id, albergueId: albergue.id },
      });
    }
    n++;
  }
  console.log(`  → ${n} albergues`);
}

async function seedAchievements() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.create({
      data: {
        slug: a.slug,
        name: a.name,
        description: a.description,
        icon: a.icon,
        condition: a.condition as Prisma.InputJsonValue,
      },
    });
  }
  console.log(`  → ${ACHIEVEMENTS.length} achievements`);
}

async function seedDemoUsers() {
  const password = await argon2.hash('demo1234');
  for (const u of DEMO_USERS) {
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: password,
        name: u.name,
        username: u.username,
        bio: u.bio,
        nationality: u.nationality,
        avatar: u.avatar,
        isOnCamino: !!u.isOnCamino,
        totalKm: u.totalKm ?? 0,
        timesCompleted: u.timesCompleted ?? 0,
      },
    });
  }
  console.log(`  → ${DEMO_USERS.length} demo users (password: demo1234)`);
}

async function seedDemoPosts() {
  for (const p of DEMO_POSTS) {
    const user = await prisma.user.findUnique({ where: { username: p.authorUsername } });
    if (!user) continue;
    let stageId: string | null = null;
    if (p.stageEndpoint && p.routeSlug) {
      const stage = await prisma.stage.findFirst({
        where: { endPoint: p.stageEndpoint, route: { slug: p.routeSlug } },
      });
      stageId = stage?.id ?? null;
    }
    await prisma.post.create({
      data: {
        userId: user.id,
        content: p.content,
        images: p.images,
        locationName: p.locationName,
        stageId,
        createdAt: daysAgo(p.daysAgo),
      },
    });
  }
  console.log(`  → ${DEMO_POSTS.length} demo posts`);
}

async function seedDemoComments() {
  // The posts were created in DEMO_POSTS order — fetch them ordered by createdAt desc
  // and map back via index. Simpler: fetch by content equality.
  let n = 0;
  for (const c of DEMO_COMMENTS) {
    const refPost = DEMO_POSTS[c.postIndex];
    if (!refPost) continue;
    const post = await prisma.post.findFirst({ where: { content: refPost.content } });
    const author = await prisma.user.findUnique({ where: { username: c.authorUsername } });
    if (!post || !author) continue;
    await prisma.comment.create({
      data: { postId: post.id, userId: author.id, content: c.content },
    });
    n++;
  }
  console.log(`  → ${n} demo comments`);
}

async function seedDemoLikes() {
  let n = 0;
  for (const [postIndex, username] of DEMO_LIKES) {
    const refPost = DEMO_POSTS[postIndex];
    if (!refPost) continue;
    const post = await prisma.post.findFirst({ where: { content: refPost.content } });
    const user = await prisma.user.findUnique({ where: { username } });
    if (!post || !user) continue;
    await prisma.like
      .create({ data: { postId: post.id, userId: user.id } })
      .catch(() => null); // ignore unique violations
    n++;
  }
  console.log(`  → ${n} demo likes`);
}

async function seedDemoFollows() {
  let n = 0;
  for (const [followerUsername, followingUsername] of DEMO_FOLLOWS) {
    const follower = await prisma.user.findUnique({ where: { username: followerUsername } });
    const following = await prisma.user.findUnique({ where: { username: followingUsername } });
    if (!follower || !following) continue;
    await prisma.follow
      .create({ data: { followerId: follower.id, followingId: following.id } })
      .catch(() => null);
    n++;
  }
  console.log(`  → ${n} follow edges`);
}

async function seedDemoAchievements() {
  let n = 0;
  for (const ua of DEMO_USER_ACHIEVEMENTS) {
    const user = await prisma.user.findUnique({ where: { username: ua.username } });
    const ach = await prisma.achievement.findUnique({ where: { slug: ua.achievementSlug } });
    if (!user || !ach) continue;
    await prisma.userAchievement
      .create({ data: { userId: user.id, achievementId: ach.id } })
      .catch(() => null);
    n++;
  }
  console.log(`  → ${n} unlocked achievements`);
}

async function seedDemoPilgrimages() {
  // Maria's primary pilgrimage (kept as before for the in-app demo).
  await seedPilgrimageFor('maria_walks', 'camino-frances', 'active', 14, 14);

  for (const p of DEMO_PILGRIMAGES) {
    await seedPilgrimageFor(p.username, p.routeSlug, p.status, p.daysAgo, p.currentStageNumber);
  }
  console.log(`  → ${1 + DEMO_PILGRIMAGES.length} demo pilgrimages`);
}

async function seedPilgrimageFor(
  username: string,
  routeSlug: string,
  status: 'planning' | 'active' | 'completed' | 'paused',
  daysSince?: number,
  currentStageNumber?: number,
) {
  const user = await prisma.user.findUnique({ where: { username } });
  const route = await prisma.route.findUnique({ where: { slug: routeSlug } });
  if (!user || !route) return;

  const startDate = status === 'planning' ? daysAgo(0) : daysAgo(daysSince ?? 7);
  const endDate = status === 'completed' ? daysAgo((daysSince ?? 30) - 5) : null;
  const totalKm = route.totalKm;
  const stages = await prisma.stage.findMany({
    where: { routeId: route.id },
    orderBy: { number: 'asc' },
  });

  let walkedKm = 0;
  if (status === 'completed') walkedKm = totalKm;
  else if (status === 'active' && currentStageNumber) {
    walkedKm = stages.slice(0, currentStageNumber - 1).reduce((s, st) => s + st.distanceKm, 0);
  }

  const pilgrimage = await prisma.pilgrimage.create({
    data: {
      userId: user.id,
      routeId: route.id,
      startDate,
      endDate,
      status,
      totalKm: walkedKm,
    },
  });

  for (const stage of stages) {
    let stageStatus: 'completed' | 'active' | 'pending' = 'pending';
    if (status === 'completed') stageStatus = 'completed';
    else if (status === 'active' && currentStageNumber) {
      if (stage.number < currentStageNumber) stageStatus = 'completed';
      else if (stage.number === currentStageNumber) stageStatus = 'active';
    }
    await prisma.pilgrimageStage.create({
      data: {
        pilgrimageId: pilgrimage.id,
        stageId: stage.id,
        status: stageStatus,
        startedAt:
          stageStatus !== 'pending' && currentStageNumber
            ? daysAgo((daysSince ?? 0) - (stage.number - 1))
            : null,
        completedAt:
          stageStatus === 'completed'
            ? daysAgo((daysSince ?? 0) - stage.number)
            : null,
        distanceWalked:
          stageStatus === 'completed'
            ? stage.distanceKm
            : stageStatus === 'active'
            ? stage.distanceKm * 0.4
            : 0,
      },
    });
  }
}

async function main() {
  console.log('🌿 Seeding SantiagoWays…');
  console.log('  Clearing existing data…');
  await clear();
  console.log('  Routes & stages…');
  await seedRoutes();
  console.log('  Waypoints…');
  await seedWaypoints();
  console.log('  Albergues…');
  await seedAlbergues();
  console.log('  Achievements…');
  await seedAchievements();
  console.log('  Users…');
  await seedDemoUsers();
  console.log('  Posts…');
  await seedDemoPosts();
  console.log('  Comments…');
  await seedDemoComments();
  console.log('  Likes…');
  await seedDemoLikes();
  console.log('  Follows…');
  await seedDemoFollows();
  console.log('  User achievements…');
  await seedDemoAchievements();
  console.log('  Pilgrimages…');
  await seedDemoPilgrimages();
  console.log('✓ Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
