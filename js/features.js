// ========== Command Palette (Cmd+K or Ctrl+K) ==========
class CommandPalette {
  constructor() {
    this.commands = [
      { name: 'Go to About Section', action: () => this.scrollTo('#about'), icon: '👤', category: 'Navigation' },
      { name: 'Go to Skills', action: () => this.scrollTo('#skills'), icon: '🛠️', category: 'Navigation' },
      { name: 'Go to Projects', action: () => this.scrollTo('#projects'), icon: '💼', category: 'Navigation' },
      { name: 'Go to Vision', action: () => this.scrollTo('#vision'), icon: '🚀', category: 'Navigation' },
      { name: 'Go to Contact', action: () => this.scrollTo('#contact'), icon: '📧', category: 'Navigation' },
      { name: 'Toggle Dark/Light Mode', action: () => toggleTheme(), icon: '🌓', category: 'Settings' },
      { name: 'Scroll to Top', action: () => scrollToTop(), icon: '⬆️', category: 'Navigation' },
      { name: 'Open Chatbot', action: () => this.openChatbot(), icon: '💬', category: 'Tools' },
      { name: 'Visit GitHub', action: () => window.open('https://github.com/eddiebrock911', '_blank'), icon: '💻', category: 'Links' },
      { name: 'Visit LinkedIn', action: () => window.open('https://www.linkedin.com/in/eddiebrock-364ba537b/', '_blank'), icon: '💼', category: 'Links' },
      { name: 'Play Tic Tac Toe', action: () => window.open('https://tickit-rht5.onrender.com', '_blank'), icon: '🎮', category: 'Fun' }
    ];
    
    this.selectedIndex = 0;
    this.filteredCommands = [...this.commands];
    this.createPalette();
    this.attachKeyboardShortcut();
  }
  
  createPalette() {
    const overlay = document.createElement('div');
    overlay.id = 'command-palette-overlay';
    overlay.className = 'command-palette-overlay';
    
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    
    palette.innerHTML = `
      <div class="command-search">
        <i class="fas fa-search"></i>
        <input 
          id="command-input" 
          type="text" 
          placeholder="Type a command or search..." 
          autocomplete="off"
        >
        <kbd class="command-hint">ESC</kbd>
      </div>
      <div id="command-list" class="command-list"></div>
      <div class="command-footer">
        <div class="command-shortcuts">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Execute</span>
          <span><kbd>ESC</kbd> Close</span>
        </div>
      </div>
    `;
    
    overlay.appendChild(palette);
    document.body.appendChild(overlay);
    
    this.renderCommands();
    this.attachEventListeners();
  }
  
  attachKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      
      // ESC to close
      if (e.key === 'Escape') {
        this.close();
      }
      
      // Arrow navigation when open
      const overlay = document.getElementById('command-palette-overlay');
      if (overlay.classList.contains('open')) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateDown();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateUp();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        }
      }
    });
  }
  
  attachEventListeners() {
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('command-input');
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    
    input.addEventListener('input', (e) => {
      this.filterCommands(e.target.value);
    });
  }
  
  renderCommands(filter = '') {
    const list = document.getElementById('command-list');
    
    if (this.filteredCommands.length === 0) {
      list.innerHTML = `
        <div class="command-empty">
          <i class="fas fa-search"></i>
          <p>No commands found</p>
        </div>
      `;
      return;
    }
    
    // Group by category
    const grouped = {};
    this.filteredCommands.forEach(cmd => {
      if (!grouped[cmd.category]) grouped[cmd.category] = [];
      grouped[cmd.category].push(cmd);
    });
    
    list.innerHTML = Object.entries(grouped).map(([category, commands]) => `
      <div class="command-category">
        <div class="category-label">${category}</div>
        ${commands.map((cmd, index) => `
          <div class="command-item ${index === this.selectedIndex ? 'selected' : ''}" 
               data-index="${this.filteredCommands.indexOf(cmd)}">
            <span class="command-icon">${cmd.icon}</span>
            <span class="command-name">${this.highlightMatch(cmd.name, filter)}</span>
            ${cmd.category === 'Links' ? '<i class="fas fa-external-link-alt command-external"></i>' : ''}
          </div>
        `).join('')}
      </div>
    `).join('');
    
    // Attach click handlers
    list.querySelectorAll('.command-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.executeCommand(parseInt(item.dataset.index));
      });
      
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = parseInt(item.dataset.index);
        this.updateSelection();
      });
    });
  }
  
  filterCommands(query) {
    query = query.toLowerCase().trim();
    
    if (!query) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query) ||
        cmd.category.toLowerCase().includes(query)
      );
    }
    
    this.selectedIndex = 0;
    this.renderCommands(query);
  }
  
  highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  navigateDown() {
    this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
    this.updateSelection();
  }
  
  navigateUp() {
    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    this.updateSelection();
  }
  
  updateSelection() {
    const items = document.querySelectorAll('.command-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });
    
    // Scroll into view
    items[this.selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  
  executeSelected() {
    this.executeCommand(this.selectedIndex);
  }
  
  executeCommand(index) {
    const cmd = this.filteredCommands[index];
    if (cmd) {
      cmd.action();
      this.close();
    }
  }
  
  toggle() {
    const overlay = document.getElementById('command-palette-overlay');
    
    if (overlay.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('command-input');
    
    overlay.classList.add('open');
    input.focus();
    input.value = '';
    this.filteredCommands = [...this.commands];
    this.selectedIndex = 0;
    this.renderCommands();
  }
  
  close() {
    const overlay = document.getElementById('command-palette-overlay');
    overlay.classList.remove('open');
  }
  
  scrollTo(selector) {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  }
  
  openChatbot() {
    if (window.chatbot) {
      window.chatbot.toggleChat();
    }
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  window.commandPalette = new CommandPalette();
});

// ========== Visitor Counter ==========
class VisitorCounter {
  constructor() {
    this.storageKey = 'ankit_portfolio_visits';
    this.sessionKey = 'ankit_session_' + new Date().toDateString();
    this.init();
  }
  
  init() {
    // Check if already counted today
    if (sessionStorage.getItem(this.sessionKey)) {
      this.displayCount();
      return;
    }
    
    this.incrementCount();
    sessionStorage.setItem(this.sessionKey, 'true');
    this.displayCount();
  }
  
  getCount() {
    return parseInt(localStorage.getItem(this.storageKey) || '0');
  }
  
  incrementCount() {
    const count = this.getCount() + 1;
    localStorage.setItem(this.storageKey, count.toString());
  }
  
  displayCount() {
    const count = this.getCount();
    const badge = document.createElement('div');
    badge.className = 'visitor-badge';
    badge.innerHTML = `
      <i class="fas fa-eye"></i>
      <span>
        <strong>${this.formatNumber(count)}</strong>
        <small>Visits</small>
      </span>
    `;
    document.body.appendChild(badge);
  }
  
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new VisitorCounter();
});

// ========== Context Menu ==========
class ContextMenu {
  constructor() {
    this.createMenu();
    this.attachListeners();
  }
  
  createMenu() {
    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.className = 'context-menu';
    
    const items = [
      { icon: '🏠', label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      { icon: '📧', label: 'Contact', action: () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) },
      { icon: '🌓', label: 'Toggle Theme', action: () => toggleTheme() },
      { icon: '💼', label: 'Projects', action: () => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }) },
      { icon: '💬', label: 'Chat', action: () => window.chatbot?.toggleChat() },
      { divider: true },
      { icon: '⌘', label: 'Commands', action: () => window.commandPalette?.open(), hint: 'Ctrl+K' }
    ];
    
    menu.innerHTML = items.map(item => {
      if (item.divider) return '<div class="context-divider"></div>';
      
      return `
        <div class="context-item" data-action="${item.label}">
          <span class="context-icon">${item.icon}</span>
          <span class="context-label">${item.label}</span>
          ${item.hint ? `<span class="context-hint">${item.hint}</span>` : ''}
        </div>
      `;
    }).join('');
    
    document.body.appendChild(menu);
    
    // Attach item clicks
    menu.querySelectorAll('.context-item').forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const actionItem = items.filter(i => !i.divider)[
          Array.from(menu.querySelectorAll('.context-item')).indexOf(item)
        ];
        actionItem.action();
        this.hide();
      });
    });
  }
  
  attachListeners() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.show(e.clientX, e.clientY);
    });
    
    document.addEventListener('click', () => this.hide());
    document.addEventListener('scroll', () => this.hide());
    
    window.addEventListener('resize', () => this.hide());
  }
  
  show(x, y) {
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    
    // Position menu
    const rect = menu.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 10;
    const maxY = window.innerHeight - rect.height - 10;
    
    menu.style.left = Math.min(x, maxX) + 'px';
    menu.style.top = Math.min(y, maxY) + 'px';
    
    setTimeout(() => menu.classList.add('open'), 10);
  }
  
  hide() {
    const menu = document.getElementById('context-menu');
    menu.classList.remove('open');
    setTimeout(() => menu.style.display = 'none', 200);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ContextMenu();
});

// ========== Keyboard Shortcuts Hint ==========
function showKeyboardHints() {
  const hints = document.createElement('div');
  hints.className = 'keyboard-hints';
  hints.innerHTML = `
    <div class="hint-title">⌨️ Keyboard Shortcuts</div>
    <div class="hint-item">
      <kbd>Ctrl</kbd> + <kbd>K</kbd>
      <span>Command Palette</span>
    </div>
    <div class="hint-item">
      <kbd>ESC</kbd>
      <span>Close overlays</span>
    </div>
    <div class="hint-item">
      <kbd>?</kbd>
      <span>Show this help</span>
    </div>
  `;
  
  document.body.appendChild(hints);
  
  setTimeout(() => hints.classList.add('show'), 100);
  
  setTimeout(() => {
    hints.classList.remove('show');
    setTimeout(() => hints.remove(), 300);
  }, 5000);
}

// Show hints on '?' key
document.addEventListener('keydown', (e) => {
  if (e.key === '?' && !e.target.matches('input, textarea')) {
    showKeyboardHints();
  }
});

// ========== Add Styles ==========
const featuresStyles = `
<style>
/* Command Palette */
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: none;
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.command-palette-overlay.open {
  display: flex;
  opacity: 1;
}

.command-palette {
  width: 600px;
  max-width: 90%;
  max-height: 70vh;
  background: var(--bg-card);
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid var(--primary-color);
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.command-search {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.command-search i {
  color: var(--primary-color);
  font-size: 18px;
}

#command-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
}

.command-hint {
  padding: 4px 8px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid var(--primary-color);
  border-radius: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

.command-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.command-category {
  margin-bottom: 10px;
}

.category-label {
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.command-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.command-item:hover,
.command-item.selected {
  background: rgba(0, 212, 255, 0.1);
  border-left-color: var(--primary-color);
}

.command-icon {
  font-size: 20px;
  width: 30px;
  text-align: center;
}

.command-name {
  flex: 1;
  color: var(--text-primary);
}

.command-name mark {
  background: var(--primary-color);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}

.command-external {
  font-size: 12px;
  color: var(--text-secondary);
}

.command-empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.command-empty i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.3;
}

.command-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.command-shortcuts {
  display: flex;
  gap: 20px;
  justify-content: center;
  font-size: 12px;
  color: var(--text-secondary);
}

.command-shortcuts kbd {
  padding: 3px 6px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid var(--primary-color);
  border-radius: 3px;
  font-size: 11px;
  margin: 0 2px;
}

/* Visitor Counter */
.visitor-badge {
  position: fixed;
  bottom: 100px;
  left: 30px;
  background: var(--bg-card);
  padding: 12px 20px;
  border-radius: 30px;
  border: 2px solid var(--primary-color);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 998;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  animation: slideInLeft 0.5s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.visitor-badge i {
  color: var(--primary-color);
  font-size: 20px;
}

.visitor-badge span {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.visitor-badge strong {
  font-size: 18px;
  color: var(--text-primary);
}

.visitor-badge small {
  font-size: 11px;
  color: var(--text-secondary);
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: var(--bg-card);
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  padding: 8px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 10001;
  display: none;
  min-width: 200px;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.2s ease;
}

.context-menu.open {
  opacity: 1;
  transform: scale(1);
}

.context-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.context-item:hover {
  background: rgba(0, 212, 255, 0.1);
}

.context-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.context-label {
  flex: 1;
  color: var(--text-primary);
  font-size: 14px;
}

.context-hint {
  font-size: 11px;
  color: var(--text-secondary);
  background: rgba(0, 212, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

.context-divider {
  height: 1px;
  background: rgba(0, 212, 255, 0.2);
  margin: 6px 0;
}

/* Keyboard Hints */
.keyboard-hints {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--bg-card);
  border: 2px solid var(--primary-color);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  opacity: 0;
  transition: all 0.3s ease;
}

.keyboard-hints.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.hint-title {
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--primary-color);
  font-size: 16px;
}

.hint-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 14px;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-item kbd {
  padding: 4px 8px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid var(--primary-color);
  border-radius: 5px;
  font-size: 12px;
  margin: 0 2px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .visitor-badge {
    left: 10px;
    bottom: 80px;
    padding: 10px 15px;
  }
  
  .visitor-badge strong {
    font-size: 16px;
  }
  
  .command-palette {
    max-height: 80vh;
  }
  
  .keyboard-hints {
    left: 10px;
    right: 10px;
    transform: translateY(20px);
    max-width: calc(100vw - 20px);
  }
  
  .keyboard-hints.show {
    transform: translateY(0);
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', featuresStyles);