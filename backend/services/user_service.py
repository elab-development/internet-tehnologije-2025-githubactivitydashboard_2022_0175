from app_models.models import db, User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


class UserService:
    @staticmethod
    def register_user(username, email, password):
        if not username or not email or not password:
            return None, "Username, email and password are required"

        if User.query.filter_by(username=username).first():
            return None, "Username already exists"
        if User.query.filter_by(email=email).first():
            return None, "Email already exists"

        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(
            username=username,
            email=email,
            password=hashed_pw,
            role='User'
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            return new_user, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {e}"

    @staticmethod
    def login_user(username, password):
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            return user
        return None