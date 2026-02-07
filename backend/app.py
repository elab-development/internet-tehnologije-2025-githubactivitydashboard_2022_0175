import sys
import os

from routes.auth_routes import auth_bp
from routes.search_routes import search_bp
from routes.repository_routes import repo_bp
from routes.watchlist_routes import watchlist_bp
from routes.activity_routes import activity_bp



# Dodajemo putanju do backend foldera u Python sistem
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

# 1. UVOZ MODELA I ŠEMA
from app_models.models import db, ma, User  # Uvozimo i 'ma' koji smo dodali u app_models.py
from schemas.user_schema import user_schema, users_schema

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
}})
bcrypt = Bcrypt(app)
# Registracija Blueprint-ova
app.register_blueprint(auth_bp)
app.register_blueprint(search_bp)
app.register_blueprint(repo_bp)
app.register_blueprint(watchlist_bp)
app.register_blueprint(activity_bp)

# 1. KONFIGURACIJA (Sada je ispravna za Docker)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elab_user:elab_password@db:5432/github_stats'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. INICIJALIZACIJA
db.init_app(app)
ma.init_app(app)  # OVO povezuje tvoje šeme sa Flask aplikacijom
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()
# --- RUTE ---

@app.route('/')
def home():
    return "<h1>Docker Postgres je online!</h1>"


# Modifikovana Anjina ruta da radi sa hešovanjem
@app.route('/dodaj-nas')
def dodaj_nas():
    try:
        db.session.query(User).delete()
        # Hešujemo lozinku "123" pre upisa u bazu
        pw = bcrypt.generate_password_hash('123').decode('utf-8')
        db.session.add(User(username='Anja', email='anja@example.com', password=pw, role='Admin'))
        db.session.add(User(username='Una', email='una@example.com', password=pw, role='User'))
        db.session.commit()
        return "Anja (Admin) i Una (Korisnik) uspešno upisane!"
    except Exception as e:
        db.session.rollback()
        return f"Greška: {e}"


@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{"id": u.user_id, "username": u.username, "role": u.role} for u in users]
    return jsonify(user_list)

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Korisnik nije pronađen"}), 404

        # Zaštita za tebe i Unu
        if user.username in ['Anja', 'Una']:
            return jsonify({"message": "Ne možete obrisati glavnog admina!"}), 403

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"Korisnik {user.username} je obrisan"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Greška na serveru: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)