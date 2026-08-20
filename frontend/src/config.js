// CRA čita samo varijable okruženja sa prefiksom REACT_APP_
const ENV_URL = process.env.REACT_APP_API_URL;

// Ako varijabla postoji koristi nju, u suprotnom direktno Render URL (produkcija)
export const API_URL = ENV_URL || 'https://github-dashboard-backend-t8do.onrender.com';