/** Senha provisória legível (demo local — em produção viria por e-mail seguro). */
export function generateProvisionalPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 10; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `Tmp_${s}`;
}
