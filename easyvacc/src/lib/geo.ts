import type { Posto } from '@/types/models';

/** Distância em km entre dois pontos (fórmula de Haversine). */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

export function mapsDirectionsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
}

export function mapsSearchUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function findNearestPosto(
  lat: number,
  lng: number,
  postos: Posto[]
): { posto: Posto; km: number } | null {
  if (postos.length === 0) return null;
  let best: { posto: Posto; km: number } | null = null;
  for (const p of postos) {
    const km = distanceKm(lat, lng, p.lat, p.lng);
    if (!best || km < best.km) best = { posto: p, km };
  }
  return best;
}
