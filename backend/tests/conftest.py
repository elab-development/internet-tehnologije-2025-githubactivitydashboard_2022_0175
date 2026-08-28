"""
Zajednička podešavanja (fixtures) za sve testove.

Pre nego što se app.py uopšte uveze, postavljamo DATABASE_URL na SQLite
in-memory bazu, tako da testovi ne zavise od pokrenutog Postgres servera
i ne diraju pravu bazu podataka.
"""
import os
import sys

# Osiguravamo da je backend/ folder na sys.path, bez obzira odakle se pytest pokreće
# (npr. iz backend/ ili iz backend/tests/), jer app.py i moduli koriste apsolutne
# importe tipa "from app_models.models import ...".
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ.setdefault("GITHUB_TOKEN", "")

import pytest

from app import app as flask_app
from app_models.models import db as _db


@pytest.fixture()
def app():
    """Flask app konfigurisan za testiranje, sa čistom SQLite bazom po testu."""
    flask_app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
    )

    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def client(app):
    """Flask test client za slanje HTTP zahteva ka rutama."""
    return app.test_client()


@pytest.fixture()
def db(app):
    """Pristup SQLAlchemy sesiji unutar app konteksta."""
    return _db


def auth_headers(user):
    """
    Pravi Authorization header sa validnim JWT tokenom za datog User-a,
    za testiranje ruta koje su zaštićene sa @token_required / @admin_required.

    Koristi se ovako: client.get("/api/users", headers=auth_headers(admin))
    """
    from utils.auth_utils import generate_token
    token = generate_token(user)
    return {"Authorization": f"Bearer {token}"}