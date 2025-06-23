from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    favorites = db.relationship('Favorite', backref='user', lazy='dynamic')
    chat_histories = db.relationship('ChatHistory', backref='user', lazy='dynamic')

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message = db.Column(db.Text, nullable=False)
    translated = db.Column(db.Text, nullable=False)
    source_lang = db.Column(db.String(10))
    target_lang = db.Column(db.String(10))
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    rating = db.Column(db.Integer)  # 1-5 stars
    feedback = db.Column(db.Text)

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    phrase = db.Column(db.Text, nullable=False)
    translation = db.Column(db.Text, nullable=False)
    source_lang = db.Column(db.String(10))
    target_lang = db.Column(db.String(10))