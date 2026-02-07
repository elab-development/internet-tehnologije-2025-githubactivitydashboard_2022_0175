
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow  # Dodaj ovo
from datetime import datetime
("Zato što mi omogućava automatsko mapiranje. Umesto da ručno kucam svaki tip podatka, "
 "Marshmallow 'čita' moj model i zna da je"
 " email string, a timestamp datum, što smanjuje mogućnost greške.")
db = SQLAlchemy()
ma = Marshmallow()  # Dodaj ovo ovde


class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='User')
    avatar_url = db.Column(db.String(255), nullable=True)  # DODAJ OVO

    # Veze
    follows = db.relationship('UserRepoFollow', backref='user', lazy=True, cascade="all, delete-orphan")
    searches = db.relationship('SearchHistory', backref='user', lazy=True, cascade="all, delete-orphan")



    def __repr__(self):
        return f'<User {self.username}>'

class Repository(db.Model):
    __tablename__ = 'repositories'
    repo_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), unique=True, nullable=False)
    url = db.Column(db.String(255), nullable=False)
    last_synced_at = db.Column(db.DateTime, default=datetime.utcnow)

    activities = db.relationship('Activity', backref='repository', lazy=True)
    followers = db.relationship('UserRepoFollow', backref='repository', lazy=True)

    def __repr__(self):
        return f'<Repo {self.full_name}>'

class Activity(db.Model):
    __tablename__ = 'activities'
    activity_id = db.Column(db.Integer, primary_key=True)
    github_event_id = db.Column(db.String(50), unique=True)
    event_type = db.Column(db.String(50))
    actor_username = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    payload = db.Column(db.JSON) # Odlično za GitHub API odgovor
    summary = db.Column(db.Text)
    repo_id = db.Column(db.Integer, db.ForeignKey('repositories.repo_id'), nullable=False)

class UserRepoFollow(db.Model):
    __tablename__ = 'user_repo_follows'
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    repo_id = db.Column(db.Integer, db.ForeignKey('repositories.repo_id'), primary_key=True)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

class SearchHistory(db.Model):
    __tablename__ = 'search_histories'
    search_id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(255), nullable=False)
    search_type = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)