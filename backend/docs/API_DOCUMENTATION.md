# API dokumentacija — GitHub Activity Dashboard

Backend (Flask) API je dokumentovan pomoću **Swagger-a** (kroz biblioteku
[flasgger](https://github.com/flasgger/flasgger)), koja iz YAML anotacija
napisanih u docstring-u svake rute automatski generiše OpenAPI (Swagger 2.0)
specifikaciju i interaktivni Swagger UI.

## Kako pokrenuti i pregledati dokumentaciju

1. Pokrenuti backend (lokalno ili preko Dockera, npr. `docker-compose up`).
2. Otvoriti u browseru:

    - **Swagger UI** (interaktivna dokumentacija, testiranje endpoint-a direktno iz browsera):
      `http://localhost:5000/apidocs/`
    - **Sirova OpenAPI specifikacija (JSON)**:
      `http://localhost:5000/apispec_1.json`

Swagger UI prikazuje sve endpoint-e grupisane po tagovima (`Auth`, `Users`,
`Search`, `Repository`, `Watchlist`, `Activity`), sa opisom parametara,
tela zahteva (request body) i mogućih odgovora (response kodova).

## Statička kopija specifikacije

Pošto se specifikacija generiše na osnovu koda, u ovom folderu se nalazi i
**statička kopija** trenutne verzije specifikacije (generisana pokretanjem
aplikacije), radi arhiviranja i uvida bez pokretanja servera:

- [`openapi.json`](./openapi.json)
- [`openapi.yaml`](./openapi.yaml)

Ako se rute u budućnosti promene, ovi fajlovi se mogu ponovo generisati
pokretanjem aplikacije i preuzimanjem sadržaja sa `/apispec_1.json`.

## Pregled endpoint-a

| Tag | Endpoint | Metoda | Opis |
|---|---|---|---|
| Auth | `/api/auth/register` | POST | Registracija novog korisnika |
| Auth | `/api/auth/login` | POST | Prijava korisnika |
| Users | `/api/users` | GET | Lista svih korisnika |
| Users | `/api/users/{user_id}` | PUT | Izmena korisničkog imena |
| Users | `/api/users/{user_id}` | DELETE | Brisanje korisnika |
| Search | `/api/search/repositories` | POST | Pretraga GitHub korisnika |
| Search | `/api/search/history/{user_id}` | GET | Istorija pretraga korisnika |
| Repository | `/api/repository/{owner}/{repo_name}` | GET | Detalji repozitorijuma |
| Repository | `/api/contributors/{owner}/{repo_name}` | GET | Kontributori repozitorijuma |
| Repository (live) | `/api/repository/details` | POST | Detalji repozitorijuma (uživo), sa opcionim logovanjem |
| Activity | `/api/activity/list` | POST | Lista aktivnosti za repozitorijum |
| Activity | `/api/activity/details/{owner}/{repo}/{sha}` | GET | Detalji commit-a |
| Watchlist | `/api/history` | GET | Istorija pretraga (query param) |
| Watchlist | `/api/following` | GET | Praćeni repozitorijumi |
| Watchlist | `/api/watchlist/follow` | POST | Dodavanje repozitorijuma u praćene |
| Watchlist | `/api/watchlist/unfollow` | DELETE | Uklanjanje repozitorijuma iz praćenih |

## Implementacija

- Biblioteka: `flasgger==0.9.7.1` (dodata u `requirements.txt`).
- Inicijalizacija: `backend/app.py`, gde je definisan `swagger_template`
  (naslov, opis, verzija, tagovi) i pozvano `Swagger(app, template=swagger_template)`.
- Svaka ruta u `backend/routes/*.py` i u `backend/app.py` ima YAML docstring
  (odvojen sa `---`) koji opisuje tagove, parametre i moguće odgovore —
  flasgger to čita i pretvara u Swagger specifikaciju automatski, bez
  potrebe za ručnim pisanjem odvojenog spec fajla.
