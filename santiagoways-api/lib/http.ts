import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from './auth';

export type ApiResponse<T> = { data: T } | { error: { message: string; code?: string; details?: unknown } };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function err(message: string, status = 400, code?: string, details?: unknown) {
  return NextResponse.json<ApiResponse<never>>(
    { error: { message, code, details } },
    { status },
  );
}

export function notFound(message = 'Not found') {
  return err(message, 404, 'not_found');
}

export function unauthorized(message = 'Unauthenticated') {
  return err(message, 401, 'unauthorized');
}

export function forbidden(message = 'Forbidden') {
  return err(message, 403, 'forbidden');
}

export function handleApiError(e: unknown) {
  if (e instanceof AuthError) return err(e.message, e.status, 'unauthorized');
  if (e instanceof ZodError) return err('Invalid request', 422, 'validation_error', e.flatten());
  // Log the real error server-side for debugging, but never leak internal
  // details (Prisma table/column names, upstream API error bodies, stack
  // traces) to the client. Return a generic 500.
  console.error(e);
  return err('Internal server error', 500, 'server_error');
}

export function paginationParams(searchParams: URLSearchParams) {
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  return { cursor, limit };
}
