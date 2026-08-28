// ========== Typing Animation ==========
(function typingAnimation() {
  const texts = ["Ankit Kumar", "AI Developer","ML Engineer"];
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
        setTimeout(type, 2000); // Pause at end
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
    
    setTimeout(type, isDeleting ? 50 : 100);
  }
  
  type();
})();


// Theme toggle removed for permanent dark futuristic mode

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

// Show/hide back to top button visibility is now handled by the Consolidated Scroll Handler.

// ========== Modern Cursor Trail ==========
if (window.innerWidth > 1024) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid #00f3ff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    cursorDot.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: #00f3ff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 10px #00f3ff;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursorDot);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Smooth follow for main cursor
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        // Faster follow for dot
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        
        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Add hover effects for interactive elements
    setTimeout(() => {
        const interactiveElements = document.querySelectorAll('a, button, .nav-link, .skill-card, .info-card, input, textarea');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '60px';
                cursor.style.height = '60px';
                cursor.style.borderColor = '#00d4ff';
                cursorDot.style.width = '12px';
                cursorDot.style.height = '12px';
                cursorDot.style.background = '#00d4ff';
                cursorDot.style.boxShadow = '0 0 15px #00d4ff';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.borderColor = '#00f3ff';
                cursorDot.style.width = '8px';
                cursorDot.style.height = '8px';
                cursorDot.style.background = '#00f3ff';
                cursorDot.style.boxShadow = '0 0 10px #00f3ff';
            });
        });
    }, 1000);
}



// ========== Consolidated High-Performance Scroll Handler ==========
(function initScrollHandler() {
  // Cache DOM elements to prevent expensive layout calculation on scroll
  const navbar = document.querySelector('.navbar');
  const backToTopBtn = document.querySelector('.back-to-top');
  const progressBar = document.querySelector('.scroll-progress-bar');
  let sections = [];
  let navLinks = [];

  // Update sections and links cache
  function updateDOMCache() {
    sections = document.querySelectorAll('section[id]');
    navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  }
  
  window.addEventListener('DOMContentLoaded', updateDOMCache);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    updateDOMCache();
  }

  let scrollScheduled = false;

  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // 1. Dynamic Navbar Styling
    if (navbar) {
      if (scrollY > 50) {
        navbar.style.padding = '10px 5%';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
      } else {
        navbar.style.padding = '15px 5%';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
      }
    }

    // 2. Back to Top Button Visibility
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }

    // 3. Scroll Progress Indicator Update
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = `${scrolled}%`;
    }

    // 4. Active Navigation Link on Scroll
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (navLinks.length > 0) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    scrollScheduled = false;
  }

  // Use passive listener and requestAnimationFrame for 60fps/120fps scrolling
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) {
      requestAnimationFrame(handleScroll);
      scrollScheduled = true;
    }
  }, { passive: true });
})();

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

// Active navigation link styling updates are now handled by the Consolidated Scroll Handler.

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

// Old Particle Background removed - Replaced by Three.js in 3d-scene.js

// ========== 3D Tilt Effect ==========
const cards = document.querySelectorAll('.project-card, .stat-card, .skill-card, .vision-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        // Maintain the normal hover translate Y we had in css
        setTimeout(() => {
            if(!card.matches(':hover')) card.style.transform = '';
        }, 300);
    });
});

// Scroll progress bar DOM updates are now handled by the Consolidated Scroll Handler.

// ===================================================
// CYBERPUNK SCI-FI INTERACTIVE MAP SYSTEM
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  initPortfolioMap();
});

function initPortfolioMap() {
  const mapElement = document.getElementById('portfolio-map');
  if (!mapElement || typeof L === 'undefined') return;

  // Ankit Kumar HQ Coordinates (Bihar Sharif, Nalanda / Patna Region, Bihar)
  const HQ_COORDS = [25.196759, 85.514895];
  const DEFAULT_ZOOM = 13;

  // Initialize Leaflet Map
  const map = L.map('portfolio-map', {
    center: HQ_COORDS,
    zoom: DEFAULT_ZOOM,
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: true
  });

  // Enable scroll zoom on map focus / click
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('click', () => map.scrollWheelZoom.enable());

  // Tile Layers Definitions
  const tileLayers = {
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    }),
    street: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19
    })
  };

  // Add Default Dark Layer
  let currentLayer = tileLayers.dark.addTo(map);

  // Custom Animated Radar Pin Icon
  const customRadarIcon = L.divIcon({
    className: 'custom-radar-marker-wrapper',
    html: `
      <div class="custom-radar-pin-container">
        <div class="radar-wave-ring wave-1"></div>
        <div class="radar-wave-ring wave-2"></div>
        <div class="radar-wave-ring wave-3"></div>
        <div class="marker-core-icon">
          <i class="fas fa-laptop-code"></i>
        </div>
        <div class="marker-floating-label">Ankit Kumar • AI Base</div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -32]
  });

  // Marker Popup Content
  const popupContent = `
    <div class="cyber-popup-card">
      <span class="popup-hud-tag"><i class="fas fa-satellite"></i> BASE HQ // ONLINE</span>
      <h3 class="popup-title">Ankit Kumar</h3>
      <p class="popup-loc"><i class="fas fa-map-pin" style="color:#00f3ff;"></i> Bihar Sharif / Patna, Bihar, India</p>
      <p class="popup-desc">Aspiring AI Developer & Coder specializing in Machine Learning, Deep Learning, and Autonomous AI Systems.</p>
      <div class="popup-stats-row">
        <div class="popup-mini-stat">
          <span>21+</span>
          <label>Projects</label>
        </div>
        <div class="popup-mini-stat">
          <span>Class 12</span>
          <label>Innovator</label>
        </div>
        <div class="popup-mini-stat">
          <span>AI / ML</span>
          <label>Focus</label>
        </div>
      </div>
      <div class="popup-cta-row">
        <a href="https://maps.app.goo.gl/WvnGAxx7Qu6cw9CK7" target="_blank" rel="noopener noreferrer" class="popup-cta-btn primary">
          <i class="fas fa-location-arrow"></i> Google Maps
        </a>
        <a href="#contact" class="popup-cta-btn secondary">
          <i class="fas fa-paper-plane"></i> Contact
        </a>
      </div>
    </div>
  `;

  // Add Marker to Map
  const hqMarker = L.marker(HQ_COORDS, { icon: customRadarIcon }).addTo(map);
  hqMarker.bindPopup(popupContent, { maxWidth: 300, minWidth: 260, className: 'cyber-leaflet-popup' });

  // Map View Mode Switcher
  const modeButtons = document.querySelectorAll('.map-mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (!tileLayers[mode]) return;

      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      map.removeLayer(currentLayer);
      currentLayer = tileLayers[mode].addTo(map);
      currentLayer.bringToBack();
    });
  });

  // Custom Floating Map Controls
  const recenterBtn = document.getElementById('btn-map-recenter');
  if (recenterBtn) {
    recenterBtn.addEventListener('click', () => {
      map.flyTo(HQ_COORDS, DEFAULT_ZOOM, {
        duration: 1.2,
        easeLinearity: 0.25
      });
      hqMarker.openPopup();
    });
  }

  const zoomInBtn = document.getElementById('btn-map-zoom-in');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => map.zoomIn());
  }

  const zoomOutBtn = document.getElementById('btn-map-zoom-out');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
  }

  // Fullscreen Toggle
  const fullscreenBtn = document.getElementById('btn-map-fullscreen');
  const mapSection = document.getElementById('portfolio-map-section');
  if (fullscreenBtn && mapSection) {
    fullscreenBtn.addEventListener('click', () => {
      mapSection.classList.toggle('map-fullscreen-active');
      const isFullscreen = mapSection.classList.contains('map-fullscreen-active');
      fullscreenBtn.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
      fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen';
      
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    });

    // Close fullscreen on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mapSection.classList.contains('map-fullscreen-active')) {
        mapSection.classList.remove('map-fullscreen-active');
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        setTimeout(() => map.invalidateSize(), 300);
      }
    });
  }

  // Stat Card "View on Map" Button Smooth Scroll & Focus
  const statMapBtn = document.getElementById('stat-view-map-btn');
  if (statMapBtn) {
    statMapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        map.flyTo(HQ_COORDS, 14, { duration: 1.2 });
        hqMarker.openPopup();
      }, 600);
    });
  }

  // Copy GPS Coordinates with Animated Toast
  const copyCoordsBtn = document.getElementById('btn-copy-coords');
  const mapToast = document.getElementById('map-toast');
  if (copyCoordsBtn) {
    copyCoordsBtn.addEventListener('click', () => {
      const coordsText = '25.196759, 85.514895';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(coordsText).then(showToast);
      } else {
        // Fallback for clipboard
        const input = document.createElement('input');
        input.value = coordsText;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast();
      }
    });
  }

  function showToast() {
    if (!mapToast) return;
    mapToast.classList.add('show');
    setTimeout(() => {
      mapToast.classList.remove('show');
    }, 2500);
  }

  // Live IST Clock Updater
  const liveClockEl = document.getElementById('map-live-clock');
  function updateLiveClock() {
    if (!liveClockEl) return;
    const now = new Date();
    const istOptions = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeString = new Intl.DateTimeFormat('en-US', istOptions).format(now);
    liveClockEl.textContent = `Patna (IST) ${timeString}`;
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // ==========================================
  // Interactive Distance Calculator Feature
  // ==========================================
  const calcDistanceBtn = document.getElementById('btn-calc-distance');
  const distanceDisplay = document.getElementById('distance-info-display');
  const distanceText = document.getElementById('distance-text');
  const clearDistanceBtn = document.getElementById('btn-clear-distance');

  let userMarker = null;
  let flightPathLine = null;
  let clickListenerActive = false;

  // Haversine Distance Formula in KM
  function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function drawDistancePath(userLat, userLng, locationLabel = 'Your Location') {
    const distKm = calculateHaversineDistance(userLat, userLng, HQ_COORDS[0], HQ_COORDS[1]);
    const distMiles = (distKm * 0.621371).toFixed(0);
    const distKmFormatted = Math.round(distKm).toLocaleString();

    // Remove existing user marker and path line
    if (userMarker) map.removeLayer(userMarker);
    if (flightPathLine) map.removeLayer(flightPathLine);

    // Custom User Pin Icon
    const userPinIcon = L.divIcon({
      className: 'custom-user-marker-wrapper',
      html: `
        <div class="user-radar-pin">
          <div class="user-core-icon">
            <i class="fas fa-user-astronaut"></i>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    userMarker = L.marker([userLat, userLng], { icon: userPinIcon }).addTo(map);
    userMarker.bindPopup(`<strong>${locationLabel}</strong><br>~${distKmFormatted} km to Base HQ`).openPopup();

    // Draw glowing curved / dashed flight line
    flightPathLine = L.polyline([[userLat, userLng], HQ_COORDS], {
      color: '#00f3ff',
      weight: 3,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    // Fit map bounds to show both points
    const bounds = L.latLngBounds([[userLat, userLng], HQ_COORDS]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });

    // Show distance banner
    if (distanceDisplay && distanceText) {
      distanceText.innerHTML = `<strong>${distKmFormatted} km</strong> (${distMiles} miles) away from Base HQ`;
      distanceDisplay.style.display = 'flex';
    }
  }

  function clearDistanceMeasurement() {
    if (userMarker) {
      map.removeLayer(userMarker);
      userMarker = null;
    }
    if (flightPathLine) {
      map.removeLayer(flightPathLine);
      flightPathLine = null;
    }
    if (distanceDisplay) {
      distanceDisplay.style.display = 'none';
    }
    map.flyTo(HQ_COORDS, DEFAULT_ZOOM, { duration: 1 });
  }

  if (clearDistanceBtn) {
    clearDistanceBtn.addEventListener('click', clearDistanceMeasurement);
  }

  if (calcDistanceBtn) {
    calcDistanceBtn.addEventListener('click', () => {
      if (distanceDisplay && distanceText) {
        distanceText.textContent = 'Locating your position...';
        distanceDisplay.style.display = 'flex';
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            drawDistancePath(latitude, longitude, 'You Are Here');
          },
          (err) => {
            // If user denies geolocation, enable click anywhere on map mode
            if (distanceText) {
              distanceText.innerHTML = '📍 Geolocation locked. <em>Click anywhere on the map</em> to measure distance!';
            }
            if (!clickListenerActive) {
              clickListenerActive = true;
              map.once('click', (e) => {
                clickListenerActive = false;
                drawDistancePath(e.latlng.lat, e.latlng.lng, 'Selected Location');
              });
            }
          },
          { timeout: 8000, maximumAge: 60000 }
        );
      } else {
        if (distanceText) {
          distanceText.innerHTML = '<em>Click anywhere on the map</em> to calculate distance!';
        }
        map.once('click', (e) => {
          drawDistancePath(e.latlng.lat, e.latlng.lng, 'Selected Location');
        });
      }
    });
  }

  // Handle Resize and Window Size Changes
  window.addEventListener('resize', () => {
    map.invalidateSize();
  });
}

