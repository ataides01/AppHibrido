import * as Location from 'expo-location';

import type { ViaCepResponse } from '@/services/viacep';

function buildAddressLine(data: ViaCepResponse): string {
  const parts = [data.logradouro, data.bairro, data.localidade, data.uf, 'Brasil'].filter(
    (p) => p && String(p).trim().length > 0
  );
  return parts.join(', ');
}

/** Geocodificação aproximada a partir do retorno do ViaCEP (sem coordenadas no JSON). */
export async function geocodeFromViaCep(data: ViaCepResponse): Promise<{ lat: number; lng: number } | null> {
  const line = buildAddressLine(data);
  if (!data.localidade || !data.uf) return null;

  try {
    const r = await Location.geocodeAsync(line);
    const first = r?.[0];
    if (first != null && Number.isFinite(first.latitude) && Number.isFinite(first.longitude)) {
      return { lat: first.latitude, lng: first.longitude };
    }
  } catch {
    /* web ou indisponível */
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.localidade)}&count=10&language=pt&countryCode=BR`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      results?: { name: string; latitude: number; longitude: number }[];
    };
    const results = json.results ?? [];
    const ln = data.localidade.toLowerCase().trim();
    const match =
      results.find((x) => (x.name ?? '').toLowerCase().trim() === ln) ??
      results.find((x) => (x.name ?? '').toLowerCase().includes(ln)) ??
      results[0];
    if (match && Number.isFinite(match.latitude) && Number.isFinite(match.longitude)) {
      return { lat: match.latitude, lng: match.longitude };
    }
  } catch {
    return null;
  }

  return null;
}
