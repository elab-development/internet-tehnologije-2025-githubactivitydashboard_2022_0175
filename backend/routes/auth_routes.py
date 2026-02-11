from flask import Blueprint, jsonify, request
from app_models.models import db, User
from schemas.user_schema import user_schema
from flask_bcrypt import Bcrypt

# Inicijalizujemo bcrypt lokalno za ovaj fajl
bcrypt = Bcrypt()
auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    # Hešovanje lozinke
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
#proba
    new_user = User(
        username=username,
        email=email,
        password=hashed_pw,
        role='User'
    )

    db.session.add(new_user)
    db.session.commit()

    return user_schema.jsonify(new_user), 201


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        return jsonify({
            "message": "Login successful",
            "user_id": user.user_id,
            "username": user.username,
            "role": user.role
        }), 200

    return jsonify({"error": "Invalid username or password"}), 401