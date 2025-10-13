/* ===== Typing animation (hero) ===== */
    (function typingAnim() {
      const texts = ["Ankit Kumar 👋", "AI Developer 🤺", "Python Coder 🐍"];
      let i = 0, j = 0, isDeleting = false;
      const el = document.querySelector('.typing');

      function type() {
        const full = texts[i];
        if (!isDeleting) {
          el.textContent = full.substring(0, j + 1);
          j++;
          if (j === full.length) {
            isDeleting = true;
            setTimeout(type, 1200);
            return;
          }
        } else {
          el.textContent = full.substring(0, j - 1);
          j--;
          if (j === 0) {
            isDeleting = false;
            i = (i + 1) % texts.length;
          }
        }
        setTimeout(type, isDeleting ? 80 : 140);
      }
      type();
    })();

/* ===== Scroll reveal animation ===== */