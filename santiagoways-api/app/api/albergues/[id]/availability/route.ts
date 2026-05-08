import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { err, handleApiError, ok } from '@lib/http';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Calls RapidAPI Booking.com endpoint for the albergue's bookingPropertyId.
// Falls back to a "not configured" response if env or property id is missing.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const { searchParams } = new URL(req.url);
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const guestsRaw = Number(searchParams.get('guests') ?? 1);
    const guests = Number.isFinite(guestsRaw) ? Math.min(20, Math.max(1, Math.floor(guestsRaw))) : 1;

    if (!checkin || !checkout || !ISO_DATE.test(checkin) || !ISO_DATE.test(checkout)) {
      return err('checkin and checkout are required (YYYY-MM-DD)', 422, 'validation_error');
    }
    if (Date.parse(checkin) >= Date.parse(checkout)) {
      return err('checkout must be after checkin', 422, 'validation_error');
    }

    const albergue = await prisma.albergue.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, bookingPropertyId: true },
    });
    if (!albergue) return err('Albergue not found', 404, 'not_found');

    if (!albergue.bookingPropertyId || !process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
      return ok({
        configured: false,
        message:
          'Booking integration not configured. Add bookingPropertyId on the albergue and set RAPIDAPI_KEY and RAPIDAPI_HOST.',
      });
    }

    const url = new URL(`https://${process.env.RAPIDAPI_HOST}/v2/hotels/availability`);
    url.searchParams.set('hotel_id', albergue.bookingPropertyId);
    url.searchParams.set('checkin_date', checkin);
    url.searchParams.set('checkout_date', checkout);
    url.searchParams.set('adults_number', String(guests));
    url.searchParams.set('currency', 'EUR');
    url.searchParams.set('locale', 'en-gb');

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      return err(`Booking API error: ${res.status}`, 502, 'upstream_error');
    }
    const data = (await res.json()) as Record<string, unknown>;
    // Don't proxy the upstream response verbatim — it can leak provider metadata
    // and unstable shapes. Surface only the fields the client actually renders.
    const rooms = Array.isArray((data as { rooms?: unknown }).rooms)
      ? ((data as { rooms: Array<Record<string, unknown>> }).rooms.slice(0, 20))
      : [];
    return ok({
      configured: true,
      checkin,
      checkout,
      guests,
      rooms: rooms.map((r) => ({
        name: typeof r.name === 'string' ? r.name : null,
        price: typeof r.price === 'number' ? r.price : null,
        currency: typeof r.currency === 'string' ? r.currency : 'EUR',
        availability: typeof r.availability === 'number' ? r.availability : null,
      })),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
