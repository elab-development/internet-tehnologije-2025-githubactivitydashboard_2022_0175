from app_models.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash


class UserService:
    @staticmethod
    def register_user(username, email, password):
        # Provera da li korisnik postoji
        if User.query.filter_by(email=email).first():
            return {"error": "Email already exists"}, 400

        hashed_pw = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_pw)

        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def login_user(email, password):
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            return user
        return None