from flask import Blueprint, jsonify, request
from services.user_service import UserService
from schemas.user_schema import user_schema

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """
    Registracija novog korisnika
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [username, email, password]
          properties:
            username:
              type: string
              example: Anja
            email:
              type: string
              example: anja@example.com
            password:
              type: string
              example: lozinka123
    responses:
      201:
        description: Korisnik uspešno registrovan
        schema:
          type: object
          properties:
            user_id:
              type: integer
            username:
              type: string
            email:
              type: string
            role:
              type: string
      400:
        description: Nedostaju podaci ili korisničko ime/email već postoji
    """
    data = request.json or {}

    user, error = UserService.register_user(
        data.get('username'),
        data.get('email'),
        data.get('password')
    )

    if error:
        return jsonify({"error": error}), 400

    return user_schema.jsonify(user), 201


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """
    Prijava korisnika
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [username, password]
          properties:
            username:
              type: string
              example: Anja
            password:
              type: string
              example: lozinka123
    responses:
      200:
        description: Uspešna prijava
        schema:
          type: object
          properties:
            message:
              type: string
            user_id:
              type: integer
            username:
              type: string
            role:
              type: string
      401:
        description: Pogrešno korisničko ime ili lozinka
    """
    data = request.json or {}

    user = UserService.login_user(data.get('username'), data.get('password'))

    if user:
        return jsonify({
            "message": "Login successful",
            "user_id": user.user_id,
            "username": user.username,
            "role": user.role
        }), 200

    return jsonify({"error": "Invalid username or password"}), 401