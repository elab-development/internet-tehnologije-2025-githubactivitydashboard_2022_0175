import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flasgger import Swagger

# Dodajemo putanju do backend foldera
sys.path.append(os.path.abspath(os.path.dirname(__file__))) #osigurava da Python vidi sve moje foldere,
#bez ovoga flask bi izbacivao ModuleNotFoundError

# 1. UVOZ MODELA I ŠEMA (Osnova)
from app_models.models import db, ma, User

app = Flask(__name__)


ALLOWED_ORIGINS = [
    os.environ.get('FRONTEND_URL', 'http://localhost:3000'),
    "https://github-dashboard-frontend-cgdz.onrender.com"
]

CORS(app, resources={r"/api/*": {
    "origins": ALLOWED_ORIGINS,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})
# React (Frontend) šalje paket: Kada klikneš na "Dugme", React spakuje podatke (npr. username i password) u jedan format koji se zove JSON. To zamisli kao providnu kutiju gde su podaci lepo poređani.
#
# Nalepnica (Content-Type): React na taj paket obavezno zalepi nalepnicu na kojoj piše: application/json.
#
# Flask (Backend) prima paket: Kada paket stigne kod Flaska, on prvo pogleda tu nalepnicu.
#
# Ako vidi application/json, on kaže: "Aha, ovo je JSON! Znam kako to da pročitam, koristiću komandu request.json da izvadim podatke."
#
# Ako nema nalepnice (ili je pogrešna), Flask se zbuni. Može da pomisli da je unutra običan tekst ili slika, i onda neće znati da izvuče username i password. Rezultat? Aplikacija izbaci grešku.
bcrypt = Bcrypt(app)

# Swagger / OpenAPI dokumentacija
# Flasgger čita YAML docstringove iz svake rute i od njih automatski
# generiše OpenAPI (Swagger) specifikaciju.
# Nakon pokretanja servera, specifikacija je dostupna na:
#   - Swagger UI:      http://localhost:5000/apidocs
#   - Raw JSON spec:    http://localhost:5000/apispec_1.json
app.config['SWAGGER'] = {
    'title': 'GitHub Activity Dashboard API',
    'uiversion': 3,
    'specs_route': '/apidocs/'
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "GitHub Activity Dashboard API",
        "description": "REST API za pretragu GitHub korisnika i repozitorijuma, "
                       "praćenje (watchlist) repozitorijuma i pregled aktivnosti (commits, issues, itd.).",
        "version": "1.0.0"
    },
    "basePath": "/",
    "schemes": ["http", "https"],
    "tags": [
        {"name": "Auth", "description": "Registracija i prijava korisnika"},
        {"name": "Users", "description": "Upravljanje korisnicima (admin)"},
        {"name": "Search", "description": "Pretraga GitHub korisnika i istorija pretraga"},
        {"name": "Repository", "description": "Podaci o repozitorijumima i kontributorima"},
        {"name": "Watchlist", "description": "Praćeni (followed) repozitorijumi"},
        {"name": "Activity", "description": "Aktivnosti (događaji) na repozitorijumima"}
    ],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Unesi 'Bearer <token>' (npr: Bearer eyJhbGciOi...). "
                            "Token dobijaš iz odgovora na /api/auth/login."
        }
    }
}

swagger = Swagger(app, template=swagger_template)

# 2. KONFIGURACIJA
# DATABASE_URL env promenljiva omogućava da se u testovima (i lokalno) koristi
# npr. SQLite baza umesto prave Postgres baze, bez menjanja produkcionog ponašanja
# (kad DATABASE_URL nije podešen, koristi se ista Postgres konekcija kao i do sada).
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://elab_user:elab_password@db:5432/github_stats'
)
#bkv gps do naseg servera, govori Flasku gde se nalazi nasa baza i kako da udjemo u nju
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#omogucava brzi rad baze

# Tajni ključ kojim se potpisuju JWT tokeni (login/autorizacija).
# U produkciji se čita iz env promenljive - OBAVEZNO postaviti u .env!
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-me-please')

# 3. INICIJALIZACIJA
db.init_app(app) #uzima moj objekat baze db i prikljucuje ga na moju apk app
ma.init_app(app)
migrate = Migrate(app, db) #Flask-Migrate je alat koji prati promene u tvojim tabelama.
#User sa kolonama username i password, a sutra odlučiš da dodaš
# kolonu broj_telefona. Bez Migracija, morala bi da obrišeš celu bazu
# i napraviš je ponovo (i izgubiš sve podatke!) folder migrations
#verzionisanje baze podataka. To nam omogućava da menjamo strukturu tabela bez
# gubitka postojećih podataka o korisnicima."

from routes.auth_routes import auth_bp
from routes.search_routes import search_bp
from routes.repository_routes import repo_bp
from routes.watchlist_routes import watchlist_bp
from routes.activity_routes import activity_bp
from utils.auth_utils import admin_required

app.register_blueprint(auth_bp) #rute su putanje do funkcija
app.register_blueprint(search_bp)
app.register_blueprint(repo_bp)
app.register_blueprint(watchlist_bp)
app.register_blueprint(activity_bp)
#modularnost, cist kod i lakse testiranje
with app.app_context():
    db.create_all()

# --- RUTE ---

@app.route('/')
def home():
    return "<h1>Docker Postgres je online!</h1>"

# NAPOMENA: ruta '/dodaj-nas' je uklonjena - bila je javno dostupna (GET, bez
# ikakve autentifikacije) i brisala je SVE korisnike iz baze pa upisivala
# samo Anja/Una admin naloge. Bilo ko ko zna putanju mogao je time da obriše
# celu users tabelu. Ista funkcionalnost (seed admin naloga) sada je u
# samostalnoj skripti: backend/seed_admins.py, koja se pokreće ručno,
# nikad preko HTTP zahteva.

@app.route('/api/users', methods=['GET'])
@admin_required
def get_users():
    """
    Vraća listu svih korisnika (SAMO ADMIN)
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: Lista korisnika
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1
              username:
                type: string
                example: Anja
              role:
                type: string
                example: Admin
      401:
        description: Nedostaje ili je nevalidan token
      403:
        description: Korisnik nije admin
    """
    users = User.query.all() #uzmi sve zapise iz tabele User
    #biramo informacije koje ce se prikazati
    user_list = [{"id": u.user_id, "username": u.username, "role": u.role} for u in users]
    return jsonify(user_list) #pakujemo u json format

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """
    Briše korisnika po ID-u (SAMO ADMIN)
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: ID korisnika koji se briše
    responses:
      200:
        description: Korisnik uspešno obrisan
      401:
        description: Nedostaje ili je nevalidan token
      403:
        description: Pokušaj brisanja glavnog admina (Anja/Una), ili korisnik nije admin
      404:
        description: Korisnik nije pronađen
      500:
        description: Greška na serveru
    """
    try:
        # pokusaj u bazi da pronadjes user-a
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Korisnik nije pronađen"}), 404
        if user.username in ['Anja', 'Una']:
            return jsonify({"message": "Ne možete obrisati glavnog admina!"}), 403
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"Korisnik {user.username} je obrisan"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Greška na serveru: {str(e)}"}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """
    Ažurira korisničko ime (SAMO ADMIN)
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: ID korisnika koji se menja
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            username:
              type: string
              example: NovoIme
    responses:
      200:
        description: Ime uspešno promenjeno
      400:
        description: Korisničko ime je već zauzeto
      401:
        description: Nedostaje ili je nevalidan token
      403:
        description: Korisnik nije admin
      404:
        description: Korisnik nije pronađen
      500:
        description: Greška na serveru
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Korisnik nije pronađen"}), 404
        #uzmi podatke koji je korisnik poslao iz React-a
        data = request.json

        # Logika za promenu imena
        if 'username' in data:
            # Provera da li ime već postoji kod nekog drugog
            new_name = data['username']
            existing_user = User.query.filter_by(username=new_name).first()
            if existing_user and existing_user.user_id != user_id:
                return jsonify({"message": "To korisničko ime je već zauzeto!"}), 400

            user.username = new_name

        db.session.commit()
        return jsonify({"message": f"Ime uspešno promenjeno u {user.username}"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Greška: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)