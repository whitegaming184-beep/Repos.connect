/* ═══════════════════════════════════════════════════════
   RESPOS-CONNECT · JavaScript Application Logic
   Wave Canvas · AI Assistant · Animations · Nav
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ──────────────── 1. WAVE CANVAS ANIMATION ──────────────── */
(function initWave() {
  const canvas = document.getElementById('waveCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, frame = 0;
  const DOT_SPACING = 28;
  const DOT_R       = 1.2;
  const WAVE_LAYERS = [
    { amp: 28, freq: 0.018, speed: 0.35, opacity: 0.28 },
    { amp: 18, freq: 0.024, speed: 0.55, opacity: 0.18 },
    { amp: 12, freq: 0.032, speed: 0.7,  opacity: 0.12 },
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    WAVE_LAYERS.forEach(layer => {
      const t = frame * layer.speed * 0.01;
      ctx.fillStyle = `rgba(130,130,130,${layer.opacity})`;

      for (let y = 0; y < H + DOT_SPACING; y += DOT_SPACING) {
        for (let x = 0; x < W + DOT_SPACING; x += DOT_SPACING) {
          const offsetY = Math.sin(x * layer.freq + t) * layer.amp
                        + Math.sin(y * layer.freq * 0.7 + t * 1.2) * (layer.amp * 0.5);
          const ry = y + offsetY;

          // Fade at edges
          const edgeDist = Math.min(x, W - x, ry, H - ry);
          const alpha    = Math.min(1, edgeDist / 120);
          if (alpha <= 0) continue;

          ctx.globalAlpha = layer.opacity * alpha;
          ctx.beginPath();
          ctx.arc(x, ry, DOT_R, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    ctx.globalAlpha = 1;
    frame++;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();


/* ──────────────── 2. NAVBAR SCROLL ──────────────── */
(function initNavbar() {
  const nav = document.querySelector('.navbar');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ──────────────── 3. MOBILE MENU ──────────────── */
(function initMobileMenu() {
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open.toString());
    menu.setAttribute('aria-hidden', (!open).toString());
  });

  // Close on link click
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });
})();


/* ──────────────── 4. CARD SCROLL ANIMATION (AOS) ──────────────── */
(function initAOS() {
  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-aos]').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const cards = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings within same grid
        const siblings = entry.target.parentElement.querySelectorAll('[data-aos]');
        const idx = Array.from(siblings).indexOf(entry.target);
        const delay = Math.min(idx % 6, 5) * 60;

        setTimeout(() => {
          entry.target.classList.add('visible');
          entry.target.style.transition = `opacity 0.55s cubic-bezier(0.23,1,0.32,1) ${delay}ms, transform 0.55s cubic-bezier(0.23,1,0.32,1) ${delay}ms, box-shadow 0.28s ease, border-color 0.28s ease, background 0.28s ease`;
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  cards.forEach(card => observer.observe(card));
})();


/* ──────────────── 5. BACK TO TOP ──────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ──────────────── 6. 3D CUBE – MOUSE PARALLAX ──────────────── */
(function initCubeParallax() {
  const cube = document.getElementById('cube3d');
  if (!cube) return;

  let baseX = 0, baseY = 0;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let animId;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientY - cy) / cy * 22;
    targetY = (e.clientX - cx) / cx * 22;
  }, { passive: true });

  function animateParallax() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    const t = Date.now() * 0.001;
    baseX = t * 26;   // auto spin Y
    baseY = t * 16;   // auto spin X
    cube.style.transform = `rotateX(${baseY + currentX}deg) rotateY(${baseX + currentY}deg) rotateZ(${t * 6}deg)`;
    animId = requestAnimationFrame(animateParallax);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animateParallax();
  }
})();


/* ──────────────── 7. AI ASSISTANT ──────────────── */
(function initAssistant() {
  const toggleBtn  = document.getElementById('assistantToggle');
  const panel      = document.getElementById('assistantPanel');
  const closeBtn   = document.getElementById('panelClose');
  const factText   = document.getElementById('factText');
  const factCounter= document.getElementById('factCounter');
  const factDots   = document.getElementById('factDots');
  const prevBtn    = document.getElementById('prevFact');
  const nextBtn    = document.getElementById('nextFact');

  if (!toggleBtn || !panel) return;

  const FACTS = [
    "Did you know? The term \"Artificial Intelligence\" was coined by John McCarthy in 1956 at the Dartmouth Conference — considered the birth of AI as a field.",
    "The GPT in ChatGPT stands for Generative Pre-trained Transformer. The transformer architecture was introduced by Google in the 2017 paper \"Attention is All You Need.\"",
    "AlphaGo became the first AI to defeat a world champion Go player in 2016. Go has more possible positions than there are atoms in the observable universe!",
    "Large Language Models like GPT-4 are trained on trillions of words of text — equivalent to reading every book in the US Library of Congress roughly 4,000 times.",
    "The Turing Test, proposed by Alan Turing in 1950, evaluates whether a machine can exhibit intelligent behaviour indistinguishable from that of a human.",
    "Neural networks are inspired by the human brain. A modern LLM can have hundreds of billions of parameters — far more connections than a single human brain has neurons.",
    "AI is now used to fold proteins — a problem that stumped scientists for 50 years. DeepMind's AlphaFold predicted structures for over 200 million proteins in 2022.",
    "The first chatbot, ELIZA, was created in 1966 at MIT. It mimicked a psychotherapist and fooled many users into thinking they were talking to a human.",
    "Retrieval-Augmented Generation (RAG) is a technique where LLMs fetch external documents before answering, dramatically reducing hallucinations and improving accuracy.",
    "GitHub Copilot, powered by OpenAI Codex, generates roughly 46% of developer code on average — meaning nearly half of new code is now AI-assisted!",
    "Moore's Law states transistor counts double every 2 years. AI training compute has been doubling every 6 months — far outpacing Moore's Law since 2012.",
    "Vector databases like Pinecone, Weaviate, and Chroma store data as mathematical embeddings, enabling AI to find semantically similar content in milliseconds.",
  ];

  let current  = 0;
  let autoTimer = null;
  let isOpen   = false;

  // Build dots
  FACTS.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'fact-dot';
    dot.setAttribute('aria-label', `Go to fact ${i + 1}`);
    dot.setAttribute('role', 'listitem');
    dot.addEventListener('click', () => goTo(i));
    factDots.appendChild(dot);
  });

  function updateUI() {
    // Fade transition
    factText.style.opacity = '0';
    setTimeout(() => {
      factText.textContent = FACTS[current];
      factCounter.textContent = `${current + 1} / ${FACTS.length}`;
      factCounter.setAttribute('aria-label', `Fact ${current + 1} of ${FACTS.length}`);
      factText.style.opacity = '1';
    }, 180);

    // Dots
    document.querySelectorAll('.fact-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(idx) {
    current = (idx + FACTS.length) % FACTS.length;
    updateUI();
    resetAutoTimer();
  }

  function resetAutoTimer() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (isOpen) goTo(current + 1);
    }, 8000);
  }

  function openPanel() {
    isOpen = true;
    panel.hidden = false;
    panel.removeAttribute('hidden');
    toggleBtn.setAttribute('aria-expanded', 'true');
    updateUI();
    resetAutoTimer();
    // Focus the close button for accessibility
    setTimeout(() => closeBtn.focus(), 100);
  }

  function closePanel() {
    isOpen = false;
    panel.hidden = true;
    panel.setAttribute('hidden', '');
    toggleBtn.setAttribute('aria-expanded', 'false');
    if (autoTimer) clearInterval(autoTimer);
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    if (isOpen) closePanel(); else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard: close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // Auto-open after 3 seconds to greet user
  setTimeout(() => {
    if (!isOpen) openPanel();
  }, 3000);

  // Initialise dots
  updateUI();
})();


/* ──────────────── 8. SMOOTH ANCHOR SCROLLING WITH OFFSET ──────────────── */
(function initSmoothScroll() {
  const NAV_H = 80;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
      window.scrollTo({ top, behavior: 'smooth' });
      // Focus management for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();


/* ──────────────── 9. CARD TILT EFFECT (desktop) ──────────────── */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.repo-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX  = y * 8;
      const tiltY  = -x * 8;
      card.style.transform = `translateY(-6px) scale(1.015) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ──────────────── 10. ACTIVE NAV LINK ON SCROLL ──────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('.category-section');
  const navLinks  = document.querySelectorAll('.nav-link');
  const NAV_H     = 100;

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= NAV_H) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color    = href === current ? 'var(--gold)' : '';
      link.style.background = href === current ? 'rgba(212,175,55,0.08)' : '';
    });
  }, { passive: true });
})();
