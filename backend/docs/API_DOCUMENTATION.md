# API dokumentacija — GitHub Activity Dashboard

Backend (Flask) API je dokumentovan pomoću **Swagger-a** (OpenAPI 2.0
specifikacija), preko Python biblioteke [flasgger](https://github.com/flasgger/flasgger).
Flasgger iz YAML anotacija napisanih u docstring-u svake rute automatski
generiše OpenAPI specifikaciju i interaktivni Swagger UI — nema potrebe da
se specifikacija održava ručno, odvojeno od koda.

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

## Autentifikacija u Swagger UI-ju (JWT Bearer token)

Pošto je API zaštićen JWT tokenima (vidi tabelu ispod — kolona "Auth"),
Swagger UI ima **"Authorize" dugme** (katanac, gore desno) preko kog se
token unosi jednom i automatski prilaže na sve zahteve koje testiraš iz
UI-ja:

1. Pozovi `POST /api/auth/login` direktno iz Swagger UI-ja (dugme "Try it out"),
   sa validnim korisničkim imenom i lozinkom.
2. Iz odgovora kopiraj vrednost polja `"token"`.
3. Klikni **Authorize**, unesi `Bearer <token>` (sa prefiksom `Bearer ` i razmakom),
   potvrdi.
4. Od tog trenutka, sve zaštićene rute (označene katancem pored naziva u UI-ju)
   automatski nose taj token u `Authorization` header-u.

Ovo je definisano u `app.py` kroz `securityDefinitions` u `swagger_template`:

```python
"securityDefinitions": {
    "Bearer": {
        "type": "apiKey",
        "name": "Authorization",
        "in": "header",
        "description": "Unesi 'Bearer <token>' ..."
    }
}
```

Svaka zaštićena ruta u svom YAML docstring-u ima:
```yaml
security:
  - Bearer: []
```
što flasgger-u govori da tu rutu u Swagger UI-ju prikaže sa katancem i
zahteva token pre testiranja.

## Statička kopija specifikacije

Pošto se specifikacija generiše na osnovu koda, u ovom folderu se nalazi i
**statička kopija** trenutne verzije specifikacije (generisana pokretanjem
aplikacije), radi arhiviranja i uvida bez pokretanja servera:

- [`openapi.json`](./openapi.json)
- [`openapi.yaml`](./openapi.yaml)

Ako se rute u budućnosti promene, ovi fajlovi se mogu ponovo generisati
pokretanjem aplikacije i preuzimanjem sadržaja sa `/apispec_1.json`, npr.:

```bash
curl http://localhost:5000/apispec_1.json -o backend/docs/openapi.json
```

## Pregled endpoint-a

Kolona **Auth** označava da li ruta zahteva prijavu (🔒 = zahteva validan
JWT Bearer token, poslat kroz `Authorization: Bearer <token>` header;
🔓 = javno dostupno, bez prijave).

| Tag | Endpoint | Metoda | Auth | Opis |
|---|---|---|---|---|
| Auth | `/api/auth/register` | POST | 🔓 | Registracija novog korisnika |
| Auth | `/api/auth/login` | POST | 🔓 | Prijava korisnika (vraća JWT token) |
| Users | `/api/users` | GET | 🔒 Admin | Lista svih korisnika |
| Users | `/api/users/{user_id}` | PUT | 🔒 Admin | Izmena korisničkog imena |
| Users | `/api/users/{user_id}` | DELETE | 🔒 Admin | Brisanje korisnika |
| Search | `/api/search/repositories` | POST | 🔓 | Pretraga GitHub korisnika (logovanje istorije samo ako je token poslat) |
| Search | `/api/search/history/{user_id}` | GET | 🔒 Vlasnik ili Admin | Istorija pretraga korisnika |
| Repository | `/api/repository/{owner}/{repo_name}` | GET | 🔓 | Detalji repozitorijuma |
| Repository | `/api/repository/{owner}/{repo_name}/languages` | GET | 🔓 | Programski jezici repozitorijuma (za grafikon) |
| Repository | `/api/contributors/{owner}/{repo_name}` | GET | 🔓 | Kontributori repozitorijuma |
| Repository (live) | `/api/repository/details` | POST | 🔓 | Detalji repozitorijuma uživo, sa opcionim logovanjem |
| Activity | `/api/activity/list` | POST | 🔓 | Lista aktivnosti za repozitorijum |
| Activity | `/api/activity/details/{owner}/{repo}/{sha}` | GET | 🔓 | Detalji commit-a |
| Watchlist | `/api/history` | GET | 🔒 | Istorija pretraga ulogovanog korisnika |
| Watchlist | `/api/following` | GET | 🔒 | Praćeni repozitorijumi ulogovanog korisnika |
| Watchlist | `/api/watchlist/follow` | POST | 🔒 | Dodavanje repozitorijuma u praćene |
| Watchlist | `/api/watchlist/unfollow` | DELETE | 🔒 | Uklanjanje repozitorijuma iz praćenih |

Ukupno: **16 endpoint-a**, od čega **8 javnih** i **8 zaštićenih** JWT tokenom.

## Implementacija

<<<<<<< feature/swagger
- Biblioteka: `flasgger==0.9.7.1` (dodata u `requirements.txt`).
- Inicijalizacija: `backend/app.py`, gde je definisan `swagger_template`
  (naslov, opis, verzija, tagovi) i pozvano `Swagger(app, template=swagger_template)`.
=======
- Biblioteka: `flasgger==0.9.7.1` (u `backend/requirements.txt`).
- Inicijalizacija: `backend/app.py` — definisan `swagger_template` (naslov,
  opis, verzija, tagovi, `securityDefinitions` za Bearer token) i pozvano
  `Swagger(app, template=swagger_template)`.
>>>>>>> local
- Svaka ruta u `backend/routes/*.py` i u `backend/app.py` ima YAML docstring
  (odvojen sa `---`) koji opisuje tagove, parametre, moguće odgovore i
  (za zaštićene rute) `security: - Bearer: []` — flasgger to čita i
  pretvara u Swagger specifikaciju automatski, bez potrebe za ručnim
  pisanjem odvojenog spec fajla.
- Zaštita ruta se sprovodi kroz `@token_required` / `@admin_required`
  dekoratore iz `backend/utils/auth_utils.py` — Swagger dokumentacija
  (`security:` u docstring-u) prati stvarno stanje zaštite u kodu, ali se
  ne generiše automatski iz dekoratora, već se ručno dodaje uz svaku
  zaštićenu rutu (bitno je da ostanu usklađeni kad se ruta menja).
