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
    
    // Projects
    if (msg.includes('project') || msg.includes('work') || msg.includes('portfolio')) {
      return `I have built <strong>9+ amazing projects</strong>! Here are some highlights:
      <br><br>
      🏅 <strong>Olympic Data Dashboard</strong> - Interactive ML-powered analytics
      <br>
      📧 <strong>Spam Classifier</strong> - NLP-based email classification
      <br>
      💻 <strong>Laptop Price Predictor</strong> - ML regression model
      <br>
      🏏 <strong>IPL Win Predictor</strong> - Cricket match prediction
      <br>
      🎮 <strong>Games</strong> - Tic Tac Toe & Space Shooter
      <br><br>
      Check out the <a href="#projects">Projects section</a> for more details!`;
    }
    
    // Skills
    else if (msg.includes('skill') || msg.includes('tech') || msg.includes('language') || msg.includes('know')) {
      return `I specialize in:
      <br><br>
      🐍 <strong>Python</strong> - Primary programming language
      <br>
      🧠 <strong>Machine Learning & Deep Learning</strong>
      <br>
      📊 <strong>Data Science & Visualization</strong>
      <br>
      💻 <strong>Web Development</strong> (HTML, CSS, JavaScript, Flask)
      <br>
      🔧 <strong>Tools</strong> - Git, Streamlit, Pandas, NumPy
      <br><br>
      Visit the <a href="#skills">Skills section</a> to learn more!`;
    }
    
    // Contact
    else if (msg.includes('contact') || msg.includes('hire') || msg.includes('reach') || msg.includes('email')) {
      return `You can reach me through:
      <br><br>
      💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/eddiebrock-364ba537b/" target="_blank">Connect with me</a>
      <br>
      💻 <strong>GitHub:</strong> <a href="https://github.com/eddiebrock911" target="_blank">Check my code</a>
      <br>
      📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/__ankit._.op_/" target="_blank">Follow my journey</a>
      <br>
      📧 <strong>Email:</strong> Drop me a message
      <br><br>
      Head to the <a href="#contact">Contact section</a> for more!`;
    }
    
    // Baby AI / Vision
    else if (msg.includes('baby ai') || msg.includes('vision') || msg.includes('future') || msg.includes('goal')) {
      return `My vision is ambitious and exciting! 🚀
      <br><br>
      🤖 <strong>Baby AI (AGI):</strong> Building advanced AI with emotion sensing, wake-word detection, and computer vision capabilities.
      <br><br>
      🚀 <strong>Mars Ecosystem:</strong> Developing sustainable living systems on Mars using AI, Space Tech, and Biology.
      <br><br>
      🧬 <strong>AI + Biology:</strong> Exploring the intersection of artificial intelligence and biological sciences.
      <br><br>
      Learn more in the <a href="#vision">Vision section</a>!`;
    }
    
    // Education
    else if (msg.includes('education') || msg.includes('study') || msg.includes('student') || msg.includes('school')) {
      return `I'm currently a <strong>Class 12 student</strong> from Patna, Bihar, India. 
      <br><br>
      Despite being in school, I'm passionate about AI/ML and have already built multiple real-world projects. I believe in learning by doing! 💪
      <br><br>
      My goal is to master AI and contribute to cutting-edge innovations.`;
    }
    
    // Location
    else if (msg.includes('location') || msg.includes('from') || msg.includes('live') || msg.includes('patna')) {
      return `I'm from <strong>Patna, Bihar, India</strong> 🇮🇳
      <br><br>
      Proud to be building AI solutions from my hometown and aiming to make a global impact!`;
    }
    
    // Age
    else if (msg.includes('age') || msg.includes('old') || msg.includes('year')) {
      return `I'm currently in Class 12, which makes me around 17-18 years old. 
      <br><br>
      Age is just a number - what matters is the passion and dedication to learn and build! 🚀`;
    }
    
    // Thank you
    else if (msg.includes('thank') || msg.includes('thanks') || msg.includes('awesome')) {
      return `You're welcome! 😊 I'm always here to help. Feel free to ask me anything else about Ankit's work!`;
    }
    
    // Greetings
    else if (msg.match(/^(hi|hello|hey|greetings|baby)/i)) {
      return `Hello! 👋 Great to see you here! I'm Baby AI assistant. I can help you learn about his projects, skills, and career goals. What would you like to know?`;
    }

    // Goodbye
    else if (msg.match(/^(Byy|ok|bye|thik|goodbye)/i)) {
      return `Goodbye! 👋 It was great chatting with you. If you have more questions about Ankit's projects, skills, or vision, just come back and ask!`;
    }
    
    // Name
    else if (msg.includes('name') || msg.includes('who are you')) {
      return `Hello! 👋 I'm Baby AI assistant. how can help you. What would you like to know?<br><br>
      Try asking about Ankit's:-
      <br>
    • Projects and work
    • Technical skills
    • Contact information
    • Future vision (Baby AI)
    • Education background
    <br><br>
    What would you like to know?`;
    }

    
    // Default
    else {
      return `That's an interesting question! While I'm designed to help with information about Ankit's portfolio, I'm still learning. 🤖
      <br><br>
      Try asking me about:
      <br>• Projects and work
      <br>• Technical skills
      <br>• Contact information
      <br>• Future vision (Baby AI)
      <br>• Education background
      <br><br>
      What would you like to know?`;
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
  bottom: 30px;
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