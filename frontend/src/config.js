// Proverava sve moguće nazive varijabli okruženja
const ENV_URL =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL);

// Ako varijabla postoji koristi nju, u suprotnom direktno stavi Render URL u produkciji
export const API_URL = ENV_URL || 'https://github-dashboard-backend-t8do.onrender.com';