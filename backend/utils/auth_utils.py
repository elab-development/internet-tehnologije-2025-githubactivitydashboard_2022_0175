"""
JWT autentifikacija i autorizacija.

Do sada login endpoint nije generisao nikakav token - samo je vraćao
{role, username, user_id} kao JSON, a frontend je to čuvao u localStorage.
To znači da je BILO KO mogao ručno da upiše 'role: Admin' u localStorage
(ili da uopšte ne šalje ništa) i backend to nikad nije proveravao -
sve rute su bile potpuno otvorene.

Ovaj modul dodaje pravu server-side proveru:
  - generate_token(user)      -> pravi potpisan JWT token pri loginu
  - token_required(f)         -> štiti rutu, zahteva validan token
                                  (bilo koji ulogovan korisnik - User ili Admin)
  - admin_required(f)         -> štiti rutu, zahteva validan token I role == 'Admin'

Nakon dekodovanja tokena, podaci o korisniku su dostupni u ruti preko
`request.current_user` (dict sa 'id', 'username', 'role').
"""
import os
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify

# U produkciji OBAVEZNO postaviti SECRET_KEY kao env promenljivu (u .env fajlu).
# Fallback vrednost postoji samo da projekat ne puca lokalno ako je neko zaboravio
# da je doda - ali se ne sme koristiti u pravoj produkciji/deploy-u.
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-me-please')
TOKEN_EXP_HOURS = 24


def generate_token(user):
    """Pravi potpisan JWT token za datog User objekta (posle uspešnog logina)."""
    payload = {
        'id': user.user_id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXP_HOURS),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def _decode_token_from_header():
    """Izvlači i dekoduje token iz 'Authorization: Bearer <token>' header-a.
    Vraća (payload, None) ako je sve ok, ili (None, (json_response, status)) ako nije."""
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return None, (jsonify({"error": "Nedostaje autentifikacioni token"}), 401)

    token = auth_header.split(' ', 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"error": "Sesija je istekla, prijavite se ponovo"}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"error": "Nevalidan token"}), 401)


def token_required(f):
    """Zahteva bilo kog ulogovanog korisnika (User ili Admin)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        payload, error = _decode_token_from_header()
        if error:
            return error
        request.current_user = payload  # {'id', 'username', 'role', ...}
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Zahteva ulogovanog korisnika sa role == 'Admin'."""
    @wraps(f)
    def decorated(*args, **kwargs):
        payload, error = _decode_token_from_header()
        if error:
            return error
        if payload.get('role') != 'Admin':
            return jsonify({"error": "Potrebna su administratorska ovlašćenja"}), 403
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated