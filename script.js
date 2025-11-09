// ========== Typing Animation ==========
(function typingAnimation() {
  const texts = ["Ankit Kumar 👋", "AI Developer 🤖", "Python Coder 🐍", "ML Engineer 🧠"];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingElement = document.querySelector('.typing');
  
  if (!typingElement) return;

  function type() {
    const currentText = texts[textIndex];
    
    if (!isDeleting) {
      typingElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      
      if (charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(type, 1200); // Pause at end
        return;
      }
    } else {
      typingElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      
      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }
    }
    
    setTimeout(type, isDeleting ? 80 : 140);
  }
  
  type();
})();

// ========== Theme Toggle ==========
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector('.theme-toggle i');
  
  body.classList.toggle('light-mode');
  
  if (body.classList.contains('light-mode')) {
    themeIcon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'light');
  } else {
    themeIcon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'dark');
  }
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const themeIcon = document.querySelector('.theme-toggle i');
  
  if (savedTheme === 'light') {
    body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
  }
});

// ========== Mobile Menu Toggle ==========
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const hamburger = document.querySelector('.hamburger');
  
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
  
  // Prevent body scroll when menu is open
  if (navMenu.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

function closeMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const hamburger = document.querySelector('.hamburger');
  
  navMenu.classList.remove('active');
  hamburger.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const navMenu = document.querySelector('.nav-menu');
  const hamburger = document.querySelector('.hamburger');
  const navbar = document.querySelector('.navbar');
  
  if (navMenu.classList.contains('active') && 
      !navbar.contains(e.target)) {
    closeMobileMenu();
  }
});

// ========== Smooth Scroll with Offset ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const offsetTop = target.offsetTop - 70; // Navbar height offset
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      closeMobileMenu();
    }
  });
});

// ========== Scroll Reveal Animation ==========
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements with slide-up class
window.addEventListener('DOMContentLoaded', () => {
  const elementsToAnimate = document.querySelectorAll(
    '.slide-up, .project-card, .skill-card, .contact-card, .vision-card, .stat-card'
  );
  
  elementsToAnimate.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// ========== Back to Top Button ==========
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Show/hide back to top button
window.addEventListener('scroll', () => {
  const backToTopBtn = document.querySelector('.back-to-top');
  
  if (backToTopBtn) {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }
});

// ========== Navbar Background on Scroll ==========
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  
  if (window.scrollY > 50) {
    navbar.style.padding = '10px 5%';
    navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
  } else {
    navbar.style.padding = '15px 5%';
    navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  }
});

// ========== Project Cards Hover Effect ==========
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.borderColor = 'var(--primary-color)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.borderColor = 'transparent';
  });
});

// ========== Skill Cards Click Animation ==========
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('click', function() {
    this.style.animation = 'none';
    setTimeout(() => {
      this.style.animation = 'pulse 0.5s ease';
    }, 10);
  });
});

// ========== Contact Cards Click Effect ==========
document.querySelectorAll('.contact-card').forEach(card => {
  card.addEventListener('click', function(e) {
    // Create ripple effect
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripple.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: rgba(0, 212, 255, 0.5);
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// ========== Lazy Loading Images ==========
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ========== Form Validation (if you add contact form later) ==========
function validateForm(formElement) {
  const inputs = formElement.querySelectorAll('input, textarea');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'red';
      isValid = false;
    } else {
      input.style.borderColor = 'var(--primary-color)';
    }
  });
  
  return isValid;
}

// ========== Active Nav Link on Scroll ==========
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    
    if (window.pageYOffset >= sectionTop && 
        window.pageYOffset < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Add active link style
const navStyle = document.createElement('style');
navStyle.textContent = `
  .nav-menu a.active {
    color: var(--primary-color);
  }
  
  .nav-menu a.active::after {
    width: 100%;
  }
`;
document.head.appendChild(navStyle);

// ========== Console Message ==========
console.log('%c👋 Hi! Welcome to my portfolio!', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with ❤️ by Ankit Kumar', 'color: #f39c12; font-size: 14px;');
console.log('%cWant to collaborate? Reach out to me!', 'color: #e74c3c; font-size: 14px;');

// ========== Performance Monitoring ==========
window.addEventListener('load', () => {
  if ('performance' in window) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`%cPage Load Time: ${pageLoadTime}ms`, 'color: #00d4ff; font-weight: bold;');
  }
});

// ========== Easter Egg - Konami Code ==========
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);
  
  if (konamiCode.join('') === konamiSequence.join('')) {
    document.body.style.animation = 'rainbow 2s infinite';
    setTimeout(() => {
      document.body.style.animation = '';
      alert('🎉 You found the secret! Keep coding and building awesome stuff!');
    }, 2000);
  }
});

// Add rainbow animation
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
  @keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
`;
document.head.appendChild(rainbowStyle);