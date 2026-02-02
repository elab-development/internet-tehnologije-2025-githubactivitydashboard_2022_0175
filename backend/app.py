from flask import Flask, request, jsonify
from models import db, User
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt  # Dodaj ovo

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)  # Dodaj ovo

# 1. KONFIGURACIJA (Sada je ispravna za Docker)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elab_user:elab_password@db:5432/github_stats'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. INICIJALIZACIJA
db.init_app(app)
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
        pw = bcrypt.generate_password_hash('123').decode('utf-8')
        # Vas dve postavljamo kao Admine
        db.session.add(User(username='Anja', email='anja@example.com', password=pw, role='Admin'))
        db.session.add(User(username='Una', email='una@example.com', password=pw, role='Admin'))
        db.session.commit()
        return "Admini (Anja i Una) su spremni!"
    except Exception as e:
        return f"Greška: {e}"


@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Korisnik već postoji!"}), 400

    # Koristimo bcrypt za lozinku
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_pw,
        role='User'
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Uspešna registracija!"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    # Provera hešovane lozinke
    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({
            "message": "Uspešan login!",
            "role": user.role,
            "username": user.username  # <--- OVO DODAJ
        }), 200

    return jsonify({"message": "Pogrešni podaci!"}), 401


# Tvoja stara ruta za pregled usera ostaje ista
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{"id": u.user_id, "username": u.username, "role": u.role} for u in users]
    return jsonify(user_list)

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Korisnik nije pronađen"}), 404


    if user.username in ['Anja','Una'] :
        return jsonify({"message": "Ne možete obrisati glavnog admina!"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"Korisnik {user.username} je obrisan"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)