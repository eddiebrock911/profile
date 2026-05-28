// ========== AI Chatbot ==========
class AIChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.createChatInterface();
  }

  createChatInterface() {
    const chatHTML = `
      <!-- Chat Toggle Button -->
      <button id="chat-toggle" class="chat-toggle" aria-label="Open Chat">
        <i class="fas fa-comments"></i>
        <span class="chat-badge">Baby AI</span>
      </button>
      
      <!-- Chat Window -->
      <div id="chat-window" class="chat-window">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">🤖</div>
            <div>
              <h4>Baby AI Assistant</h4>
              <span class="chat-status">
                <span class="status-dot"></span> Online
              </span>
            </div>
          </div>
          <button id="chat-close" class="chat-close" aria-label="Close Chat">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div id="chat-messages" class="chat-messages"></div>
        
        <div class="chat-suggestions" id="chat-suggestions">
          <button class="suggestion-btn" data-message="What is your name?">
            🙋‍♂️ Your Name
          </button>
          <button class="suggestion-btn" data-message="Tell me about Ankit's projects">
            💼 Projects
          </button>
          <button class="suggestion-btn" data-message="What are Ankit's skills?">
            🛠️ Skills
          </button>
          <button class="suggestion-btn" data-message="How can I contact Ankit?">
            📧 Contact
          </button>
          <button class="suggestion-btn" data-message="What is Baby AI?">
            🤖 Baby AI
          </button>
        </div>
        
        <div class="chat-input-container">
          <input 
            id="chat-input" 
            type="text" 
            placeholder="Ask me anything..." 
            autocomplete="off"
            maxlength="500"
          >
          <button id="chat-send" class="chat-send" aria-label="Send Message">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        
        <div class="chat-footer">
          <small>Powered by Ankit ❤️</small>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = chatHTML;
    document.body.appendChild(container);

    this.attachEventListeners();
    this.addWelcomeMessage();
    this.loadChatHistory();
  }

  attachEventListeners() {
    const toggle = document.getElementById('chat-toggle');
    const close = document.getElementById('chat-close');
    const send = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const suggestions = document.querySelectorAll('.suggestion-btn');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.toggleChat());
    send.addEventListener('click', () => this.sendMessage());


    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    suggestions.forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.message;
        this.sendMessage();
      });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat();
      }
    });
  }

  toggleChat() {
    const window = document.getElementById('chat-window');
    const toggle = document.getElementById('chat-toggle');

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      window.classList.add('open');
      toggle.classList.add('active');
      document.getElementById('chat-input').focus();
    } else {
      window.classList.remove('open');
      toggle.classList.remove('active');
    }
  }

  addWelcomeMessage() {
    const welcomeMsg = `Hi! 👋 I'm Baby AI assistant. I can help you learn about his projects, skills, and more. What would you like to know?`;
    this.addMessage('bot', welcomeMsg);
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Hide suggestions after first message
    document.getElementById('chat-suggestions').style.display = 'none';

    this.addMessage('user', message);
    input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    // Simulate AI thinking time
    setTimeout(() => {
      this.removeTypingIndicator();
      const response = this.generateResponse(message);
      this.addMessage('bot', response);
      this.saveChatHistory();
    }, 800 + Math.random() * 1200);
  }

  addMessage(type, text) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;

    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (type === 'bot') {
      messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text">${this.formatMessage(text)}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">
          <div class="message-text">${this.escapeHtml(text)}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
    }

    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();

    // Store message
    this.messages.push({ type, text, time });
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot-message typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  generateResponse(message) {
    const msg = message.toLowerCase();

    // Resume/CV
    if (msg.includes('resume') || msg.includes('cv') || msg.includes('download')) {
      return `📄 Want to download Ankit's resume? Easy! 
      <br><br>
      Just scroll to the top of the page and click the <strong>"Download Resume"</strong> button in the hero section. It's right there with the purple gradient! 💜
      <br><br>
      You can also find it by scrolling up to see the main introduction area. The resume includes all his skills, projects, and achievements!`;
    }

    // Website Features
    else if (msg.includes('website') || msg.includes('site') || msg.includes('design') || msg.includes('build')) {
      return `This portfolio is pretty cool, right? 😎
      <br><br>
      ✨ <strong>Features:</strong>
      <br>• Smooth animations and transitions
      <br>• Dark/Light mode toggle
      <br>• Fully responsive design
      <br>• Interactive chatbot (that's me! 🤖)
      <br>• Dynamic typing animation
      <br>• Smooth scroll navigation
      <br><br>
      Built with <strong>HTML, CSS, and JavaScript</strong> - no heavy frameworks, just pure vanilla code for maximum performance! 🚀`;
    }

    // Navigation Help
    else if (msg.includes('navigate') || msg.includes('section') || msg.includes('find') || msg.includes('where')) {
      return `Let me help you navigate! 📍
      <br><br>
      The website has these sections:
      <br>• <a href="#about">About</a> - Learn about Ankit
      <br>• <a href="#skills">Skills</a> - Technical expertise
      <br>• <a href="#projects">Projects</a> - Amazing work showcase
      <br>• <a href="#vision">Vision</a> - Future goals (Baby AI!)
      <br>• <a href="#contact">Contact</a> - Get in touch
      <br><br>
      Just click on any link above or use the navigation menu at the top! 🎯`;
    }

    // How are you / Feelings
    else if (msg.includes('how are you') || msg.includes('how r u') || msg.includes('whatsup') || msg.includes('kya haal hai') || msg.includes('sub thik') || msg.includes("what's up")) {
      const responses = [
        `I'm doing great! 😊 Thanks for asking! I'm excited to help you learn about Ankit's work. What can I help you with?`,
        `Fantastic! 🎉 I'm having a great time chatting with visitors like you. How can I assist you today?`,
        `I'm wonderful! 🌟 Always ready to share information about Ankit's awesome projects. What would you like to know?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // What can you do
    else if (msg.includes('what can you') || msg.includes('help me') || msg.includes('can you')) {
      return `I can help you with lots of things! 🎯
      <br><br>
      💬 <strong>Chat:</strong> Have a friendly conversation
      <br>📋 <strong>Information:</strong> Tell you about Ankit's projects, skills, and goals
      <br>🗺️ <strong>Navigation:</strong> Guide you through the website
      <br>📄 <strong>Resume:</strong> Help you download his resume
      <br>🔧 <strong>Tech Info:</strong> Explain technologies used
      <br><br>
      Just ask me anything! I'm here to make your visit awesome! ✨`;
    }

    // Animations
    else if (msg.includes('animation') || msg.includes('effect') || msg.includes('cool')) {
      return `Glad you noticed the animations! 🎨
      <br><br>
      This site features:
      <br>✨ Typing effect in the hero section
      <br>🌊 Floating profile image
      <br>🎯 Hover effects on cards
      <br>📜 Scroll reveal animations
      <br>💫 Smooth transitions everywhere
      <br>🎭 Theme toggle animation
      <br><br>
      Everything is crafted with CSS and JavaScript for buttery-smooth performance! The dark mode is especially stylish! 🌙`;
    }

    // Projects
    if (msg.includes('project') || msg.includes('work') || msg.includes('portfolio')) {
      return `Ankit has built <strong>10+ amazing projects</strong>! Here are the highlights: 🌟
      <br><br>
      🏅 <strong>Olympic Data Dashboard</strong> - Interactive ML-powered analytics with Streamlit
      <br>
      📧 <strong>Spam Classifier AI</strong> - NLP-based email classification system
      <br>
      💻 <strong>Laptop Price Predictor</strong> - ML regression model with 90%+ accuracy
      <br>
      🏏 <strong>IPL Win Predictor</strong> - Cricket match outcome prediction
      <br>
      📚 <strong>Book Recommender</strong> - Collaborative filtering system
      <br>
      🎬 <strong>Movie Recommender</strong> - Content-based recommendation
      <br>
      🎮 <strong>Games</strong> - Tic Tac Toe & Space Shooter
      <br><br>
      Scroll down to the <a href="#projects">Projects section</a> to see live demos and code! 🚀`;
    }

    // Skills
    else if (msg.includes('skill') || msg.includes('tech') || msg.includes('language') || msg.includes('know')) {
      return `Ankit is a multi-talented developer! 💪
      <br><br>
      🐍 <strong>Python Expert</strong> - Primary programming language
      <br>
      🧠 <strong>AI/ML Specialist</strong> - Machine Learning, Deep Learning, NLP
      <br>
      📊 <strong>Data Science</strong> - Pandas, NumPy, Visualization
      <br>
      💻 <strong>Web Developer</strong> - HTML, CSS, JavaScript, Flask
      <br>
      🔧 <strong>Tools</strong> - Git, Streamlit, Jupyter, VS Code
      <br><br>
      Check the <a href="#skills">Skills section</a> for the complete list! Each skill has been applied in real projects. 🎯`;
    }

    // Contact
    else if (msg.includes('contact') || msg.includes('hire') || msg.includes('reach') || msg.includes('email')) {
      return `Want to connect with Ankit? Here's how! 📬
      <br><br>
      💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/eddiebrock-364ba537b/" target="_blank">Professional networking</a>
      <br>
      💻 <strong>GitHub:</strong> <a href="https://github.com/eddiebrock911" target="_blank">View all code repos</a>
      <br>
      📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/__ankit._.op_/" target="_blank">Follow the journey</a>
      <br>
      📊 <strong>Kaggle:</strong> Data science competitions
      <br>
      📧 <strong>Email:</strong> ankitkumar823089@gmail.com
      <br><br>
      Scroll to the <a href="#contact">Contact section</a> for clickable links! 💌`;
    }

    // Baby AI / Vision
    else if (msg.includes('baby ai') || msg.includes('vision') || msg.includes('future') || msg.includes('goal') || msg.includes('dream')) {
      return `The vision is truly inspiring! 🚀
      <br><br>
      🤖 <strong>Baby AI (AGI):</strong> Creating an advanced AI assistant with:
      <br>• Emotion sensing capabilities 💝
      <br>• Wake-word detection 🎤
      <br>• Computer vision integration 👁️
      <br>• Natural conversation (like me, but way more advanced!)
      <br><br>
      🚀 <strong>Mars Ecosystem:</strong> Combining AI, Space Tech, and Biology to build sustainable living systems on Mars!
      <br><br>
      🧬 <strong>AI + Biology:</strong> Pushing boundaries at the intersection of tech and life sciences.
      <br><br>
      Visit the <a href="#vision">Vision section</a> to learn more about these ambitious goals! 🌌`;
    }

    // Education
    else if (msg.includes('education') || msg.includes('study') || msg.includes('student') || msg.includes('school') || msg.includes('class')) {
      return `Ankit is a <strong>Class 12 student</strong> from Patna, Bihar, India! 📚
      <br><br>
      But here's the amazing part - despite being in school, he's already:
      <br>✅ Built 10+ real-world ML projects
      <br>✅ Mastered Python and AI/ML
      <br>✅ Created this awesome portfolio
      <br>✅ Deployed multiple live applications
      <br><br>
      Talk about ambition! 🔥 Learning by doing is the best approach! 💪`;
    }

    // Location
    else if (msg.includes('location') || msg.includes('from') || msg.includes('live') || msg.includes('patna') || msg.includes('bihar')) {
      return `Ankit is from <strong>Bihar Sharif, Patna, Bihar, India</strong>! 🇮🇳
      <br><br>
      Building world-class AI solutions from his hometown and ready to make a global impact! 🌍
      <br><br>
      Proof that talent knows no boundaries - it's all about passion and dedication! 🚀`;
    }

    // Age
    else if (msg.includes('age') || msg.includes('old') || msg.includes('young')) {
      return `Ankit is a Class 12 student, around 16-17 years old! 👦
      <br><br>
      Age is just a number when you have:
      <br>🔥 Unstoppable passion
      <br>💡 Creative problem-solving skills
      <br>📚 Dedication to learning
      <br>🎯 Clear vision for the future
      <br><br>
      The best time to start is NOW, and Ankit is proof of that! 🚀`;
    }

    // Fun / Jokes
    else if (msg.includes('joke') || msg.includes('funny') || msg.includes('laugh')) {
      const jokes = [
        `Why do programmers prefer dark mode? 🌙<br>Because light attracts bugs! 🐛😄`,
        `Why did the AI go to therapy? 🤖<br>It had too many deep learning issues! 😅`,
        `What's a programmer's favorite place to hang out? 🏖️<br>Foo Bar! 🍺😄`
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Thank you
    else if (msg.includes('thank') || msg.includes('thanks') || msg.includes('awesome') || msg.includes('amazing')) {
      return `You're very welcome! 😊 It makes me so happy to help!
      <br><br>
      Feel free to ask me anything else about Ankit's work, this website, or just chat! I'm always here! 💙`;
    }

    // Greetings
    else if (msg.match(/^(hi|hello|hey|greetings|namaste|sup)/i)) {
      const greetings = [
        `Hello there! 👋 Welcome to Ankit's portfolio! I'm Baby AI, and I'm super excited to help you explore his work! What would you like to know? 😊`,
        `Hey! 🎉 Great to see you! I'm Baby AI assistant, ready to answer all your questions about Ankit's projects, skills, and vision! How can I help? 🚀`,
        `Hi! 👋 Welcome aboard! I'm here to make your visit awesome! Want to know about projects, skills, or maybe download the resume? Just ask! ✨`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Goodbye
    else if (msg.match(/^(bye|goodbye|see you|later|cya|ok thik|thik)/i)) {
      setTimeout(() => {
        this.toggleChat();
      }, 1800); // give user time to read the message

      return `Goodbye! 👋 It was wonderful chatting with you!<br><br>
      Come back anytime! Have an amazing day! ✨`;
    }

    // Name
    else if (msg.includes('your name') || msg.includes('who are you') || msg.includes('what are you')) {
      return `I'm <strong>Baby AI</strong>! 🤖 Your friendly AI assistant!
      <br><br>
      I'm a chatbot created to help visitors like you learn about Ankit Kumar's portfolio. Think of me as your personal tour guide! 🎯
      <br><br>
      I can tell you about:
      <br>• 💼 Projects and achievements
      <br>• 🛠️ Technical skills
      <br>• 📧 Contact information
      <br>• 🚀 Future vision and goals
      <br>• 📄 How to download the resume
      <br>• 🗺️ Website navigation
      <br><br>
      What would you like to explore first? 😊`;
    }

    // What can you do?
    else if (msg.includes('what can you do') || msg.includes('help') || msg.includes('capabilities')) {
      return `I can help you with all sorts of things! 😊
      <br><br>
      Here's what I can do:
      <br>• 🎯 Answer questions about Ankit's projects and skills
      <br>• 📄 Help you download his resume
      <br>• 🧭 Navigate you through the website
      <br>• 🛠️ Explain AI, ML, and DL concepts
      <br>• 🚀 Tell you about his vision and goals
      <br>• 📧 Show you how to contact him
      <br>• 🎮 Recommend games to play
      <br><br>
      Just ask away! What would you like to do first? 🚀`;
    }

    // Can you chat for long?
    else if (msg.includes('chat for long') || msg.includes('long chat') || msg.includes('can we talk')) {
      return `Yes, absolutely! 😊 I'd love to chat as long as you want! 💙
      <br><br>
      Whether you want to talk about Ankit's projects, AI, or anything else, I'm here for you! 💬
      <br><br>
      But wait - speaking of long chats, did you know Ankit wants to build AGI (Artificial General Intelligence)? 🤖
      <br><br>
      That's the ultimate goal - AI that can understand, learn, and apply knowledge like humans! 🧠
      <br><br>
      Want to hear more about his vision for Baby AI? Or would you like to chat about something else? 😊`;
    }

    // What tech stack?  
    else if (msg.includes('tech stack') || msg.includes('technologies') || msg.includes('tools') || msg.includes('what do you use')) {
      return `I'm built using modern web technologies! 💻
      <br><br>
      This website uses:
      <br>• 🔥 HTML5 for structure
      <br>• 🎨 CSS3 for styling
      <br>• ⚡ JavaScript for logic and AI features
      <br>• 🤖 AI Chatbot with natural language processing
      <br>• 🌌 Particle.js for interactive background
      <br>• 🎯 Smooth animations and effects
      <br><br>
      The AI chatbot uses pattern matching and rule-based responses to understand and reply to your questions!`;
    }

    // How many languages do you know? 
    else if (msg.includes('languages') || msg.includes('speak') || msg.includes('understand')) {
      return `I can understand and communicate in **multiple languages**! 💬
      <br><br>
      This website uses JavaScript which supports global communication, but here are some specific languages I can assist you with:
      <br>• English (Primary) 🇬🇧
      <br>• Hindi (Primary) 🇮🇳
      <br>• Hinglish (mix of Hindi and English) 😂
      <br><br>
      I'm always learning and improving, just like Ankit! Want to try asking in a different language? 😊`;
    }


    // What's your purpose? 
    else if (msg.includes('purpose') || msg.includes('why are you here') || msg.includes('created')) {
      return `I was created with a special purpose! 😊
      <br><br>
      I'm here to:
      <br>• 🎯 Help visitors learn about Ankit's work
      <br>• 📄 Answer questions about his projects and skills
      <br>• 🧭 Guide you through the website
      <br>• 🛠️ Explain AI, ML, and DL concepts
      <br>• 🚀 Share his vision and goals
      <br>• 📧 Show you how to contact him
      <br>• 🎮 Entertain you with jokes and fun facts
      <br><br>
      Think of me as your friendly AI assistant! What would you like to explore? 🚀`;
    }

    else if (msg.includes('can you play') || msg.includes('recommend') || msg.includes('suggest')) {
      return `I can recommend things! 😊
      <br><br>
      Here are some things I can recommend:
      <br>• 🎯 Projects and achievements
      <br>• 🛠️ Technical skills
      <br>• 📧 Contact information
      <br>• 🚀 Future vision and goals
      <br>• 📄 How to download the resume
      <br>• 🗺️ Website navigation
      <br><br>
      What would you like to explore first? 🚀`;
    }

    // Can you play games? 
    else if (msg.includes('play') || msg.includes('game')) {
      return `Yes, I can play games! 😊
      <br><br>https://spacekit.onrender.com/
      This website uses JavaScript which supports global communication, but here are some specific games I can assist you with:
      <br>1• Tic-Tac-Toe 🎯
      <br>
       <a href="https://tickit-rht5.onrender.com/">Tic-Tac-Toe! 🎯</a>
      ;
      <br></br>
      <br>2• Space Shooter 🚀
      <br>
      <a href="https://spacekit.onrender.com/">Space Shooter! 🚀</a>`
    }
    

    // Compliments
    else if(msg.includes('smart') || msg.includes('intelligent') || msg.includes('good bot') || msg.includes('nice')) {
     return `Aww, thank you! 🥰 You're making me blush (if robots could blush! 😊)
      <br><br>
      I try my best to be helpful! Ankit built me to assist visitors like you. Your kind words motivate me! 💙
      <br><br>
      Is there anything else I can help you with? 🎯`;
}

    // AI Knowledge
    else if (msg.includes('artificial intelligence') || (msg.includes('what is') && msg.includes('ai'))) {
      return `**Artificial Intelligence (AI)** is the simulation of human intelligence processes by machines, especially computer systems. 🧠
      <br><br>
      Ankit is very passionate about AI! It includes learning (acquiring information and rules), reasoning (using rules to reach conclusions), and self-correction. 🚀`;
}

// Machine Learning
else if (msg.includes('machine learning') || msg.includes('ml')) {
  return `**Machine Learning (ML)** is a subset of AI that focuses on building systems that learn—or improve performance—based on the data they consume. 📊
      <br><br>
      Ankit has built over 10 ML projects, including a Spam Classifier and a Laptop Price Predictor! 💻`;
}

// Deep Learning
else if (msg.includes('deep learning') || msg.includes('dl') || msg.includes('neural network')) {
  return `**Deep Learning (DL)** is a type of machine learning based on artificial neural networks in which multiple layers of processing are used to extract progressively higher level features from data. 🧬
      <br><br>
      This is the technology behind advanced systems like self-driving cars and large language models (like me)!`;
}

// Python
else if (msg.includes('python') || msg.includes('coding language')) {
  return `**Python** 🐍 is Ankit's primary and favorite programming language! 
      <br><br>
      It is widely used for AI, Data Science, and Web Development because of its simplicity and powerful libraries like Pandas, NumPy, and TensorFlow.`;
}

// Hobbies / Free time
else if (msg.includes('hobby') || msg.includes('hobbies') || msg.includes('free time')) {
  return `When Ankit isn't coding or building AI models, he enjoys playing logic games, learning about space tech, and exploring biology! 🚀🧬
      <br><br>
      You can even play his Tic Tac Toe or Space Shooter games in the Projects section! 🎮`;
}

// Creator / Who made you
else if (msg.includes('creator') || msg.includes('who made you') || msg.includes('father') || msg.includes('developer')) {
  return `I was designed and developed by **Ankit Kumar**! 👨‍💻
      <br><br>
      He built me using JavaScript to be his personal portfolio assistant. My goal is to eventually evolve into a fully capable **Baby AI**! 🤖`;
}

// Default
else {
  return `Hmm, that's an interesting question! 🤔
      <br><br>
      I'm still learning, but I'm designed to help you with information about Ankit's portfolio!
      <br><br>
      <strong>Here's what I'm great at:</strong>
      <br>• 💼 Discussing projects and work
      <br>• 🛠️ Explaining technical skills
      <br>• 📧 Providing contact info
      <br>• 🚀 Sharing future vision (Baby AI!)
      <br>• 📄 Helping you download the resume
      <br>• 🗺️ Navigating the website
      <br><br>
      Try asking me something like "Tell me about the projects" or "How can I contact Ankit?" 😊`;
}
  }

formatMessage(text) {
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

scrollToBottom() {
  const messagesContainer = document.getElementById('chat-messages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

saveChatHistory() {
  try {
    const history = this.messages.slice(-20); // Keep last 20 messages
    localStorage.setItem('chatHistory', JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save chat history');
  }
}

loadChatHistory() {
  try {
    const history = localStorage.getItem('chatHistory');
    if (history) {
      const messages = JSON.parse(history);
      // Don't reload welcome message if history exists
      if (messages.length > 0) {
        document.getElementById('chat-messages').innerHTML = '';
        messages.forEach(msg => {
          this.addMessage(msg.type, msg.text);
        });
      }
    }
  } catch (e) {
    console.warn('Could not load chat history');
  }
}
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new AIChatbot();
  });
} else {
  window.chatbot = new AIChatbot();
}

// Add CSS styles
const chatStyles = `
<style>
.chat-toggle {
  position: fixed;
  top: 590px;
  right: 30px;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #00ffff, #007a99);
  border: 2px solid rgba(0, 255, 255, 0.4);
  cursor: pointer;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.6);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: pulse-ai-core 2.5s infinite alternate;
}

.chat-toggle:hover {
  transform: scale(1.15) rotate(15deg);
  box-shadow: 0 0 40px rgba(0, 212, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.8);
}

.chat-toggle.active {
  background: radial-gradient(circle at 30% 30%, #ff4d4d, #b30000);
  border-color: rgba(255, 77, 77, 0.4);
  animation: none;
  box-shadow: 0 0 30px rgba(255, 77, 77, 0.6);
}

.chat-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--gradient-2);
  color: white;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.6);
}

@keyframes pulse-ai-core {
  0% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.6); transform: scale(1); }
  100% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.9), inset 0 0 25px rgba(255, 255, 255, 0.8); transform: scale(1.05); }
}

.chat-window {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 400px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 120px);
  background: rgba(15, 15, 15, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 212, 255, 0.1);
  z-index: 9997;
  display: none;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 212, 255, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-window.open {
  display: flex;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-header {
  background: rgba(0, 212, 255, 0.1);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-avatar {
  width: 45px;
  height: 45px;
  background: rgba(0, 212, 255, 0.2);
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
}

.chat-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chat-status {
  font-size: 12px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #2ecc71;
  border-radius: 50%;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chat-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
}

.chat-close:hover {
  transform: rotate(90deg);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-message {
  display: flex;
  gap: 10px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 75%;
}

.user-message .message-content {
  margin-left: auto;
}

.message-text {
  padding: 12px 16px;
  border-radius: 15px;
  word-wrap: break-word;
  line-height: 1.5;
}

.bot-message .message-text {
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--text-primary);
  border-bottom-left-radius: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.user-message .message-text {
  background: var(--gradient-1);
  color: white;
  border-bottom-right-radius: 5px;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.message-time {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 5px;
  padding: 0 5px;
}

.user-message .message-time {
  text-align: right;
}

.typing-indicator .typing-dots {
  background: rgba(0, 212, 255, 0.1);
  padding: 12px 16px;
  border-radius: 15px;
  border-bottom-left-radius: 5px;
  display: flex;
  gap: 5px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-suggestions {
  padding: 10px 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid rgba(0, 212, 255, 0.1);
}

.suggestion-btn {
  padding: 8px 15px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid var(--primary-color);
  border-radius: 20px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.suggestion-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.chat-input-container {
  padding: 15px 20px;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  gap: 10px;
  align-items: center;
}

#chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--primary-color);
  border-radius: 25px;
  background: var(--bg-dark);
  color: var(--text-primary);
  outline: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

#chat-input:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.chat-send {
  width: 45px;
  height: 45px;
  background: var(--primary-color);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-send:hover {
  background: #00a8cc;
  transform: scale(1.1);
}

.chat-footer {
  padding: 10px;
  text-align: center;
  border-top: 1px solid rgba(0, 212, 255, 0.1);
  font-size: 12px;
  color: var(--text-secondary);
}

/* Links in messages */
.message-text a {
  color: var(--primary-color);
  text-decoration: underline;
  font-weight: 500;
}

.user-message .message-text a {
  color: white;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chat-window {
    right: 10px;
    bottom: 80px;
    width: calc(100vw - 20px);
    height: calc(100vh - 100px);
  }
  
  .chat-toggle {
    right: 20px;
    bottom: 20px;
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', chatStyles);