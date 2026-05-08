// Weather snapshot via Open-Meteo (free, no key). Returns null on failure
// so callers can degrade silently. Cache TTL is 30 min in-memory; the
// query layer (react-query) handles persistence.
type WeatherSnapshot = {
  temperatureC: number;
  feelsLikeC: number;
  windKmh: number;
  precipitation: number;
  weatherCode: number;
  description: string;
  description_en: string;
};

const WMO: Record<number, { es: string; en: string }> = {
  0: { es: 'Despejado', en: 'Clear' },
  1: { es: 'Mayormente despejado', en: 'Mostly clear' },
  2: { es: 'Parcialmente nublado', en: 'Partly cloudy' },
  3: { es: 'Nublado', en: 'Overcast' },
  45: { es: 'Niebla', en: 'Fog' },
  48: { es: 'Niebla helada', en: 'Freezing fog' },
  51: { es: 'Llovizna ligera', en: 'Light drizzle' },
  53: { es: 'Llovizna', en: 'Drizzle' },
  55: { es: 'Llovizna densa', en: 'Heavy drizzle' },
  61: { es: 'Lluvia ligera', en: 'Light rain' },
  63: { es: 'Lluvia', en: 'Rain' },
  65: { es: 'Lluvia intensa', en: 'Heavy rain' },
  71: { es: 'Nieve ligera', en: 'Light snow' },
  73: { es: 'Nieve', en: 'Snow' },
  75: { es: 'Nieve intensa', en: 'Heavy snow' },
  80: { es: 'Chubascos', en: 'Showers' },
  81: { es: 'Chubascos fuertes', en: 'Heavy showers' },
  95: { es: 'Tormenta', en: 'Thunderstorm' },
  96: { es: 'Tormenta con granizo', en: 'Thunderstorm w/ hail' },
  99: { es: 'Tormenta intensa', en: 'Severe thunderstorm' },
};

export async function fetchWeather(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<WeatherSnapshot | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code&timezone=auto`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current?: {
        temperature_2m: number;
        apparent_temperature: number;
        wind_speed_10m: number;
        precipitation: number;
        weather_code: number;
      };
    };
    if (!json.current) return null;
    const c = json.current;
    const wmo = WMO[c.weather_code] ?? { es: 'Tiempo variable', en: 'Variable' };
    return {
      temperatureC: c.temperature_2m,
      feelsLikeC: c.apparent_temperature,
      windKmh: c.wind_speed_10m,
      precipitation: c.precipitation,
      weatherCode: c.weather_code,
      description: wmo.es,
      description_en: wmo.en,
    };
  } catch {
    return null;
  }
}

// Tomorrow's max precipitation forecast — used for "rainy day ahead" alerts.
export async function fetchTomorrowRain(
  lat: number,
  lng: number,
): Promise<{ maxPrecipitation: number; weatherCode: number } | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&daily=precipitation_sum,weather_code&forecast_days=2&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      daily?: { precipitation_sum: number[]; weather_code: number[] };
    };
    if (!json.daily?.precipitation_sum?.[1]) return null;
    return {
      maxPrecipitation: json.daily.precipitation_sum[1] ?? 0,
      weatherCode: json.daily.weather_code[1] ?? 0,
    };
  } catch {
    return null;
  }
}
