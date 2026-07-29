from flask import Blueprint, jsonify, request
from services.user_service import UserService
from schemas.user_schema import user_schema

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
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