import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

# Dodajemo putanju do backend foldera
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# 1. UVOZ MODELA I ŠEMA (Osnova)
from app_models.models import db, ma, User

app = Flask(__name__)

# Poboljšan CORS - jako bitno za ERR_CONNECTION_RESET
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

bcrypt = Bcrypt(app)

# 2. KONFIGURACIJA
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elab_user:elab_password@db:5432/github_stats'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 3. INICIJALIZACIJA
db.init_app(app)
ma.init_app(app)
migrate = Migrate(app, db)

# 4. TEK SADA REGISTRUJEMO BLUEPRINTOVE (Izbegavamo Circular Import)
from routes.auth_routes import auth_bp
from routes.search_routes import search_bp
from routes.repository_routes import repo_bp
from routes.watchlist_routes import watchlist_bp
from routes.activity_routes import activity_bp

app.register_blueprint(auth_bp)
app.register_blueprint(search_bp)
app.register_blueprint(repo_bp)
app.register_blueprint(watchlist_bp)
app.register_blueprint(activity_bp)

with app.app_context():
    db.create_all()

# --- RUTE ---

@app.route('/')
def home():
    return "<h1>Docker Postgres je online!</h1>"

@app.route('/dodaj-nas')
def dodaj_nas():
    try:
        db.session.query(User).delete()
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