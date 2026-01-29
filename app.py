from flask import Flask
from models import db, User, Repository, Activity, UserRepoFollow, SearchHistory

app = Flask(__name__)

# --- KONFIGURACIJA ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elab_user:elab_password@127.0.0.1:5432/github_stats'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- POVEZIVANJE ---
db.init_app(app)  # Ovo "venčava" modele sa aplikacijom!

@app.route('/')
def home():
    return "<h1>Docker Postgres je online!</h1>"

@app.route('/dodaj-nas')
def dodaj_nas():
    try:
        # Čišćenje i dodavanje test podataka
        db.session.query(User).delete()
        db.session.add(User(username='Anja', email='anja@example.com', password='123'))
        db.session.add(User(username='Una', email='una@example.com', password='123'))
        db.session.commit()
        return "Anja i Una uspešno upisane!"
    except Exception as e:
        db.session.rollback()
        return f"Greška: {e}"

# --- POKRETANJE ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Pravi tabele ako ne postoje
    app.run(host="0.0.0.0", port=5000, debug=True)