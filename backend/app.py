import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

# Dodajemo putanju do backend foldera
sys.path.append(os.path.abspath(os.path.dirname(__file__))) #osigurava da Python vidi sve moje foldere,
#bez ovoga flask bi izbacivao ModuleNotFoundError

# 1. UVOZ MODELA I ŠEMA (Osnova)
from app_models.models import db, ma, User

app = Flask(__name__)

# Cors omogucava da ako react radi na portu 3000, a Flask na 5000 se obezbedi komunikacija.
#Pregledači (browsers) blokiraju komunikaciju između različitih portova iz bezbednosnih razloga, pa smo pomoću
# flask-cors dozvolili našem frontendu da bezbedno poziva API.
CORS(app, resources={r"/*": {
    "origins": "*", #bilo koji sajt moze da uputi zahtev mom serveru
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

# 2. KONFIGURACIJA
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elab_user:elab_password@db:5432/github_stats'
#bkv gps do naseg servera, govori Flasku gde se nalazi nasa baza i kako da udjemo u nju
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#omogucava brzi rad baze

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

@app.route('/dodaj-nas') #inicijalizacija sistema i admina
def dodaj_nas():
    try:
        db.session.query(User).delete()
        pw = bcrypt.generate_password_hash('123').decode('utf-8') #hesujemo lozinku radi bezbednosti
        db.session.add(User(username='Anja', email='anja@example.com', password=pw, role='Admin'))
        db.session.add(User(username='Una', email='una@example.com', password=pw, role='User'))
        db.session.commit()
        return "Anja (Admin) i Una (Korisnik) uspešno upisane!"
    except Exception as e:
        db.session.rollback()
        return f"Greška: {e}"

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all() #uzmi sve zapise iz tabele User
    #biramo informacije koje ce se prikazati
    user_list = [{"id": u.user_id, "username": u.username, "role": u.role} for u in users]
    return jsonify(user_list) #pakujemo u json format

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
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
def update_user(user_id):
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
# Zašto za Docker: Pošto tvoj React frontend i Flask backend žive
# u odvojenim kontejnerima (kao u odvojenim stanovima), ako bi ovde
# pisalo 127.0.0.1 (localhost), Docker kontejneri ne bi mogli da "vide"
# jedan drugog. 0.0.0.0 im omogućava da komuniciraju.

