/**
 * 1explore 主页交互脚本
 * - 动态加载 AI实验室数据
 * - 导航 active 状态管理
 */

(async function () {
  // ---- 加载 AI实验室数据 ----
  async function loadLabs() {
    try {
      const res = await fetch('./labs.json');
      if (!res.ok) throw new Error('Failed to load labs.json');
      const data = await res.json();
      renderLabs(data.labs);
    } catch (err) {
      console.warn('AI实验室数据加载失败:', err);
      document.getElementById('labs-grid').innerHTML =
        '<p class="placeholder-text">实验室数据加载失败</p>';
    }
  }

  function renderLabs(labs) {
    const grid = document.getElementById('labs-grid');
    if (!labs || labs.length === 0) {
      grid.innerHTML = '<p class="placeholder-text">[ 暂无实验项目 ]</p>';
      return;
    }

    grid.innerHTML = labs.map(lab => `
      <a href="${lab.url}" target="_blank" class="lab-card" ${lab.url === '#' ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
        <div class="lab-card-title">${lab.title}</div>
        <div class="lab-card-desc">${lab.description}</div>
        <div class="lab-card-footer">
          <span class="lab-card-date">${lab.date}</span>
          <span class="lab-card-arrow">→</span>
        </div>
      </a>
    `).join('');
  }

  loadLabs();

  // ---- 导航 active 状态 ----
  const dots = document.querySelectorAll('.dot');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;

          // 侧边圆点
          dots.forEach(d => {
            d.classList.toggle('active', d.getAttribute('href') === `#${id}`);
          });

          // 导航栏链接
          navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach(section => observer.observe(section));
})();
