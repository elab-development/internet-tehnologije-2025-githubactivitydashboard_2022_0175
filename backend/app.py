from flask import Flask, request, jsonify
from backend.models import db, User
from flask_cors import CORS
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)

# 1. PRVO KONFIGURACIJA
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elab_user:elab_password@127.0.0.1:5432/github_stats'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. ZATIM INICIJALIZACIJA
db.init_app(app)
migrate = Migrate(app, db)

# --- RUTE ---

@app.route('/')
def home():
    return "<h1>Docker Postgres je online!</h1>"

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({"message": "Korisnik već postoji!"}), 400

    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"Korisnik {new_user.username} je uspešno dodat!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@app.route('/dodaj-nas')
def dodaj_nas():
    try:
        db.session.query(User).delete()
        db.session.add(User(username='Anja', email='anja@example.com', password='123'))
        db.session.add(User(username='Una', email='una@example.com', password='123'))
        db.session.commit()
        return "Anja i Una uspešno upisane!"
    except Exception as e:
        db.session.rollback()
        return f"Greška: {e}"

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{"id": u.user_id, "username": u.username, "email": u.email} for u in users]
    return jsonify(user_list)

# --- POKRETANJE ---
if __name__ == '__main__':
    # Sa migracijama ti više ne treba db.create_all() ovde,
    # jer će 'flask db upgrade' to raditi profi način.
    app.run(host="0.0.0.0", port=5000, debug=True)