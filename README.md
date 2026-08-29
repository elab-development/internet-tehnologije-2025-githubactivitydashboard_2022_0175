# GitHub Activity Dashboard

Web aplikacija za prikupljanje, analizu i vizuelni prikaz aktivnosti GitHub
korisnika i repozitorijuma. Korisnik unosi naziv javnog repozitorijuma
(format `vlasnik/repozitorijum`, npr. `facebook/react`) ili GitHub korisničko
ime, nakon čega sistem preko GitHub REST API-ja preuzima podatke i prikazuje
ih na dashboard-u — hronološki feed aktivnosti (commit-ovi, pull request-ovi,
issue-i), statistiku kontributora i vizuelizacije. Aplikacija podržava
registraciju i prijavu korisnika, watchlist listu praćenih repozitorijuma,
istoriju pretraga i administratorski panel za upravljanje korisnicima.

## Funkcionalnosti

- **Pretraga** GitHub korisnika i repozitorijuma
- **Repo dashboard** — osnovni podaci o repozitorijumu (zvezdice, jezik, open issues), feed aktivnosti sa filterima po tipu događaja i autoru, detalji pojedinačnog commit-a
- **Kontributori** — top 10 kontributora po broju commit-ova (bar grafikon)
- **Vizuelizacije** (Chart.js) — raspodela aktivnosti po tipu događaja (doughnut) i raspodela programskih jezika u repozitorijumu (pie)
- **Watchlist** — praćenje/otpraćivanje repozitorijuma, sa Telegram notifikacijom pri zapraćivanju
- **Istorija pretraga** — čuva se po ulogovanom korisniku
- **Autentifikacija** — registracija, prijava, JWT token; uloge `User` i `Admin`
- **Admin panel** — pregled, preimenovanje i brisanje korisnika (samo za administratore)

## Tehnologije

**Frontend**
- React 18, React Router 7 — komponentni prikaz i navigacija
- Chart.js / react-chartjs-2 — grafikoni
- Jest + React Testing Library — unit/komponentni testovi
- Playwright — E2E testovi

**Backend**
- Python / Flask 3 — REST API
- Flask-SQLAlchemy + Flask-Migrate — ORM i migracije baze
- Flask-Marshmallow — serijalizacija (šeme)
- Flask-Bcrypt — hashing lozinki
- PyJWT — JWT autentifikacija
- Flasgger — Swagger/OpenAPI dokumentacija
- PyGithub / requests — komunikacija sa GitHub REST API-jem
- Flask-CORS — komunikacija frontend–backend
- pytest — testovi (backend)
- Gunicorn — produkcioni WSGI server

**Baza podataka**
- PostgreSQL

**Integracije**
- GitHub REST API (podaci o korisnicima, repozitorijumima, aktivnostima)
- Telegram Bot API (notifikacije pri zapraćivanju repozitorijuma)

**DevOps**
- Docker i docker-compose (lokalni razvoj — tri odvojena kontejnera)
- Višefazni (multi-stage) root `Dockerfile` — kombinovani build za produkciju (React build servira se kao statika iz Flask-a)
- GitHub Actions — CI/CD pipeline
- Render — hosting (odvojeni frontend i backend servisi)

## Struktura projekta

```text
├── backend/
│   ├── app.py                # Flask aplikacija, inicijalizacija, Swagger config
│   ├── app_models/           # SQLAlchemy modeli (User, Repository, Activity, ...)
│   ├── routes/                # Flask blueprints (auth, search, repository, activity, watchlist)
│   ├── services/              # Poslovna logika (GitHub API, baza, Telegram)
│   ├── schemas/                # Marshmallow šeme za serijalizaciju
│   ├── utils/                  # Auth dekoratori (JWT)
│   ├── tests/                  # pytest testovi
│   ├── docs/                   # Swagger/OpenAPI dokumentacija (statička kopija)
│   ├── seed_admins.py          # Skripta za (re)kreiranje glavnih admin naloga
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── views/               # Stranice (Home, RepoView, UserView, AdminView, ContributorsView)
│   │   ├── components/          # UI komponente (Login, SearchBox, ActivityFeed, ActivityCharts, ...)
│   │   └── utils/                # authFetch — automatsko slanje JWT tokena
│   └── e2e/                       # Playwright E2E testovi
├── docker-compose.yml           # Lokalno pokretanje (tri kontejnera: db, backend, frontend)
├── Dockerfile                    # Kombinovani produkcioni build
└── .github/workflows/ci-cd.yml   # CI/CD pipeline
```

## Model podataka

| Tabela | Opis |
|---|---|
| `users` | Korisnici aplikacije (username, email, hash lozinke, uloga `User`/`Admin`) |
| `repositories` | Repozitorijumi na koje se aplikacija referiše |
| `activities` | Sačuvani GitHub događaji vezani za repozitorijum |
| `user_repo_follows` | Veza korisnik ↔ praćeni repozitorijum (watchlist) |
| `search_histories` | Istorija pretraga po korisniku |

## Preduslovi

- Docker Desktop (za pokretanje pomoću Docker-a)
- Python 3.10+ (za lokalno pokretanje backend-a)
- Node.js LTS (za lokalno pokretanje frontend-a)
- GitHub Personal Access Token

## Promenljive okruženja

**`backend/.env`**
```env
GITHUB_TOKEN=<tvoj_github_token>
SECRET_KEY=<duga, nasumična vrednost — koristi se za potpisivanje JWT tokena>
PORT=5000
```

**`frontend/.env`** (samo za lokalno pokretanje van produkcije — bez ovoga frontend gađa produkcioni backend na Render-u)
```env
REACT_APP_API_URL=http://localhost:5000
```

Oba `.env` fajla su isključena iz verzionisanja (`.gitignore`) — tajne se ne
čuvaju u izvornom kodu.

## Pokretanje pomoću Docker-a (preporučeno)

Iz root foldera projekta:

```bash
docker-compose up --build
```

Podižu se tri kontejnera: PostgreSQL baza, Flask backend i React frontend.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

Prvo pokretanje na praznoj bazi zahteva da se ručno kreiraju glavni admin
nalozi (videti odeljak "Inicijalni admin nalozi" ispod).

Zaustavljanje: `docker-compose down` (ne samo `Ctrl+C`, kako ne bi ostali
"zaglavljeni" kontejneri pri sledećem pokretanju).

## Lokalno pokretanje

### 1. Baza podataka

```bash
docker-compose up db
```

Alternativno se može koristiti lokalna PostgreSQL instalacija, uz
odgovarajuću izmenu konekcionog stringa (promenljiva okruženja `DATABASE_URL`).

### 2. Backend (novi terminal)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows (Linux/macOS: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```

Backend se pokreće na http://localhost:5000. Konekcija na bazu se čita iz
`DATABASE_URL`; ako nije postavljena, podrazumevano se koristi
`postgresql://elab_user:elab_password@db:5432/github_stats`.

### 3. Frontend (novi terminal)

```bash
cd frontend
npm install
npm start
```

Frontend se pokreće na http://localhost:3000.

## Inicijalni admin nalozi

Umesto javno dostupne HTTP rute (bezbednosni rizik), glavni admin nalozi
(`Anja`, `Una`) se kreiraju ručno, jednokratnom skriptom:

```bash
# lokalno
cd backend
python seed_admins.py

# ili unutar Docker kontejnera
docker compose exec backend python seed_admins.py
```

## API dokumentacija (Swagger)

REST API je dokumentovan pomoću Swagger-a (OpenAPI 2.0, biblioteka `flasgger`).
Nakon pokretanja backend-a:

- **Swagger UI** (interaktivno testiranje endpoint-a iz browsera): http://localhost:5000/apidocs/
- **OpenAPI specifikacija (JSON)**: http://localhost:5000/apispec_1.json

Deo endpoint-a je zaštićen JWT tokenom (registracija/prijava i pregled
javnih GitHub podataka su otvoreni; upravljanje korisnicima, watchlist i
lična istorija pretraga zahtevaju prijavu). U Swagger UI-ju se token unosi
preko dugmeta **Authorize** (`Bearer <token>`), dobijenog sa `/api/auth/login`.

Detaljan pregled svih endpoint-a i statička kopija specifikacije:
[`backend/docs/API_DOCUMENTATION.md`](./backend/docs/API_DOCUMENTATION.md)

## Autentifikacija i autorizacija

- Lozinke se čuvaju hashovane (Flask-Bcrypt), nikad u čistom tekstu.
- Prijava vraća JWT token koji frontend čuva i automatski prilaže na
  zaštićene zahteve (`utils/authFetch.js`).
- Uloge: `User` i `Admin`. Upravljanje korisnicima (`/api/users/*`) je
  ograničeno isključivo na administratore; watchlist i istorija pretraga su
  ograničeni na vlasnika naloga (ili administratora).
- Pretraga i pregled javnih GitHub podataka (repozitorijumi, kontributori,
  aktivnosti) ostaju dostupni i neulogovanim korisnicima.

## Testiranje

**Backend (pytest, 65 testova)**
```bash
cd backend
pip install -r requirements-test.txt
pytest -v
```

**Frontend — unit/komponentni testovi (Jest, 14 testova)**
```bash
cd frontend
npm test -- --watchAll=false
```

**Frontend — E2E testovi (Playwright, 6 scenarija)**
```bash
cd frontend
npx playwright install --with-deps chromium
npm run test:e2e
```

## CI/CD

Definisano u `.github/workflows/ci-cd.yml`, okida se na push (grane `main`,
`develop`, `feature/**`) i na pull request ka `main`/`develop`:

1. **Backend Tests (Python)** — instalacija zavisnosti, pokretanje pytest testova
2. **Frontend Tests & Build** — Jest testovi, Playwright E2E testovi, provera produkcionog build-a
3. **Build Docker Container** — provera da se Docker image uspešno gradi (pokreće se samo ako prethodna dva posla prođu)
4. **Deploy to Render Cloud** — samo za push na `main`; okida Render deploy hook-ove za backend i frontend

## Bezbednost

Aplikacija uključuje: zaštitu od SQL injection napada (Flask-SQLAlchemy ORM
i parametrizovani upiti), zaštitu od XSS-a (React JSX auto-escaping),
restriktivno konfigurisan CORS (dozvoljeni domeni, metode i zaglavlja), JWT
autentifikaciju sa razdvojenim ulogama (`User`/`Admin`), hashovanje lozinki,
i čuvanje svih tajni (API ključevi, lozinke baze, JWT tajna) isključivo kroz
promenljive okruženja, van verzionisanog koda.

## Autori

- Una Stanković 0328/2022
- Anja Stanišić 0175/2022
