import os
import uuid
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, session, send_from_directory
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, ChatHistory, Favorite
import requests
#from gtts import gTTS
from PIL import Image
import pytesseract

# ========== Configuration ==========
# Set Tesseract path for Windows (adjust if not installed here)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Set up absolute paths
basedir = os.path.abspath(os.path.dirname(__file__))
instance_dir = os.path.join(basedir, "instance")
upload_dir = os.path.join(basedir, "uploads")

# Ensure necessary folders exist
os.makedirs(instance_dir, exist_ok=True)
os.makedirs(upload_dir, exist_ok=True)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production!
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(instance_dir, 'app.db')}"
app.config['UPLOAD_FOLDER'] = upload_dir
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB upload limit

db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

LIBRETRANSLATE_URL = "http://localhost:5000/translate"

# ========== User Management ==========
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        if User.query.filter_by(username=username).first():
            flash('Username exists')
            return redirect(url_for('register'))
        user = User(username=username, password_hash=password)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and check_password_hash(user.password_hash, request.form['password']):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid credentials')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# ========== Main Page ==========
@app.route("/")
@login_required
def index():
    user_history = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.timestamp.desc()).limit(20).all()
    favorites = Favorite.query.filter_by(user_id=current_user.id).all()
    return render_template("index.html", history=user_history, favorites=favorites)

# ========== Translation, TTS, Chat History ==========
@app.route("/translate", methods=["POST"])
@login_required
def translate_text():
    data = request.json
    source = data.get("source")
    target = data.get("target")
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    use_auto = not source or source == "auto"
    if use_auto:
        source = "auto"

    # Contextual translation
    context = data.get("context", "default")
    q = text
    if context == "formal":
        q = "Please translate formally: " + text
    elif context == "informal":
        q = "Please translate informally: " + text

    payload = {"q": q, "source": source, "target": target, "format": "text"}
    headers = {"accept": "application/json"}
    translated = ""
    detected_lang = None
    error = None
    try:
        response = requests.post(LIBRETRANSLATE_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        rjson = response.json()
        translated = rjson.get("translatedText", "")
        # LibreTranslate returns "detectedLanguage": {"language": "en", "confidence": 1}
        if use_auto:
            detected_lang = rjson.get("detectedLanguage", {}).get("language")
    except Exception as e:
        error = f"Translation error: {str(e)}"
        translated = error

    chat = ChatHistory(
        user_id=current_user.id,
        message=text,
        translated=translated,
        source_lang=detected_lang if use_auto and detected_lang else source,
        target_lang=target
    )
    db.session.add(chat)
    db.session.commit()
    code = 200 if not error else 500
    return jsonify({
        "translated": translated,
        "history_id": chat.id,
        "detected_source": detected_lang if use_auto and detected_lang else source
    }), code

@app.route("/tts", methods=["POST"])
@login_required
def text_to_speech():
    data = request.json
    text = data.get("text", "")
    lang = data.get("lang", "en")
    voice = data.get("voice", "female")  # Accept the voice parameter but ignore for now

    filename = f"static/{uuid.uuid4()}.mp3"
    try:
        # gTTS currently doesn't support true male/female selection, but we accept the param for future use
        tts = gTTS(text=text, lang=lang)
        tts.save(filename)
        return jsonify({"audio_url": "/" + filename})
    except Exception as e:
        return jsonify({"error": f"TTS error: {str(e)}"}), 500

@app.route("/history")
@login_required
def get_history():
    history = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.timestamp.desc()).all()
    return jsonify([{
        "id": h.id,
        "message": h.message,
        "translated": h.translated,
        "source_lang": h.source_lang,
        "target_lang": h.target_lang,
        "timestamp": h.timestamp.isoformat(),
        "rating": h.rating,
        "feedback": h.feedback
    } for h in history])

@app.route("/clear_chat", methods=["POST"])
@login_required
def clear_chat():
    ChatHistory.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({"status": "ok"})

@app.route("/clear_history", methods=["POST"])
@login_required
def clear_history():
    ChatHistory.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({"status": "ok"})

@app.route("/rate", methods=["POST"])
@login_required
def rate_translation():
    data = request.json
    hist = ChatHistory.query.get(data['history_id'])
    if hist and hist.user_id == current_user.id:
        hist.rating = data['rating']
        hist.feedback = data.get('feedback', '')
        db.session.commit()
        return jsonify({"status": "ok"})
    return jsonify({"status": "error"}), 403

# ========== Favorites / Phrasebook ==========
@app.route("/favorite", methods=["POST"])
@login_required
def add_favorite():
    data = request.json
    fav = Favorite(
        user_id=current_user.id,
        phrase=data['phrase'],
        translation=data['translation'],
        source_lang=data['source'],
        target_lang=data['target']
    )
    db.session.add(fav)
    db.session.commit()
    return jsonify({"status": "ok"})

@app.route("/remove_favorite", methods=["POST"])
@login_required
def remove_favorite():
    data = request.json
    fav = Favorite.query.filter_by(id=data['fav_id'], user_id=current_user.id).first()
    if fav:
        db.session.delete(fav)
        db.session.commit()
        return jsonify({"status": "ok"})
    return jsonify({"status": "error"}), 404

@app.route("/clear_favorites", methods=["POST"])
@login_required
def clear_favorites():
    Favorite.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({"status": "ok"})

# ========== Pronunciation Practice ==========
@app.route("/analyze_pronunciation", methods=['POST'])
@login_required
def analyze_pronunciation():
    data = request.json
    expected = data['expected'].lower()
    actual = data['actual'].lower()
    score = sum(1 for a, b in zip(expected, actual) if a == b) / max(len(expected), 1)
    return jsonify({"score": round(score * 100, 2)})

# ========== OCR for Image Translation ==========
@app.route("/upload_image", methods=["POST"])
@login_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        file.save(filepath)
        img = Image.open(filepath)
        text = pytesseract.image_to_string(img)
    except Exception as e:
        return jsonify({'error': f'OCR failed: {str(e)}'}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
    return jsonify({'extracted_text': text})

# Serve uploaded images (if needed)
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ========== App Entry Point ==========
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)