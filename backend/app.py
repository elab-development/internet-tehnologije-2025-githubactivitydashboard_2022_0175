import sys
import os

# Dodajemo putanju do backend foldera u Python sistem
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

# 1. UVOZ MODELA I ŠEMA (Pazi na putanje!)
from app_models.models import db, ma, User  # Uvozimo i 'ma' koji smo dodali u app_models.py
from schemas.user_schema import user_schema, users_schema

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# 2. KONFIGURACIJA
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elab_user:elab_password@db:5432/github_stats'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 3. INICIJALIZACIJA (Sada uključujemo i Marshmallow)
db.init_app(app)
ma.init_app(app)  # OVO povezuje tvoje šeme sa Flask aplikacijom
migrate = Migrate(app, db)


# --- RUTE ---

@app.route('/')
def home():
    return "<h1>Docker Postgres je online! Arhitektura je spremna.</h1>"


@app.route('/dodaj-nas')
def dodaj_nas():
    try:
        db.session.query(User).delete()
        pw = bcrypt.generate_password_hash('123').decode('utf-8')
        db.session.add(User(username='Anja', email='anja@example.com', password=pw, role='Admin'))
        db.session.add(User(username='Una', email='una@example.com', password=pw, role='Korisnik'))
        db.session.commit()
        return "Anja (Admin) i Una (Korisnik) uspešno upisane!"
    except Exception as e:
        db.session.rollback()
        return f"Greška: {e}"


@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Korisnik već postoji!"}), 400

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_pw,
        role='Korisnik'
    )
    db.session.add(new_user)
    db.session.commit()

    # Koristimo DTO (user_schema) da vratimo podatke BEZ lozinke
    return user_schema.jsonify(new_user), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        # Ovde bi sutra mogli da vratimo user_schema.dump(user)
        # da React dobije i email, id, itd.
        return jsonify({"message": "Uspešan login!", "role": user.role, "user_id": user.user_id}), 200

    return jsonify({"message": "Pogrešni podaci!"}), 401


@app.route('/api/users', methods=['GET'])
def get_users():
    all_users = User.query.all()
    # users_schema (množina) automatski pretvara listu objekata u listu JSON-ova
    return users_schema.jsonify(all_users)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)