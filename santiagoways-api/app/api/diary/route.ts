import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok, created } from '@lib/http';

const CreateSchema = z.object({
  pilgrimageId: z.string().optional(),
  stageId: z.string().optional(),
  date: z.string().datetime().optional(),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(8000),
  images: z.array(z.string().url()).max(10).default([]),
  mood: z.enum(['happy', 'tired', 'inspired', 'grateful', 'challenged']).optional(),
  weather: z.string().max(40).optional(),
  isPrivate: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const url = new URL(req.url);
    const stageId = url.searchParams.get('stageId') ?? undefined;
    const pilgrimageId = url.searchParams.get('pilgrimageId') ?? undefined;
    const entries = await prisma.diaryEntry.findMany({
      where: { userId: auth.sub, ...(stageId ? { stageId } : {}), ...(pilgrimageId ? { pilgrimageId } : {}) },
      orderBy: { date: 'desc' },
      take: 100,
    });
    return ok(entries);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const json = await req.json();
    const data = CreateSchema.parse(json);
    const entry = await prisma.diaryEntry.create({
      data: {
        userId: auth.sub,
        pilgrimageId: data.pilgrimageId,
        stageId: data.stageId,
        date: data.date ? new Date(data.date) : new Date(),
        title: data.title,
        body: data.body,
        images: data.images,
        mood: data.mood,
        weather: data.weather,
        isPrivate: data.isPrivate,
      },
    });
    return created(entry);
  } catch (e) {
    return handleApiError(e);
  }
}
