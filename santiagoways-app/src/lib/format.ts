export function formatKm(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} km`;
}

export function formatElevation(value: number): string {
  return `${Math.round(value)} m`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function timeAgo(iso: string | Date, locale: 'es' | 'en' = 'es'): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.round(ms / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (locale === 'es') {
    if (sec < 60) return 'ahora';
    if (min < 60) return `hace ${min} min`;
    if (hr < 24) return `hace ${hr} h`;
    if (day < 7) return `hace ${day} d`;
    return new Date(iso).toLocaleDateString('es-ES');
  }
  if (sec < 60) return 'now';
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString('en-GB');
}

export function greeting(date = new Date()): 'goodMorning' | 'goodAfternoon' | 'goodEvening' {
  const h = date.getHours();
  if (h < 12) return 'goodMorning';
  if (h < 19) return 'goodAfternoon';
  return 'goodEvening';
}
