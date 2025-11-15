// ========== Service Worker Registration ==========
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered!'))
      .catch(err => console.log('Service Worker error:', err));
  });
}

// ========== Service Worker Code (save as sw.js) ==========
/*
const CACHE_NAME = 'ankit-portfolio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/Ankit1.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
*/

// ========== Lazy Loading Images ==========
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src]');
    this.observer = new IntersectionObserver(
      (entries) => this.onIntersection(entries),
      { rootMargin: '50px' }
    );
    
    this.images.forEach(img => this.observer.observe(img));
  }
  
  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        this.observer.unobserve(img);
        
        img.onload = () => {
          img.style.opacity = '1';
          img.style.filter = 'blur(0)';
        };
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => new LazyLoader());

// ========== Debounce Function for Performance ==========
function debounce(func, wait = 20) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========== Virtual Scrolling for Large Lists ==========
class VirtualScroll {
  constructor(container, items, itemHeight = 100) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.scrollTop = 0;
    
    this.viewport = document.createElement('div');
    this.viewport.style.cssText = `
      height: 100%;
      overflow-y: auto;
      position: relative;
    `;
    
    this.content = document.createElement('div');
    this.content.style.height = `${items.length * itemHeight}px`;
    
    this.itemsContainer = document.createElement('div');
    this.itemsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `;
    
    this.viewport.appendChild(this.content);
    this.content.appendChild(this.itemsContainer);
    this.container.appendChild(this.viewport);
    
    this.viewport.addEventListener('scroll', debounce(() => this.update(), 16));
    this.update();
  }
  
  update() {
    this.scrollTop = this.viewport.scrollTop;
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.viewport.clientHeight / this.itemHeight) + 1,
      this.items.length
    );
    
    this.itemsContainer.innerHTML = '';
    this.itemsContainer.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.style.height = `${this.itemHeight}px`;
      item.innerHTML = this.items[i];
      this.itemsContainer.appendChild(item);
    }
  }
}

// ========== Resource Hints ==========
function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
    { rel: 'preload', href: '/Ankit1.jpg', as: 'image' }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.keys(hint).forEach(key => link.setAttribute(key, hint[key]));
    document.head.appendChild(link);
  });
}

window.addEventListener('DOMContentLoaded', addResourceHints);

// ========== Critical CSS Inlining ==========
function inlineCriticalCSS() {
  const criticalCSS = `
    /* Add your above-the-fold CSS here */
    .hero { min-height: 100vh; }
    .navbar { position: fixed; top: 0; width: 100%; }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
}

// ========== Image Optimization ==========
class ImageOptimizer {
  constructor() {
    this.supportsWebP = false;
    this.supportsAvif = false;
    this.checkSupport();
  }
  
  async checkSupport() {
    this.supportsWebP = await this.canUseFormat('image/webp');
    this.supportsAvif = await this.canUseFormat('image/avif');
  }
  
  canUseFormat(format) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img.width === 1);
      img.onerror = () => resolve(false);
      img.src = `data:${format};base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=`;
    });
  }
  
  getOptimizedSrc(src) {
    if (!src) return src;
    
    const base = src.replace(/\.(jpg|jpeg|png)$/i, '');
    
    if (this.supportsAvif) return `${base}.avif`;
    if (this.supportsWebP) return `${base}.webp`;
    return src;
  }
}

const imageOptimizer = new ImageOptimizer();

// ========== Bundle Splitting & Code Splitting ==========
function loadModuleOnDemand(modulePath) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = modulePath;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Load heavy modules only when needed
document.querySelectorAll('[data-load-module]').forEach(trigger => {
  trigger.addEventListener('click', async () => {
    const module = trigger.dataset.loadModule;
    await loadModuleOnDemand(`/modules/${module}.js`);
  });
});

// ========== Request Idle Callback for Non-Critical Tasks ==========
function runWhenIdle(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

// Example: Load analytics only when idle
runWhenIdle(() => {
  // Load Google Analytics or other tracking scripts
  console.log('Non-critical scripts loaded');
});

// ========== Font Loading Strategy ==========
if ('fonts' in document) {
  Promise.all([
    document.fonts.load('400 1em Poppins'),
    document.fonts.load('600 1em Poppins'),
    document.fonts.load('700 1em Poppins')
  ]).then(() => {
    document.body.classList.add('fonts-loaded');
  });
}

// ========== Memory Management ==========
class MemoryManager {
  constructor() {
    this.observers = [];
    this.timers = [];
    this.listeners = [];
  }
  
  addObserver(observer) {
    this.observers.push(observer);
    return observer;
  }
  
  addTimer(timer) {
    this.timers.push(timer);
    return timer;
  }
  
  addListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }
  
  cleanup() {
    this.observers.forEach(obs => obs.disconnect());
    this.timers.forEach(timer => clearTimeout(timer));
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    
    this.observers = [];
    this.timers = [];
    this.listeners = [];
  }
}

const memoryManager = new MemoryManager();

// ========== Network Information API ==========
function adaptToNetworkSpeed() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    if (connection.effectiveType === '4g') {
      // Load high-quality images
      document.body.classList.add('high-quality');
    } else {
      // Load lower quality images
      document.body.classList.add('low-quality');
    }
    
    connection.addEventListener('change', () => {
      console.log('Network changed:', connection.effectiveType);
    });
  }
}

window.addEventListener('DOMContentLoaded', adaptToNetworkSpeed);

// ========== Intersection Observer for Animations ==========
const animationObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        animationObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  animationObserver.observe(el);
});

// ========== Performance Monitoring ==========
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  
  init() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('LCP:', this.metrics.lcp);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0];
        this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        console.log('FID:', this.metrics.fid);
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        console.log('CLS:', this.metrics.cls);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  report() {
    console.table(this.metrics);
    
    // Send to analytics
    if (window.gtag) {
      Object.keys(this.metrics).forEach(metric => {
        gtag('event', metric, {
          value: Math.round(this.metrics[metric]),
          metric_id: metric
        });
      });
    }
  }
}

const perfMonitor = new PerformanceMonitor();
window.addEventListener('load', () => {
  setTimeout(() => perfMonitor.report(), 5000);
});