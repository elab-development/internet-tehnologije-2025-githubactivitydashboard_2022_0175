# GitHub Activity Dashboard

Web aplikacija za prikupljanje, analizu i vizuelni prikaz aktivnosti GitHub korisnika i repozitorijuma. Korisnik unosi naziv javnog repozitorijuma (format `vlasnik/repozitorijum`, npr. `facebook/react`), nakon čega sistem preko GitHub REST API-ja preuzima nedavne događaje (commit-ovi, pull request-ovi, issue-i) i prikazuje ih hronološki na dashboard-u, uz mogućnost filtriranja po tipu događaja i korisniku. Aplikacija podržava registraciju i prijavu korisnika, kao i watchlist listu praćenih repozitorijuma.

## Tehnologije

**Frontend**
- React — komponentni prikaz dashboard-a
- React Router — navigacija između stranica
- Chart.js (react-chartjs-2) — vizuelizacija podataka (grafikoni)

**Backend**
- Python / Flask — REST API
- PyGithub — komunikacija sa GitHub REST API-jem
- Flask-SQLAlchemy — ORM za rad sa bazom
- Flask-Migrate — migracije baze podataka
- Flask-Marshmallow — serijalizacija podataka (šeme/DTO)
- Flask-Bcrypt — hashing lozinki
- Flask-CORS — komunikacija frontend–backend

**Baza podataka**
- PostgreSQL

**DevOps**
- Docker i docker-compose
- Git i GitHub

## Struktura projekta

```text
├── backend/          # Flask REST API (routes, services, schemas, app_models)
├── frontend/         # React aplikacija
└── docker-compose.yml
```

## Preduslovi

- Docker Desktop (za pokretanje pomoću Docker-a, odnosno baze pri lokalnom pokretanju)
- Python 3.x (za lokalno pokretanje backend-a)
- Node.js LTS (za lokalno pokretanje frontend-a)
- GitHub Personal Access Token

Pre pokretanja kreirati fajl `backend/.env` sa sadržajem:

```env
GITHUB_TOKEN=vas_github_token
```

Fajl `.env` je isključen iz verzionisanja (`.gitignore`) i token se ne čuva u izvornom kodu.

## Pokretanje pomoću Docker-a (preporučeno)

Iz root foldera projekta:

```bash
docker-compose up --build
```

Podižu se tri kontejnera: PostgreSQL baza, Flask backend i React frontend.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

Zaustavljanje: `Ctrl+C`, odnosno `docker-compose down`.

## Lokalno pokretanje

### 1. Baza podataka

Najjednostavnije je pokrenuti samo bazu iz docker-compose-a:

```bash
docker-compose up db
```

Alternativno se može koristiti lokalna PostgreSQL instalacija, uz odgovarajuću izmenu konekcionog stringa (promenljiva okruženja `DATABASE_URL`).

### 2. Backend (novi terminal)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows (Linux/macOS: source venv/bin/activate)
pip install -r backend\requirements.txt
python app.py
```

Backend se pokreće na http://localhost:5000. Konekcija na bazu se čita iz promenljive okruženja `DATABASE_URL`; ako nije postavljena, podrazumevano se koristi lokalna baza na `localhost:5432`.

### 3. Frontend (novi terminal)

```bash
cd frontend
npm install
npm start
```

Frontend se pokreće na http://localhost:3000.

## Bezbednost

Aplikacija uključuje osnovne zaštitne mehanizme: zaštitu od SQL injection napada (Flask-SQLAlchemy ORM i parametrizovani upiti), zaštitu od XSS-a (React JSX auto-escaping i sanitizacija unosa), restriktivno konfigurisan CORS (dozvoljeni domeni, metode i zaglavlja), kao i čuvanje svih tajni (API ključevi, lozinke baze, JWT tajna) isključivo kroz promenljive okruženja.

## Autori

- Una Stanković 0328/2022
- Anja Stanišić 0175/2022