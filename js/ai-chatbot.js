// ========== Advanced Baby AI Chatbot for AnkitAI Portfolio ==========
// Drop-in replacement for ai-chatbot.js | Vanilla JS, no backend required

(function () {
  'use strict';

  class AdvancedBabyAI {
    constructor(options = {}) {
      this.options = {
        storageKey: 'babyAI.chat.v2',
        themeKey: 'babyAI.theme',
        maxHistory: 50,
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
            category: 'ai',
            status: 'live',
            tags: ['olympic', 'olympics', 'dashboard', 'streamlit', 'data', 'analytics', 'eda'],
            desc: 'Interactive Olympics analytics dashboard — medals, countries, athletes aur event trends ka full EDA + visualization.',
            demo: 'https://olympikit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Olympics-analysis-app',
            stack: ['Python', 'Streamlit', 'Pandas', 'EDA', 'Data Visualization']
          },
          {
            name: 'Spam Classifier AI',
            category: 'ai',
            status: 'live',
            tags: ['spam', 'classifier', 'nlp', 'email', 'sms', 'ham'],
            desc: 'End-to-end SMS/Email spam detection using NLP — text preprocessing, Bag of Words & TF-IDF, model training aur evaluation.',
            demo: 'https://antispamkit.onrender.com/',
            code: 'https://github.com/eddiebrock911/sms-email-classification-',
            stack: ['Python', 'NLP', 'Scikit-learn', 'TF-IDF', 'Streamlit']
          },
          {
            name: 'Laptop Price Predictor',
            category: 'ai',
            status: 'live',
            tags: ['laptop', 'price', 'regression', 'predictor', 'specs'],
            desc: 'ML regression web app jo brand, RAM, CPU, GPU jaise specs se laptop ka price predict karta hai.',
            demo: 'https://laptoprikit-vvle.onrender.com/',
            code: 'https://github.com/eddiebrock911/laptop-price-predictor-website-',
            stack: ['Python', 'Regression', 'Pandas', 'NumPy', 'Streamlit']
          },
          {
            name: 'IPL Win Probability Predictor',
            category: 'ai',
            status: 'live',
            tags: ['ipl', 'cricket', 'win', 'probability', 'match', 'classification'],
            desc: 'Live match stats (runs left, wickets, balls remaining, team strength) se batting team ki win probability predict karta hai.',
            demo: 'https://iplwinprokit.onrender.com/',
            code: 'https://github.com/eddiebrock911/IPL-Win-Probability-Predictor-Project',
            stack: ['Python', 'Logistic Regression', 'ML', 'Streamlit']
          },
          {
            name: 'Book Recommendation System',
            category: 'ai',
            status: 'live',
            tags: ['book', 'books', 'recommendation', 'recommender', 'collaborative'],
            desc: 'Collaborative filtering based book recommender jo aapki interest ke hisaab se books suggest karta hai.',
            demo: 'https://bookreckit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Books-Recommender-Systems-',
            stack: ['Python', 'Recommendation', 'TF-IDF', 'Scikit-learn', 'Pandas']
          },
          {
            name: 'Movie Recommendation System',
            category: 'ai',
            status: 'live',
            tags: ['movie', 'movies', 'recommendation', 'tmdb', 'content'],
            desc: 'Content-based movie recommendation system — similarity scores se milte-julte movies instantly suggest karta hai.',
            demo: 'https://movieskit.onrender.com/',
            code: 'https://github.com/eddiebrock911/movies-recommendation-system-',
            stack: ['Python', 'Content-Based Filtering', 'TF-IDF', 'Streamlit']
          },
          {
            name: 'AI Job Salary Prediction',
            category: 'ai',
            status: 'live',
            tags: ['job', 'salary', 'career', 'random forest', 'prediction'],
            desc: 'AI/Data jobs ki salary predict karne wala ML app — role, experience aur skills ke basis par estimate deta hai.',
            demo: 'https://aijobprekit.onrender.com/',
            code: 'https://github.com/eddiebrock911/AI-job-salary-prediction',
            stack: ['Python', 'Random Forest', 'Pandas', 'Streamlit']
          },
          {
            name: 'Quora Question Pair',
            category: 'ai',
            status: 'live',
            tags: ['quora', 'question', 'pair', 'duplicate', 'nlp', 'similarity'],
            desc: 'Do questions duplicate hain ya nahi — ye predict karne wala NLP model with fuzzy features, BOW aur t-SNE analysis.',
            demo: 'https://quorakit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Quora-Question-pair',
            stack: ['Python', 'NLP', 'NLTK', 'FuzzyWuzzy', 'Random Forest']
          },
          {
            name: 'WhatsApp Chat Analyzer',
            category: 'ai',
            status: 'live',
            tags: ['whatsapp', 'chat', 'analyzer', 'analysis', 'wordcloud'],
            desc: 'WhatsApp chat export upload karo aur poora analysis pao — top users, activity timeline, emoji stats aur wordcloud.',
            demo: 'https://whatkit.onrender.com/',
            code: 'https://github.com/eddiebrock911/WhatsApp-Chat-Analysis-Project',
            stack: ['Python', 'NLP', 'Matplotlib', 'Pandas', 'Streamlit']
          },
          {
            name: 'Student Mental Health Score',
            category: 'ai',
            status: 'live',
            tags: ['student', 'mental', 'health', 'score', 'wellbeing', 'prediction'],
            desc: 'ML app jo student lifestyle aur habits ke data se mental health score predict karta hai.',
            demo: 'https://mentalkit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Student-Mental-Health-Score',
            stack: ['Python', 'Machine Learning', 'Pandas', 'Streamlit']
          },
          {
            name: 'Cat vs Dog Classification',
            category: 'ai',
            status: 'sleeping',
            tags: ['cat', 'dog', 'image', 'cnn', 'tensorflow', 'classification', 'vision'],
            desc: 'Deep learning image classifier (CNN) jo photo dekh kar cat aur dog me difference batata hai.',
            demo: 'https://imgclassifier-tilx.onrender.com/',
            code: 'https://github.com/eddiebrock911/Cat-vs-Dog-Classification',
            stack: ['Python', 'TensorFlow', 'CNN', 'Deep Learning']
          },
          {
            name: 'Language Detection Model',
            category: 'ai',
            status: 'code',
            tags: ['language', 'detection', 'detect', 'multilingual', 'nlp'],
            desc: 'NLP model jo diye gaye text ki language automatically detect karta hai.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Language-Detection-model',
            stack: ['Python', 'NLP', 'Scikit-learn']
          },
          {
            name: 'House Price Predictor',
            category: 'ai',
            status: 'code',
            tags: ['house', 'home', 'property', 'price', 'regression'],
            desc: 'Area, location aur rooms jaise features se ghar ki price predict karne wala ML model.',
            demo: null,
            code: 'https://github.com/eddiebrock911/hous-price-predictor-website-',
            stack: ['Python', 'Regression', 'Pandas', 'Streamlit']
          },
          {
            name: 'Titanic Survival Prediction',
            category: 'ai',
            status: 'code',
            tags: ['titanic', 'survival', 'kaggle', 'classification'],
            desc: 'Classic Kaggle Titanic problem — multiple classification algorithms train karke unki performance compare ki gayi hai.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Titanic-Machine-Learning',
            stack: ['Python', 'Scikit-learn', 'Classification', 'Pandas']
          },
          {
            name: 'AI Background Remover',
            category: 'ai',
            status: 'code',
            tags: ['background', 'remove', 'remover', 'image', 'segmentation'],
            desc: 'Deep learning based tool jo images ka background automatically detect karke hata deta hai — no manual masking.',
            demo: null,
            code: 'https://github.com/eddiebrock911/AI-BackgroundRemove',
            stack: ['Python', 'Deep Learning', 'Image Processing']
          },
          {
            name: 'Remove Background (Streamlit)',
            category: 'ai',
            status: 'code',
            tags: ['background', 'remove', 'opencv', 'cnn', 'streamlit'],
            desc: 'Streamlit app version of background removal tool built with OpenCV aur CNN based segmentation.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Remove-Background',
            stack: ['Python', 'OpenCV', 'CNN', 'Streamlit']
          },
          {
            name: 'Grammar and Spell Checker',
            category: 'ai',
            status: 'code',
            tags: ['grammar', 'spell', 'checker', 'spelling', 'correction', 'nlp'],
            desc: 'NLP based tool jo text me grammatical errors aur spelling mistakes detect karke correct karta hai.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Grammar-and-spell-checker',
            stack: ['Python', 'NLP', 'Machine Learning']
          },
          {
            name: 'Keyword Extraction with Python',
            category: 'ai',
            status: 'code',
            tags: ['keyword', 'extraction', 'tfidf', 'text', 'nlp'],
            desc: 'TF-IDF based intelligent keyword extraction system jo kisi bhi document se important keywords nikalta hai.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Keyword-Extraction-with-python',
            stack: ['Python', 'TF-IDF', 'Scikit-learn', 'NLP']
          },
          {
            name: 'Computer Vision with OpenCV',
            category: 'ai',
            status: 'code',
            tags: ['computer vision', 'opencv', 'object detection', 'video', 'cv'],
            desc: 'Real-time image aur video analysis project — object detection, image processing aur feature extraction.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Computer-Vision',
            stack: ['Python', 'OpenCV', 'Deep Learning']
          },
          {
            name: 'Baby AI Assistant',
            category: 'ai',
            status: 'code',
            tags: ['baby ai', 'assistant', 'agi', 'vision', 'nlp'],
            desc: 'Ankit ka flagship vision project — ek smart, lightweight AI assistant jo intuitive aur responsive ho. Ye portfolio chatbot uska mini prototype hai.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Baby-AI',
            stack: ['NLP', 'Deep Learning', 'Neural Networks', 'AI']
          },
          {
            name: 'Space Shooters Game',
            category: 'game',
            status: 'live',
            tags: ['space', 'shooter', 'shooters', 'game', 'arcade', 'canvas'],
            desc: 'Fast-paced browser arcade shooter — alien territory me spacecraft udao, enemies ko blast karo aur survive karo.',
            demo: 'https://spacekit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Space-Shooters-Game',
            stack: ['JavaScript', 'HTML5 Canvas', 'CSS3', 'Game Dev']
          },
          {
            name: 'Tic Tac Toe Multiplayer (Online + Offline)',
            category: 'game',
            status: 'live',
            tags: ['tic', 'toe', 'tictactoe', 'multiplayer', 'socket', 'online', 'game'],
            desc: 'Real-time multiplayer Tic-Tac-Toe — room code se friends ke saath online khelo ya single device par offline.',
            demo: 'https://tickiton.onrender.com/',
            code: 'https://github.com/eddiebrock911/Tic-Tac-Toe-Online-off-',
            stack: ['Node.js', 'Express', 'Socket.IO', 'JavaScript']
          },
          {
            name: 'Tic Tac Toe Classic',
            category: 'game',
            status: 'live',
            tags: ['tic', 'toe', 'tictactoe', 'classic', 'bootstrap', 'game'],
            desc: 'Classic 3x3 Tic Tac Toe game — clean responsive UI ke saath do players ka turn-based match.',
            demo: 'https://tickit-rht5.onrender.com/',
            code: 'https://github.com/eddiebrock911/Tic-Tac-Toe',
            stack: ['JavaScript', 'Bootstrap', 'HTML5', 'CSS3']
          },
          {
            name: 'AnkitAI Portfolio',
            category: 'web',
            status: 'live',
            tags: ['portfolio', 'ankitai', 'personal', 'website', 'profile'],
            desc: 'Ankit ka main personal portfolio — AI/ML projects, data visualization, games aur Baby AI assistant ek jagah.',
            demo: 'https://ankitai.onrender.com/',
            code: 'https://github.com/eddiebrock911/profile',
            stack: ['JavaScript', 'HTML5', 'CSS3', 'Python']
          },
          {
            name: 'GitProfile Developer Portfolio',
            category: 'web',
            status: 'live',
            tags: ['gitprofile', 'portfolio', 'developer', 'typescript', 'github pages'],
            desc: 'Dynamic developer portfolio jo GitHub data se auto-generate hota hai — ML, NLP aur Generative AI projects showcase.',
            demo: 'https://eddiebrock911.github.io/gitprofile/',
            code: 'https://github.com/eddiebrock911/gitprofile',
            stack: ['TypeScript', 'React', 'GitHub Pages']
          },
          {
            name: 'Zynero E-Commerce',
            category: 'web',
            status: 'live',
            tags: ['zynero', 'ecommerce', 'e-com', 'shop', 'store', 'cart'],
            desc: 'Modern e-commerce web experience — product listing, cart flow aur clean responsive storefront UI.',
            demo: 'https://zynero.onrender.com/',
            code: 'https://github.com/eddiebrock911/Zynero-',
            stack: ['JavaScript', 'HTML5', 'CSS3']
          },
          {
            name: 'Abhishek Developer Portfolio',
            category: 'web',
            status: 'live',
            tags: ['abhishek', 'portfolio', 'client', 'dark theme', 'particle'],
            desc: 'Sleek dark-themed developer portfolio — particle effects, 3D card tilt, custom cursor aur terminal-style about section.',
            demo: 'https://abhishekkit.onrender.com/',
            code: 'https://github.com/eddiebrock911/Abhishek-profile',
            stack: ['JavaScript', 'CSS3', 'HTML5', 'Animations']
          },
          {
            name: 'Laukesh Kumar Portfolio',
            category: 'web',
            status: 'live',
            tags: ['laukesh', 'portfolio', 'client', 'photo editor', 'bgmi', 'gamer'],
            desc: 'Photo editor aur BGMI gamer ke liye banaya gaya visually stunning portfolio — work, highlights aur services showcase.',
            demo: 'https://laukesh.onrender.com/',
            code: 'https://github.com/eddiebrock911/laukeshKumar-Profile',
            stack: ['HTML5', 'CSS3', 'Bootstrap', 'JavaScript']
          },
          {
            name: 'Birthday Surprise Website',
            category: 'fun',
            status: 'code',
            tags: ['birthday', 'surprise', 'babe', 'celebration', 'gift'],
            desc: 'Magical animated birthday surprise website — music, animations aur personalised message reveal ke saath.',
            demo: null,
            code: 'https://github.com/eddiebrock911/babe-birthday',
            stack: ['JavaScript', 'CSS3', 'HTML5', 'Firebase']
          },
          {
            name: 'Naincy Birthday Website',
            category: 'fun',
            status: 'code',
            tags: ['naincy', 'birthday', 'surprise', 'vite', 'celebration'],
            desc: 'Vite se banaya gaya interactive birthday celebration website with smooth animations.',
            demo: null,
            code: 'https://github.com/eddiebrock911/Naincy-birthday',
            stack: ['JavaScript', 'Vite', 'CSS3']
          },
          {
            name: 'Babe Betu Surprise Site',
            category: 'fun',
            status: 'code',
            tags: ['babe', 'betu', 'surprise', 'romantic', 'creative'],
            desc: 'Creative surprise website project — animated sections aur playful interactive UI.',
            demo: null,
            code: 'https://github.com/eddiebrock911/babe-betu',
            stack: ['CSS3', 'JavaScript', 'HTML5']
          }
        ],
        categories: [
          { id: 'ai', label: 'AI / ML Projects' },
          { id: 'game', label: 'Games' },
          { id: 'web', label: 'Web & Portfolio' },
          { id: 'fun', label: 'Fun & Creative' }
        ],
        skills: {
          languages: ['Python', 'c++','JavaScript', 'SQL'],
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
            <button class="tool-chip" data-action="project:all">🔗 All Projects</button>
          </div>

          <main id="chat-messages" class="baby-ai-messages"></main>

          <div class="baby-ai-suggestions" id="chat-suggestions">
            <button class="suggestion-btn" data-message="Best project kaunsa hai?">🏆 Best Project</button>
            <button class="suggestion-btn" data-message="Ankit ke AI ML skills batao">🧠 AI/ML Skills</button>
            <button class="suggestion-btn" data-message="How can I hire Ankit?">🤝 Hire</button>
            <button class="suggestion-btn" data-message="Baby AI kya hai?">🤖 Baby AI</button>
            <button class="suggestion-btn" data-message="Sabhi project links dikhao">🔗 All Projects</button>
            <button class="suggestion-btn" data-message="Live demo dikhao">⚡ Live Demos</button>
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

      // High-priority phrases: list/overview intents must win over single-project matching
      const listFirst = /\b(sab|sabhi|saare|sare|all|list|kitne|how many|har)\b/.test(text)
        || /\ball project|project links|live demo|demos|kaun kaun/.test(text);
      const gamesFirst = /\bgames?\b/.test(text) || /khel/.test(text);
      const visionFirst = /baby ai (kya|kaun|what|about|vision)/.test(text) || /\bvision\b/.test(text);

      if (listFirst) return { intent: 'projects', html: this.replyProjects(text) };
      if (gamesFirst) return { intent: 'games', html: this.replyGames() };
      if (visionFirst) return { intent: 'vision', html: this.replyVision() };

      const project = this.findProject(text);
      if (project) return { intent: 'project_detail', html: this.projectCard(project), meta: { quickReplies: ['All projects', 'Live demos', 'Contact Ankit'] } };

      const intents = [
        { name: 'greeting', keys: ['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'kya haal'], handler: () => this.replyGreeting() },
        { name: 'projects', keys: ['project', 'work', 'portfolio', 'links', 'demo', 'github repo', 'best project', 'kaunsa project', 'sabhi project', 'saare project', 'all project', 'live demo', 'repo', 'kitne project'], handler: () => this.replyProjects(text) },
        { name: 'ai_projects', keys: ['ai project', 'ml project', 'machine learning project', 'data project', 'python project'], handler: () => this.replyCategory('ai') },
        { name: 'web_projects', keys: ['web project', 'website project', 'frontend', 'ecommerce', 'e-commerce'], handler: () => this.replyCategory('web') },
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
      const all = this.knowledge.projects;
      const live = all.filter((p) => p.demo);

      if (/\b(all|sab|saare|sabhi|full|complete|list|links?)\b/.test(text)) {
        return this.allProjectLinks();
      }
      if (/\b(live|demo|deploy)/.test(text)) return this.replyLiveDemos();

      const highlight = live.slice(0, 6).map((p, i) =>
        `${i + 1}. <strong>${p.name}</strong> \u2014 ${p.desc}<br>
         <span class="mini-stack">${p.stack.join(' \u2022 ')}</span><br>\u{1F517} ${this.projectLinks(p)}`
      ).join('<br><br>');

      return `Ankit ke paas total <strong>${all.length} projects</strong> hain \u2014 jisme <strong>${live.length} live demo</strong> ke saath deployed hain \u{1F680}<br><br>
        Top highlights \u{1F447}<br><br>${highlight}<br><br>
        Category wise dekhna hai? Neeche click karo.` +
        this.actionRow([
          ['project:all', '\u{1F517} All Project Links'],
          ['cat:ai', '\u{1F9E0} AI/ML'],
          ['cat:game', '\u{1F3AE} Games'],
          ['cat:web', '\u{1F310} Web'],
          ['project:live', '\u26A1 Live Demos']
        ]);
    }

    replyCategory(catId) {
      const cat = this.knowledge.categories.find((c) => c.id === catId);
      const list = this.knowledge.projects.filter((p) => p.category === catId);
      if (!cat || !list.length) return this.allProjectLinks();

      const body = list.map((p, i) =>
        `${i + 1}. <strong>${p.name}</strong> ${this.statusBadge(p)}<br>${p.desc}<br>
         <span class="mini-stack">${p.stack.join(' \u2022 ')}</span><br>\u{1F517} ${this.projectLinks(p)}`
      ).join('<br><br>');

      return `<strong>${cat.label}</strong> \u2014 ${list.length} projects \u{1F447}<br><br>${body}` +
        this.actionRow([['project:all', 'All Projects'], ['nav:projects', 'Open Section']]);
    }

    replyLiveDemos() {
      const live = this.knowledge.projects.filter((p) => p.demo);
      const body = live.map((p, i) =>
        `${i + 1}. <strong>${p.name}</strong> \u2014 <a href="${p.demo}" target="_blank" rel="noopener">Open Demo</a> | <a href="${p.code}" target="_blank" rel="noopener">Code</a>`
      ).join('<br>');
      return `\u26A1 <strong>${live.length} live demos</strong> \u2014 sab abhi online hain \u{1F447}<br><br>${body}<br><br>
        <em>Note: free hosting par pehli baar khulne me 30-60 second lag sakta hai (cold start).</em>` +
        this.actionRow([['project:all', 'All Projects'], ['nav:projects', 'Open Section']]);
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
      const games = this.knowledge.projects.filter((p) => p.category === 'game');
      return `\u{1F3AE} Ankit ke playable games \u2014 abhi browser me khel sakte ho:<br><br>` + games.map((g) =>
        `<strong>${g.name}</strong> \u2014 ${g.desc}<br>${this.projectLinks(g).replace('\u{1F310} Live Demo', '\u{1F3AE} Play Now')}`
      ).join('<br><br>') + this.actionRow([['project:all', 'All Projects'], ['cat:web', '\u{1F310} Web Projects']]);
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

    projectLinks(p) {
      const parts = [];
      if (p.demo) parts.push(`<a href="${p.demo}" target="_blank" rel="noopener">\u{1F310} Live Demo</a>`);
      parts.push(`<a href="${p.code}" target="_blank" rel="noopener">\u{1F4BB} Source Code</a>`);
      return parts.join(' \u2022 ');
    }

    statusBadge(p) {
      if (p.status === 'live') return '<span class="mini-badge live">\u25CF Live</span>';
      if (p.status === 'sleeping') return '<span class="mini-badge warm">\u25CF Live (cold start \u2014 30-60s)</span>';
      return '<span class="mini-badge code">\u25CF Code only</span>';
    }

    projectCard(p) {
      this.context.lastProject = p.name;
      return `\u{1F4BC} <strong>${p.name}</strong> ${this.statusBadge(p)}<br><br>
        ${p.desc}<br><br>
        <span class="mini-stack">${p.stack.join(' \u2022 ')}</span><br><br>
        \u{1F517} ${this.projectLinks(p)}`;
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
      if (action.startsWith('cat:')) return this.addBotInstant(this.replyCategory(action.split(':')[1]));
      if (action === 'project:live') return this.addBotInstant(this.replyLiveDemos());
      if (action === 'copy:email') return this.copyText(this.options.email, 'Email copied ✅');
    }

    allProjectLinks(filterCat) {
      const cats = filterCat
        ? this.knowledge.categories.filter((c) => c.id === filterCat)
        : this.knowledge.categories;

      const total = this.knowledge.projects.length;
      const liveCount = this.knowledge.projects.filter((p) => p.demo).length;

      let out = filterCat
        ? ''
        : `\u{1F517} <strong>All ${total} projects</strong> \u2014 ${liveCount} live demos \u{1F680}<br>`;

      cats.forEach((c) => {
        const list = this.knowledge.projects.filter((p) => p.category === c.id);
        if (!list.length) return;
        out += `<br><strong>${c.label} (${list.length})</strong><br>`;
        out += list.map((p) => `\u2022 <strong>${p.name}</strong> \u2014 ${this.projectLinks(p)}`).join('<br>');
        out += '<br>';
      });

      return out + this.actionRow([
        ['nav:projects', 'Open Projects Section'],
        ['cat:ai', '\u{1F9E0} AI/ML'],
        ['cat:game', '\u{1F3AE} Games'],
        ['cat:web', '\u{1F310} Web']
      ]);
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
        .mini-badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:10.5px; font-weight:700; vertical-align:middle; white-space:nowrap; }
        .mini-badge.live { background:rgba(34,197,94,.16); color:#4ade80; border:1px solid rgba(34,197,94,.35); }
        .mini-badge.warm { background:rgba(245,158,11,.16); color:#fbbf24; border:1px solid rgba(245,158,11,.35); }
        .mini-badge.code { background:rgba(148,163,184,.16); color:#cbd5e1; border:1px solid rgba(148,163,184,.35); }
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
