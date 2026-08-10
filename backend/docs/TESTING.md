# Automatizovani testovi — backend

Testovi su pisani u **pytest**-u i nalaze se u `backend/tests/`.

## Instalacija test zavisnosti

```bash
cd backend
pip install -r requirements-test.txt
```

## Pokretanje testova

```bash
cd backend
pytest
```

Sa detaljnim prikazom i coverage izveštajem:

```bash
pytest -v --cov=. --cov-report=term-missing
```

## Kako testovi rade

- **Nema potrebe za pokrenutim Postgres serverom.** `tests/conftest.py`
  pre uvoza `app.py` postavlja `DATABASE_URL=sqlite:///:memory:`, pa se
  aplikacija u testovima povezuje na SQLite bazu u memoriji umesto na
  pravu Postgres bazu (`app.py` je zbog toga izmenjen da čita
  `SQLALCHEMY_DATABASE_URI` iz `DATABASE_URL` env promenljive, sa
  fallback-om na staru Postgres konekciju ako promenljiva nije podešena
  — produkcijsko ponašanje ostaje nepromenjeno).
- Pre i posle svakog testa baza se kreira/briše ispočetka (`db.create_all()`
  / `db.drop_all()`), tako da su testovi potpuno izolovani jedni od drugih.
- Pozivi ka pravom GitHub API-ju (`GitHubService.*`) su **mockovani**
  pomoću `unittest.mock.patch`, tako da testovi ne zavise od interneta,
  GitHub tokena ili rate-limit-a, i rade brzo i predvidivo.

## Struktura testova

| Fajl | Šta testira |
|---|---|
| `test_users.py` | `GET/PUT/DELETE /api/users` — listanje, izmena imena, brisanje, zaštita glavnog admina |
| `test_auth.py` | `POST /api/auth/register`, `POST /api/auth/login` — registracija, duplikati, pogrešna lozinka |
| `test_watchlist.py` | `follow/unfollow`, `/api/following`, `/api/history` |
| `test_search.py` | `POST /api/search/repositories`, `GET /api/search/history/<id>` (GitHub pozivi mockovani) |
| `test_repository.py` | `GET /api/repository/<owner>/<repo>`, `GET /api/contributors/<owner>/<repo>` (GitHub pozivi mockovani) |
| `test_activity.py` | `POST /api/repository/details`, `POST /api/activity/list`, `GET /api/activity/details/...` (GitHub pozivi mockovani) |
| `test_github_service.py` | Čista logika filtriranja u `GitHubService.get_repo_events` (filter po tipu događaja i po autoru), parsiranje URL-a u `get_repo_details` |

Trenutno: **45 testova**, svi prolaze, ~89% pokrivenosti koda (`pytest --cov`).