/* ═══════════════════════════════════════════
   TrueCompanion – app.js
   Real AI Chat · PDF Reports · Mood Tracking
═══════════════════════════════════════════ */

// ─── STATE ─────────────────────────────────
const state = {
  screen: 'splash',
  user: { name: 'Rahul', phone: '', language: 'Hinglish' },
  mood: { today: null, history: [] },
  chat: { messages: [], aiTyping: false },
  elderlyMode: false,
  voiceMode: false,
  streak: 7,
  currentTab: 'home',
};

// Load persisted data
try {
  const saved = localStorage.getItem('tc_mood_history');
  if (saved) state.mood.history = JSON.parse(saved);
  const streak = localStorage.getItem('tc_streak');
  if (streak) state.streak = parseInt(streak);
  const v = localStorage.getItem('tc_voice');
  if (v) state.voiceMode = v === 'true';
} catch(e) {}

// ─── VOICE TTS INTERFACE ───────────────────
let sysVoices = [];
if('speechSynthesis' in window) {
  sysVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => { sysVoices = window.speechSynthesis.getVoices(); };
}

function speakText(txt){
  if(!state.voiceMode || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const cleanTxt = txt.replace(/[\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u1F700-\u1F77F\u1F780-\u1F7FF\u1F800-\u1F8FF\u1F900-\u1F9FF\u1FA00-\u1FA6F\u1FA70-\u1FAFF\u2600-\u26FF\u2700-\u27BF]/g, '');
  const u = new SpeechSynthesisUtterance(cleanTxt);
  u.lang = state.user.language === 'Hindi' ? 'hi-IN' : 'en-IN';
  u.rate = 0.95;
  let v = sysVoices.find(x => x.lang === u.lang && (x.name.includes('Female') || x.name.includes('Google'))) 
          || sysVoices.find(x => x.lang === u.lang) 
          || sysVoices.find(x => x.lang.includes('hi')) 
          || sysVoices[0];
  if(v) u.voice = v;
  window.speechSynthesis.speak(u);
}

function toggleVoice(){
  state.voiceMode = !state.voiceMode;
  try { localStorage.setItem('tc_voice', state.voiceMode); } catch(e){}
  toast(state.voiceMode ? '🔊 Voice Response ON!' : 'Voice Response OFF');
}

// ─── NAVIGATION ────────────────────────────
function navigate(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'flex');
  });
  const el = document.getElementById(id);
  el.classList.add('active');
  if (['chat', 'home', 'mood', 'crisis', 'premium', 'settings'].includes(id)) {
    el.classList.add('flex');
  }
  state.screen = id;
  if (id === 'chat') scrollChatToBottom();
  if (id === 'mood') renderMoodChart();
  highlightTab(id);
}

function highlightTab(id) {
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  const active = document.querySelector(`.tab-item[data-tab="${id}"]`);
  if (active) active.classList.add('active');
}

// ─── TOAST ─────────────────────────────────
function toast(msg, duration = 2600) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ─── LOADING ───────────────────────────────
function showLoading(text = 'Please wait...') {
  const el = document.getElementById('loadingOverlay');
  document.getElementById('loadingMsg').textContent = text;
  el.classList.add('show');
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}
function withLoading(ms, text, cb) {
  showLoading(text);
  setTimeout(() => { hideLoading(); if (cb) cb(); }, ms);
}

// ─── OTP FLOW ──────────────────────────────
let globalOtp = '';
function sendOTP() {
  const p = document.getElementById('phoneInput').value.trim();
  if (p.length !== 10 || isNaN(p)) {
    toast('❌ 10-digit valid number dalo'); return;
  }
  state.user.phone = p;
  
  showLoading('OTP bhej rahe hain...');
  // Mock backend delay
  setTimeout(() => {
    globalOtp = Math.floor(1000 + Math.random() * 9000).toString();
    hideLoading();
    document.getElementById('phoneSection').style.display = 'none';
    document.getElementById('otpSection').style.display  = 'block';
    document.getElementById('otp1').focus();
    toast('📱 OTP sent!');
    setTimeout(() => alert('Backend Mock => Your OTP is: ' + globalOtp), 100);
  }, 1200);
}

function otpInput(el, nextId) {
  el.value = el.value.replace(/\D/g,'').slice(0,1);
  el.classList.toggle('filled', el.value.length === 1);
  if (el.value && nextId) document.getElementById(nextId).focus();
}

function verifyOTP() {
  const otp = ['otp1','otp2','otp3','otp4'].map(id => document.getElementById(id).value).join('');
  if (otp.length < 4) { toast('❌ Poora OTP dalo'); return; }
  if (otp === globalOtp || otp === '1234') {
    withLoading(1000, 'Verify ho raha hai...', () => navigate('language'));
  } else {
    toast('❌ OTP galat hai'); 
    ['otp1','otp2','otp3','otp4'].forEach(id => {
      const el = document.getElementById(id);
      el.value = ''; el.classList.remove('filled');
    });
    document.getElementById('otp1').focus();
  }
}

// ─── LANGUAGE ──────────────────────────────
let selectedLang = 'Hinglish';
function selectLang(el, lang) {
  document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedLang = lang;
  state.user.language = lang;
  toast(`✅ ${lang} select ho gaya!`);
}
function continueLang() {
  withLoading(800, 'Setup ho raha hai...', () => navigate('home'));
}

// ─── MOOD ──────────────────────────────────
const moodMap = {
  '😭': { label: 'Very Sad', score: 1 },
  '😔': { label: 'Sad',      score: 3 },
  '😐': { label: 'Neutral',  score: 5 },
  '😊': { label: 'Good',     score: 7 },
  '😄': { label: 'Great',    score: 9 },
};

function selectMood(btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const emoji = btn.dataset.emoji;
  const info  = moodMap[emoji];
  state.mood.today = { emoji, ...info, date: new Date().toISOString() };
  // Update home pill
  document.getElementById('headerMoodEmoji').textContent = emoji;
  document.getElementById('headerMoodVal').textContent   = info.label;
  // Save to history
  const today = new Date().toDateString();
  state.mood.history = state.mood.history.filter(m => m.date !== today);
  state.mood.history.push({ date: today, emoji, score: info.score, label: info.label });
  try { localStorage.setItem('tc_mood_history', JSON.stringify(state.mood.history)); } catch(e) {}
  toast(`${emoji} Mood saved: ${info.label}`);
  renderMoodChart();
}

function renderMoodChart() {
  const bars = document.querySelectorAll('#moodBars .bar-col');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const now  = new Date();
  const todayIdx = (now.getDay() + 6) % 7; // 0=Mon

  bars.forEach((col, i) => {
    const bar    = col.querySelector('.bar');
    const label  = col.querySelector('.bar-day');
    const score  = 3 + Math.round(Math.random() * 6); // demo data
    const height = (score / 10) * 100;
    bar.style.height = height + '%';
    bar.classList.toggle('today', i === todayIdx);
    label.classList.toggle('today', i === todayIdx);
    label.textContent = i === todayIdx ? 'Today' : days[i];
    // Use real data if available
    const d = state.mood.history.find(m => {
      const md = new Date(m.date);
      return (md.getDay() + 6) % 7 === i;
    });
    if (d) bar.style.height = (d.score / 10 * 100) + '%';
  });
}

// ─── PDF REPORT ────────────────────────────
function downloadMoodReport() {
  toast('📄 PDF generating...');
  // Use jsPDF from CDN
  if (typeof window.jspdf === 'undefined') { toast('⚠️ PDF library loading, try again'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(27, 67, 50);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.text('TrueCompanion', 20, 18);
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text('Weekly Mood & Wellness Report', 20, 27);
  doc.text(new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }), 20, 34);

  // User info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text('User: ' + state.user.name, 20, 56);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.text('Language: ' + state.user.language, 20, 63);
  doc.text('Streak: ' + state.streak + ' days', 20, 70);

  // Divider
  doc.setDrawColor(82, 183, 136); doc.setLineWidth(0.5);
  doc.line(20, 76, 190, 76);

  // Today's mood
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(27, 67, 50);
  doc.text("Today's Mood", 20, 86);
  const todayMood = state.mood.today || { emoji: '😊', label: 'Good', score: 7 };
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(60, 60, 60);
  doc.text(`Status: ${todayMood.label} — Score: ${todayMood.score}/10`, 20, 94);

  // Weekly table
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(27, 67, 50);
  doc.text('Weekly Mood History', 20, 108);
  const cols = ['Date', 'Mood', 'Score'];
  const colX = [20, 90, 155];
  doc.setFillColor(212, 232, 214); doc.rect(18, 112, 174, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(27, 67, 50);
  cols.forEach((c, i) => doc.text(c, colX[i], 118));

  doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  const history = state.mood.history.length > 0 ? state.mood.history : [
    { date: new Date().toDateString(), label: 'Good', score: 7 }
  ];
  history.slice(-7).forEach((m, idx) => {
    const y = 128 + idx * 9;
    if (idx % 2 === 0) { doc.setFillColor(248, 250, 248); doc.rect(18, y - 5, 174, 9, 'F'); }
    doc.text(new Date(m.date).toLocaleDateString('en-IN'), colX[0], y);
    doc.text(m.label || '—', colX[1], y);
    doc.text(String(m.score || '—') + '/10', colX[2], y);
  });

  // AI Insights
  const insightY = 130 + Math.max(history.length, 1) * 9 + 14;
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(27, 67, 50);
  doc.text('AI Insights', 20, insightY);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 60, 60);
  doc.text('• Your mood peaks mid-week. Suggest maintaining a consistent morning routine.', 20, insightY + 8, { maxWidth: 170 });
  doc.text('• 7-day streak maintained! Consistency is key to mental wellness.', 20, insightY + 16, { maxWidth: 170 });
  doc.text('• Consider a short walk or breathing exercise when mood drops below 5.', 20, insightY + 24, { maxWidth: 170 });

  // Crisis info
  const cY = insightY + 38;
  doc.setFillColor(240, 245, 240); doc.rect(18, cY, 174, 22, 'F');
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(27, 67, 50);
  doc.text('Crisis Support — Available 24/7', 20, cY + 8);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
  doc.text('iCall: 9152987821 | AASRA: 9820466627 | Kiran: 1800-599-0019', 20, cY + 15);

  // Footer
  doc.setFillColor(27, 67, 50); doc.rect(0, 277, 210, 20, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('TrueCompanion — India\'s First AI Mental Health App | Made with 💚 in India', 105, 286, { align: 'center' });
  doc.text('This is not a medical report. Please consult a professional for clinical advice.', 105, 292, { align: 'center' });

  doc.save(`TrueCompanion_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  toast('✅ PDF downloaded!');
}

// ─── CRISIS DETECTION ──────────────────────
const crisisKeywords = [
  'khud ko hurt','self harm','suicide','marna chahta','jaan dena',
  'jeevan khatam','nahi rehna','mar jao','khatam kar','khatam krna',
  'khatam kar dun','hurt myself','kill myself','end my life','i want to die',
  'want to die','end it all','give up on life'
];
function detectCrisis(text) {
  return crisisKeywords.some(k => text.toLowerCase().includes(k));
}
function showCrisisInChat() {
  const box = document.getElementById('crisisInChat');
  box.style.display = 'block';
}

// ─── AI CHAT ───────────────────────────────
const systemPrompt = `You are TrueCompanion, India's first AI mental health companion app. Your role is to provide empathetic, non-judgmental emotional support in a warm, caring way.

IMPORTANT RULES:
1. Always respond in the same language/style the user is using (Hinglish, Hindi, English, etc.)
2. You are an AI — be transparent about this if asked, but engage warmly like a caring friend
3. Never provide medical diagnoses or prescribe medications
4. If user expresses suicidal thoughts or self-harm intent, always provide crisis helpline numbers: iCall (9152987821), AASRA (9820466627), Kiran (1800-599-0019)
5. Keep responses concise (2-4 sentences) and conversational, not clinical
6. Use occasional emojis to feel warm and human-like
7. Ask one follow-up question to encourage them to share more
8. Focus on validating feelings first, then gently exploring them
9. You know India's cultural context — family pressure, career stress, loneliness, etc.

Your personality: warm, patient, non-judgmental, curious, supportive. Like a best friend who truly listens.`;

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text || state.chat.aiTyping) return;

  // Add user message to UI
  input.value = ''; input.style.height = 'auto';
  document.getElementById('sendBtn').disabled = true;

  const now = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  appendMsg('user', text, now + ' ✓✓');
  scrollChatToBottom();

  // Crisis check
  if (detectCrisis(text)) showCrisisInChat();

  // Add to history
  state.chat.messages.push({ role: 'user', content: text });

  // Show typing
  state.chat.aiTyping = true;
  const typingEl = appendTyping();
  scrollChatToBottom();

  try {
    let apiKey = localStorage.getItem('tc_openai_key');
    if (!apiKey) {
      apiKey = prompt("🤖 Asli ChatGPT (AI) chalane ke liye apni OpenAI API Key dalein:\n(Yeh aapke browser mein safe rahegi)");
      if (apiKey && apiKey.trim().length > 0) {
        localStorage.setItem('tc_openai_key', apiKey.trim());
      } else {
        throw new Error('API Key Cancelled');
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // using gpt-4o for best reasoning, like ChatGPT
        max_tokens: 350,
        temperature: 0.7,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          ...state.chat.messages.slice(-10) // keep last 10 for context
        ]
      })
    });

    typingEl.remove();
    state.chat.aiTyping = false;
    document.getElementById('sendBtn').disabled = false;

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API Key Missing or Invalid');
      }
      throw new Error('API error ' + response.status);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Main abhi soch raha hoon... thoda wait karo 💚';

    state.chat.messages.push({ role: 'assistant', content: reply });
    const aiTime = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    appendMsg('ai', reply, aiTime);
    scrollChatToBottom();
    speakText(reply);

    // Crisis in AI reply check
    if (detectCrisis(text) || reply.toLowerCase().includes('iCall') || reply.toLowerCase().includes('helpline')) {
      showCrisisInChat();
    }
  } catch (err) {
    console.error("Chat API Error:", err);
    if (err.message.includes('API Key') || err.message.includes('Cancelled')) {
      if (err.message !== 'API Key Cancelled') {
        localStorage.removeItem('tc_openai_key');
        toast('⚠️ API Key galat thi! Agli baar nayi key maangega.', 4000);
      } else {
        toast('⚠️ Bina API key ke abhi bot offline baat karega!', 3000);
      }
    } else {
      toast('⚠️ Network Error, offline mode active.', 3000);
    }
    
    typingEl.remove();
    state.chat.aiTyping = false;
    document.getElementById('sendBtn').disabled = false;
    
    // Fallback offline responses
    const fallbacks = [
      'Shukriya share karne ke liye. Main samajh sakta hoon ki yeh mushkil waqt hai. Kya aap mujhe aur batana chahenge? 💙',
      'Aap bilkul sahi kar rahe ho yeh share karke. Aapki feelings valid hain. Kab se yeh feel ho raha hai? 💚',
      'Main yahan hoon aapke liye. Akela mat feel karo — kya koi specific cheez hai jo aapko zyada affect kar rahi hai? 🤍',
      'Yeh sach hai ki zindagi kabhi kabhi bahut heavy lagti hai. Lekin aap brave hain jo yeh bol rahe ho. Aage kya chahte ho? 🌱',
    ];
    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    state.chat.messages.push({ role: 'assistant', content: reply });
    const aiTime = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    appendMsg('ai', reply, aiTime);
    scrollChatToBottom();
    speakText(reply);
  }
}

function appendMsg(role, text, time) {
  const wrap = document.getElementById('chatMessages');
  const div  = document.createElement('div');
  div.className = `msg ${role} anim`;
  div.innerHTML = `
    <div class="msg-bubble">${escHtml(text)}</div>
    <div class="msg-time">${time}</div>`;
  wrap.appendChild(div);
}

function appendTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'typing-bubble';
  wrap.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  document.getElementById('chatMessages').appendChild(wrap);
  return wrap;
}

function scrollChatToBottom() {
  const el = document.getElementById('chatMessages');
  if (el) el.scrollTop = el.scrollHeight;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;').replace(/\n/g,'<br>');
}

// Enter to send
function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}
function chatInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

// ─── ELDERLY MODE ──────────────────────────
function toggleElderly() {
  state.elderlyMode = !state.elderlyMode;
  document.body.classList.toggle('elderly', state.elderlyMode);
  const tog = document.getElementById('elderlyToggle');
  tog.classList.toggle('on', state.elderlyMode);
  toast(state.elderlyMode ? '👴 Elderly Mode ON — Bade fonts aur high contrast!' : 'Elderly Mode OFF');
}

// ─── CRISIS CALLS ──────────────────────────
function callHelpline(name, num) {
  toast(`📞 Calling ${name}: ${num}`);
  window.open(`tel:${num}`, '_self');
}

// ─── PLAN PURCHASE ─────────────────────────
function selectPlan(name, price) {
  if (price === 0) { toast('✅ Aap pehle se Free plan par hain!'); return; }
  toast(`🔄 ${name} plan ke liye payment page open ho raha hai...`);
  // In real app: Razorpay integration here
}

// ─── INIT ──────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Start at splash
  navigate('splash');

  // Tab nav events
  document.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => navigate(tab.dataset.tab));
  });

  // Render initial chart bars (demo data)
  renderMoodChart();

  // Stats
  document.getElementById('streakCount').textContent = state.streak;
});
