const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
let currentHistoryId = null;

// WhatsApp-style message appending
function appendMessage(text, sender = "user") {
    const div = document.createElement("div");
    div.className = "chat-bubble " + (sender === "user" ? "chat-user" : "chat-ai");
    div.innerHTML = `<span>${text}</span>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Load chat history from backend and render it
async function loadChatHistory() {
    try {
        const res = await fetch("/history");
        if (!res.ok) return;
        const data = await res.json();
        chatBox.innerHTML = "";
        data.reverse().forEach(item => {
            appendMessage(item.message, "user");
            appendMessage(item.translated, "ai");
        });
    } catch (err) {
        // Optionally handle error
    }
}
window.addEventListener("DOMContentLoaded", loadChatHistory);

// --- TTS Play/Pause controls ---
let ttsAudio = null;
function playAudio() {
    if (ttsAudio) ttsAudio.play();
}
function pauseAudio() {
    if (ttsAudio) ttsAudio.pause();
}

// Send text for translation and TTS
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    userInput.value = "";

    const sourceLangSelect = document.getElementById("source-lang");
    const source = sourceLangSelect.value;
    const target = document.getElementById("target-lang").value;
    const context = document.getElementById("context").value;
    const voice = document.getElementById("voice-select") ? document.getElementById("voice-select").value : "female";

    try {
        const res = await fetch("/translate", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text, source, target, context})
        });
        const data = await res.json();
        const translated = data.translated;
        currentHistoryId = data.history_id;
        appendMessage(translated, "ai");

        // Update source language select if detected_source is returned and was auto
        if (data.detected_source && data.detected_source !== "auto" && source === "auto") {
            sourceLangSelect.value = data.detected_source;
            sourceLangSelect.title = "Auto-detected: " + data.detected_source;
            // Optionally show a tooltip/brief visual indicator
            showDetectedLangToast(data.detected_source);
        }

        // Request TTS audio
        const ttsRes = await fetch("/tts", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text: translated, lang: target, voice: voice})
        });
        const ttsData = await ttsRes.json();
        if (ttsData.audio_url) {
            ttsAudio = document.getElementById('tts-audio');
            if (ttsAudio) {
                ttsAudio.src = ttsData.audio_url;
                document.getElementById('audio-controls').style.display = 'flex';
                ttsAudio.load();
                ttsAudio.play();
            }
        }
    } catch (err) {
        appendMessage("Error: Could not translate or synthesize speech.", "ai");
    }
}

// Show a short toast/indicator for auto-detected language
function showDetectedLangToast(langCode) {
    // Optionally, use a map for language code to readable name
    const langMap = {
        en: "English", ar: "Arabic", az: "Azerbaijani", zh: "Chinese", cs: "Czech", nl: "Dutch",
        fr: "French", de: "German", el: "Greek", he: "Hebrew", hi: "Hindi", hu: "Hungarian",
        id: "Indonesian", ga: "Irish", it: "Italian", ja: "Japanese", ko: "Korean", fa: "Persian",
        pl: "Polish", pt: "Portuguese", ru: "Russian", es: "Spanish", sv: "Swedish", tr: "Turkish",
        uk: "Ukrainian", ur: "Urdu", uz: "Uzbek", vi: "Vietnamese", bn: "Bengali"
    };
    const langName = langMap[langCode] || langCode;
    let toast = document.getElementById('detected-lang-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'detected-lang-toast';
        toast.style.position = 'fixed';
        toast.style.top = '15px';
        toast.style.right = '15px';
        toast.style.zIndex = '9999';
        toast.style.background = '#222';
        toast.style.color = '#fff';
        toast.style.padding = '10px 18px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
        document.body.appendChild(toast);
    }
    toast.textContent = 'Detected Language: ' + langName;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

// Speech-to-text via browser
function startSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech Recognition not supported in this browser.");
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = document.getElementById("source-lang").value || "en";
    recognition.onresult = function(event) {
        userInput.value = event.results[0][0].transcript;
    };
    recognition.start();
}

// OCR: Upload image, extract & auto-translate
async function uploadImage() {
    const fileInput = document.getElementById('ocr-image');
    const ocrResultDiv = document.getElementById('ocr-result');
    if (!fileInput.files.length) return;
    ocrResultDiv.textContent = "Extracting text...";
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    try {
        const res = await fetch("/upload_image", {method: "POST", body: formData});
        const data = await res.json();
        if (data.error) {
            ocrResultDiv.textContent = "OCR Error: " + data.error;
            return;
        }
        ocrResultDiv.textContent = "Extracted: " + (data.extracted_text || "(none)");
        userInput.value = data.extracted_text || "";

        // Auto-translate extracted text if present
        if (data.extracted_text && data.extracted_text.trim()) {
            const source = document.getElementById("source-lang").value;
            const target = document.getElementById("target-lang").value;
            const context = document.getElementById("context").value;
            const translateRes = await fetch("/translate", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text: data.extracted_text, source, target, context})
            });
            const translateData = await translateRes.json();
            ocrResultDiv.textContent += "\nTranslation: " + (translateData.translated || "(none)");
            // Update detected language if auto
            if (translateData.detected_source && translateData.detected_source !== "auto" && source === "auto") {
                document.getElementById("source-lang").value = translateData.detected_source;
                document.getElementById("source-lang").title = "Auto-detected: " + translateData.detected_source;
                showDetectedLangToast(translateData.detected_source);
            }
        }
    } catch (err) {
        ocrResultDiv.textContent = "OCR or translation failed.";
    }
}

// Add a favorite phrase
async function addFavorite(phrase, translation, source, target) {
    await fetch("/favorite", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({phrase, translation, source, target})
    });
    alert("Added to favorites!");
}

// Remove a favorite
async function removeFavorite(fav_id) {
    await fetch("/remove_favorite", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fav_id})
    });
    location.reload();
}

// Pronunciation practice (simple demo)
async function analyzePronunciation(expected) {
    const actual = prompt("Speak the phrase, then type what you said:");
    const res = await fetch("/analyze_pronunciation", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({expected, actual})
    });
    const data = await res.json();
    alert("Pronunciation similarity: " + data.score + "%");
}

// Show rating box below the specific translation only
function showRating(historyId) {
    document.querySelectorAll('.rating-box').forEach(box => box.style.display = 'none');
    const box = document.getElementById('rating-box-' + historyId);
    if (box) {
        box.style.display = 'block';
        currentHistoryId = historyId;
    }
}
function hideRating(historyId) {
    const box = document.getElementById('rating-box-' + historyId);
    if (box) box.style.display = 'none';
}
async function submitRating(historyId) {
    const rating = document.getElementById('rating-value-' + historyId).value;
    const feedback = document.getElementById('rating-feedback-' + historyId).value;
    await fetch("/rate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({history_id: historyId, rating, feedback})
    });
    document.getElementById('rating-box-' + historyId).innerHTML = "<span>Thank you for your feedback!</span>";
}

// Smart button hover (optional, for dynamic effects, CSS preferred)
document.querySelectorAll('.smart-btn').forEach(btn => {
    btn.addEventListener('mouseover', () => btn.classList.add('smart-hover'));
    btn.addEventListener('mouseout', () => btn.classList.remove('smart-hover'));
});

// Fullscreen mode for translator
function toggleFullScreen() {
    const container = document.getElementById('translator-container');
    const btn = document.getElementById('fullscreen-btn');
    container.classList.toggle('fullscreen');
    if (container.classList.contains('fullscreen')) {
        btn.innerText = "Exit Full Screen";
    } else {
        btn.innerText = "⛶ Full Screen";
    }
}

// Clear chat functionality
async function clearChat() {
    if (confirm("Are you sure you want to clear the chat? This cannot be undone.")) {
        chatBox.innerHTML = '';
        await fetch("/clear_chat", {method: "POST"});
        loadChatHistory();
    }
}

// Add from history as favorite
async function addFavoriteFromHistory(phrase, translation, source, target) {
    await addFavorite(phrase, translation, source, target);
    location.reload();
}

// Clear all history
async function clearHistory() {
    if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
        await fetch("/clear_chat", {method: "POST"});
        location.reload();
    }
}

// Clear all favorites
async function clearFavorites() {
    if (confirm("Are you sure you want to clear all favorites? This cannot be undone.")) {
        await fetch("/clear_favorites", {method: "POST"});
        location.reload();
    }
}
// Sort a language dropdown alphabetically by option text, keeping "Auto Detect" (value="auto") on top if present
function sortLanguageDropdownOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const options = Array.from(select.options);
    const autoOption = options.find(option => option.value === 'auto'); // Keep 'Auto Detect' on top if it exists
    const sortedOptions = options
        .filter(option => option.value !== 'auto')
        .sort((a, b) => a.text.localeCompare(b.text));

    // Re-append options
    select.innerHTML = '';
    if (autoOption) select.appendChild(autoOption);
    sortedOptions.forEach(option => select.appendChild(option));
}

// Sort dropdowns when the DOM is ready
window.addEventListener("DOMContentLoaded", () => {
    loadChatHistory();  // already in your code
    sortLanguageDropdownOptions("source-lang");
    sortLanguageDropdownOptions("target-lang");
});