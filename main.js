/**
 * 1xplore 主页交互脚本 v2
 * - i18n 切换（ZH/EN，localStorage 记忆）
 * - 滚动揭示（IntersectionObserver）
 * - Hero 标题逐字出现
 * - 鼠标 spotlight 跟随
 * - Labs 数据动态加载
 * - 导航 active 状态联动
 */

(async function () {
  'use strict';

  /* ---------------- i18n 切换 ---------------- */
  function setupI18n() {
    const STORAGE_KEY = '1xplore-lang';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') {
      applyLang(stored, false);
    }

    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang-btn');
        applyLang(lang, true);
      });
    });

    function applyLang(lang, persist) {
      document.body.setAttribute('data-lang', lang);
      document.documentElement.setAttribute('data-lang', lang);
      document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
      document.querySelectorAll('[data-lang-btn]').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lang-btn') === lang);
      });
      if (persist) localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  /* ---------------- 滚动揭示 ---------------- */
  function setupReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach(t => observer.observe(t));
  }

  /* ---------------- Hero 标题逐字出现 ---------------- */
  function setupTypewriter() {
    // 等字体加载完成后再触发，避免抖动
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    const start = () => {
      // 选择当前语言的标题
      const lang = document.body.getAttribute('data-lang') || 'zh';
      const titleEl = lang === 'zh'
        ? document.getElementById('heroTitleZh')
        : document.getElementById('heroTitleEn');
      if (!titleEl) return;

      const chars = titleEl.querySelectorAll('.char');
      heroTitle.classList.add('is-typing');
      chars.forEach((ch, i) => {
        ch.style.transitionDelay = (i * 35) + 'ms';
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      setTimeout(start, 100);
    }
  }

  /* ---------------- Labs 动态加载 ---------------- */
  async function loadLabs() {
    const grid = document.getElementById('labs-grid');
    if (!grid) return;

    try {
      const res = await fetch('./labs.json');
      if (!res.ok) throw new Error('Failed to load labs.json');
      const data = await res.json();
      renderLabs(data.labs);
    } catch (err) {
      console.warn('实验室数据加载失败:', err);
      grid.innerHTML = '<p class="placeholder-text">实验室数据加载失败</p>';
    }
  }

  function renderLabs(labs) {
    const grid = document.getElementById('labs-grid');
    if (!labs || labs.length === 0) {
      grid.innerHTML = '<p class="placeholder-text">[ 暂无实验项目 ]</p>';
      return;
    }

    grid.innerHTML = labs.map(lab => `
      <a href="${lab.url}" target="_blank" rel="noopener" class="lab-card">
        <span class="lab-card-mark">shipped</span>
        <div class="lab-card-title">${lab.title}</div>
        <div class="lab-card-desc">${lab.description}</div>
        <div class="lab-card-footer">
          <span class="lab-card-date">${lab.date}</span>
          <span class="lab-card-arrow">→</span>
        </div>
      </a>
    `).join('');
  }

  /* ---------------- 导航 active 状态 ---------------- */
  function setupNavActive() {
    const dots = document.querySelectorAll('.dot');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            dots.forEach(d => {
              d.classList.toggle('active', d.getAttribute('href') === `#${id}`);
            });
            navLinks.forEach(a => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach(section => observer.observe(section));
  }

  /* ---------------- 启动 ---------------- */
  setupI18n();
  setupReveal();
  setupTypewriter();
  setupNavActive();
  loadLabs();
})();
