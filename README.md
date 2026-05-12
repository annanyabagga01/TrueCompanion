# 🤍 TrueCompanion

**India's First AI Mental Health Companion App**

> Free · No judgment · 24/7 available · Made with 💚 in India

TrueCompanion ek single-file Progressive Web App (PWA) hai jo Indian users ke liye design ki gayi hai — Hinglish mein baat karo, moods track karo, aur real AI se emotional support lo.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Chat | GPT-4o powered empathetic chat, Hinglish/Hindi/English mein |
| 📊 Mood Tracker | Daily mood log with weekly bar chart |
| 📄 PDF Report | Downloadable weekly wellness report (jsPDF) |
| 🆘 Crisis Support | Auto-detects crisis keywords, Indian helplines (iCall, AASRA, Kiran) |
| 🔊 Voice Mode | Text-to-Speech AI replies (Hindi & English voices) |
| 📱 OTP Login | Phone number + OTP auth (Fast2SMS ready) |
| 🌏 Multilingual | Hinglish, Hindi, English, Tamil, Bengali, Telugu, Marathi, Punjabi |
| 👴 Elderly Mode | Larger fonts + high contrast for senior users |
| 🌙 Dark Mode | System-aware dark/light theme |
| 🔥 Streak System | Daily wellness streak tracking |
| ⭐ Premium Plans | Freemium model with Razorpay integration (ready) |
| 💾 Offline Fallback | Works offline with fallback AI responses |

---

## 📁 Project Structure

```
TrueCompanion/
├── TrueCompanion.html      # Main app — all screens in one file
├── TrueCompanion_app.js    # All logic: chat, mood, OTP, PDF, voice, etc.
└── TrueCompanion_style.css # Full styling: themes, animations, elderly mode
```

> **Note:** App is designed to work as a **single HTML file** (all CSS/JS can be inlined). Split into 3 files for development convenience.

---

## 📱 Screens / Flow

```
Splash → Login (OTP) → Language Select → Home
                                           ├── 💬 Chat (AI)
                                           ├── 📊 Mood Log
                                           ├── 🆘 Crisis Help
                                           ├── ⭐ Premium
                                           └── ⚙️ Settings
```

---

## 🚀 Setup & Run

### Local mein chalao

Koi build step nahi, koi server nahi — bas file open karo:

```bash
# Option 1: Directly browser mein open karo
open TrueCompanion.html

# Option 2: Local server (PWA features ke liye recommended)
npx serve .
# Ya
python3 -m http.server 8080
```

### AI Chat ke liye

Pehli baar chat karte waqt app **OpenAI API Key** maangega.

1. [platform.openai.com](https://platform.openai.com) par jaao
2. API key banao
3. App mein paste karo — yeh `localStorage` mein safe store hogi

> Model: `gpt-4o` · Context: last 10 messages maintain hota hai

---

## 🔑 OTP Login (Development Mode)

- **Demo OTP**: `1234` (kisi bhi number ke saath kaam karta hai)
- **Production**: Fast2SMS API integrate karo

```js
// app.js mein Fast2SMS integration point:
// sendOTP() function → replace mock setTimeout with real API call
```

---

## 🌍 Language Support

App in 8 languages mein respond kar sakti hai:

- Hinglish *(default)*
- Hindi
- English
- Tamil · Bengali · Telugu · Marathi · Punjabi

AI ka system prompt automatically detected language follow karta hai.

---

## 🆘 Crisis Detection

App automatically **crisis keywords** detect karti hai — Hindi aur English dono mein:

```
"suicide", "marna chahta", "self harm", "jaan dena", "end my life" ...
```

Detect hone par:
- Chat mein crisis card show hota hai
- Indian helplines prominently display hoti hain:
  - **iCall**: 9152987821
  - **AASRA**: 9820466627
  - **Kiran (Govt.)**: 1800-599-0019 *(toll-free)*

---

## 📊 Mood Tracking

- 5 moods: 😭 Very Sad · 😔 Sad · 😐 Neutral · 😊 Good · 😄 Great
- Score 1–10 scale
- History `localStorage` mein persist hoti hai
- Weekly bar chart with "Today" highlight
- PDF report mein mood history table included hai

---

## 📄 PDF Report

`downloadMoodReport()` se generate hota hai:

- User info + streak
- Today's mood
- 7-day mood history table
- AI-generated insights
- Crisis helpline info
- Footer disclaimer

**Dependency**: jsPDF (CDN se load hota hai)

---

## ⚙️ Settings

| Setting | Details |
|---|---|
| Elderly Mode | Body class toggle → bade fonts, high contrast |
| Voice Mode | TTS on/off, state `localStorage` mein save |
| API Key Reset | `localStorage` se key remove karo |
| Dark Mode | CSS variable based theming |

---

## 💳 Premium Plans

Freemium model — Razorpay integration ke liye `selectPlan()` function ready hai:

| Plan | Price | Features |
|---|---|---|
| Free | ₹0 | 10 chats/day, basic mood log |
| Plus | ₹199/mo | Unlimited chat, PDF reports, voice |
| Pro | ₹499/mo | All features + priority support |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML + CSS + JS (no framework) |
| AI | OpenAI GPT-4o via REST API |
| PDF | jsPDF (CDN) |
| Voice | Web Speech API (built-in browser) |
| Auth | Fast2SMS OTP (mock in dev) |
| Storage | localStorage |
| Payment | Razorpay (integration-ready) |
| Hosting | Any static host — Netlify, GitHub Pages, Vercel |

---

## 🚢 Deployment

```bash
# Netlify / Vercel / GitHub Pages
# Bas TrueCompanion.html upload karo — koi build step nahi

# PWA ke liye add karo:
# - manifest.json
# - service-worker.js (offline caching)
# - HTTPS (required for PWA install prompt)
```

---

## 🔒 Privacy

- Koi backend server nahi — sab kuch user ke browser mein
- API key sirf `localStorage` mein store hoti hai
- Mood history bhi local — koi cloud sync nahi (yet)
- Phone number sirf OTP ke liye use hota hai

---

## 🤝 Contributing

1. Fork karo
2. Feature branch banao: `git checkout -b feature/journal`
3. Changes karo aur commit karo
4. PR submit karo

---

## 📞 Support & Crisis

Agar tum ya koi tumhara jaanna wala struggle kar raha hai:

- **iCall**: 9152987821
- **AASRA**: 9820466627
- **Kiran Helpline**: 1800-599-0019 *(free, 24/7)*

---

## 📜 License

MIT License — freely use, modify, distribute.

---

*TrueCompanion — Akele mat feel karo. Hum hain. 💚*

Annanya Bagga
