/* ============================================
   LIVE CHAT — PREMIUM EDITION 💎
   Project: naincyKit
   Features: 40+ Premium Features
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyBGj9MkqAOUvGox8MEsaz7vPUOwQbAref4",
  authDomain: "naincykit.firebaseapp.com",
  databaseURL: "https://naincykit-default-rtdb.firebaseio.com",
  projectId: "naincykit",
  storageBucket: "naincykit.firebasestorage.app",
  messagingSenderId: "401758447692",
  appId: "1:401758447692:web:8928284aa8f7552290ece9"
};

window.NK = window.NK || {};
window.NK.utils = window.NK.utils || {
  dayKey(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  },
  startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  },
  messagePreview(msg) {
    if (!msg) return "";
    return (msg.text || "[media]").replace(/\s+/g, " ").slice(0, 48);
  },
  extractLinks(value) {
    if (!value || !value.toString) return [];
    const re = /(https?:\/\/|www\.)[^\s]+/gi;
    return (value.match(re) || []).filter(Boolean);
  },
  extractEmoji(text) {
    if (!text) return [];
    const regex = /(?:[\u2700-\u27BF]|[\u{1F300}-\u{1FAFF}]|[\u2600-\u26FF])/gu;
    return (text.match(regex) || []).filter(Boolean);
  }
};
window.NK.memories = window.NK.memories || { count: 0 };
window.NK.store = window.NK.store || {
  reactions: {},
  favorites: {},
  pinned: {},
  async loadAll() {
    const values = Object.values(window.allMessages || {});
    return values.map((msg, index) => ({ ...msg, key: msg.key || Object.keys(window.allMessages || {})[index] }));
  }
};
window.NK.dashboard = window.NK.dashboard || {
  cached: null,
  async compute(force = false) {
    const msgs = Object.values(window.allMessages || {});
    if (!msgs.length) return { empty: true, total: 0 };
    const bySender = {};
    msgs.forEach((m) => {
      if (!m || !m.sender) return;
      bySender[m.sender] = (bySender[m.sender] || 0) + 1;
    });
    const total = msgs.length;
    const photos = msgs.filter((m) => m.type === "image").length;
    const videos = msgs.filter((m) => m.type === "video").length;
    const voice = msgs.filter((m) => m.type === "voice").length;
    const topSender = Object.entries(bySender).sort((a, b) => b[1] - a[1])[0];
    const allLinks = msgs.reduce((sum, m) => sum + (m.text ? window.NK.utils.extractLinks(m.text).length : 0), 0);
    return {
      empty: false,
      total,
      photos,
      videos,
      voice,
      bySender,
      participants: Object.keys(bySender),
      topSender: topSender ? { name: topSender[0], count: topSender[1] } : null,
      linkCount: allLinks,
      chatDays: new Set(msgs.map((m) => window.NK.utils.dayKey(m.timestamp))).size,
      topDay: null,
      topEmoji: []
    };
  },
  invalidate() {
    this.cached = null;
  }
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let storageRef = null;
try { storageRef = firebase.storage().ref(); } catch(e) {}

// ─── USER IDENTITY ────────────────────────────────────────
let myName = localStorage.getItem("chatName");
if (!myName) {
  myName = (prompt("What is your name? (Ankit or Naincy):") || "Guest").trim();
  if (!myName) myName = "Guest";
  localStorage.setItem("chatName", myName);
}

let myDeviceId = localStorage.getItem("chatDeviceId");
if (!myDeviceId) {
  myDeviceId = myName + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  localStorage.setItem("chatDeviceId", myDeviceId);
}

const chatRef = db.ref("messages");
const typingRef = db.ref("typing/" + myName);
const presenceRef = db.ref("presence/" + myName);
const pinnedRef = db.ref("pinnedMessages");
const favoritesRef = db.ref("favoriteMessages");
const scheduledRef = db.ref("scheduledMessages");
const streakRef = db.ref("streakData");
const loveMeterRef = db.ref("loveMeter");

let lastReadMsgKey = localStorage.getItem("chatLastRead") || "";
let chatSoundEnabled = localStorage.getItem("chatSound") !== "off";
let myMsgKeys = new Set();
let allReactions = {};
let allPinned = {};
let allFavorites = {};
let allMessages = {};
let lastMsgCount = 0;

// ─── PREMIUM STATE ────────────────────────────────────────
let currentTheme = localStorage.getItem("chatTheme") || "default";
let chatPinLocked = false;
let chatPinCode = localStorage.getItem("chatPinCode") || "";
let editingMsgKey = null;
let replyingTo = null;
let gifPickerOpen = false;
let stickerPickerOpen = false;
let searchOpen = false;
let statsOpen = false;
let calendarOpen = false;
let scheduleOpen = false;
let voiceRecording = false;
let mediaRecorder = null;
let voiceChunks = [];
let voiceTimer = null;
let voiceSeconds = 0;

// ─── STREAK TRACKING ──────────────────────────────────────
let streakData = { days: 0, lastDate: "", started: "" };

function updateStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (streakData.lastDate === today) return;
  
  if (streakData.lastDate === yesterday) {
    streakData.days++;
  } else if (streakData.lastDate !== today) {
    streakData.days = 1;
    streakData.started = today;
  }
  streakData.lastDate = today;
  streakRef.set(streakData);
  updateStreakUI();
}

function updateStreakUI() {
  const el = document.getElementById("chat-streak-display");
  if (el) {
    el.innerHTML = `<span class="streak-fire">🔥</span> Day ${streakData.days}`;
  }
}

streakRef.on("value", (snap) => {
  const d = snap.val();
  if (d) {
    streakData = d;
    updateStreakUI();
  }
});

// ─── LOVE METER ───────────────────────────────────────────
let loveMeterValue = 97;

function updateLoveMeterUI() {
  const el = document.getElementById("chat-love-meter");
  if (el) {
    el.querySelector(".love-meter-fill").style.width = loveMeterValue + "%";
    el.querySelector(".love-meter-pct").textContent = loveMeterValue + "%";
  }
}

// ─── CHAT THEMES ──────────────────────────────────────────
const CHAT_THEMES = {
  default: { name: "Default", bg: "linear-gradient(135deg, rgba(255,77,141,0.2), rgba(155,92,255,0.2))", msgMe: "linear-gradient(135deg, #ff4d8d, #d946ef)", msgThem: "rgba(255,255,255,0.1)" },
  sakura: { name: "Sakura 🌸", bg: "linear-gradient(135deg, #fce4ec, #f8bbd0)", msgMe: "linear-gradient(135deg, #ec407a, #f48fb1)", msgThem: "rgba(236,64,122,0.15)" },
  galaxy: { name: "Galaxy 🌌", bg: "linear-gradient(135deg, #0d0221, #1a0533, #2d1b69)", msgMe: "linear-gradient(135deg, #7c4dff, #448aff)", msgThem: "rgba(124,77,255,0.15)" },
  neon: { name: "Neon 💚", bg: "linear-gradient(135deg, #0a0a0a, #1a1a2e)", msgMe: "linear-gradient(135deg, #00ff88, #00cc6a)", msgThem: "rgba(0,255,136,0.1)" },
  glass: { name: "Glass 🪟", bg: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))", msgMe: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))", msgThem: "rgba(255,255,255,0.08)" },
  dark: { name: "Dark 🖤", bg: "linear-gradient(135deg, #1a1a1a, #2d2d2d)", msgMe: "linear-gradient(135deg, #424242, #616161)", msgThem: "rgba(255,255,255,0.05)" },
  pink: { name: "Cute Pink 💗", bg: "linear-gradient(135deg, #ff9a9e, #fecfef)", msgMe: "linear-gradient(135deg, #ff6b9d, #c44569)", msgThem: "rgba(255,107,157,0.15)" },
  love: { name: "Love Theme ❤️", bg: "linear-gradient(135deg, #ee0979, #ff6a00)", msgMe: "linear-gradient(135deg, #ff0844, #ffb199)", msgThem: "rgba(255,8,68,0.15)" }
};

function applyChatTheme(themeKey) {
  const theme = CHAT_THEMES[themeKey] || CHAT_THEMES.default;
  currentTheme = themeKey;
  localStorage.setItem("chatTheme", themeKey);
  
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;
  
  chatBox.style.setProperty("--chat-header-bg", theme.bg);
  chatBox.style.setProperty("--chat-msg-me", theme.msgMe);
  chatBox.style.setProperty("--chat-msg-them", theme.msgThem);
  chatBox.dataset.theme = themeKey;
  
  // Re-render messages
  renderAllMessages();
}

// ─── AUTO DAY/NIGHT THEME ─────────────────────────────────
function autoDayNightTheme() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    // Daytime - light themes
    if (currentTheme === "default") applyChatTheme("sakura");
  } else {
    // Nighttime - dark themes
    if (currentTheme === "default") applyChatTheme("galaxy");
  }
}

// ─── PRESENCE HEARTBEAT ───────────────────────────────────
presenceRef.set({ online: true, lastSeen: Date.now(), name: myName });
presenceRef.onDisconnect().set({ online: false, lastSeen: Date.now(), name: myName });

setInterval(() => {
  presenceRef.update({ online: true, lastSeen: Date.now() });
}, 30000);

typingRef.onDisconnect().set(false);

// ─── CHAT SOUND (Web Audio) ──────────────────────────────
let audioCtx = null;

function playMsgSound() {
  if (!chatSoundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
}

function playSendSound() {
  if (!chatSoundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {}
}

// ─── TOGGLE CHAT BOX ─────────────────────────────────────
function toggleChat() {
  // PIN Lock Check
  if (chatPinCode && !chatPinLocked) {
    showPinLock();
    return;
  }
  
  const box = document.getElementById("chat-box");
  if (!box) return;
  box.classList.toggle("open");

  if (box.classList.contains("open")) {
    const input = document.getElementById("chat-input");
    if (input) setTimeout(() => input.focus(), 200);
    const messagesDiv = document.getElementById("chat-messages");
    if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
    markAllAsRead();
    const badge = document.querySelector(".chat-notif-badge");
    if (badge) badge.remove();
    updateStreak();
    
    // Clear all browser notifications when chat is opened
    if (typeof ChatNotifications !== "undefined") {
      ChatNotifications.clearAllNotifications();
    }
  }
}

// ─── PIN LOCK ─────────────────────────────────────────────
function showPinLock() {
  let overlay = document.getElementById("chat-pin-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "chat-pin-overlay";
    overlay.className = "chat-pin-overlay";
    overlay.innerHTML = `
      <div class="chat-pin-card">
        <span class="chat-pin-icon">🔒</span>
        <h3>Enter PIN</h3>
        <input type="password" id="chat-pin-input" maxlength="6" placeholder="Enter PIN..." />
        <div class="chat-pin-btns">
          <button onclick="checkChatPin()">Unlock</button>
          <button onclick="closePinLock()">Cancel</button>
        </div>
        <p class="chat-pin-error" id="chat-pin-error"></p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.classList.add("open");
  setTimeout(() => {
    const inp = document.getElementById("chat-pin-input");
    if (inp) inp.focus();
  }, 200);
}

function checkChatPin() {
  const inp = document.getElementById("chat-pin-input");
  const err = document.getElementById("chat-pin-error");
  if (!inp) return;
  if (inp.value === chatPinCode) {
    chatPinLocked = true;
    closePinLock();
    // Now actually open chat
    const box = document.getElementById("chat-box");
    if (box) {
      box.classList.add("open");
      const input = document.getElementById("chat-input");
      if (input) setTimeout(() => input.focus(), 200);
      markAllAsRead();
    }
  } else {
    if (err) err.textContent = "Wrong PIN! 💔";
    inp.value = "";
    inp.classList.add("shake");
    setTimeout(() => inp.classList.remove("shake"), 500);
  }
}

function closePinLock() {
  const overlay = document.getElementById("chat-pin-overlay");
  if (overlay) overlay.classList.remove("open");
}

function setChatPin() {
  const pin = prompt("Set a 4-6 digit PIN for chat lock:");
  if (pin && pin.length >= 4 && pin.length <= 6) {
    chatPinCode = pin;
    localStorage.setItem("chatPinCode", pin);
    showPremiumToast("PIN Lock set! 🔒");
  }
}

function removeChatPin() {
  chatPinCode = "";
  chatPinLocked = false;
  localStorage.removeItem("chatPinCode");
  showPremiumToast("PIN Lock removed 🔓");
}

// ─── MARK ALL AS READ ────────────────────────────────────
function markAllAsRead() {
  chatRef.limitToLast(1).once("value", (snap) => {
    const data = snap.val();
    if (data) {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        lastReadMsgKey = keys[keys.length - 1];
        localStorage.setItem("chatLastRead", lastReadMsgKey);
      }
    }
  });
}

// ─── SEND MESSAGE ────────────────────────────────────────
function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  typingRef.set(false);

  // Edit mode
  if (editingMsgKey) {
    chatRef.child(editingMsgKey).update({
      text: text.slice(0, 500),
      edited: true,
      editedAt: Date.now()
    });
    editingMsgKey = null;
    hideEditBar();
    input.value = "";
    playSendSound();
    return;
  }

  const msgData = {
    text: text.slice(0, 500),
    sender: myName,
    timestamp: Date.now(),
    deviceId: myDeviceId,
    read: false
  };

  // Reply reference
  if (replyingTo) {
    msgData.replyTo = replyingTo.key;
    msgData.replyText = replyingTo.text;
    msgData.replySender = replyingTo.sender;
    replyingTo = null;
    hideReplyBar();
  }

  chatRef.push(msgData);
  input.value = "";
  if (emojiPickerOpen) toggleEmojiPicker();
  playSendSound();

  // Love Rain trigger
  const lower = text.toLowerCase();
  if (lower.includes("i love you") || lower.includes("love you") || lower.includes("i love u") ||
      lower.includes("miss you") || lower.includes("love u") || lower.includes("ily") ||
      lower.includes("❤️❤️❤️") || lower.includes("💕💕💕")) {
    triggerLoveRain();
    triggerMessageAnimation("hearts");
  }

  // AI Auto Reply check
  checkAIAutoReply(text);
}

// ─── SEND SPECIAL MESSAGE TYPES ───────────────────────────
function sendSecretMessage() {
  const text = prompt("Type your secret message:");
  if (!text || !text.trim()) return;
  
  chatRef.push({
    text: text.slice(0, 500),
    sender: myName,
    timestamp: Date.now(),
    deviceId: myDeviceId,
    read: false,
    secret: true,
    revealed: false
  });
  playSendSound();
  showPremiumToast("Secret message sent! 🤫");
}

function sendSelfDestructMessage() {
  const text = prompt("Type message (will self-destruct):");
  if (!text || !text.trim()) return;
  
  const durations = [5, 30, 60];
  const choice = prompt("Delete after: 1) 5 sec  2) 30 sec  3) 1 min\nEnter 1, 2, or 3:");
  const dur = durations[parseInt(choice) - 1] || 30;
  
  chatRef.push({
    text: text.slice(0, 500),
    sender: myName,
    timestamp: Date.now(),
    deviceId: myDeviceId,
    read: false,
    selfDestruct: true,
    destructAfter: dur
  });
  playSendSound();
  showPremiumToast(`Self-destruct in ${dur}s! 💣`);
}

function sendScheduledMessage() {
  const text = prompt("Type your scheduled message:");
  if (!text || !text.trim()) return;
  
  const timeStr = prompt("Schedule time (e.g., '2026-08-06 00:00' for tomorrow midnight):");
  if (!timeStr) return;
  
  const scheduledTime = new Date(timeStr).getTime();
  if (isNaN(scheduledTime) || scheduledTime < Date.now()) {
    showPremiumToast("Invalid or past time! ⏰");
    return;
  }
  
  scheduledRef.push({
    text: text.slice(0, 500),
    sender: myName,
    scheduledTime: scheduledTime,
    createdAt: Date.now(),
    sent: false
  });
  showPremiumToast("Message scheduled! 📅");
}

// Check and send scheduled messages
setInterval(() => {
  scheduledRef.orderByChild("sent").equalTo(false).once("value", (snap) => {
    const data = snap.val();
    if (!data) return;
    Object.entries(data).forEach(([key, msg]) => {
      if (msg.scheduledTime <= Date.now()) {
        chatRef.push({
          text: msg.text,
          sender: msg.sender,
          timestamp: Date.now(),
          deviceId: myDeviceId,
          read: false,
          scheduled: true
        });
        scheduledRef.child(key).update({ sent: true });
      }
    });
  });
}, 30000);

// ─── REPLY TO MESSAGE ────────────────────────────────────
function replyToMessage(key, text, sender) {
  replyingTo = { key, text, sender };
  showReplyBar(sender, text);
  const input = document.getElementById("chat-input");
  if (input) input.focus();
}

function showReplyBar(sender, text) {
  let bar = document.getElementById("chat-reply-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "chat-reply-bar";
    bar.className = "chat-reply-bar";
    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(bar, inputRow);
  }
  bar.innerHTML = `
    <div class="reply-preview">
      <div class="reply-preview-line"></div>
      <div class="reply-preview-content">
        <span class="reply-preview-name">${escapeHtml(sender)}</span>
        <span class="reply-preview-text">${escapeHtml(text.substring(0, 50))}</span>
      </div>
    </div>
    <button class="reply-cancel" onclick="hideReplyBar()">✕</button>
  `;
  bar.style.display = "flex";
}

function hideReplyBar() {
  replyingTo = null;
  const bar = document.getElementById("chat-reply-bar");
  if (bar) bar.style.display = "none";
}

// ─── EDIT MESSAGE ────────────────────────────────────────
function editMessage(key, text) {
  editingMsgKey = key;
  const input = document.getElementById("chat-input");
  if (input) {
    input.value = text;
    input.focus();
  }
  showEditBar(text);
}

function showEditBar(text) {
  let bar = document.getElementById("chat-edit-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "chat-edit-bar";
    bar.className = "chat-edit-bar";
    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(bar, inputRow);
  }
  bar.innerHTML = `
    <span class="edit-icon">✏️</span>
    <span class="edit-label">Editing message</span>
    <button class="edit-cancel" onclick="cancelEdit()">✕</button>
  `;
  bar.style.display = "flex";
}

function hideEditBar() {
  const bar = document.getElementById("chat-edit-bar");
  if (bar) bar.style.display = "none";
}

function cancelEdit() {
  editingMsgKey = null;
  const input = document.getElementById("chat-input");
  if (input) input.value = "";
  hideEditBar();
}

// ─── PIN MESSAGE ──────────────────────────────────────────
function pinMessage(key) {
  if (allPinned[key]) {
    pinnedRef.child(key).remove();
    showPremiumToast("Message unpinned 📌");
  } else {
    pinnedRef.child(key).set({
      pinnedBy: myName,
      timestamp: Date.now()
    });
    showPremiumToast("Message pinned! 📌");
  }
}

pinnedRef.on("value", (snap) => {
  allPinned = snap.val() || {};
  updatePinnedBar();
});

function updatePinnedBar() {
  let bar = document.getElementById("chat-pinned-bar");
  const keys = Object.keys(allPinned);
  
  if (keys.length === 0) {
    if (bar) bar.style.display = "none";
    return;
  }
  
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "chat-pinned-bar";
    bar.className = "chat-pinned-bar";
    const msgs = document.getElementById("chat-messages");
    if (msgs && msgs.parentElement) {
      msgs.parentElement.insertBefore(bar, msgs);
    }
  }
  
  // Show latest pinned message
  const latestKey = keys[keys.length - 1];
  const msg = allMessages[latestKey];
  if (msg) {
    bar.innerHTML = `
      <span class="pinned-icon">📌</span>
      <span class="pinned-text">${escapeHtml((msg.text || "").substring(0, 40))}</span>
      <button class="pinned-close" onclick="document.getElementById('chat-pinned-bar').style.display='none'">✕</button>
    `;
    bar.style.display = "flex";
  }
}

// ─── FAVORITE MESSAGE ─────────────────────────────────────
function favoriteMessage(key) {
  if (allFavorites[key]) {
    favoritesRef.child(key).remove();
    showPremiumToast("Removed from favorites");
  } else {
    favoritesRef.child(key).set({
      favoritedBy: myName,
      timestamp: Date.now()
    });
    showPremiumToast("Added to favorites! ⭐");
  }
}

favoritesRef.on("value", (snap) => {
  allFavorites = snap.val() || {};
});

// ─── SEARCH MESSAGES ──────────────────────────────────────
function toggleSearch() {
  searchOpen = !searchOpen;
  let panel = document.getElementById("chat-search-panel");
  
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "chat-search-panel";
    panel.className = "chat-search-panel";
    panel.innerHTML = `
      <div class="search-input-row">
        <input type="text" id="chat-search-input" placeholder="Search messages..." oninput="searchMessages(this.value)" />
        <button onclick="toggleSearch()">✕</button>
      </div>
      <div class="search-results" id="chat-search-results"></div>
    `;
    const header = document.querySelector(".chat-header");
    if (header) header.after(panel);
  }
  
  panel.classList.toggle("open", searchOpen);
  if (searchOpen) {
    setTimeout(() => {
      const inp = document.getElementById("chat-search-input");
      if (inp) inp.focus();
    }, 200);
  }
}

function searchMessages(query) {
  const results = document.getElementById("chat-search-results");
  if (!results) return;
  
  if (!query || query.length < 2) {
    results.innerHTML = "";
    return;
  }
  
  const q = query.toLowerCase();
  const found = Object.entries(allMessages).filter(([key, msg]) => {
    return msg.text && msg.text.toLowerCase().includes(q);
  }).slice(-10);
  
  if (found.length === 0) {
    results.innerHTML = '<div class="search-empty">No messages found</div>';
    return;
  }
  
  results.innerHTML = found.map(([key, msg]) => `
    <div class="search-result-item" onclick="scrollToMessage('${key}')">
      <span class="search-result-sender">${escapeHtml(msg.sender || "")}</span>
      <span class="search-result-text">${highlightSearch(msg.text, query)}</span>
    </div>
  `).join("");
}

function highlightSearch(text, query) {
  if (!text) return "";
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escaped.replace(regex, '<mark>$1</mark>');
}

function scrollToMessage(key) {
  const el = document.querySelector(`.msg[data-key="${key}"]`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("msg-highlight");
    setTimeout(() => el.classList.remove("msg-highlight"), 2000);
  }
  toggleSearch();
}

// ─── CHAT STATISTICS ──────────────────────────────────────
async function toggleStats() {
  statsOpen = !statsOpen;
  let panel = document.getElementById("chat-stats-panel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "chat-stats-panel";
    panel.className = "chat-stats-panel";
    document.body.appendChild(panel);
  }

  if (statsOpen) {
    let data = { empty: true, total: 0, topSender: null, linkCount: 0, chatDays: 0 };
    try {
      data = await window.NK.dashboard.compute(true);
    } catch (error) {
      console.error("Dashboard stats failed:", error);
    }

    const msgs = Object.values(allMessages || {});
    const totalMsgs = data.total || msgs.length;
    const photos = data.photos || msgs.filter((m) => m.type === "image").length;
    const videos = data.videos || msgs.filter((m) => m.type === "video").length;
    const voice = data.voice || msgs.filter((m) => m.type === "voice").length;

    const emojiCount = {};
    const emojiRegex = /(?:[\u2700-\u27BF]|[\u{1F300}-\u{1FAFF}]|[\u2600-\u26FF])/gu;
    msgs.forEach((m) => {
      if (m.text) {
        const emojis = m.text.match(emojiRegex) || [];
        emojis.forEach((e) => {
          emojiCount[e] = (emojiCount[e] || 0) + 1;
        });
      }
    });

    const topEmoji = Object.entries(emojiCount).sort((a, b) => b[1] - a[1])[0];
    const topSenderName = data.topSender ? data.topSender.name : "—";
    const topSenderCount = data.topSender ? data.topSender.count : 0;
    const topDay = data.topDay ? data.topDay.day : "—";
    const longestStreak = streakData.days || 0;

    panel.innerHTML = `
      <div class="chat-stats-card">
        <div class="stats-header">
          <h3>📊 Relationship Stats</h3>
          <button onclick="toggleStats()">✕</button>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-num">${totalMsgs.toLocaleString()}</span>
            <span class="stat-label">Messages</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">${photos}</span>
            <span class="stat-label">Photos</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">${videos}</span>
            <span class="stat-label">Videos</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">${voice}</span>
            <span class="stat-label">Voice Notes</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">${topEmoji ? topEmoji[0] : "❤️"}</span>
            <span class="stat-label">Top Emoji</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">🔥 ${longestStreak}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>

        <div class="relationship-breakdown">
          <div class="mini-metric">
            <span>Top sender</span>
            <strong>${escapeHtml(topSenderName)}</strong>
          </div>
          <div class="mini-metric">
            <span>Most active day</span>
            <strong>${escapeHtml(topDay)}</strong>
          </div>
          <div class="mini-metric">
            <span>Chat days</span>
            <strong>${data.chatDays || 0}</strong>
          </div>
          <div class="mini-metric">
            <span>Shared links</span>
            <strong>${data.linkCount || 0}</strong>
          </div>
        </div>

        <div class="stats-love-meter">
          <h4>💖 Love Meter</h4>
          <div class="love-meter-bar">
            <div class="love-meter-fill" style="width: ${loveMeterValue}%"></div>
          </div>
          <span class="love-meter-pct">${loveMeterValue}% Compatible</span>
        </div>
      </div>
    `;
    panel.classList.add("open");
  } else {
    panel.classList.remove("open");
  }
}

// ─── CHAT CALENDAR ────────────────────────────────────────
function toggleCalendar() {
  calendarOpen = !calendarOpen;
  let panel = document.getElementById("chat-calendar-panel");
  
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "chat-calendar-panel";
    panel.className = "chat-calendar-panel";
    document.body.appendChild(panel);
  }
  
  if (calendarOpen) {
    panel.innerHTML = `
      <div class="chat-calendar-card">
        <div class="calendar-header">
          <h3>📅 Chat Calendar</h3>
          <button onclick="toggleCalendar()">✕</button>
        </div>
        <input type="date" id="chat-calendar-date" onchange="loadCalendarDate(this.value)" />
        <div class="calendar-results" id="chat-calendar-results">
          <p class="calendar-hint">Select a date to see all messages from that day</p>
        </div>
      </div>
    `;
    panel.classList.add("open");
  } else {
    panel.classList.remove("open");
  }
}

function loadCalendarDate(dateStr) {
  const results = document.getElementById("chat-calendar-results");
  if (!results || !dateStr) return;
  
  const selected = new Date(dateStr);
  const dayStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).getTime();
  const dayEnd = dayStart + 86400000;
  
  const dayMsgs = Object.entries(allMessages).filter(([key, msg]) => {
    return msg.timestamp >= dayStart && msg.timestamp < dayEnd;
  }).sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  if (dayMsgs.length === 0) {
    results.innerHTML = '<p class="calendar-empty">No messages on this day</p>';
    return;
  }
  
  results.innerHTML = `
    <p class="calendar-count">${dayMsgs.length} messages on ${selected.toLocaleDateString()}</p>
    ${dayMsgs.map(([key, msg]) => `
      <div class="calendar-msg">
        <span class="cal-msg-sender">${escapeHtml(msg.sender)}</span>
        <span class="cal-msg-text">${escapeHtml(msg.text || "[media]")}</span>
        <span class="cal-msg-time">${new Date(msg.timestamp).toLocaleTimeString("en-US", {hour:"2-digit",minute:"2-digit"})}</span>
      </div>
    `).join("")}
  `;
}

// ─── IMAGE SHARING ────────────────────────────────────────
function sendImage() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showPremiumToast("Image too large! Max 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      chatRef.push({
        type: "image",
        imageUrl: base64,
        sender: myName,
        timestamp: Date.now(),
        deviceId: myDeviceId,
        read: false
      });
      playSendSound();
      showPremiumToast("Image sent! 📸");
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ─── VIDEO SHARING ────────────────────────────────────────
function sendVideo() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      showPremiumToast("Video too large! Max 10MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      chatRef.push({
        type: "video",
        videoUrl: ev.target.result,
        sender: myName,
        timestamp: Date.now(),
        deviceId: myDeviceId,
        read: false
      });
      playSendSound();
      showPremiumToast("Video sent! 🎥");
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ─── VOICE MESSAGE ────────────────────────────────────────
function toggleVoiceRecord() {
  if (voiceRecording) {
    stopVoiceRecord();
  } else {
    startVoiceRecord();
  }
}

function startVoiceRecord() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showPremiumToast("Microphone not available!");
    return;
  }
  
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    voiceRecording = true;
    voiceChunks = [];
    voiceSeconds = 0;
    
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) voiceChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(voiceChunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onload = (ev) => {
        chatRef.push({
          type: "voice",
          voiceUrl: ev.target.result,
          duration: voiceSeconds,
          sender: myName,
          timestamp: Date.now(),
          deviceId: myDeviceId,
          read: false
        });
        playSendSound();
        showPremiumToast("Voice message sent! 🎤");
      };
      reader.readAsDataURL(blob);
    };
    
    mediaRecorder.start();
    
    // Timer
    voiceTimer = setInterval(() => {
      voiceSeconds++;
      updateVoiceRecordUI();
    }, 1000);
    
    updateVoiceRecordUI();
  }).catch(err => {
    showPremiumToast("Mic permission denied!");
  });
}

function stopVoiceRecord() {
  voiceRecording = false;
  if (voiceTimer) clearInterval(voiceTimer);
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  hideVoiceRecordUI();
}

function cancelVoiceRecord() {
  voiceRecording = false;
  if (voiceTimer) clearInterval(voiceTimer);
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  voiceChunks = [];
  hideVoiceRecordUI();
}

function updateVoiceRecordUI() {
  let bar = document.getElementById("chat-voice-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "chat-voice-bar";
    bar.className = "chat-voice-bar";
    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(bar, inputRow);
  }
  const mins = Math.floor(voiceSeconds / 60);
  const secs = voiceSeconds % 60;
  bar.innerHTML = `
    <div class="voice-rec-indicator">
      <span class="voice-rec-dot"></span>
      <span class="voice-rec-time">${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}</span>
      <span class="voice-rec-waves">〰️</span>
    </div>
    <div class="voice-rec-actions">
      <button class="voice-cancel-btn" onclick="cancelVoiceRecord()">🗑️</button>
      <button class="voice-stop-btn" onclick="stopVoiceRecord()">⏹️ Send</button>
    </div>
  `;
  bar.style.display = "flex";
}

function hideVoiceRecordUI() {
  const bar = document.getElementById("chat-voice-bar");
  if (bar) bar.style.display = "none";
}

// ─── FILE SHARING ─────────────────────────────────────────
function sendFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,.zip,.apk,.txt,.xls,.xlsx,.ppt,.pptx";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      showPremiumToast("File too large! Max 10MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      chatRef.push({
        type: "file",
        fileUrl: ev.target.result,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        sender: myName,
        timestamp: Date.now(),
        deviceId: myDeviceId,
        read: false
      });
      playSendSound();
      showPremiumToast("File sent! 📄");
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ─── STICKER PACK ─────────────────────────────────────────
const STICKER_PACK = [
  "🥰", "😘", "🤗", "💕", "💖", "💗", "❤️", "💝",
  "🌹", "🦋", "✨", "💫", "🌸", "🌺", "🌷", "💐",
  "🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁",
  "😍", "🥺", "😢", "🙈", "💪", "👑", "🎉", "🎊",
  "☕", "🍕", "🍰", "🧁", "🍫", "🍩", "🎂", "🍪"
];

function toggleStickerPicker() {
  stickerPickerOpen = !stickerPickerOpen;
  let picker = document.getElementById("chat-sticker-picker");
  
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "chat-sticker-picker";
    picker.className = "chat-sticker-picker";
    
    const grid = document.createElement("div");
    grid.className = "sticker-grid";
    
    STICKER_PACK.forEach(sticker => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sticker-btn";
      btn.textContent = sticker;
      btn.addEventListener("click", () => {
        sendSticker(sticker);
      });
      grid.appendChild(btn);
    });
    
    picker.appendChild(grid);
    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(picker, inputRow);
  }
  
  picker.classList.toggle("open", stickerPickerOpen);
}

function sendSticker(sticker) {
  chatRef.push({
    type: "sticker",
    sticker: sticker,
    sender: myName,
    timestamp: Date.now(),
    deviceId: myDeviceId,
    read: false
  });
  playSendSound();
  if (stickerPickerOpen) toggleStickerPicker();
}

// ─── GIF SEARCH (KLIPY API) ──────────────────────────────
// 🔑 PASTE YOUR KLIPY API KEY BELOW (get it from https://partner.klipy.com/api-keys)
const KLIPY_API_KEY = "FsTUSFpgCVoWOk3yQo7HIHCvTe0UXx55To9hyZLFUAmgphfQaXpyhPFSEUTU8bN8";
const KLIPY_BASE_URL = "https://api.klipy.com/api/v1";
let klipyCurrentPage = 1;
let klipyCurrentQuery = "";
let klipyHasNext = false;

function toggleGifPicker() {
  gifPickerOpen = !gifPickerOpen;
  let picker = document.getElementById("chat-gif-picker");
  
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "chat-gif-picker";
    picker.className = "chat-gif-picker";
    picker.innerHTML = `
      <div class="gif-search-row">
        <input type="text" id="gif-search-input" placeholder="Search GIFs on Klipy..." onkeydown="if(event.key==='Enter') searchKlipyGifs(this.value)" />
        <button onclick="searchKlipyGifs(document.getElementById('gif-search-input').value)">🔍</button>
      </div>
      <div class="gif-results" id="gif-results">
        <p class="gif-hint">🎭 Powered by Klipy — Search love, cute, happy GIFs...</p>
      </div>
    `;
    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(picker, inputRow);
  }
  
  picker.classList.toggle("open", gifPickerOpen);
  if (gifPickerOpen) {
    setTimeout(() => {
      const inp = document.getElementById("gif-search-input");
      if (inp) inp.focus();
    }, 200);
    // Load trending GIFs on open
    loadKlipyTrending();
  }
}


// ─── KLIPY: Load Trending GIFs ────────────────────────────
function loadKlipyTrending() {
  const results = document.getElementById("gif-results");
  if (!results) return;
  
  /*
  if (!KLIPY_API_KEY) {
    results.innerHTML = '<p class="gif-error">⚠️ Klipy API key not set! Add your key in live-chat.js</p>';
    return;
  }
  */
  
  results.innerHTML = '<p class="gif-loading">🔥 Loading trending GIFs...</p>';
  
  const url = `${KLIPY_BASE_URL}/${KLIPY_API_KEY}/gifs/trending?per_page=24&locale=in_IN`;
  
  fetch(url)
    .then(r => r.json())
    .then(response => {
      if (!response.result || !response.data || !response.data.data || response.data.data.length === 0) {
        results.innerHTML = '<p class="gif-empty">No trending GIFs found</p>';
        return;
      }
      
      klipyHasNext = response.data.has_next;
      klipyCurrentPage = response.data.current_page;
      klipyCurrentQuery = "";
      
      renderKlipyGifs(response.data.data, results);
      
      // Add "Load More" button if there are more results
      if (klipyHasNext) {
        const loadMoreBtn = document.createElement("button");
        loadMoreBtn.className = "gif-load-more";
        loadMoreBtn.textContent = "Load More Trending 🔥";
        loadMoreBtn.onclick = () => loadKlipyTrendingMore();
        results.appendChild(loadMoreBtn);
      }
    })
    .catch(err => {
      results.innerHTML = '<p class="gif-error">Could not load GIFs. Check API key or try again!</p>';
      console.error("Klipy trending error:", err);
    });
}

function loadKlipyTrendingMore() {
  const results = document.getElementById("gif-results");
  if (!results) return;
  
  const nextPage = klipyCurrentPage + 1;
  const url = `${KLIPY_BASE_URL}/${KLIPY_API_KEY}/gifs/trending?per_page=24&page=${nextPage}&locale=in_IN`;
  
  // Remove load more button
  const loadMore = results.querySelector(".gif-load-more");
  if (loadMore) loadMore.remove();
  
  fetch(url)
    .then(r => r.json())
    .then(response => {
      if (!response.result || !response.data || !response.data.data) return;
      
      klipyHasNext = response.data.has_next;
      klipyCurrentPage = response.data.current_page;
      
      renderKlipyGifs(response.data.data, results, true);
      
      if (klipyHasNext) {
        const loadMoreBtn = document.createElement("button");
        loadMoreBtn.className = "gif-load-more";
        loadMoreBtn.textContent = "Load More 🔥";
        loadMoreBtn.onclick = () => loadKlipyTrendingMore();
        results.appendChild(loadMoreBtn);
      }
    })
    .catch(err => console.error("Klipy trending more error:", err));
}

// ─── KLIPY: Search GIFs ──────────────────────────────────
function searchKlipyGifs(query) {
  const results = document.getElementById("gif-results");
  if (!results) return;
  
  if (!query || !query.trim()) {
    loadKlipyTrending();
    return;
  }
  
  if (!KLIPY_API_KEY) {
    results.innerHTML = '<p class="gif-error">⚠️ Klipy API key not set! Add your key in live-chat.js</p>';
    return;
  }
  
  results.innerHTML = '<p class="gif-loading">🔍 Searching GIFs...</p>';
  klipyCurrentQuery = query;
  klipyCurrentPage = 1;
  
  const url = `${KLIPY_BASE_URL}/${KLIPY_API_KEY}/gifs/search?q=${encodeURIComponent(query)}&per_page=24&locale=in_IN&rating=g`;
  
  fetch(url)
    .then(r => r.json())
    .then(response => {
      if (!response.result || !response.data || !response.data.data || response.data.data.length === 0) {
        results.innerHTML = '<p class="gif-empty">No GIFs found for "' + escapeHtml(query) + '"</p>';
        return;
      }
      
      klipyHasNext = response.data.has_next;
      klipyCurrentPage = response.data.current_page;
      
      renderKlipyGifs(response.data.data, results);
      
      if (klipyHasNext) {
        const loadMoreBtn = document.createElement("button");
        loadMoreBtn.className = "gif-load-more";
        loadMoreBtn.textContent = "Load More Results 🔍";
        loadMoreBtn.onclick = () => searchKlipyGifsMore();
        results.appendChild(loadMoreBtn);
      }
    })
    .catch(err => {
      results.innerHTML = '<p class="gif-error">Could not search GIFs. Try again!</p>';
      console.error("Klipy search error:", err);
    });
}

function searchKlipyGifsMore() {
  const results = document.getElementById("gif-results");
  if (!results || !klipyCurrentQuery) return;
  
  const nextPage = klipyCurrentPage + 1;
  const url = `${KLIPY_BASE_URL}/${KLIPY_API_KEY}/gifs/search?q=${encodeURIComponent(klipyCurrentQuery)}&per_page=24&page=${nextPage}&locale=in_IN&rating=g`;
  
  const loadMore = results.querySelector(".gif-load-more");
  if (loadMore) loadMore.remove();
  
  fetch(url)
    .then(r => r.json())
    .then(response => {
      if (!response.result || !response.data || !response.data.data) return;
      
      klipyHasNext = response.data.has_next;
      klipyCurrentPage = response.data.current_page;
      
      renderKlipyGifs(response.data.data, results, true);
      
      if (klipyHasNext) {
        const loadMoreBtn = document.createElement("button");
        loadMoreBtn.className = "gif-load-more";
        loadMoreBtn.textContent = "Load More 🔍";
        loadMoreBtn.onclick = () => searchKlipyGifsMore();
        results.appendChild(loadMoreBtn);
      }
    })
    .catch(err => console.error("Klipy search more error:", err));
}

// Keep old function name for backwards compatibility
function searchGifs(query) {
  searchKlipyGifs(query);
}

// ─── KLIPY: Render GIF Grid ──────────────────────────────
function renderKlipyGifs(gifData, container, append = false) {
  if (!append) container.innerHTML = "";
  
  gifData.forEach(gif => {
    // Klipy response structure: each gif has id, title, slug, file (with sizes)
    // file structure: { xs: {jpg: {url}}, sm: {jpg: {url}}, md: {gif: {url}}, hd: {gif: {url}} }
    const files = gif.file || gif.files || {};
    
    // Get thumbnail URL (small preview)
    let thumbUrl = "";
    if (files.xs && files.xs.jpg && files.xs.jpg.url) {
      thumbUrl = files.xs.jpg.url;
    } else if (files.sm && files.sm.jpg && files.sm.jpg.url) {
      thumbUrl = files.sm.jpg.url;
    } else if (files.xs && files.xs.gif && files.xs.gif.url) {
      thumbUrl = files.xs.gif.url;
    }
    
    // Get full GIF URL
    let fullUrl = "";
    if (files.hd && files.hd.gif && files.hd.gif.url) {
      fullUrl = files.hd.gif.url;
    } else if (files.md && files.md.gif && files.md.gif.url) {
      fullUrl = files.md.gif.url;
    } else if (files.gif && files.gif.url) {
      fullUrl = files.gif.url;
    } else if (files.sm && files.sm.gif && files.sm.gif.url) {
      fullUrl = files.sm.gif.url;
    }
    
    // Fallback: use slug-based URL
    if (!thumbUrl && gif.slug) {
      thumbUrl = `https://media.klipy.com/320/${gif.slug}.gif`;
    }
    if (!fullUrl && gif.slug) {
      fullUrl = `https://media.klipy.com/${gif.slug}.gif`;
    }
    
    // Use gif.url or gif.src as ultimate fallback
    if (!thumbUrl) thumbUrl = gif.url || gif.src || "";
    if (!fullUrl) fullUrl = gif.url || gif.src || thumbUrl;
    
    if (!thumbUrl) return; // Skip if no URL found
    
    const img = document.createElement("img");
    img.className = "gif-thumb";
    img.src = thumbUrl;
    img.alt = gif.title || "GIF";
    img.loading = "lazy";
    img.title = gif.title || "";
    img.setAttribute("data-full", fullUrl);
    img.setAttribute("data-thumb", thumbUrl);
    
    // Escape URLs for onclick
    const escapedFull = fullUrl.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const escapedThumb = thumbUrl.replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    img.onclick = function() {
      sendKlipyGif(escapedFull, escapedThumb);
    };
    
    container.appendChild(img);
  });
}

// ─── KLIPY: Send GIF ─────────────────────────────────────
function sendKlipyGif(fullUrl, thumbUrl) {
  chatRef.push({
    type: "gif",
    gifUrl: thumbUrl,
    gifOriginal: fullUrl,
    gifProvider: "klipy",
    sender: myName,
    timestamp: Date.now(),
    deviceId: myDeviceId,
    read: false
  });
  playSendSound();
  if (gifPickerOpen) toggleGifPicker();
  showPremiumToast("GIF sent! 🎭");
}

// Keep old function name for backwards compatibility
function sendGif(originalUrl, thumbUrl) {
  sendKlipyGif(originalUrl, thumbUrl);
}

// ─── DOUBLE TAP LIKE ──────────────────────────────────────
let lastTapTime = 0;
let lastTapKey = "";

function handleDoubleTap(key, el) {
  const now = Date.now();
  if (lastTapKey === key && now - lastTapTime < 400) {
    // Double tap!
    reactToMessage(key, "❤️");
    showDoubleTapHeart(el);
    lastTapTime = 0;
    lastTapKey = "";
  } else {
    lastTapTime = now;
    lastTapKey = key;
  }
}

function showDoubleTapHeart(el) {
  const heart = document.createElement("span");
  heart.className = "double-tap-heart";
  heart.textContent = "❤️";
  heart.style.position = "absolute";
  heart.style.top = "50%";
  heart.style.left = "50%";
  heart.style.transform = "translate(-50%, -50%) scale(0)";
  heart.style.fontSize = "2.5rem";
  heart.style.pointerEvents = "none";
  heart.style.zIndex = "100";
  heart.style.animation = "doubleTapHeart 0.8s ease-out forwards";
  
  el.style.position = "relative";
  el.appendChild(heart);
  setTimeout(() => heart.remove(), 900);
}

// ─── MESSAGE ANIMATIONS ───────────────────────────────────
function triggerMessageAnimation(type) {
  const container = document.getElementById("chat-messages");
  if (!container) return;
  
  const animations = {
    confetti: () => spawnConfettiInChat(container),
    fireworks: () => spawnFireworksInChat(container),
    hearts: () => { /* already handled by love rain */ },
    snow: () => spawnSnowInChat(container),
    balloons: () => spawnBalloonsInChat(container)
  };
  
  if (animations[type]) animations[type]();
}

function spawnConfettiInChat(container) {
  const colors = ["#ff4d8d", "#9b5cff", "#ffd6a0", "#4ade80", "#60a5fa", "#fbbf24"];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("span");
    p.className = "chat-confetti";
    p.style.left = Math.random() * 100 + "%";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.setProperty("--cd", 1.5 + Math.random() * 1.5 + "s");
    p.style.animationDelay = Math.random() * 0.5 + "s";
    p.style.width = 6 + Math.random() * 6 + "px";
    p.style.height = 6 + Math.random() * 6 + "px";
    container.appendChild(p);
    setTimeout(() => p.remove(), 3500);
  }
}

function spawnFireworksInChat(container) {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const fw = document.createElement("span");
      fw.className = "chat-firework";
      fw.style.left = 20 + Math.random() * 60 + "%";
      fw.style.top = 20 + Math.random() * 60 + "%";
      fw.textContent = "✨";
      fw.style.fontSize = "2rem";
      container.appendChild(fw);
      setTimeout(() => fw.remove(), 1500);
    }, i * 200);
  }
}

function spawnSnowInChat(container) {
  for (let i = 0; i < 20; i++) {
    const s = document.createElement("span");
    s.className = "chat-snow";
    s.textContent = "❄️";
    s.style.left = Math.random() * 100 + "%";
    s.style.setProperty("--sd", 2 + Math.random() * 2 + "s");
    s.style.animationDelay = Math.random() * 1 + "s";
    s.style.fontSize = 8 + Math.random() * 12 + "px";
    container.appendChild(s);
    setTimeout(() => s.remove(), 4500);
  }
}

function spawnBalloonsInChat(container) {
  const balloons = ["🎈", "🎈", "🎈", "💜", "💗", "🎈"];
  for (let i = 0; i < 10; i++) {
    const b = document.createElement("span");
    b.className = "chat-balloon";
    b.textContent = balloons[Math.floor(Math.random() * balloons.length)];
    b.style.left = Math.random() * 100 + "%";
    b.style.setProperty("--bd", 2 + Math.random() * 2 + "s");
    b.style.animationDelay = Math.random() * 0.8 + "s";
    b.style.fontSize = 20 + Math.random() * 14 + "px";
    container.appendChild(b);
    setTimeout(() => b.remove(), 4500);
  }
}

// ─── AI AUTO REPLY ────────────────────────────────────────
const AI_REPLIES = {
  sad: ["Don't worry ❤️ I'm always with you.", "Everything will be okay, my love 💕", "I'm here for you always 🤗"],
  happy: ["Your happiness makes me happy! 🥰", "Yay! Let's celebrate! 🎉", "Love seeing you happy! 💕"],
  angry: ["Take a deep breath, my love 🌸", "I understand. Want to talk about it? 💕", "I'm here whenever you need me 🤗"],
  love: ["I love you too! ❤️❤️❤️", "You're my everything 💕", "Forever and always, my love 🌹"],
  miss: ["I miss you too! 🥺💕", "Counting the moments until we meet ✨", "You're always in my heart 💗"],
  tired: ["Rest well, my love. You deserve it 🌙", "Take care of yourself 💕", "Sleep tight, beautiful 🌸"],
  study: ["You're doing amazing! Keep going! 📚✨", "Future lawyer in the making! ⚖️💪", "I believe in you so much! 🌟"]
};

function checkAIAutoReply(text) {
  const lower = text.toLowerCase();
  let category = null;
  
  if (lower.includes("sad") || lower.includes("upset") || lower.includes("cry") || lower.includes("😢") || lower.includes("😭")) category = "sad";
  else if (lower.includes("happy") || lower.includes("excited") || lower.includes("yay") || lower.includes("🎉")) category = "happy";
  else if (lower.includes("angry") || lower.includes("mad") || lower.includes("frustrated")) category = "angry";
  else if (lower.includes("tired") || lower.includes("exhausted") || lower.includes("sleepy")) category = "tired";
  else if (lower.includes("study") || lower.includes("exam") || lower.includes("homework")) category = "study";
  
  if (category) {
    // Show AI suggestion (not auto-send, just suggest)
    showAISuggestion(category);
  }
}

function showAISuggestion(category) {
  const replies = AI_REPLIES[category];
  if (!replies) return;
  const suggestion = replies[Math.floor(Math.random() * replies.length)];
  
  let bar = document.getElementById("chat-ai-suggest");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "chat-ai-suggest";
    bar.className = "chat-ai-suggest";
    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(bar, inputRow);
  }
  
  bar.innerHTML = `
    <span class="ai-icon">🤖</span>
    <span class="ai-text">${suggestion}</span>
    <button class="ai-send-btn" onclick="sendAISuggestion('${suggestion.replace(/'/g, "\\'")}')">Send</button>
    <button class="ai-close-btn" onclick="hideAISuggestion()">✕</button>
  `;
  bar.style.display = "flex";
  
  // Auto-hide after 8 seconds
  setTimeout(hideAISuggestion, 8000);
}

function sendAISuggestion(text) {
  const input = document.getElementById("chat-input");
  if (input) {
    input.value = text;
    sendMessage();
  }
  hideAISuggestion();
}

function hideAISuggestion() {
  const bar = document.getElementById("chat-ai-suggest");
  if (bar) bar.style.display = "none";
}

// ─── TRANSLATE MESSAGE ────────────────────────────────────
function translateMessage(key, text) {
  // Using a simple translation approach - MyMemory API (free)
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
  
  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (data.responseData && data.responseData.translatedText) {
        showPremiumToast("Translated: " + data.responseData.translatedText);
        // Update the message display
        const el = document.querySelector(`.msg[data-key="${key}"] .msg-text`);
        if (el) {
          const original = el.textContent;
          el.textContent = data.responseData.translatedText;
          el.title = "Original: " + original;
          el.dataset.translated = "true";
        }
      }
    })
    .catch(() => {
      showPremiumToast("Translation failed. Try again!");
    });
}

// ─── SPEECH TO TEXT ───────────────────────────────────────
function startSpeechToText() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showPremiumToast("Speech recognition not supported in this browser");
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const input = document.getElementById("chat-input");
    if (input) {
      input.value += (input.value ? " " : "") + text;
      input.focus();
    }
    showPremiumToast("Speech captured! 🎙");
  };
  
  recognition.onerror = (event) => {
    showPremiumToast("Speech error: " + event.error);
  };
  
  recognition.onend = () => {
    const micBtn = document.getElementById("chat-mic-btn");
    if (micBtn) micBtn.classList.remove("recording");
  };
  
  const micBtn = document.getElementById("chat-mic-btn");
  if (micBtn) micBtn.classList.add("recording");
  
  recognition.start();
  showPremiumToast("Listening... 🎙 Speak now!");
}

// ─── LIVE LOCATION ────────────────────────────────────────
function shareLocation() {
  if (!navigator.geolocation) {
    showPremiumToast("Location not supported!");
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      chatRef.push({
        type: "location",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        sender: myName,
        timestamp: Date.now(),
        deviceId: myDeviceId,
        read: false
      });
      playSendSound();
      showPremiumToast("Location shared! 📍");
    },
    (err) => {
      showPremiumToast("Location access denied!");
    }
  );
}

// ─── SPOTIFY SHARING ──────────────────────────────────────
function shareSpotify() {
  const songName = prompt("Enter song name to share:");
  if (!songName) return;
  const artist = prompt("Artist name:") || "Unknown";
  
  chatRef.push({
    type: "spotify",
    songName: songName,
    artist: artist,
    sender: myName,
    timestamp: Date.now(),
    deviceId: myDeviceId,
    read: false
  });
  playSendSound();
  showPremiumToast("Song shared! 🎵");
}

// ─── MESSAGE FORWARD ──────────────────────────────────────
function forwardMessage(key, text) {
  // In a multi-chat system this would forward to another chat
  // For now, copy to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showPremiumToast("Message copied! Forward by pasting 📤");
    });
  } else {
    showPremiumToast("Forward: " + text.substring(0, 50));
  }
}

// ─── EXPORT CHAT ──────────────────────────────────────────
function exportChat(format) {
  const msgs = Object.entries(allMessages).sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  if (format === "txt") {
    let text = "=== Ankit & Naincy Chat Export ===\n";
    text += "Exported: " + new Date().toLocaleString() + "\n\n";
    msgs.forEach(([key, msg]) => {
      const time = new Date(msg.timestamp).toLocaleString();
      text += `[${time}] ${msg.sender}: ${msg.text || "[media]"}\n`;
    });
    downloadFile("chat-export.txt", text, "text/plain");
  } else if (format === "html") {
    let html = `<!DOCTYPE html><html><head><title>Chat Export</title>
    <style>body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#1a1a2e;color:#fff}
    .msg{padding:8px 12px;margin:8px 0;border-radius:12px}
    .me{background:linear-gradient(135deg,#ff4d8d,#d946ef);text-align:right}
    .them{background:rgba(255,255,255,0.1)}
    .meta{font-size:0.7rem;opacity:0.6}</style></head><body>
    <h1>💕 Chat Export</h1><p>Exported: ${new Date().toLocaleString()}</p>`;
    msgs.forEach(([key, msg]) => {
      const isMe = msg.sender === myName;
      const time = new Date(msg.timestamp).toLocaleString();
      html += `<div class="msg ${isMe ? 'me' : 'them'}">
        <div>${escapeHtml(msg.text || "[media]")}</div>
        <div class="meta">${escapeHtml(msg.sender)} · ${time}</div>
      </div>`;
    });
    html += "</body></html>";
    downloadFile("chat-export.html", html, "text/html");
  } else if (format === "pdf") {
    // Simple PDF-like text export
    let text = "CHAT EXPORT - Ankit & Naincy\n";
    text += "Date: " + new Date().toLocaleString() + "\n\n";
    msgs.forEach(([key, msg]) => {
      const time = new Date(msg.timestamp).toLocaleString();
      text += `[${time}] ${msg.sender}: ${msg.text || "[media]"}\n`;
    });
    downloadFile("chat-export.txt", text, "text/plain");
    showPremiumToast("Chat exported as TXT (PDF needs server)");
    return;
  }
  showPremiumToast("Chat exported! 📥");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── QUICK REPLY ──────────────────────────────────────────
function quickReply(text) {
  const input = document.getElementById("chat-input");
  if (input) {
    input.value = text;
    sendMessage();
  }
}

// ─── DELETE MESSAGE ──────────────────────────────────────
function deleteMessage(key) {
  if (!key) return;
  if (!confirm("Delete this message?")) return;
  chatRef.child(key).remove();
}

// ─── REACT TO MESSAGE ────────────────────────────────────
function reactToMessage(key, emoji) {
  if (!key) return;
  const reactRef = db.ref("reactions/" + key);
  reactRef.child(myName).set({
    emoji: emoji,
    timestamp: Date.now()
  });
}

// ─── LOVE RAIN EFFECT ────────────────────────────────────
function triggerLoveRain() {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const hearts = ["💕", "💗", "💖", "❤️", "💝", "💘", "🌹", "✨", "💫", "🦋"];
  for (let i = 0; i < 20; i++) {
    const h = document.createElement("span");
    h.className = "chat-love-rain-heart";
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.left = Math.random() * 100 + "%";
    h.style.setProperty("--lr-dur", 1.5 + Math.random() * 1.5 + "s");
    h.style.setProperty("--lr-delay", Math.random() * 0.5 + "s");
    h.style.setProperty("--lr-size", 14 + Math.random() * 14 + "px");
    h.style.setProperty("--lr-drift", -30 + Math.random() * 60 + "px");
    container.appendChild(h);
    setTimeout(() => h.remove(), 3500);
  }
}

// ─── ESCAPE HTML ─────────────────────────────────────────
function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

// ─── TIME AGO HELPER ─────────────────────────────────────
function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  return days + "d ago";
}

// ─── TOAST NOTIFICATION ───────────────────────────────────
function showPremiumToast(message) {
  let toast = document.getElementById("chat-premium-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "chat-premium-toast";
    toast.className = "chat-premium-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ─── EMOJI PICKER ────────────────────────────────────────
const CHAT_EMOJIS = [
  "❤️", "💕", "💗", "😍", "🥰", "😘", "💋", "🤗",
  "😊", "😂", "🥺", "😢", "😭", "🙈", "💪", "👏",
  "🔥", "✨", "💫", "🌸", "🌹", "🦋", "👑", "💯",
  "🎉", "🎊", "☕", "📚", "⚖️", "💕", "💝", "🫶"
];

let emojiPickerOpen = false;

function toggleEmojiPicker() {
  emojiPickerOpen = !emojiPickerOpen;
  let picker = document.getElementById("chat-emoji-picker");

  if (!picker) {
    picker = document.createElement("div");
    picker.id = "chat-emoji-picker";
    picker.className = "chat-emoji-picker";

    CHAT_EMOJIS.forEach((emoji) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-emoji-btn";
      btn.textContent = emoji;
      btn.addEventListener("click", () => {
        const input = document.getElementById("chat-input");
        if (input) {
          input.value += emoji;
          input.focus();
        }
      });
      picker.appendChild(btn);
    });

    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(picker, inputRow);
  }

  picker.classList.toggle("open", emojiPickerOpen);
  const toggleBtn = document.getElementById("chat-emoji-toggle");
  if (toggleBtn) toggleBtn.classList.toggle("active", emojiPickerOpen);
}

// ─── REACTION PICKER ──────────────────────────────────────
let activeReactionPicker = null;

function showReactionPicker(msgKey, anchorEl) {
  if (activeReactionPicker) {
    activeReactionPicker.remove();
    activeReactionPicker = null;
  }

  const picker = document.createElement("div");
  picker.className = "chat-reaction-picker";

  const reactions = ["❤️", "😂", "😍", "🥰", "👏", "🔥", "💕", "😢"];
  reactions.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = emoji;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      reactToMessage(msgKey, emoji);
      picker.remove();
      activeReactionPicker = null;
    });
    picker.appendChild(btn);
  });

  const rect = anchorEl.getBoundingClientRect();
  const pickerWidth = reactions.length * 38 + 24;
  let leftPos = rect.left;
  if (leftPos + pickerWidth > window.innerWidth - 12) leftPos = window.innerWidth - pickerWidth - 12;
  if (leftPos < 8) leftPos = 8;
  let topPos = rect.top - 52;
  if (topPos < 8) topPos = rect.bottom + 8;

  picker.style.position = "fixed";
  picker.style.left = leftPos + "px";
  picker.style.top = topPos + "px";
  picker.style.zIndex = "11000";

  document.body.appendChild(picker);
  activeReactionPicker = picker;

  setTimeout(() => {
    document.addEventListener("click", closeReactionPicker, { once: true });
  }, 10);
}

function closeReactionPicker() {
  if (activeReactionPicker) {
    activeReactionPicker.remove();
    activeReactionPicker = null;
  }
}

// ─── PREMIUM ATTACHMENT MENU ──────────────────────────────
let attachMenuOpen = false;

function toggleAttachMenu() {
  attachMenuOpen = !attachMenuOpen;
  let menu = document.getElementById("chat-attach-menu");
  
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "chat-attach-menu";
    menu.className = "chat-attach-menu";
    menu.innerHTML = `
      <div class="attach-grid">
        <button class="attach-item" onclick="sendImage(); toggleAttachMenu();">
          <span>📸</span><span>Photo</span>
        </button>
        <button class="attach-item" onclick="sendVideo(); toggleAttachMenu();">
          <span>🎥</span><span>Video</span>
        </button>
        <button class="attach-item" onclick="sendFile(); toggleAttachMenu();">
          <span>📄</span><span>File</span>
        </button>
        <button class="attach-item" onclick="toggleVoiceRecord(); toggleAttachMenu();">
          <span>🎤</span><span>Voice</span>
        </button>
        <button class="attach-item" onclick="sendStickerMenu(); toggleAttachMenu();">
          <span>😊</span><span>Sticker</span>
        </button>
        <button class="attach-item" onclick="toggleGifPicker(); toggleAttachMenu();">
          <span>🎭</span><span>GIF</span>
        </button>
        <button class="attach-item" onclick="shareLocation(); toggleAttachMenu();">
          <span>📍</span><span>Location</span>
        </button>
        <button class="attach-item" onclick="shareSpotify(); toggleAttachMenu();">
          <span>🎵</span><span>Music</span>
        </button>
        <button class="attach-item" onclick="sendSecretMessage(); toggleAttachMenu();">
          <span>🤫</span><span>Secret</span>
        </button>
        <button class="attach-item" onclick="sendSelfDestructMessage(); toggleAttachMenu();">
          <span>💣</span><span>Destruct</span>
        </button>
        <button class="attach-item" onclick="sendScheduledMessage(); toggleAttachMenu();">
          <span>⏰</span><span>Schedule</span>
        </button>
        <button class="attach-item" onclick="triggerMessageAnimation('confetti'); toggleAttachMenu();">
          <span>🎊</span><span>Confetti</span>
        </button>
        <button class="attach-item" onclick="triggerMessageAnimation('fireworks'); toggleAttachMenu();">
          <span>🎆</span><span>Fireworks</span>
        </button>
        <button class="attach-item" onclick="triggerMessageAnimation('snow'); toggleAttachMenu();">
          <span>❄️</span><span>Snow</span>
        </button>
        <button class="attach-item" onclick="triggerMessageAnimation('balloons'); toggleAttachMenu();">
          <span>🎈</span><span>Balloons</span>
        </button>
      </div>
    `;
    const inputRow = document.querySelector(".chat-input-row");
    if (inputRow) inputRow.parentElement.insertBefore(menu, inputRow);
  }
  
  menu.classList.toggle("open", attachMenuOpen);
}

function sendStickerMenu() {
  toggleStickerPicker();
}

// ─── PREMIUM SETTINGS MENU ────────────────────────────────
function openChatAnalyst() {
  let panel = document.getElementById("chat-analyst-panel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "chat-analyst-panel";
    panel.className = "chat-analyst-panel";
    document.body.appendChild(panel);
  }

  async function renderAnalyst() {
    let stats = { empty: true, total: 0, bySender: {}, activeDays: 0, topSender: null, topEmoji: [], byHour: Array(24).fill(0), topHour: 0, topDay: null, linkCount: 0, chatDays: 0, avgPerDay: 0, currentStreak: 0 };

    try {
      stats = await window.NK.dashboard.compute(true);
    } catch (error) {
      console.error("Chat analyst failed:", error);
    }

    const msgs = Object.values(allMessages || {});
    const topSenderName = stats.topSender ? stats.topSender.name : (Object.entries(stats.bySender || {}).sort((a, b) => b[1] - a[1])[0] || ["—", 0])[0];
    const topSenderCount = stats.topSender ? stats.topSender.count : (Object.entries(stats.bySender || {}).sort((a, b) => b[1] - a[1])[0] || ["—", 0])[1];
    const activeDays = stats.chatDays || new Set(msgs.map((m) => window.NK.utils.dayKey(m.timestamp))).size;
    const dayCount = stats.total || msgs.length;
    const topEmoji = stats.topEmoji && stats.topEmoji.length ? stats.topEmoji.map(([emoji, count]) => `${emoji} ${count}`).join(" • ") : "❤️ 1";
    const topHour = (stats.topHour !== undefined && stats.topHour !== null) ? stats.topHour : 0;
    const topDay = stats.topDay ? stats.topDay.day : "—";
    const avgPerDay = stats.avgPerDay || (dayCount && activeDays ? (dayCount / activeDays).toFixed(1) : 0);

    panel.innerHTML = `
      <div class="chat-analyst-card">
        <div class="analyst-header">
          <div>
            <p class="analyst-kicker">Chat Settings</p>
            <h3>📊 Chat Analyst</h3>
          </div>
          <button onclick="closeChatAnalyst()" type="button">✕</button>
        </div>

        <div class="analyst-grid">
          <div class="analyst-box accent">
            <span>Total Messages</span>
            <strong>${dayCount}</strong>
          </div>
          <div class="analyst-box">
            <span>Active Days</span>
            <strong>${activeDays}</strong>
          </div>
          <div class="analyst-box">
            <span>Top Sender</span>
            <strong>${escapeHtml(topSenderName)}</strong>
          </div>
          <div class="analyst-box">
            <span>Streak</span>
            <strong>🔥 ${streakData.days}</strong>
          </div>
        </div>

        <div class="analyst-chart-card">
          <h4>💬 Relationship Dashboard</h4>
          <div class="analyst-metrics">
            <div><span>Most active day</span><strong>${escapeHtml(topDay)}</strong></div>
            <div><span>Top hour</span><strong>${topHour}:00</strong></div>
            <div><span>Avg/day</span><strong>${avgPerDay}</strong></div>
            <div><span>Links shared</span><strong>${stats.linkCount || 0}</strong></div>
          </div>
          <div class="analyst-emoji-box">
            <span>Top emoji</span>
            <strong>${escapeHtml(topEmoji)}</strong>
          </div>
        </div>

        <div class="analyst-senders">
          <h4>👥 Sender Activity</h4>
          ${Object.entries(stats.bySender || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => `
            <div class="sender-row">
              <span>${escapeHtml(name)}</span>
              <div class="sender-glow"><i style="width:${Math.max(18, (count / Math.max(1, dayCount)) * 100)}%"></i></div>
              <strong>${count}</strong>
            </div>
          `).join("") || '<p class="analyst-empty">No messages yet.</p>'}
        </div>
      </div>
    `;

    panel.classList.add("open");
  }

  renderAnalyst();
}

function closeChatAnalyst() {
  const panel = document.getElementById("chat-analyst-panel");
  if (panel) panel.classList.remove("open");
}

function togglePremiumMenu() {
  let menu = document.getElementById("chat-premium-menu");
  
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "chat-premium-menu";
    menu.className = "chat-premium-menu";
    menu.innerHTML = `
      <div class="premium-menu-card">
        <h3>⚙️ Chat Settings</h3>
        <div class="premium-menu-items">
          <button onclick="toggleSearch(); togglePremiumMenu();">🔍 Search Messages</button>
          <button onclick="toggleStats(); togglePremiumMenu();">📊 Chat Statistics</button>
          <button onclick="openChatAnalyst(); togglePremiumMenu();">📈 Chat Analyst</button>
          <button onclick="toggleCalendar(); togglePremiumMenu();">📅 Chat Calendar</button>
          <button onclick="showThemePicker(); togglePremiumMenu();">🎨 Chat Themes</button>
          <button onclick="toggleFavoriteView(); togglePremiumMenu();">⭐ Favorite Messages</button>
          <button onclick="exportChat('txt'); togglePremiumMenu();">📥 Export (TXT)</button>
          <button onclick="exportChat('html'); togglePremiumMenu();">📥 Export (HTML)</button>
          <button onclick="exportChat('pdf'); togglePremiumMenu();">📥 Export (PDF)</button>
          <button onclick="setChatPin(); togglePremiumMenu();">🔒 Set PIN Lock</button>
          <button onclick="removeChatPin(); togglePremiumMenu();">🔓 Remove PIN Lock</button>
          <button onclick="toggleChatSound(); togglePremiumMenu();">🔔 Sound: ${chatSoundEnabled ? 'ON' : 'OFF'}</button>
          <button onclick="startWebRTCCall('voice'); togglePremiumMenu();">📞 Voice Call</button>
          <button onclick="startWebRTCCall('video'); togglePremiumMenu();">📹 Video Call</button>
        </div>
        <button class="premium-menu-close" onclick="togglePremiumMenu()">✕ Close</button>
      </div>
    `;
    document.body.appendChild(menu);
  }
  
  menu.classList.toggle("open");
}

function showThemePicker() {
  let picker = document.getElementById("chat-theme-picker");
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "chat-theme-picker";
    picker.className = "chat-theme-picker";
    document.body.appendChild(picker);
  }
  
  picker.innerHTML = `
    <div class="theme-picker-card">
      <h3>🎨 Chat Themes</h3>
      <div class="theme-grid">
        ${Object.entries(CHAT_THEMES).map(([key, theme]) => `
          <button class="theme-option ${currentTheme === key ? 'active' : ''}" 
                  onclick="applyChatTheme('${key}'); closeThemePicker();">
            <span class="theme-preview" style="background: ${theme.msgMe}"></span>
            <span class="theme-name">${theme.name}</span>
          </button>
        `).join("")}
      </div>
      <button onclick="closeThemePicker()">Close</button>
    </div>
  `;
  picker.classList.add("open");
}

function closeThemePicker() {
  const picker = document.getElementById("chat-theme-picker");
  if (picker) picker.classList.remove("open");
}

function toggleFavoriteView() {
  let panel = document.getElementById("chat-favorites-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "chat-favorites-panel";
    panel.className = "chat-favorites-panel";
    document.body.appendChild(panel);
  }
  
  const isOpen = panel.classList.contains("open");
  if (!isOpen) {
    const favMsgs = Object.entries(allFavorites).map(([key]) => {
      const msg = allMessages[key];
      return msg ? { key, ...msg } : null;
    }).filter(Boolean);
    
    panel.innerHTML = `
      <div class="favorites-card">
        <h3>⭐ Favorite Messages</h3>
        <div class="favorites-list">
          ${favMsgs.length === 0 ? '<p class="favorites-empty">No favorites yet. Star messages to add them here!</p>' : 
            favMsgs.map(msg => `
              <div class="fav-item">
                <span class="fav-sender">${escapeHtml(msg.sender)}</span>
                <span class="fav-text">${escapeHtml(msg.text || "[media]")}</span>
                <span class="fav-time">${timeAgo(msg.timestamp)}</span>
              </div>
            `).join("")}
        </div>
        <button onclick="document.getElementById('chat-favorites-panel').classList.remove('open')">Close</button>
      </div>
    `;
    panel.classList.add("open");
  } else {
    panel.classList.remove("open");
  }
}

// ─── WEBRTC (Basic Framework) ─────────────────────────────
function startWebRTCCall(type) {
  showPremiumToast(`${type === 'voice' ? '📞' : '📹'} ${type} call - Coming Soon!`);
  // WebRTC implementation would require a signaling server
  // This is a placeholder for the framework
}

// ─── RENDER MESSAGES ──────────────────────────────────────
function renderAllMessages() {
  // Force re-render by triggering the listener
  chatRef.limitToLast(80).once("value", (snapshot) => {
    renderMessages(snapshot);
  });
}

db.ref("reactions").on("value", (snap) => {
  allReactions = snap.val() || {};
  const box = document.getElementById("chat-box");
  if (box && box.classList.contains("open")) {
    updateReactionBadges();
  }
});

function updateReactionBadges() {
  document.querySelectorAll(".msg[data-key]").forEach((msgEl) => {
    const key = msgEl.dataset.key;
    const reactions = allReactions[key];
    let badgeContainer = msgEl.querySelector(".msg-reactions");

    if (reactions) {
      const emojiCounts = {};
      Object.values(reactions).forEach((r) => {
        if (r.emoji) emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
      });

      if (!badgeContainer) {
        badgeContainer = document.createElement("div");
        badgeContainer.className = "msg-reactions";
        msgEl.appendChild(badgeContainer);
      }

      badgeContainer.innerHTML = Object.entries(emojiCounts)
        .map(([emoji, count]) =>
          `<span class="msg-reaction-badge">${emoji}${count > 1 ? " " + count : ""}</span>`
        ).join("");
    } else if (badgeContainer) {
      badgeContainer.remove();
    }
  });
}

function renderMessages(snapshot) {
  const messagesDiv = document.getElementById("chat-messages");
  if (!messagesDiv) return;

  const wasNearBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight < 80;
  messagesDiv.innerHTML = "";
  const data = snapshot.val();

  if (!data) {
    messagesDiv.innerHTML = '<div class="chat-empty-state"><span class="chat-empty-icon">💌</span><p>No messages yet…<br>say something sweet 💕</p></div>';
    return;
  }

  const keys = Object.keys(data);
  const sortedKeys = keys.sort((a, b) => (data[a].timestamp || 0) - (data[b].timestamp || 0));
  const newMsgCount = sortedKeys.length;
  let unreadCount = 0;

  sortedKeys.forEach((key, index) => {
    const msg = data[key];
    allMessages[key] = msg; // Store for search/stats
    const div = document.createElement("div");
    const isMe = msg.sender === myName;
    div.className = "msg " + (isMe ? "me" : "them");
    div.dataset.key = key;
    
    if (isMe) myMsgKeys.add(key);
    if (!isMe && key > lastReadMsgKey) unreadCount++;

    // Double tap handler
    div.addEventListener("click", () => handleDoubleTap(key, div));

    // Sender name
    if (!isMe && msg.sender) {
      const senderEl = document.createElement("div");
      senderEl.className = "msg-sender";
      senderEl.textContent = msg.sender;
      div.appendChild(senderEl);
    }

    // Reply preview
    if (msg.replyTo) {
      const replyEl = document.createElement("div");
      replyEl.className = "msg-reply-preview";
      replyEl.innerHTML = `
        <div class="reply-line"></div>
        <div class="reply-content">
          <span class="reply-name">${escapeHtml(msg.replySender || "Unknown")}</span>
          <span class="reply-text">${escapeHtml((msg.replyText || "").substring(0, 40))}</span>
        </div>
      `;
      div.appendChild(replyEl);
    }

    // Message content based on type
    if (msg.type === "image") {
      const imgEl = document.createElement("div");
      imgEl.className = "msg-image";
      imgEl.innerHTML = `<img src="${msg.imageUrl}" alt="Shared image" onclick="openImageZoom('${key}')" />`;
      div.appendChild(imgEl);
    } else if (msg.type === "video") {
      const vidEl = document.createElement("div");
      vidEl.className = "msg-video";
      vidEl.innerHTML = `<video src="${msg.videoUrl}" controls preload="metadata"></video>`;
      div.appendChild(vidEl);
    } else if (msg.type === "voice") {
      const voiceEl = document.createElement("div");
      voiceEl.className = "msg-voice";
      voiceEl.innerHTML = `
        <audio src="${msg.voiceUrl}" controls preload="metadata" class="voice-player"></audio>
        <span class="voice-duration">${msg.duration || 0}s</span>
      `;
      div.appendChild(voiceEl);
    } else if (msg.type === "file") {
      const fileEl = document.createElement("div");
      fileEl.className = "msg-file";
      fileEl.innerHTML = `
        <span class="file-icon">📄</span>
        <div class="file-info">
          <span class="file-name">${escapeHtml(msg.fileName)}</span>
          <span class="file-size">${formatFileSize(msg.fileSize)}</span>
        </div>
        <a href="${msg.fileUrl}" download="${escapeHtml(msg.fileName)}" class="file-download">⬇️</a>
      `;
      div.appendChild(fileEl);
    } else if (msg.type === "sticker") {
      const stickerEl = document.createElement("div");
      stickerEl.className = "msg-sticker";
      stickerEl.textContent = msg.sticker;
      div.appendChild(stickerEl);
    } else if (msg.type === "gif") {
      const gifEl = document.createElement("div");
      gifEl.className = "msg-gif";
      gifEl.innerHTML = `<img src="${msg.gifUrl}" alt="GIF" />`;
      div.appendChild(gifEl);
    } else if (msg.type === "location") {
      const locEl = document.createElement("div");
      locEl.className = "msg-location";
      locEl.innerHTML = `
        <span class="loc-icon">📍</span>
        <a href="https://maps.google.com/?q=${msg.lat},${msg.lng}" target="_blank">
          ${escapeHtml(msg.sender)} is here
        </a>
      `;
      div.appendChild(locEl);
    } else if (msg.type === "spotify") {
      const spotEl = document.createElement("div");
      spotEl.className = "msg-spotify";
      spotEl.innerHTML = `
        <span class="spotify-icon">🎵</span>
        <div class="spotify-info">
          <span class="spotify-song">${escapeHtml(msg.songName)}</span>
          <span class="spotify-artist">${escapeHtml(msg.artist)}</span>
        </div>
      `;
      div.appendChild(spotEl);
    } else if (msg.secret && !msg.revealed) {
      // Secret message - tap to reveal
      const secretEl = document.createElement("div");
      secretEl.className = "msg-secret";
      secretEl.innerHTML = `
        <span class="secret-icon">🤫</span>
        <span class="secret-label">Tap to reveal secret message</span>
      `;
      secretEl.addEventListener("click", () => {
        secretEl.className = "msg-secret revealed";
        secretEl.innerHTML = `<span class="secret-text">${escapeHtml(msg.text)}</span>`;
        chatRef.child(key).update({ revealed: true });
      });
      div.appendChild(secretEl);
    } else if (msg.secret && msg.revealed) {
      const textNode = document.createElement("div");
      textNode.className = "msg-text msg-secret-revealed";
      textNode.textContent = msg.text || "";
      div.appendChild(textNode);
    } else if (msg.selfDestruct) {
      const destructEl = document.createElement("div");
      destructEl.className = "msg-self-destruct";
      destructEl.innerHTML = `
        <span class="destruct-icon">💣</span>
        <span class="destruct-text">${escapeHtml(msg.text)}</span>
        <span class="destruct-timer" data-expires="${msg.timestamp + (msg.destructAfter * 1000)}">
          ${msg.destructAfter}s
        </span>
      `;
      div.appendChild(destructEl);
      
      // Self destruct timer
      const expiresAt = msg.timestamp + (msg.destructAfter * 1000);
      if (Date.now() > expiresAt) {
        div.style.opacity = "0.3";
        div.innerHTML = '<span class="msg-deleted">💨 Message self-destructed</span>';
      } else {
        const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
        if (remaining > 0 && remaining < 60) {
          setTimeout(() => {
            div.style.opacity = "0.3";
            div.innerHTML = '<span class="msg-deleted">💨 Message self-destructed</span>';
          }, remaining * 1000);
        }
      }
    } else {
      // Normal text message
      const textNode = document.createElement("div");
      textNode.className = "msg-text";
      textNode.textContent = msg.text || "";
      div.appendChild(textNode);
    }

    // Edited tag
    if (msg.edited) {
      const editTag = document.createElement("span");
      editTag.className = "msg-edited-tag";
      editTag.textContent = "✏️ edited";
      div.appendChild(editTag);
    }

    // Scheduled tag
    if (msg.scheduled) {
      const schedTag = document.createElement("span");
      schedTag.className = "msg-scheduled-tag";
      schedTag.textContent = "⏰ scheduled";
      div.appendChild(schedTag);
    }

    // Bottom row
    const bottomRow = document.createElement("div");
    bottomRow.className = "msg-bottom";

    const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit"
    });
    const timeEl = document.createElement("span");
    timeEl.className = "msg-time";
    timeEl.textContent = time;
    bottomRow.appendChild(timeEl);

    if (isMe) {
      const statusEl = document.createElement("span");
      statusEl.className = "msg-status";
      if (msg.read) {
        statusEl.innerHTML = '<span class="msg-seen">✓✓</span>';
        statusEl.title = "Seen";
      } else {
        statusEl.innerHTML = '<span class="msg-delivered">✓</span>';
        statusEl.title = "Delivered";
      }
      bottomRow.appendChild(statusEl);
    }

    div.appendChild(bottomRow);

    // Actions
    const actionsEl = document.createElement("div");
    actionsEl.className = "msg-actions";

    // React button
    const reactBtn = document.createElement("button");
    reactBtn.type = "button";
    reactBtn.className = "msg-action-btn";
    reactBtn.innerHTML = "😊";
    reactBtn.title = "React";
    reactBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showReactionPicker(key, div);
    });
    actionsEl.appendChild(reactBtn);

    // Reply button
    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "msg-action-btn";
    replyBtn.innerHTML = "↩️";
    replyBtn.title = "Reply";
    replyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      replyToMessage(key, msg.text || "[media]", msg.sender);
    });
    actionsEl.appendChild(replyBtn);

    // More actions (dropdown)
    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "msg-action-btn";
    moreBtn.innerHTML = "⋯";
    moreBtn.title = "More";
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showMoreActions(key, msg, isMe, moreBtn);
    });
    actionsEl.appendChild(moreBtn);

    div.appendChild(actionsEl);

    // Reactions display
    const reactions = allReactions[key];
    if (reactions) {
      const emojiCounts = {};
      Object.values(reactions).forEach((r) => {
        if (r.emoji) emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
      });

      if (Object.keys(emojiCounts).length > 0) {
        const reactionsEl = document.createElement("div");
        reactionsEl.className = "msg-reactions";
        reactionsEl.innerHTML = Object.entries(emojiCounts)
          .map(([emoji, count]) =>
            `<span class="msg-reaction-badge">${emoji}${count > 1 ? " " + count : ""}</span>`
          ).join("");
        div.appendChild(reactionsEl);
      }
    }

    messagesDiv.appendChild(div);
  });

  // Sound and notifications for new messages
  if (newMsgCount > lastMsgCount && lastMsgCount > 0) {
    const latestMsg = data[sortedKeys[sortedKeys.length - 1]];
    if (latestMsg && latestMsg.sender !== myName) {
      playMsgSound();
      
      // Request notification permission and show notification
      if (typeof ChatNotifications !== "undefined") {
        // Request permission on first message
        if (ChatNotifications.getPermission() === "default") {
          ChatNotifications.requestPermission().then((permission) => {
            if (permission === "granted") {
              ChatNotifications.notifyNewMessage(latestMsg.sender, latestMsg.text || "[Media]", false);
            }
          });
        } else if (ChatNotifications.canNotify()) {
          ChatNotifications.notifyNewMessage(latestMsg.sender, latestMsg.text || "[Media]", false);
        }
      }
      
      const box = document.getElementById("chat-box");
      if (!box || !box.classList.contains("open")) {
        showNotifBadge(unreadCount);
      }
    }
  }
  lastMsgCount = newMsgCount;

  if (wasNearBottom) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Auto mark as read
  const box = document.getElementById("chat-box");
  if (box && box.classList.contains("open") && sortedKeys.length > 0) {
    const newLastKey = sortedKeys[sortedKeys.length - 1];
    if (newLastKey !== lastReadMsgKey) {
      lastReadMsgKey = newLastKey;
      localStorage.setItem("chatLastRead", lastReadMsgKey);
    }
  }
}

function showMoreActions(key, msg, isMe, anchorBtn) {
  // Remove existing menu
  let existing = document.getElementById("chat-more-menu");
  if (existing) existing.remove();
  
  const menu = document.createElement("div");
  menu.id = "chat-more-menu";
  menu.className = "chat-more-menu";
  
  let items = `
    <button onclick="pinMessage('${key}'); closeMoreMenu();">${allPinned[key] ? '📌 Unpin' : '📌 Pin'}</button>
    <button onclick="favoriteMessage('${key}'); closeMoreMenu();">${allFavorites[key] ? '⭐ Unfavorite' : '⭐ Favorite'}</button>
    <button onclick="forwardMessage('${key}', \`${(msg.text || '').replace(/`/g, "'")}\`); closeMoreMenu();">📤 Forward</button>
    <button onclick="translateMessage('${key}', \`${(msg.text || '').replace(/`/g, "'")}\`); closeMoreMenu();">🌐 Translate</button>
  `;
  
  if (isMe && msg.type !== "image" && msg.type !== "video" && msg.type !== "voice" && msg.type !== "file") {
    const canEdit = (Date.now() - msg.timestamp) < 600000; // 10 minutes
    if (canEdit) {
      items += `<button onclick="editMessage('${key}', \`${(msg.text || '').replace(/`/g, "'")}\`); closeMoreMenu();">✏️ Edit</button>`;
    }
    items += `<button onclick="deleteMessage('${key}'); closeMoreMenu();">🗑️ Delete</button>`;
  }
  
  menu.innerHTML = items;
  
  const rect = anchorBtn.getBoundingClientRect();
  menu.style.position = "fixed";
  menu.style.left = Math.min(rect.left, window.innerWidth - 180) + "px";
  menu.style.top = (rect.top - 10) + "px";
  menu.style.transform = "translateY(-100%)";
  menu.style.zIndex = "11000";
  
  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener("click", closeMoreMenu, { once: true });
  }, 10);
}

function closeMoreMenu() {
  const menu = document.getElementById("chat-more-menu");
  if (menu) menu.remove();
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function openImageZoom(key) {
  const msg = allMessages[key];
  if (!msg || !msg.imageUrl) return;
  const overlay = document.getElementById("zoom-overlay");
  const zoomImg = document.getElementById("zoom-img");
  if (overlay && zoomImg) {
    zoomImg.src = msg.imageUrl;
    overlay.classList.add("open");
  }
}

// Main message listener
chatRef.limitToLast(80).on("value", renderMessages);

// ─── NOTIFICATION BADGE ──────────────────────────────────
function showNotifBadge(count) {
  const toggleBtn = document.querySelector(".chat-toggle-btn");
  if (!toggleBtn) return;
  let badge = toggleBtn.querySelector(".chat-notif-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "chat-notif-badge";
    toggleBtn.appendChild(badge);
  }
  badge.textContent = count > 0 ? (count > 9 ? "9+" : count) : "";
  badge.style.display = count > 0 ? "flex" : "none";
}

// ─── MARK MESSAGES AS READ ────────────────────────────────
setInterval(() => {
  const box = document.getElementById("chat-box");
  if (!box || !box.classList.contains("open")) return;
  chatRef.orderByChild("read").equalTo(false).limitToLast(20).once("value", (snap) => {
    const data = snap.val();
    if (!data) return;
    Object.entries(data).forEach(([key, msg]) => {
      if (msg.sender !== myName && !msg.read) {
        chatRef.child(key).update({ read: true });
      }
    });
  });
}, 3000);

// ─── TYPING INDICATOR ────────────────────────────────────
const chatInput = document.getElementById("chat-input");
let typingTimeout = null;

if (chatInput) {
  chatInput.addEventListener("input", () => {
    typingRef.set(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => typingRef.set(false), 2000);
  });
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") typingRef.set(false);
  });
}

db.ref("typing").on("value", (snap) => {
  const data = snap.val() || {};
  const typingIndicator = document.getElementById("chat-typing");
  const typingOthers = Object.entries(data)
    .filter(([name, isTyping]) => name !== myName && isTyping === true)
    .map(([name]) => name);

  if (typingIndicator) {
    if (typingOthers.length > 0) {
      typingIndicator.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span> ${typingOthers.join(", ")} is typing...`;
      typingIndicator.classList.add("visible");
    } else {
      typingIndicator.classList.remove("visible");
    }
  }
});

// ─── ONLINE STATUS + LAST SEEN ───────────────────────────
db.ref("presence").on("value", (snapshot) => {
  const data = snapshot.val() || {};
  const statusEl = document.getElementById("online-status");
  const dotEl = document.querySelector(".status-dot");
  if (!statusEl) return;

  const others = Object.entries(data).filter(([name]) => name !== myName);
  const onlineOther = others.find(([, d]) => d && d.online);

  if (onlineOther) {
    statusEl.textContent = onlineOther[0] + " is online 💕";
    if (dotEl) {
      dotEl.style.background = "#4ade80";
      dotEl.style.boxShadow = "0 0 8px rgba(74, 222, 128, 0.6)";
    }
  } else if (others.length) {
    const other = others[0];
    const lastSeen = other[1] && other[1].lastSeen;
    if (lastSeen) {
      statusEl.textContent = other[0] + " · last seen " + timeAgo(lastSeen);
    } else {
      statusEl.textContent = other[0] + " is offline";
    }
    if (dotEl) {
      dotEl.style.background = "#888";
      dotEl.style.boxShadow = "none";
    }
  } else {
    statusEl.textContent = "waiting for partner…";
    if (dotEl) {
      dotEl.style.background = "#fbbf24";
      dotEl.style.boxShadow = "0 0 8px rgba(251, 191, 36, 0.5)";
    }
  }
});

// ─── SOUND TOGGLE ────────────────────────────────────────
function toggleChatSound() {
  chatSoundEnabled = !chatSoundEnabled;
  localStorage.setItem("chatSound", chatSoundEnabled ? "on" : "off");
  const btn = document.getElementById("chat-sound-toggle");
  if (btn) {
    btn.textContent = chatSoundEnabled ? "🔔" : "🔕";
    btn.title = chatSoundEnabled ? "Sound On" : "Sound Off";
  }
}

// ─── ENHANCE CHAT UI ─────────────────────────────────────
function enhanceChatUI() {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;

  // Typing indicator
  if (!document.getElementById("chat-typing")) {
    const typingEl = document.createElement("div");
    typingEl.id = "chat-typing";
    typingEl.className = "chat-typing-indicator";
    typingEl.innerHTML = "";
    const messagesDiv = document.getElementById("chat-messages");
    if (messagesDiv && messagesDiv.parentElement) {
      messagesDiv.parentElement.insertBefore(typingEl, messagesDiv.nextSibling);
    }
  }

  // Sound toggle + Premium menu button in header
  const chatHeader = chatBox.querySelector(".chat-header");
  if (chatHeader) {
    if (!document.getElementById("chat-sound-toggle")) {
      const soundBtn = document.createElement("button");
      soundBtn.type = "button";
      soundBtn.id = "chat-sound-toggle";
      soundBtn.className = "chat-header-btn";
      soundBtn.textContent = chatSoundEnabled ? "🔔" : "🔕";
      soundBtn.title = chatSoundEnabled ? "Sound On" : "Sound Off";
      soundBtn.addEventListener("click", toggleChatSound);
      const closeBtn = chatHeader.querySelector(".chat-close");
      if (closeBtn) chatHeader.insertBefore(soundBtn, closeBtn);
    }
    
    // Premium features button
    if (!document.getElementById("chat-premium-btn")) {
      const premBtn = document.createElement("button");
      premBtn.type = "button";
      premBtn.id = "chat-premium-btn";
      premBtn.className = "chat-header-btn";
      premBtn.textContent = "⚙️";
      premBtn.title = "Chat Settings";
      premBtn.setAttribute("aria-label", "Open chat settings");
      premBtn.addEventListener("click", togglePremiumMenu);
      const closeBtn = chatHeader.querySelector(".chat-close");
      if (closeBtn) chatHeader.insertBefore(premBtn, closeBtn);
    }
    
    // Streak display
    if (!document.getElementById("chat-streak-display")) {
      const streakEl = document.createElement("span");
      streakEl.id = "chat-streak-display";
      streakEl.className = "chat-streak-display";
      streakEl.innerHTML = `<span class="streak-fire">🔥</span> Day ${streakData.days}`;
      chatHeader.appendChild(streakEl);
    }
  }

  // Add attachment button to input row
  const inputRow = document.querySelector(".chat-input-row");
  if (inputRow) {
    if (!document.getElementById("chat-attach-btn")) {
      const attachBtn = document.createElement("button");
      attachBtn.type = "button";
      attachBtn.id = "chat-attach-btn";
      attachBtn.className = "chat-extra-btn";
      attachBtn.textContent = "📎";
      attachBtn.title = "Attach";
      attachBtn.addEventListener("click", toggleAttachMenu);
      inputRow.insertBefore(attachBtn, inputRow.firstChild);
    }
    
    // Mic button for speech-to-text
    if (!document.getElementById("chat-mic-btn")) {
      const micBtn = document.createElement("button");
      micBtn.type = "button";
      micBtn.id = "chat-mic-btn";
      micBtn.className = "chat-extra-btn";
      micBtn.textContent = "🎙";
      micBtn.title = "Speech to Text";
      micBtn.addEventListener("click", startSpeechToText);
      inputRow.insertBefore(micBtn, inputRow.lastElementChild);
    }
  }

  // Apply saved theme
  if (currentTheme && currentTheme !== "default") {
    applyChatTheme(currentTheme);
  }
}

// ─── EXPOSE FOR INLINE HANDLERS ──────────────────────────
window.toggleChat = toggleChat;
window.sendMessage = sendMessage;
window.quickReply = quickReply;
window.toggleEmojiPicker = toggleEmojiPicker;
window.toggleChatSound = toggleChatSound;
window.deleteMessage = deleteMessage;
window.reactToMessage = reactToMessage;
window.toggleStickerPicker = toggleStickerPicker;
window.toggleGifPicker = toggleGifPicker;
window.toggleSearch = toggleSearch;
window.toggleStats = toggleStats;
window.toggleCalendar = toggleCalendar;
window.toggleAttachMenu = toggleAttachMenu;
window.togglePremiumMenu = togglePremiumMenu;
window.toggleVoiceRecord = toggleVoiceRecord;
window.stopVoiceRecord = stopVoiceRecord;
window.cancelVoiceRecord = cancelVoiceRecord;
window.sendImage = sendImage;
window.sendVideo = sendVideo;
window.sendFile = sendFile;
window.sendSecretMessage = sendSecretMessage;
window.sendSelfDestructMessage = sendSelfDestructMessage;
window.sendScheduledMessage = sendScheduledMessage;
window.shareLocation = shareLocation;
window.shareSpotify = shareSpotify;
window.exportChat = exportChat;
window.applyChatTheme = applyChatTheme;
window.showThemePicker = showThemePicker;
window.closeThemePicker = closeThemePicker;
window.setChatPin = setChatPin;
window.removeChatPin = removeChatPin;
window.checkChatPin = checkChatPin;
window.closePinLock = closePinLock;
window.hideReplyBar = hideReplyBar;
window.cancelEdit = cancelEdit;
window.pinMessage = pinMessage;
window.favoriteMessage = favoriteMessage;
window.translateMessage = translateMessage;
window.forwardMessage = forwardMessage;
window.startSpeechToText = startSpeechToText;
window.sendAISuggestion = sendAISuggestion;
window.hideAISuggestion = hideAISuggestion;
window.searchMessages = searchMessages;
window.scrollToMessage = scrollToMessage;
window.loadCalendarDate = loadCalendarDate;
window.toggleFavoriteView = toggleFavoriteView;
window.startWebRTCCall = startWebRTCCall;
window.sendGif = sendGif;
window.searchGifs = searchGifs;
window.openImageZoom = openImageZoom;
window.triggerMessageAnimation = triggerMessageAnimation;
window.closeMoreMenu = closeMoreMenu;
window.updateStreak = updateStreak;

// ─── INIT ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(enhanceChatUI, 500);
  // Auto day/night theme
  autoDayNightTheme();
  // Check streak
  updateStreak();
});
