# 🌟 PINNACLE - AI Language Tools Suite

Welcome to the **PINNACLE** project – a unified repository hosting multiple AI-powered language applications. This suite showcases two flagship tools built with cutting-edge NLP, OCR, and translation technologies:

1. ✅ **AI Text Corrector** – Grammar and spelling correction using LanguageTool.
2. 🌐 **AI Translator Chat Bot** – A multilingual translator with chat interface, voice, OCR, and more.

---

## 📁 Projects Included

### 1. 🔤 [AI Text Corrector](./Ai%20Autocorrect%20App)

A modern browser-based grammar correction tool leveraging the **LanguageTool API**.

**Key Features:**
- Grammar, spelling, and stylistic error detection
- Displays original text, corrected output, and explanation
- Animated result presentation and toast error notifications
- Built using React, TypeScript, Tailwind CSS

### 2. 🌍 [AI Translator Chat Bot](./Ai%20Translator%20App)

A Flask-based WhatsApp-style multilingual chat translator with OCR, TTS, favorites, and pronunciation.

**Key Features:**
- LibreTranslate-powered translations with speech synthesis
- Chat-like multilingual interface with text, speech, and image input
- User authentication with session-based history and favorites
- Docker support for easy deployment

---

## 🧰 Tech Stack

| Layer       | AI Text Corrector                         | AI Translator Chat Bot                          |
|-------------|-------------------------------------------|--------------------------------------------------|
| Frontend    | React, Tailwind CSS, TypeScript, ESM CDN  | Bootstrap 5, Vanilla JS                         |
| Backend     | No backend – runs fully in browser        | Flask, SQLAlchemy, gTTS, pytesseract, Flask-Login |
| AI API      | LanguageTool                              | LibreTranslate, Google TTS, Tesseract OCR        |
| Container   | N/A                                       | Docker & Docker Compose (optional)               |

---

## 🚀 Getting Started

### 🔤 AI Text Corrector

1. **Serve `index.html`** locally with Python/Node server or VS Code Live Server.
2. Open in browser and start correcting grammar.

```bash
# Using Python HTTP server
python -m http.server
```

### 🌍 AI Translator Chat Bot

1. **Install Dependencies & Tesseract**
2. **Set up LibreTranslate (public or local)**
3. **Run Flask App**

```bash
# Setup Python env
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt

# Run the app
flask run
```

Alternatively, use Docker:

```bash
docker compose up --build
```

---

## 📸 Screenshots

| AI Translator | OCR | Favorites |
|---------------|-----|-----------|
| ![](Ai%20Translator%20App/Image1.png) | ![](Ai%20Translator%20App/Image2.png) | ![](Ai%20Translator%20App/Image3.png) |

---

## 📜 License

This project is open-source and MIT licensed.

---

## 🙋‍♂️ Contact

Created by [archisman44].  
For feedback or contributions, feel free to open an issue or PR.

---

**Enjoy effortless AI-powered communication! 🚀🧠**
