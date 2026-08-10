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

```
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

```
GITHUB_TOKEN=vas_github_token
```

Fajl `.env` je isključen iz verzionisanja (`.gitignore`) i token se ne čuva u izvornom kodu.

## Pokretanje pomoću Docker-a (preporučeno)

Iz root foldera projekta:

```
docker-compose up --build
```

Podižu se tri kontejnera: PostgreSQL baza, Flask backend i React frontend.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

Zaustavljanje: `Ctrl+C`, odnosno `docker-compose down`.

## Lokalno pokretanje

### 1. Baza podataka

Najjednostavnije je pokrenuti samo bazu iz docker-compose-a:

```
docker-compose up db
```

Alternativno se može koristiti lokalna PostgreSQL instalacija, uz odgovarajuću izmenu konekcionog stringa (promenljiva okruženja `DATABASE_URL`).

### 2. Backend (novi terminal)

```
cd backend
python -m venv venv
venv\Scripts\activate        # Windows (Linux/macOS: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```

Backend se pokreće na http://localhost:5000. Konekcija na bazu se čita iz promenljive okruženja `DATABASE_URL`; ako nije postavljena, podrazumevano se koristi lokalna baza na `localhost:5432`.

### 3. Frontend (novi terminal)

```
cd frontend
npm install
npm start
```

Frontend se pokreće na http://localhost:3000.

## Autori

- Una Stanković 2022/0328
- Anja Stanišić 0175/2022