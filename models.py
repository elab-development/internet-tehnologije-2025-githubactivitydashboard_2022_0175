from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# 1. User(user_id, username, email, password)
class User(db.Model):
    __tablename__ = 'users'  # Popravljeno: dodate __
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    # Veze
    follows = db.relationship('UserRepoFollow', backref='user', lazy=True)
    searches = db.relationship('SearchHistory', backref='user', lazy=True)

# 2. Repository(repo_id, full_name, url, last_synced_at)
class Repository(db.Model):
    __tablename__ = 'repositories' # Popravljeno: dodate __
    repo_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), unique=True, nullable=False)
    url = db.Column(db.String(255), nullable=False)
    last_synced_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Veze
    activities = db.relationship('Activity', backref='repository', lazy=True)
    followers = db.relationship('UserRepoFollow', backref='repository', lazy=True)

# 3. Activity(activity_id, github_event_id, event_type, actor_username, timestamp, payload, summary, repo_id)
class Activity(db.Model):
    __tablename__ = 'activities' # Popravljeno: dodate __
    activity_id = db.Column(db.Integer, primary_key=True)
    github_event_id = db.Column(db.String(50), unique=True)
    event_type = db.Column(db.String(50))
    actor_username = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    payload = db.Column(db.JSON)
    summary = db.Column(db.Text)

    repo_id = db.Column(db.Integer, db.ForeignKey('repositories.repo_id'), nullable=False)

# 4. UserRepoFollow(user_id, repo_id, date_added)
class UserRepoFollow(db.Model):
    __tablename__ = 'user_repo_follows' # Popravljeno: dodate __
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    repo_id = db.Column(db.Integer, db.ForeignKey('repositories.repo_id'), primary_key=True)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

# 5. SearchHistory(search_id, query, search_type, timestamp, user_id)
# 5. SearchHistory(search_id, query, search_type, timestamp, user_id)
class SearchHistory(db.Model):
    __tablename__ = 'search_histories'
    search_id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(255), nullable=False)
    search_type = db.Column(db.String(50)) # npr. 'repo' ili 'user'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)