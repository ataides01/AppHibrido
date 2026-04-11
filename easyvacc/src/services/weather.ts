/** Clima com Open-Meteo (sem chave de API). */
export type WeatherNow = {
  temperature: number;
  weathercode: number;
  windspeed: number;
};

const WMO: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Pred. limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina',
  51: 'Garoa leve',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  80: 'Pancadas de chuva',
  95: 'Trovoadas',
};

export function weatherLabel(code: number): string {
  return WMO[code] ?? 'Condições variáveis';
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherNow | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number; wind_speed_10m: number };
  };
  return {
    temperature: json.current.temperature_2m,
    weathercode: json.current.weather_code,
    windspeed: json.current.wind_speed_10m,
  };
}

/** Referência: centro de Saquarema, RJ (Open-Meteo). */
const SAQUAREMA_LAT = -22.9205;
const SAQUAREMA_LNG = -42.5103;

export async function fetchWeatherSaquaremaRJ(): Promise<WeatherNow | null> {
  return fetchWeather(SAQUAREMA_LAT, SAQUAREMA_LNG);
}
