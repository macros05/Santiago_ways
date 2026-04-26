import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { err, handleApiError, ok } from '@lib/http';

// Calls RapidAPI Booking.com endpoint for the albergue's bookingPropertyId.
// Falls back to a "not configured" response if env or property id is missing.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const { searchParams } = new URL(req.url);
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const guests = Number(searchParams.get('guests') ?? 1);

    if (!checkin || !checkout) {
      return err('checkin and checkout are required (YYYY-MM-DD)', 422, 'validation_error');
    }

    const albergue = await prisma.albergue.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, bookingPropertyId: true },
    });
    if (!albergue) return err('Albergue not found', 404, 'not_found');

    if (!albergue.bookingPropertyId || !process.env.RAPIDAPI_KEY) {
      return ok({
        configured: false,
        message:
          'Booking integration not configured. Add bookingPropertyId on the albergue and set RAPIDAPI_KEY.',
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
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      return err(`Booking API error: ${res.status}`, 502, 'upstream_error');
    }
    const data = await res.json();
    return ok({ configured: true, raw: data });
  } catch (e) {
    return handleApiError(e);
  }
}
