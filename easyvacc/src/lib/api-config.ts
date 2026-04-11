/**
 * Defina `EXPO_PUBLIC_API_URL` no `.env` na raiz do app (ex.: `http://127.0.0.1:3333`).
 * Android emulador: `http://10.0.2.2:3333`. Celular na mesma rede: IP da máquina.
 * Sem essa variável, o app usa só armazenamento local (modo offline).
 */
export function getApiBaseUrl(): string | null {
  const u = process.env.EXPO_PUBLIC_API_URL;
  if (typeof u === 'string' && u.trim().length > 0) {
    return u.replace(/\/$/, '');
  }
  return null;
}

export function isApiMode(): boolean {
  return getApiBaseUrl() !== null;
}
