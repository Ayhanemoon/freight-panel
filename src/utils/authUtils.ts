export const isTokenExpired = (expirationDate: string | null): boolean => {
  if (!expirationDate) return true;
  const now = new Date();
  const expiration = new Date(expirationDate);
  return now >= expiration;
};