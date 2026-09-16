/* =========================================================
   dashboard.js — Relationship statistics.
   EVERY number is derived from real messages in Firebase.
   Nothing here is invented or hard-coded.
   ========================================================= */
(function (global) {
  "use strict";
  global.NK = global.NK || {};
  const NK = global.NK;
  NK.utils = NK.utils || {
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
  NK.store = NK.store || {
    reactions: {},
    favorites: {},
    pinned: {},
    async loadAll() {
      const values = Object.values(global.allMessages || {});
      return values.map((msg, index) => ({ ...msg, key: msg.key || Object.keys(global.allMessages || {})[index] }));
    }
  };
  NK.memories = NK.memories || { count: 0 };
  const U = NK.utils;

  const DAY = 86400000;
  let cached = null;
  let cachedAt = 0;

  async function compute(force) {
    if (cached && !force && Date.now() - cachedAt < 60000) return cached;

    const msgs = (await NK.store.loadAll())
      .filter((m) => m && m.timestamp && !m.deletedForEveryone);

    if (!msgs.length) {
      cached = { empty: true, total: 0 };
      cachedAt = Date.now();
      return cached;
    }

    const bySender = {};
    const byDay = new Map();
    const byHour = new Array(24).fill(0);
    const byWeekday = new Array(7).fill(0);
    const emojiCount = new Map();
    const counts = { voice: 0, image: 0, video: 0, file: 0, link: 0, location: 0, sticker: 0, gif: 0, call: 0 };
    let callSeconds = 0, totalChars = 0, editedCount = 0, forwardedCount = 0;

    msgs.forEach((m) => {
      bySender[m.sender] = (bySender[m.sender] || 0) + 1;

      const dk = U.dayKey(m.timestamp);
      byDay.set(dk, (byDay.get(dk) || 0) + 1);

      const d = new Date(m.timestamp);
      byHour[d.getHours()]++;
      byWeekday[d.getDay()]++;

      if (m.type === "voice") counts.voice++;
      else if (m.type === "image") counts.image++;
      else if (m.type === "video") counts.video++;
      else if (m.type === "file") counts.file++;
      else if (m.type === "location") counts.location++;
      else if (m.type === "sticker") counts.sticker++;
      else if (m.type === "gif") counts.gif++;

      if (m.callLog) { counts.call++; callSeconds += Number(m.callDuration) || 0; }
      if (m.edited) editedCount++;
      if (m.forwarded) forwardedCount++;

      if (m.text) {
        totalChars += m.text.length;
        if (U.extractLinks(m.text).length) counts.link++;
        U.extractEmoji(m.text).forEach((e) => emojiCount.set(e, (emojiCount.get(e) || 0) + 1));
      }
      if (m.type === "spotify") counts.link++;
    });

    // Emoji from reactions count too.
    Object.values(NK.store.reactions).forEach((per) => {
      Object.values(per || {}).forEach((r) => {
        if (r && r.emoji) emojiCount.set(r.emoji, (emojiCount.get(r.emoji) || 0) + 1);
      });
    });

    /* ---- streaks (consecutive calendar days with >=1 message) ---- */
    const dayList = Array.from(byDay.keys()).sort();
    const daySet = new Set(dayList);
    let longestStreak = 0, run = 0, longestEnd = null;
    let prevTs = null;
    dayList.forEach((dk) => {
      const ts = new Date(dk + "T00:00:00").getTime();
      if (prevTs !== null && ts - prevTs === DAY) run++;
      else run = 1;
      if (run > longestStreak) { longestStreak = run; longestEnd = dk; }
      prevTs = ts;
    });

    // Current streak counts back from today (or yesterday if today is quiet).
    let currentStreak = 0;
    let cursor = U.startOfDay(Date.now());
    if (!daySet.has(U.dayKey(cursor))) cursor -= DAY;
    while (daySet.has(U.dayKey(cursor))) { currentStreak++; cursor -= DAY; }

    /* ---- rankings ---- */
    const topDay = Array.from(byDay.entries()).sort((a, b) => b[1] - a[1])[0];
    const topHour = byHour.reduce((best, v, i) => (v > byHour[best] ? i : best), 0);
    const topWeekday = byWeekday.reduce((best, v, i) => (v > byWeekday[best] ? i : best), 0);
    const topEmoji = Array.from(emojiCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const first = msgs[0], last = msgs[msgs.length - 1];
    const totalDays = Math.max(1, Math.round((U.startOfDay(last.timestamp) - U.startOfDay(first.timestamp)) / DAY) + 1);

    cached = {
      empty: false,
      total: msgs.length,
      bySender,
      participants: Object.keys(bySender).sort((a, b) => bySender[b] - bySender[a]),
      counts,
      callSeconds,
      favorites: Object.keys(NK.store.favorites).length,
      pinned: Object.keys(NK.store.pinned).length,
      memories: NK.memories.count,
      currentStreak,
      longestStreak,
      longestStreakEnd: longestEnd,
      activeDays: byDay.size,
      totalDays,
      avgPerDay: +(msgs.length / totalDays).toFixed(1),
      avgLength: Math.round(totalChars / Math.max(1, msgs.filter((m) => m.text).length)),
      firstMessage: first,
      lastMessage: last,
      topDay: topDay ? { day: topDay[0], count: topDay[1] } : null,
      topHour, topWeekday,
      topEmoji,
      editedCount, forwardedCount,
      byHour, byWeekday,
      byDaySeries: dayList.slice(-60).map((d) => ({ day: d, count: byDay.get(d) })),
      journey: buildJourney(msgs, { currentStreak, longestStreak, byDay })
    };
    cachedAt = Date.now();
    return cached;
  }

  /** Milestones, each tied to a real message. */
  function buildJourney(msgs, extra) {
    const j = [];
    const firstOf = (pred) => msgs.find(pred);

    const push = (icon, title, msg, note) => {
      if (!msg) return;
      j.push({ icon, title, at: msg.timestamp, messageId: msg.key, note: note || U.messagePreview(msg) });
    };

    push("💌", "First message", msgs[0]);
    push("📷", "First photo", firstOf((m) => m.type === "image"));
    push("🎤", "First voice message", firstOf((m) => m.type === "voice"));
    push("🎞", "First video", firstOf((m) => m.type === "video"));
    push("📞", "First call", firstOf((m) => m.callLog));
    push("📍", "First location shared", firstOf((m) => m.type === "location"));
    push("❤️", "First 'I love you'", firstOf((m) =>
      m.text && /\bi\s*love\s*(you|u)\b/i.test(m.text)));

    [100, 500, 1000, 5000, 10000].forEach((n) => {
      if (msgs.length >= n) {
        const m = msgs[n - 1];
        j.push({ icon: "🎉", title: n.toLocaleString() + " messages", at: m.timestamp, messageId: m.key, note: "Milestone reached" });
      }
    });

    // Busiest single day
    const busiest = Array.from(extra.byDay.entries()).sort((a, b) => b[1] - a[1])[0];
    if (busiest && busiest[1] > 5) {
      const dayMsgs = msgs.filter((m) => U.dayKey(m.timestamp) === busiest[0]);
      if (dayMsgs.length) {
        j.push({
          icon: "🔥", title: "Longest conversation",
          at: dayMsgs[0].timestamp, messageId: dayMsgs[0].key,
          note: busiest[1] + " messages in one day"
        });
      }
    }

    [7, 30, 100, 365].forEach((n) => {
      if (extra.longestStreak >= n) {
        j.push({ icon: "⚡", title: n + " day streak", at: null, note: "Longest run: " + extra.longestStreak + " days" });
      }
    });

    return j.sort((a, b) => (a.at || Infinity) - (b.at || Infinity));
  }

  function invalidate() { cached = null; }

  NK.dashboard = { compute, invalidate, get cached() { return cached; } };
})(window);
