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
      return `Goodbye! 👋 It was wonderful chatting with you!
      <br><br>
      Don't be a stranger - come back anytime you want to learn more about Ankit's projects or just want to chat! 💙
      <br><br>
      Have an amazing day! ✨`;
      setTimeout(() => {
        document.getElementById('chat-close').click();
      }, 800);

      return `Goodbye! 👋<br><br>Come back anytime!`;

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

    // Compliments
    else if (msg.includes('smart') || msg.includes('intelligent') || msg.includes('good bot') || msg.includes('nice')) {
      return `Aww, thank you! 🥰 You're making me blush (if robots could blush! 😊)
      <br><br>
      I try my best to be helpful! Ankit built me to assist visitors like you. Your kind words motivate me! 💙
      <br><br>
      Is there anything else I can help you with? 🎯`;
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #007a99);
  border: none;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(0, 212, 255, 0.5);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  transition: all 0.3s ease;
  animation: pulse-chat 2s infinite;
}

.chat-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(0, 212, 255, 0.7);
}

.chat-toggle.active {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.chat-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

@keyframes pulse-chat {
  0%, 100% { box-shadow: 0 5px 20px rgba(0, 212, 255, 0.5); }
  50% { box-shadow: 0 5px 30px rgba(0, 212, 255, 0.8); }
}

.chat-window {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 380px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 120px);
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 9997;
  display: none;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid var(--primary-color);
  animation: slideUp 0.3s ease;
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
  background: linear-gradient(135deg, #00d4ff, #007a99);
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
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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
  background: rgba(0, 212, 255, 0.1);
  color: var(--text-primary);
  border-bottom-left-radius: 5px;
}

.user-message .message-text {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 5px;
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