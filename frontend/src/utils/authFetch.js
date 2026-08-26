// Helper koji automatski dodaje "Authorization: Bearer <token>" header
// na svaki zahtev koji zahteva login (watchlist, istorija pretraga, admin panel).
//
// Token se čita direktno iz localStorage ('userSession'), tako da komponente
// ne moraju da ga prosleđuju kroz props - dovoljno je da su ulogovane.

export function getToken() {
  const saved = localStorage.getItem('userSession');
  if (!saved) return null;
  try {
    return JSON.parse(saved).token || null;
  } catch {
    return null;
  }
}

/**
 * Isto kao obican fetch(), samo automatski doda Authorization header
 * ako postoji token ulogovanog korisnika.
 */
export async function authFetch(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers });
}