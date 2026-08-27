"""
Jednokratna skripta za sedovanje glavnih admin naloga (Anja, Una).

Ranije je ovo bila HTTP ruta '/dodaj-nas' - javno dostupna, bez ikakve
autentifikacije, i BRISALA JE SVE korisnike iz baze pre upisa admina.
To je ozbiljna bezbednosna rupa (bilo ko ko zna putanju mogao je time
da obriše celu users tabelu), pa je ruta uklonjena iz app.py.

Ova skripta radi istu stvar, ali se pokreće ručno sa servera/lokalno,
nikad preko mreže:

    cd backend
    python seed_admins.py

Napomena: skripta radi "upsert" - ako Anja/Una već postoje, samo im
resetuje lozinku i ulogu (Admin); ako ne postoje, kreira ih. Ne briše
naloge, jer bi to puklo na FK constraint-u (postojeća istorija pretraga,
watchlist, itd. i dalje referenciraju njihov user_id).
"""
import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import app, bcrypt
from app_models.models import db, User


def seed_admins():
    with app.app_context():
        try:
            pw = bcrypt.generate_password_hash('123').decode('utf-8')

            for username, email in [('Anja', 'anja@example.com'), ('Una', 'una@example.com')]:
                user = User.query.filter_by(username=username).first()
                if user:
                    # Već postoji - samo osveži lozinku i ulogu, ne diramo user_id
                    # (istorija/watchlist ostaju netaknuti).
                    user.password = pw
                    user.role = 'Admin'
                else:
                    db.session.add(User(username=username, email=email, password=pw, role='Admin'))

            db.session.commit()
            print("Anja i Una (Admin) uspešno upisane/ažurirane.")
        except Exception as e:
            db.session.rollback()
            print(f"Greška: {e}")


if __name__ == '__main__':
    seed_admins()