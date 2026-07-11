// ========== Advanced Baby AI Chatbot for AnkitAI Portfolio ==========
// Drop-in replacement for ai-chatbot.js | Vanilla JS, no backend required

(function () {
  'use strict';

  class AdvancedBabyAI {
    constructor(options = {}) {
      this.options = {
        storageKey: 'babyAI.chat.v2',
        themeKey: 'babyAI.theme',
        maxHistory: 40,
        ownerName: 'Ankit Kumar',
        email: 'ankitkumar823089@gmail.com',
        github: 'https://github.com/eddiebrock911',
        linkedin: 'https://www.linkedin.com/in/eddiebrock-364ba537b/',
        instagram: 'https://www.instagram.com/__ankit._.op_/',
        kaggle: 'https://www.kaggle.com/ankitkumar8252',
        ...options
      };

      this.isOpen = false;
      this.isMuted = JSON.parse(localStorage.getItem('babyAI.muted') || 'true');
      this.messages = [];
      this.context = { lastIntent: null, lastProject: null };
      this.recognition = null;
      this.isListening = false;

      this.knowledge = this.createKnowledgeBase();
      this.createChatInterface();
      this.attachEventListeners();
      this.loadChatHistory();

      if (!this.messages.length) this.addWelcomeMessage();
      this.initVoiceRecognition();
      window.BabyAI = this;
    }

    createKnowledgeBase() {
      return {
        projects: [
          {
            name: 'Olympic Data Dashboard',
            tags: ['olympic', 'dashboard', 'streamlit', 'data', 'analytics'],
            desc: 'Interactive dashboard with ML/data visualization for Olympic data trends.',
            demo: 'https://olympikit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Olympics-analysis-app',
            stack: ['Python', 'Streamlit', 'ML', 'Pandas', 'Data Visualization']
          },
          {
            name: 'Spam Classifier AI',
            tags: ['spam', 'classifier', 'nlp', 'email', 'sms'],
            desc: 'NLP model that classifies messages as spam or ham.',
            demo: 'https://antispamkit.onrender.com/',
            code: 'https://github.com/eddiebrock911/sms-email-classification-',
            stack: ['Python', 'NLP', 'Streamlit', 'Pandas', 'NumPy']
          },
          {
            name: 'Laptop Price Predictor',
            tags: ['laptop', 'price', 'regression', 'predictor'],
            desc: 'ML regression app for predicting laptop prices from specs.',
            demo: 'https://laptoprikit-vvle.onrender.com/',
            code: 'https://github.com/eddiebrock911/laptop-price-predictor-website-',
            stack: ['Python', 'Regression', 'Pandas', 'NumPy', 'Streamlit']
          },
          {
            name: 'IPL Win Predictor',
            tags: ['ipl', 'cricket', 'win', 'probability', 'classification'],
            desc: 'Cricket match win-probability predictor using Logistic Regression.',
            demo: 'https://iplwinprokit.onrender.com/',
            code: 'https://github.com/eddiebrock911/IPL-Win-Probability-Predictor-Project',
            stack: ['Python', 'ML', 'Classification', 'Cricket', 'NumPy']
          },
          {
            name: 'Book Recommendation System',
            tags: ['book', 'recommendation', 'recommender', 'collaborative'],
            desc: 'Book recommender using collaborative filtering.',
            demo: 'https://bookreckit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Books-Recommender-Systems-',
            stack: ['Python', 'Flask', 'Recommendation', 'Pandas']
          },
          {
            name: 'Movie Recommendation System',
            tags: ['movie', 'recommendation', 'tmdb', 'content'],
            desc: 'Content-based movie recommendation system powered by TMDb data.',
            demo: 'https://movieskit.onrender.com/',
            code: 'https://github.com/eddiebrock911/movies-recommendation-system-',
            stack: ['Python', 'Content-Based Filtering', 'TMDb', 'Pandas']
          },
          {
            name: 'AI Job Recommendation System',
            tags: ['job', 'salary', 'recommendation', 'random forest'],
            desc: 'AI job recommendation and salary prediction using Random Forest.',
            demo: 'https://aijobprekit.onrender.com/',
            code: 'https://github.com/eddiebrock911/AI-job-salary-prediction',
            stack: ['Python', 'Random Forest', 'Pandas', 'ML']
          },
          {
            name: 'Quora Question Pair',
            tags: ['question', 'pair', 'nlp', 'classification'],
            desc: 'Question pair classification for Quora dataset.',
            demo: 'https://quorakit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Quora-Question-pair',
            stack: ['Python', 'NLP', 'Scikit-learn', 'Pandas']
          },
          {
            name: 'Tic Tac Toe Game',
            tags: ['tic', 'toe', 'game', 'javascript'],
            desc: 'Fun Tic Tac Toe game built in JavaScript with AI opponent.',
            demo: 'https://tickiton.onrender.com/',
            code: 'https://github.com/eddiebrock911/Tic-Tac-Toe',
            stack: ['JavaScript', 'HTML5', 'CSS3']
          },
          {
            name: 'Space Shooter Game',
            tags: ['space', 'shooter', 'game', 'canvas'],
            desc: 'Space Shooter game built with JavaScript and HTML5 Canvas.',
            demo: 'https://spacekit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Space-Shooters-Game',
            stack: ['JavaScript', 'Canvas', 'Game Dev','HTML5', 'CSS3']
          }
        ],
        skills: {
          languages: ['Python', 'JavaScript', 'SQL'],
          ai: ['Machine Learning', 'Deep Learning', 'Data Science', 'NLP', 'Transformers'],
          web: ['HTML5', 'CSS3', 'Flask', 'Responsive Design'],
          tools: ['Git & GitHub', 'Pandas', 'NumPy', 'Streamlit', 'Data Visualization']
        },
        sections: [
          { label: 'About', id: 'about', emoji: '👤' },
          { label: 'Skills', id: 'skills', emoji: '🛠️' },
          { label: 'Projects', id: 'projects', emoji: '💼' },
          { label: 'Vision', id: 'vision', emoji: '🚀' },
          { label: 'Contact', id: 'contact', emoji: '📧' }
        ]
      };
    }

    createChatInterface() {
      if (document.getElementById('baby-ai-root')) return;

      const root = document.createElement('div');
      root.id = 'baby-ai-root';
      root.innerHTML = `
        <button id="chat-toggle" class="baby-ai-toggle" aria-label="Open Baby AI Chat" title="Ask Baby AI">
          <span class="orb-ring"></span>
          <span class="orb-face">🤖</span>
          <span class="chat-badge">Baby AI</span>
        </button>

        <section id="chat-window" class="baby-ai-window" aria-live="polite" aria-label="Baby AI Assistant">
          <header class="baby-ai-header">
            <div class="baby-ai-title-wrap">
              <div class="baby-ai-avatar">🤖</div>
              <div>
                <h4>Baby AI Assistant</h4>
                <span class="baby-ai-status"><span class="status-dot"></span> Online • Portfolio Guide</span>
              </div>
            </div>
            <div class="baby-ai-actions">
              <button id="chat-voice-toggle" class="icon-btn" title="Voice reply on/off" aria-label="Toggle voice replies">${this.isMuted ? '🔇' : '🔊'}</button>
              <button id="chat-clear" class="icon-btn" title="Clear chat" aria-label="Clear chat">🧹</button>
              <button id="chat-close" class="icon-btn" title="Close" aria-label="Close chat">✕</button>
            </div>
          </header>

          <div class="baby-ai-toolbar" id="baby-ai-toolbar">
            <button class="tool-chip" data-action="nav:projects">💼 Projects</button>
            <button class="tool-chip" data-action="nav:skills">🛠️ Skills</button>
            <button class="tool-chip" data-action="contact">📧 Contact</button>
            <button class="tool-chip" data-action="games">🎮 Games</button>
          </div>

          <main id="chat-messages" class="baby-ai-messages"></main>

          <div class="baby-ai-suggestions" id="chat-suggestions">
            <button class="suggestion-btn" data-message="Best project kaunsa hai?">🏆 Best Project</button>
            <button class="suggestion-btn" data-message="Ankit ke AI ML skills batao">🧠 AI/ML Skills</button>
            <button class="suggestion-btn" data-message="How can I hire Ankit?">🤝 Hire</button>
            <button class="suggestion-btn" data-message="Baby AI kya hai?">🤖 Baby AI</button>
            <button class="suggestion-btn" data-message="Show project links">🔗 Links</button>
          </div>

          <form class="baby-ai-input-row" id="chat-form">
            <button type="button" id="chat-mic" class="mic-btn" aria-label="Voice input" title="Voice input">🎙️</button>
            <input id="chat-input" type="text" placeholder="Ask anything... Hindi/English/Hinglish" autocomplete="off" maxlength="500" />
            <button id="chat-send" class="send-btn" type="submit" aria-label="Send message">➤</button>
          </form>

          <footer class="baby-ai-footer">
            <span>Powered by Ankit ❤️</span>
            <button id="chat-export" class="footer-link" type="button">Export Chat</button>
          </footer>
        </section>
      `;
      document.body.appendChild(root);
      this.injectStyles();
    }

    attachEventListeners() {
      const $ = (id) => document.getElementById(id);
      $('chat-toggle').addEventListener('click', () => this.toggleChat(true));
      $('chat-close').addEventListener('click', () => this.toggleChat(false));
      $('chat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
      $('chat-clear').addEventListener('click', () => this.clearChat());
      $('chat-export').addEventListener('click', () => this.exportChat());
      $('chat-voice-toggle').addEventListener('click', () => this.toggleVoiceReplies());
      $('chat-mic').addEventListener('click', () => this.toggleListening());

      document.querySelectorAll('.suggestion-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          $('chat-input').value = btn.dataset.message;
          this.sendMessage();
        });
      });

      document.getElementById('baby-ai-toolbar').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) this.handleAction(btn.dataset.action);
      });

      document.getElementById('chat-messages').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) this.handleAction(btn.dataset.action);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.toggleChat(false);
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.toggleChat(true);
        }
      });
    }

    addWelcomeMessage() {
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      this.addMessage('bot', `${greet}! 👋 Main <strong>Baby AI</strong> hoon — Ankit Kumar ke portfolio ka smart guide.\n\nMain projects, skills, contact, AI/ML concepts, navigation, games aur hiring info bata sakta hoon. Aap Hindi, English ya Hinglish me pooch sakte ho.`, {
        quickReplies: ['Projects dikhao', 'Skills batao', 'Contact Ankit', 'Baby AI kya hai?']
      });
    }

    toggleChat(force) {
      const win = document.getElementById('chat-window');
      const toggle = document.getElementById('chat-toggle');
      this.isOpen = typeof force === 'boolean' ? force : !this.isOpen;
      win.classList.toggle('open', this.isOpen);
      toggle.classList.toggle('active', this.isOpen);
      if (this.isOpen) setTimeout(() => document.getElementById('chat-input').focus(), 50);
    }

    sendMessage(raw) {
      const input = document.getElementById('chat-input');
      const message = (raw || input.value || '').trim();
      if (!message) return;

      document.getElementById('chat-suggestions').classList.add('collapsed');
      this.addMessage('user', message);
      input.value = '';
      this.showTypingIndicator();

      const thinkingTime = Math.min(1500, 450 + message.length * 18 + Math.random() * 500);
      setTimeout(() => {
        this.removeTypingIndicator();
        const result = this.generateResponse(message);
        this.addMessage('bot', result.html, result.meta || {});
        this.context.lastIntent = result.intent || this.context.lastIntent;
        this.saveChatHistory();
        if (!this.isMuted) this.speak(this.stripHtml(result.html));
      }, thinkingTime);
    }

    generateResponse(message) {
      const text = this.normalize(message);
      const project = this.findProject(text);
      if (project) return { intent: 'project_detail', html: this.projectCard(project), meta: { quickReplies: ['More projects', 'Live demo', 'Code link'] } };

      const intents = [
        { name: 'greeting', keys: ['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'kya haal'], handler: () => this.replyGreeting() },
        { name: 'projects', keys: ['project', 'work', 'portfolio', 'links', 'demo', 'github repo', 'best project', 'kaunsa project'], handler: () => this.replyProjects(text) },
        { name: 'skills', keys: ['skill', 'tech', 'technology', 'stack', 'language', 'tools', 'python', 'javascript', 'aata hai'], handler: () => this.replySkills() },
        { name: 'contact', keys: ['contact', 'email', 'hire', 'linkedin', 'github', 'instagram', 'reach', 'collaboration', 'connect'], handler: () => this.replyContact() },
        { name: 'vision', keys: ['baby ai', 'vision', 'future', 'goal', 'dream', 'agi', 'mars', 'biology'], handler: () => this.replyVision() },
        { name: 'about', keys: ['about', 'ankit', 'who is', 'kaun hai', 'education', 'study', 'student', 'class', 'location', 'bihar', 'patna'], handler: () => this.replyAbout() },
        { name: 'navigation', keys: ['navigate', 'section', 'scroll', 'where', 'find', 'go to'], handler: () => this.replyNavigation() },
        { name: 'resume', keys: ['resume', 'cv', 'download'], handler: () => this.replyResume() },
        { name: 'games', keys: ['game', 'play', 'tic tac toe', 'space shooter'], handler: () => this.replyGames() },
        { name: 'ai_ml', keys: ['what is ai', 'artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'neural network', 'ml', 'dl'], handler: () => this.replyAIConcept(text) },
        { name: 'thanks', keys: ['thank', 'thanks', 'dhanyawad', 'shukriya', 'awesome', 'nice', 'good bot'], handler: () => this.replyThanks() },
        { name: 'bye', keys: ['bye', 'goodbye', 'see you', 'later', 'ok thik', 'alvida'], handler: () => this.replyBye() }
      ];

      let best = { score: 0, intent: null };
      intents.forEach((intent) => {
        const score = this.scoreIntent(text, intent.keys);
        if (score > best.score) best = { score, intent };
      });

      if (best.score > 0) {
        return { intent: best.intent.name, html: best.intent.handler() };
      }
      return { intent: 'fallback', html: this.replyFallback(text) };
    }

    scoreIntent(text, keys) {
      let score = 0;
      keys.forEach((key) => {
        if (text.includes(key)) score += key.length > 4 ? 3 : 2;
        const words = key.split(' ');
        if (words.length > 1 && words.every((w) => text.includes(w))) score += 2;
      });
      return score;
    }

    normalize(str) {
      return String(str)
        .toLowerCase()
        .replace(/[?!.।,;:()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    findProject(text) {
      let best = null;
      let bestScore = 0;
      this.knowledge.projects.forEach((p) => {
        const hay = `${p.name} ${p.tags.join(' ')} ${p.stack.join(' ')}`.toLowerCase();
        let score = 0;
        text.split(' ').forEach((word) => {
          if (word.length > 2 && hay.includes(word)) score += 1;
        });
        p.tags.forEach((tag) => { if (text.includes(tag)) score += 3; });
        if (score > bestScore) { bestScore = score; best = p; }
      });
      return bestScore >= 3 ? best : null;
    }

    replyGreeting() {
      const replies = [
        'Hello! 👋 Kaise ho? Main Baby AI hoon — Ankit ke projects, skills aur contact ke baare me instantly bata sakta hoon.',
        'Namaste! 🙏 Portfolio explore karna hai? Projects, Skills, Vision ya Contact — bas pooch lo.',
        'Hey! 🚀 Main aapka smart portfolio guide hoon. Aap Hinglish me bhi baat kar sakte ho.'
      ];
      return replies[Math.floor(Math.random() * replies.length)] + this.actionRow([
        ['nav:projects', '💼 Projects'], ['nav:skills', '🛠️ Skills'], ['contact', '📧 Contact']
      ]);
    }

    replyProjects(text) {
      const top = this.knowledge.projects.slice(0, 7).map((p, i) =>
        `${i + 1}. <strong>${p.name}</strong> — ${p.desc}<br><span class="mini-stack">${p.stack.join(' • ')}</span>`
      ).join('<br><br>');
      return `Ankit ne AI/ML + Web + Games ke multiple real-world projects banaye hain. Highlights 👇<br><br>${top}<br><br>` +
        this.actionRow([['nav:projects', 'Open Projects Section'], ['project:all', 'All Project Links'], ['games', '🎮 Games']]);
    }

    replySkills() {
      const s = this.knowledge.skills;
      return `Ankit ke core skills ka quick map 👇<br><br>
        🐍 <strong>Programming:</strong> ${s.languages.join(', ')}<br>
        🧠 <strong>AI/ML:</strong> ${s.ai.join(', ')}<br>
        🌐 <strong>Web:</strong> ${s.web.join(', ')}<br>
        🧰 <strong>Tools:</strong> ${s.tools.join(', ')}<br><br>
        Strongest area: <strong>Python + Machine Learning + NLP + Data Projects</strong>.` +
        this.actionRow([['nav:skills', 'Open Skills'], ['project:all', 'Project Links']]);
    }

    replyContact() {
      return `Ankit se connect karne ke liye ye direct links use karein 👇<br><br>
        📧 <strong>Email:</strong> <a href="mailto:${this.options.email}">${this.options.email}</a><br>
        💻 <strong>GitHub:</strong> <a href="${this.options.github}" target="_blank" rel="noopener">github.com/eddiebrock911</a><br>
        💼 <strong>LinkedIn:</strong> <a href="${this.options.linkedin}" target="_blank" rel="noopener">LinkedIn Profile</a><br>
        📸 <strong>Instagram:</strong> <a href="${this.options.instagram}" target="_blank" rel="noopener">Instagram</a><br>
        📊 <strong>Kaggle:</strong> <a href="${this.options.kaggle}" target="_blank" rel="noopener">Kaggle</a><br><br>
        Hiring/collaboration ke liye email ya LinkedIn best rahega.` +
        this.actionRow([['copy:email', 'Copy Email'], ['nav:contact', 'Open Contact']]);
    }

    replyVision() {
      return `🚀 <strong>Baby AI Vision</strong><br><br>
        Ankit ka long-term goal ek advanced AI banana hai jisme:<br>
        • Emotion sensing 💝<br>
        • Wake-word detection 🎤<br>
        • Computer vision 👁️<br>
        • Natural conversation 🤖<br>
        • AI + Space Tech + Biology integration 🧬🌌<br><br>
        Ye portfolio chatbot us vision ka mini prototype feel deta hai — visitor guide + knowledge assistant.` +
        this.actionRow([['nav:vision', 'Open Vision'], ['nav:projects', 'See Projects']]);
    }

    replyAbout() {
      return `👤 <strong>About Ankit Kumar</strong><br><br>
        Ankit Bihar, India se ek dedicated coder aur Class 12 PCBM student hain. Unka focus <strong>AI, Machine Learning, Python development, NLP, Data Science</strong> aur web apps par hai.<br><br>
        Impressive part: school level par hote hue bhi unhone multiple live ML apps deploy kiye hain — ye practical learning mindset dikhata hai. 🔥` +
        this.actionRow([['nav:about', 'Open About'], ['nav:projects', 'Projects']]);
    }

    replyNavigation() {
      const buttons = this.knowledge.sections.map((s) => [`nav:${s.id}`, `${s.emoji} ${s.label}`]);
      return `Kis section par jaana hai? Neeche click karo 👇` + this.actionRow(buttons);
    }

    replyResume() {
      return `📄 Resume/CV download ke liye hero/top section me <strong>Download Resume</strong> button check karein. Agar button visible na ho, top par scroll karein.` +
        this.actionRow([['scroll:top', '⬆️ Top'], ['nav:contact', 'Contact Instead']]);
    }

    replyGames() {
      const games = this.knowledge.projects.filter((p) => p.tags.includes('game'));
      return `🎮 Ankit ke playable games:<br><br>` + games.map((g) =>
        `<strong>${g.name}</strong> — ${g.desc}<br><a href="${g.demo}" target="_blank" rel="noopener">Play Live</a> • <a href="${g.code}" target="_blank" rel="noopener">Code</a>`
      ).join('<br><br>');
    }

    replyAIConcept(text) {
      if (text.includes('deep') || text.includes('dl') || text.includes('neural')) {
        return `🧬 <strong>Deep Learning</strong> ML ka advanced part hai jisme neural networks multiple layers ke through patterns learn karte hain. Images, speech, NLP aur LLMs me iska use hota hai.`;
      }
      if (text.includes('machine') || text.includes('ml')) {
        return `📊 <strong>Machine Learning</strong> AI ka subset hai jisme model data se patterns learn karke prediction/classification karta hai. Ankit ke Spam Classifier, IPL Predictor, Laptop Price Predictor isi idea par based hain.`;
      }
      return `🧠 <strong>Artificial Intelligence</strong> machines ko human-like reasoning, learning aur decision-making ability dene ka field hai. ML, DL, NLP aur Computer Vision AI ke major areas hain.`;
    }

    replyThanks() {
      return `You're welcome! 😊 Agar chaho to main aapko best projects, skill roadmap ya Ankit ka contact bhi instantly dikha sakta hoon.` +
        this.actionRow([['project:all', 'Project Links'], ['contact', 'Contact']]);
    }

    replyBye() {
      setTimeout(() => this.toggleChat(false), 1800);
      return `Bye! 👋 Portfolio visit karne ke liye thanks. Have a great day! ✨`;
    }

    replyFallback(text) {
      const suggestions = ['Tell me about projects', 'Skills batao', 'Contact Ankit', 'What is Baby AI?'];
      return `Hmm, main is question ko fully samajh nahi paya 🤔<br><br>
        Main best help kar sakta hoon in topics par:<br>
        • Ankit ke Projects<br>
        • Skills / Tech stack<br>
        • Contact / Hiring<br>
        • Baby AI vision<br>
        • AI/ML concepts<br><br>
        Try: <em>${suggestions[Math.floor(Math.random() * suggestions.length)]}</em>`;
    }

    projectCard(p) {
      this.context.lastProject = p.name;
      return `💼 <strong>${p.name}</strong><br><br>
        ${p.desc}<br><br>
        <span class="mini-stack">${p.stack.join(' • ')}</span><br><br>
        🔗 <a href="${p.demo}" target="_blank" rel="noopener">Live Demo</a> • <a href="${p.code}" target="_blank" rel="noopener">Source Code</a>`;
    }

    actionRow(actions) {
      return `<div class="bot-actions">${actions.map(([action, label]) => `<button data-action="${this.escapeAttr(action)}">${label}</button>`).join('')}</div>`;
    }

    handleAction(action) {
      if (!action) return;
      if (action.startsWith('nav:')) return this.scrollToSection(action.split(':')[1]);
      if (action === 'scroll:top') return window.scrollTo({ top: 0, behavior: 'smooth' });
      if (action === 'contact') return this.addBotInstant(this.replyContact());
      if (action === 'games') return this.addBotInstant(this.replyGames());
      if (action === 'project:all') return this.addBotInstant(this.allProjectLinks());
      if (action === 'copy:email') return this.copyText(this.options.email, 'Email copied ✅');
    }

    allProjectLinks() {
      return `🔗 <strong>All important project links</strong><br><br>` + this.knowledge.projects.map((p) =>
        `• <strong>${p.name}</strong>: <a href="${p.demo}" target="_blank" rel="noopener">Demo</a> | <a href="${p.code}" target="_blank" rel="noopener">Code</a>`
      ).join('<br>');
    }

    scrollToSection(id) {
      const el = document.getElementById(id) || document.querySelector(`[data-section="${id}"]`) || document.querySelector(`.${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.addBotInstant(`Done ✅ <strong>${id}</strong> section par le gaya.`);
      } else {
        this.addBotInstant(`Section <strong>${id}</strong> page me nahi mila. Aap top navigation se try karein.`);
      }
    }

    addBotInstant(html) {
      this.addMessage('bot', html);
      this.saveChatHistory();
      if (!this.isMuted) this.speak(this.stripHtml(html));
    }

    addMessage(type, text, meta = {}) {
      const messagesContainer = document.getElementById('chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `baby-message ${type}-message`;

      const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const content = type === 'bot' ? this.formatMessage(text) : this.escapeHtml(text);
      const avatar = type === 'bot' ? '<div class="message-avatar">🤖</div>' : '';
      const quick = meta.quickReplies ? `<div class="quick-replies">${meta.quickReplies.map((q) => `<button data-action="ask:${this.escapeAttr(q)}">${this.escapeHtml(q)}</button>`).join('')}</div>` : '';

      messageDiv.innerHTML = `
        ${avatar}
        <div class="message-content">
          <div class="message-text">${content}</div>
          ${quick}
          <div class="message-time">${time}</div>
        </div>
      `;

      const quickButtons = messageDiv.querySelectorAll('[data-action^="ask:"]');
      quickButtons.forEach((btn) => btn.addEventListener('click', () => this.sendMessage(btn.dataset.action.replace('ask:', ''))));

      messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();

      this.messages.push({ type, text, time });
      if (this.messages.length > this.options.maxHistory) this.messages = this.messages.slice(-this.options.maxHistory);
      this.saveChatHistory();
    }

    showTypingIndicator() {
      const messagesContainer = document.getElementById('chat-messages');
      this.removeTypingIndicator();
      const indicator = document.createElement('div');
      indicator.className = 'baby-message bot-message typing-indicator';
      indicator.id = 'typing-indicator';
      indicator.innerHTML = `<div class="message-avatar">🤖</div><div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
      messagesContainer.appendChild(indicator);
      this.scrollToBottom();
    }

    removeTypingIndicator() {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();
    }

    initVoiceRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const mic = document.getElementById('chat-mic');
      if (!SpeechRecognition) {
        mic.title = 'Voice input not supported in this browser';
        mic.classList.add('disabled');
        return;
      }
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-IN';
      this.recognition.interimResults = false;
      this.recognition.continuous = false;
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chat-input').value = transcript;
        this.sendMessage();
      };
      this.recognition.onend = () => {
        this.isListening = false;
        mic.classList.remove('listening');
      };
    }

    toggleListening() {
      if (!this.recognition) return this.addBotInstant('Voice input is browser supported feature. Is browser me available nahi hai.');
      if (this.isListening) {
        this.recognition.stop();
      } else {
        this.isListening = true;
        document.getElementById('chat-mic').classList.add('listening');
        this.recognition.start();
      }
    }

    toggleVoiceReplies() {
      this.isMuted = !this.isMuted;
      localStorage.setItem('babyAI.muted', JSON.stringify(this.isMuted));
      document.getElementById('chat-voice-toggle').textContent = this.isMuted ? '🔇' : '🔊';
      if (this.isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
    }

    speak(text) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text.slice(0, 220));
      utter.lang = 'en-IN';
      utter.rate = 1;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    }

    clearChat() {
      if (!confirm('Clear Baby AI chat history?')) return;
      this.messages = [];
      localStorage.removeItem(this.options.storageKey);
      document.getElementById('chat-messages').innerHTML = '';
      this.addWelcomeMessage();
    }

    exportChat() {
      const lines = this.messages.map((m) => `[${m.time}] ${m.type.toUpperCase()}: ${this.stripHtml(m.text)}`).join('\n\n');
      const blob = new Blob([lines || 'No chat yet.'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'baby-ai-chat.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    copyText(text, successMsg) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => this.addBotInstant(successMsg));
      } else {
        this.addBotInstant(text);
      }
    }

    saveChatHistory() {
      try { localStorage.setItem(this.options.storageKey, JSON.stringify(this.messages.slice(-this.options.maxHistory))); } catch (_) {}
    }

    loadChatHistory() {
      try {
        const raw = localStorage.getItem(this.options.storageKey);
        if (!raw) return;
        const history = JSON.parse(raw);
        if (!Array.isArray(history) || !history.length) return;
        document.getElementById('chat-messages').innerHTML = '';
        this.messages = [];
        history.forEach((m) => this.addMessage(m.type, m.text));
      } catch (_) {}
    }

    formatMessage(text) {
      return String(text)
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    stripHtml(html) {
      const div = document.createElement('div');
      div.innerHTML = this.formatMessage(html);
      return div.textContent || div.innerText || '';
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = String(text);
      return div.innerHTML;
    }

    escapeAttr(text) {
      return String(text).replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    scrollToBottom() {
      const messagesContainer = document.getElementById('chat-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    injectStyles() {
      if (document.getElementById('baby-ai-styles')) return;
      const style = document.createElement('style');
      style.id = 'baby-ai-styles';
      style.textContent = `
        :root {
          --baby-primary: #00d4ff;
          --baby-secondary: #7c3aed;
          --baby-accent: #22c55e;
          --baby-bg: rgba(8, 12, 25, 0.88);
          --baby-card: rgba(255,255,255,0.08);
          --baby-border: rgba(0, 212, 255, 0.22);
          --baby-text: #f8fafc;
          --baby-muted: #a5b4fc;
          --baby-shadow: 0 22px 70px rgba(0,0,0,0.45), 0 0 35px rgba(0,212,255,0.18);
        }

        .baby-ai-toggle {
          position: fixed;
          right: 28px;
          bottom: 28px;
          width: 72px;
          height: 72px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.25);
          background: radial-gradient(circle at 30% 25%, #ffffff 0 6%, #67e8f9 12%, #0ea5e9 42%, #4c1d95 100%);
          color: white;
          cursor: pointer;
          display: grid;
          place-items: center;
          z-index: 99998;
          box-shadow: 0 0 26px rgba(0,212,255,.65), inset 0 0 18px rgba(255,255,255,.4);
          transition: transform .25s ease, filter .25s ease;
          isolation: isolate;
        }
        .baby-ai-toggle:hover { transform: translateY(-4px) scale(1.06); filter: brightness(1.1); }
        .baby-ai-toggle.active { background: radial-gradient(circle at 30% 25%, #fff 0 5%, #fca5a5 14%, #ef4444 46%, #7f1d1d 100%); }
        .orb-face { font-size: 30px; z-index: 2; animation: babyFloat 2.8s ease-in-out infinite; }
        .orb-ring { position:absolute; inset:-8px; border-radius:inherit; border:2px solid rgba(0,212,255,.35); animation: babyPulse 2s ease-out infinite; }
        .chat-badge { position:absolute; top:-10px; right:-10px; padding:4px 9px; border-radius:999px; color:#fff; font-size:11px; font-weight:800; background:linear-gradient(135deg,#f97316,#ec4899); box-shadow:0 8px 20px rgba(236,72,153,.35); }
        @keyframes babyPulse { 0%{ transform:scale(.92); opacity:.9;} 100%{ transform:scale(1.25); opacity:0;} }
        @keyframes babyFloat { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-3px);} }

        .baby-ai-window {
          position: fixed;
          right: 28px;
          bottom: 112px;
          width: 420px;
          max-width: calc(100vw - 28px);
          height: 650px;
          max-height: calc(100vh - 132px);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 99997;
          color: var(--baby-text);
          background: linear-gradient(145deg, rgba(8,12,25,.94), rgba(22,17,48,.9));
          border: 1px solid var(--baby-border);
          border-radius: 26px;
          box-shadow: var(--baby-shadow);
          backdrop-filter: blur(18px) saturate(150%);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          transform-origin: bottom right;
        }
        .baby-ai-window.open { display:flex; animation: babySlide .28s cubic-bezier(.2,.8,.2,1); }
        @keyframes babySlide { from{ opacity:0; transform: translateY(18px) scale(.96);} to{ opacity:1; transform: translateY(0) scale(1);} }
        .baby-ai-window::before { content:''; position:absolute; inset:0; pointer-events:none; background: radial-gradient(circle at 15% 0%, rgba(0,212,255,.22), transparent 30%), radial-gradient(circle at 85% 20%, rgba(124,58,237,.22), transparent 36%); }

        .baby-ai-header, .baby-ai-toolbar, .baby-ai-input-row, .baby-ai-footer { position:relative; z-index:1; }
        .baby-ai-header { padding:16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); }
        .baby-ai-title-wrap { display:flex; align-items:center; gap:12px; min-width:0; }
        .baby-ai-avatar { width:46px; height:46px; display:grid; place-items:center; border-radius:16px; background:linear-gradient(135deg, rgba(0,212,255,.25), rgba(124,58,237,.3)); border:1px solid rgba(255,255,255,.18); font-size:24px; box-shadow: inset 0 0 16px rgba(255,255,255,.08); }
        .baby-ai-header h4 { margin:0; font-size:16px; letter-spacing:.2px; }
        .baby-ai-status { display:flex; align-items:center; gap:6px; font-size:12px; color:#c4b5fd; margin-top:3px; }
        .status-dot { width:8px; height:8px; border-radius:999px; background:#22c55e; box-shadow:0 0 12px #22c55e; animation: statusBlink 1.8s infinite; }
        @keyframes statusBlink { 50%{ opacity:.45; } }
        .baby-ai-actions { display:flex; gap:7px; }
        .icon-btn { width:34px; height:34px; border:1px solid rgba(255,255,255,.12); border-radius:12px; background:rgba(255,255,255,.08); color:#fff; cursor:pointer; transition:.2s; }
        .icon-btn:hover { background:rgba(0,212,255,.18); transform:translateY(-1px); }

        .baby-ai-toolbar { display:flex; gap:8px; padding:10px 12px; overflow-x:auto; border-bottom:1px solid rgba(255,255,255,.08); }
        .tool-chip, .suggestion-btn, .bot-actions button, .quick-replies button { border:1px solid rgba(0,212,255,.28); color:#e0f2fe; background:rgba(0,212,255,.09); border-radius:999px; padding:8px 12px; cursor:pointer; white-space:nowrap; transition:.2s; font-size:12.5px; }
        .tool-chip:hover, .suggestion-btn:hover, .bot-actions button:hover, .quick-replies button:hover { background:rgba(0,212,255,.22); transform:translateY(-1px); }

        .baby-ai-messages { position:relative; z-index:1; flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:14px; scroll-behavior:smooth; }
        .baby-ai-messages::-webkit-scrollbar { width:8px; }
        .baby-ai-messages::-webkit-scrollbar-thumb { background:rgba(0,212,255,.25); border-radius:999px; }
        .baby-message { display:flex; gap:10px; animation: msgIn .22s ease; }
        @keyframes msgIn { from{ opacity:0; transform:translateY(8px);} to{ opacity:1; transform:translateY(0);} }
        .user-message { justify-content:flex-end; }
        .message-avatar { flex:0 0 32px; width:32px; height:32px; display:grid; place-items:center; border-radius:12px; background:rgba(0,212,255,.16); border:1px solid rgba(0,212,255,.24); }
        .message-content { max-width:78%; }
        .user-message .message-content { max-width:82%; }
        .message-text { padding:12px 14px; border-radius:18px; line-height:1.48; font-size:14px; word-wrap:break-word; }
        .bot-message .message-text { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-bottom-left-radius:6px; }
        .user-message .message-text { background:linear-gradient(135deg,#0ea5e9,#7c3aed); color:#fff; border-bottom-right-radius:6px; box-shadow:0 10px 24px rgba(14,165,233,.18); }
        .message-time { margin-top:5px; padding:0 5px; color:#93c5fd; opacity:.85; font-size:11px; }
        .user-message .message-time { text-align:right; }
        .message-text a { color:#67e8f9; text-decoration:underline; font-weight:700; }
        .mini-stack { display:inline-block; margin-top:3px; color:#c4b5fd; font-size:12px; }
        .bot-actions, .quick-replies { display:flex; flex-wrap:wrap; gap:7px; margin-top:10px; }
        .quick-replies { margin-left:2px; }
        .typing-dots { display:flex; align-items:center; gap:6px; padding:13px 15px; background:rgba(255,255,255,.07); border-radius:18px; border-bottom-left-radius:6px; }
        .typing-dots span { width:8px; height:8px; border-radius:999px; background:#67e8f9; animation: typingDot 1.1s infinite ease-in-out; }
        .typing-dots span:nth-child(2){ animation-delay:.15s; } .typing-dots span:nth-child(3){ animation-delay:.3s; }
        @keyframes typingDot { 0%,80%,100%{ transform:translateY(0); opacity:.45;} 40%{ transform:translateY(-7px); opacity:1;} }

        .baby-ai-suggestions { position:relative; z-index:1; display:flex; gap:8px; flex-wrap:wrap; padding:10px 14px; border-top:1px solid rgba(255,255,255,.08); transition:.2s; }
        .baby-ai-suggestions.collapsed { display:none; }
        .baby-ai-input-row { display:flex; gap:9px; align-items:center; padding:13px; border-top:1px solid rgba(255,255,255,.1); background:rgba(0,0,0,.12); }
        #chat-input { flex:1; min-width:0; padding:13px 15px; border-radius:999px; border:1px solid rgba(103,232,249,.35); background:rgba(2,6,23,.72); color:#fff; outline:none; font-size:14px; }
        #chat-input:focus { border-color:#67e8f9; box-shadow:0 0 0 4px rgba(103,232,249,.12); }
        .send-btn, .mic-btn { flex:0 0 44px; width:44px; height:44px; border-radius:999px; border:0; cursor:pointer; color:#fff; display:grid; place-items:center; transition:.2s; }
        .send-btn { background:linear-gradient(135deg,#06b6d4,#7c3aed); font-size:18px; }
        .mic-btn { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.14); }
        .send-btn:hover, .mic-btn:hover { transform:scale(1.06); filter:brightness(1.1); }
        .mic-btn.listening { background:#ef4444; animation: micPulse 1s infinite; }
        .mic-btn.disabled { opacity:.45; cursor:not-allowed; }
        @keyframes micPulse { 50%{ box-shadow:0 0 0 8px rgba(239,68,68,.18); } }
        .baby-ai-footer { display:flex; align-items:center; justify-content:space-between; padding:9px 14px; color:#c4b5fd; font-size:12px; border-top:1px solid rgba(255,255,255,.06); }
        .footer-link { border:0; background:transparent; color:#67e8f9; cursor:pointer; font-size:12px; }

        @media (max-width: 768px) {
          .baby-ai-toggle { right:18px; bottom:18px; width:64px; height:64px; }
          .baby-ai-window { right:10px; bottom:92px; width:calc(100vw - 20px); height:calc(100vh - 112px); border-radius:22px; }
          .message-content { max-width:84%; }
          .baby-ai-toolbar { padding-bottom:8px; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AdvancedBabyAI());
  } else {
    new AdvancedBabyAI();
  }
})();
