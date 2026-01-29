from flask import Flask, jsonify
from models import db, User, Repository  # Uvozimo bazu i modele iz Uninog fajla

app = Flask(__name__)

# 1. Konfiguracija baze
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///baza.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. Inicijalizacija baze
db.init_app(app)

# 3. Kreiranje tabela (ovo se dešava samo prvi put)
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return jsonify({
        "poruka": "Dashboard API radi, tabele su kreirane!",
        "status": "uspeh"
    })

# Ruta za proveru da li baza radi (testiraj na: http://127.0.0.1:5000/test)
@app.route('/test')
def test_db():
    # Probaćemo da izbrojimo korisnike (na početku ih ima 0)
    broj_korisnika = User.query.count()
    return jsonify({
        "broj_korisnika_u_bazi": broj_korisnika
    })
@app.route('/dodaj-nas')
def dodaj_nas():
    # Proveravamo da li već postojite da ne bi bilo greške
    postoji = User.query.filter_by(username='Anja').first()
    if not postoji:
        anja = User(username='Anja', email='anja@primer.com', password='123')
        una = User(username='Una', email='una@primer.com', password='456')
        db.session.add(anja)
        db.session.add(una)
        db.session.commit()
        return "Anja i Una su uspesno dodate!"
    return "Vec ste u bazi!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)