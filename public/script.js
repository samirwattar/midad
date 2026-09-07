// ===== ميداد — frontend logic =====

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

const COVER_STYLES = ['cv-1','cv-2','cv-3','cv-4','cv-5','cv-6','cv-7','cv-8'];

function coverStyleFor(id) {
  return COVER_STYLES[id % COVER_STYLES.length];
}

function relativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'اليوم';
  if (days === 1) return 'منذ يوم';
  if (days === 2) return 'منذ يومين';
  if (days < 7) return `منذ ${days} أيام`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'منذ أسبوع';
  return `منذ ${weeks} أسابيع`;
}

function statusLabel(status) {
  return status === 'completed' ? 'مكتمل' : 'مستمر';
}
function typeLabel(type) {
  return type === 'translated' ? 'مترجمة' : 'مؤلفة';
}

/* =========================================================================
   Icons — the site had `data-icon="..."` markers everywhere but nothing
   ever turned them into visible icons. This renders them as inline SVGs.
   Call renderIcons() again any time new data-icon elements are added to
   the DOM after the initial page load (dynamic nav, cards, etc.).
   ========================================================================= */
const ICONS = {
  quill: '<path d="M12 20 21 3M3 21c3-1 6-2 9-6M6 15c2-4 4-9 9-13"/>',
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
  book: '<path d="M4 4h9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4Z"/><path d="M20 4h-9a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20Z"/>',
  flame: '<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-1 .5-2 1-3 .3 1 1 1.5 1 1.5C8 7 12 5 12 2Z"/>',
  tag: '<path d="M20 12 12 20l-9-9V4h7l10 8Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 8.2a3 3 0 1 1 3.8 2.9"/><path d="M21.5 20c0-2.6-1.7-4.7-4-5.6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6.5 8-6.5s8 2.5 8 6.5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m5 5 14 14M19 5 5 19"/>',
  discord: '<path d="M8 5.5c-2.5.7-4 2-4 2s-2 4-2 9c0 0 1.7 2 4.5 2.2l.7-1.4"/><path d="M16 5.5c2.5.7 4 2 4 2s2 4 2 9c0 0-1.7 2-4.5 2.2l-.7-1.4"/><ellipse cx="9" cy="13.5" rx="1.3" ry="1.6"/><ellipse cx="15" cy="13.5" rx="1.3" ry="1.6"/>',
  share: '<circle cx="18" cy="5" r="2.3"/><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="19" r="2.3"/><path d="m8.1 10.8 7.8-4.1M8.1 13.2l7.8 4.1"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h13l-3 4 3 4H5"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  crown: '<path d="M3 8l4 4 5-6 5 6 4-4-2 10H5L3 8Z"/>',
  eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>',
  star: '<path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6Z"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z"/>',
  check: '<path d="m5 13 4 4 10-10"/>',
  heart: '<path d="M12 20s-7-4.4-9.5-8.7C.7 8 2.4 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.6 0 5.3 3.5 3.5 6.8C19 15.6 12 20 12 20Z"/>',
  shield: '<path d="M12 3 5 5.5V11c0 5 3 8.5 7 10 4-1.5 7-5 7-10V5.5Z"/><path d="m9 12 2 2 4-4.5"/>',
  comment: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H10l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6.5 8 6 8-6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
};

function renderIcons(root = document) {
  root.querySelectorAll('i[data-icon]').forEach(el => {
    const name = el.getAttribute('data-icon');
    const path = ICONS[name];
    if (!path) return;
    el.innerHTML = `<svg class="icon" viewBox="0 0 24 24">${path}</svg>`;
  });
}

/* =========================================================================
   Theme toggle (dark/light) — persisted in localStorage
   ========================================================================= */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon) icon.setAttribute('data-icon', theme === 'light' ? 'sun' : 'moon');
  });
  renderIcons();
}

function initThemeToggle() {
  const saved = localStorage.getItem('midad-theme') || 'dark';
  applyTheme(saved);

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      localStorage.setItem('midad-theme', next);
      applyTheme(next);
    });
  });
}


/* =========================================================================
   Chapter reader (chapter.html)
   ========================================================================= */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function paragraphize(content) {
  return content
    .split(/\n{2,}/)
    .map(p => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

async function loadChapter() {
  const root = document.getElementById('reader-root');
  if (!root) return; // not on the chapter page

  const params = new URLSearchParams(window.location.search);
  const novelId = params.get('novel');
  const chNum = params.get('ch');

  if (!novelId || !chNum) {
    setText('reader-chapter-title', 'لم يتم تحديد الفصل');
    return;
  }

  try {
    const res = await fetch(`/api/novels/${novelId}/chapters/${chNum}`);
    if (!res.ok) throw new Error('Not found');
    const chapter = await res.json();

    document.title = `${chapter.title || 'الفصل ' + chapter.chapter_number} — ${chapter.novel_title} — ميداد`;
    setText('reader-novel-title', chapter.novel_title);
    setText('reader-chapter-title', chapter.title || `الفصل ${chapter.chapter_number}`);

    const novelLink = document.getElementById('reader-novel-link');
    if (novelLink) novelLink.href = `novel.html?id=${chapter.novel_id}`;

    const contentEl = document.getElementById('reader-content');
    if (contentEl) contentEl.innerHTML = paragraphize(chapter.content || '');

    const prevBtn = document.getElementById('reader-prev');
    const nextBtn = document.getElementById('reader-next');
    if (prevBtn) {
      if (chapter.prev_chapter) {
        prevBtn.href = `chapter.html?novel=${chapter.novel_id}&ch=${chapter.prev_chapter}`;
        prevBtn.removeAttribute('disabled');
      } else {
        prevBtn.removeAttribute('href');
        prevBtn.setAttribute('disabled', 'true');
      }
    }
    if (nextBtn) {
      if (chapter.next_chapter) {
        nextBtn.href = `chapter.html?novel=${chapter.novel_id}&ch=${chapter.next_chapter}`;
        nextBtn.removeAttribute('disabled');
      } else {
        nextBtn.removeAttribute('href');
        nextBtn.setAttribute('disabled', 'true');
      }
    }

    window.scrollTo(0, 0);
  } catch (err) {
    console.error('Failed to load chapter:', err);
    setText('reader-chapter-title', 'تعذّر تحميل هذا الفصل');
  }
}



let currentUser = null; // { id, username, role } or null

// role hierarchy: user < author < admin < co-owner < owner.
// anyone in ADMIN_ROLES gets the admin dashboard link and can publish
// without needing the 'author' role.
const ADMIN_ROLES = ['admin', 'co-owner', 'owner'];
function isAdminRole(role) { return ADMIN_ROLES.includes(role); }

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    currentUser = res.ok ? await res.json() : null;
  } catch {
    currentUser = null;
  }
  renderAuthNav();
  guardPublishPage();
  return currentUser;
}

function renderAuthNav() {
  const authArea = document.getElementById('nav-auth-area');
  const publishBtn = document.getElementById('nav-publish-btn');
  const publishBtnMobile = document.getElementById('nav-publish-btn-mobile');
  const canPublish = currentUser && (currentUser.role === 'author' || isAdminRole(currentUser.role));

  if (publishBtn) publishBtn.style.display = canPublish ? '' : 'none';
  if (publishBtnMobile) publishBtnMobile.style.display = canPublish ? '' : 'none';

  if (!authArea) return;
  if (currentUser) {
    const navAvatarHtml = currentUser.avatar
      ? `<img src="/${currentUser.avatar}" alt="${currentUser.username}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`
      : `<i data-icon="user"></i>`;

    const adminLinkHtml = isAdminRole(currentUser.role)
      ? `<a href="admin.html" class="icon-btn" aria-label="لوحة الإدارة" title="لوحة الإدارة"><i data-icon="flag"></i></a>`
      : '';
    authArea.innerHTML = `${adminLinkHtml}<a href="profile.html" class="icon-btn" aria-label="الملف الشخصي">${navAvatarHtml}</a>`;
    } else {
    authArea.innerHTML = `<a class="icon-btn" href="login.html" aria-label="تسجيل الدخول"><i data-icon="user"></i></a>`;
    }
  renderIcons(authArea);
  }

// only lets authors/admins see the publish form; everyone else gets the login prompt
  function guardPublishPage() {
    const form = document.getElementById('publish-form');
    const guard = document.getElementById('publish-guard');
    if (!form || !guard) return; // not on the publish page

  const canPublish = currentUser && (currentUser.role === 'author' || isAdminRole(currentUser.role));
    form.style.display = canPublish ? '' : 'none';
    guard.style.display = canPublish ? 'none' : '';
}

/* =========================================================================
   Login / register pages — validation UI, password toggle, submit handling
   ========================================================================= */
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.getAttribute('data-toggle-for'));
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.setAttribute('aria-label', showing ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور');
    });
  });
}

function setFieldError(fieldId, message) {
  const row = document.getElementById(`row-${fieldId}`);
  const err = document.getElementById(`err-${fieldId}`);
  if (row) row.classList.add('has-error');
  if (err) { err.textContent = message; err.classList.add('show'); }
}

function clearFieldErrors(form) {
  form.querySelectorAll('.form-row.has-error').forEach(row => row.classList.remove('has-error'));
  form.querySelectorAll('.field-error.show').forEach(err => { err.classList.remove('show'); err.textContent = ''; });
}

function setFormAlert(alertId, message) {
  const box = document.getElementById(alertId);
  if (!box) return;
  box.textContent = message;
  box.classList.add('show');
}

function clearFormAlert(alertId) {
  const box = document.getElementById(alertId);
  if (!box) return;
  box.classList.remove('show');
  box.textContent = '';
}

function setButtonLoading(btn, loadingText) {
  btn.dataset.originalText = btn.textContent;
  btn.textContent = loadingText;
  btn.classList.add('is-loading');
  btn.disabled = true;
}

function resetButtonLoading(btn) {
  btn.textContent = btn.dataset.originalText || btn.textContent;
  btn.classList.remove('is-loading');
  btn.disabled = false;
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    clearFormAlert('login-alert');

    const username = document.getElementById('l-username').value.trim();
    const password = document.getElementById('l-password').value;

    let hasError = false;
    if (!username) { setFieldError('username', 'أدخل اسم المستخدم أو البريد الإلكتروني'); hasError = true; }
    if (!password) { setFieldError('password', 'أدخل كلمة المرور'); hasError = true; }
    if (hasError) return;

    const submitBtn = document.getElementById('login-submit');
    setButtonLoading(submitBtn, 'جارٍ الدخول...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
      window.location.href = 'index.html';
    } catch (err) {
      setFormAlert('login-alert', err.message);
      resetButtonLoading(submitBtn);
    }
  });
}

function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    clearFormAlert('register-alert');

    const username = document.getElementById('r-username').value.trim();
    const email = document.getElementById('r-email').value.trim();
    const password = document.getElementById('r-password').value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasError = false;
    if (!username) { setFieldError('username', 'أدخل اسم المستخدم'); hasError = true; }
    if (!email) { setFieldError('email', 'أدخل البريد الإلكتروني'); hasError = true; }
    else if (!emailPattern.test(email)) { setFieldError('email', 'صيغة البريد الإلكتروني غير صحيحة'); hasError = true; }
    if (!password) { setFieldError('password', 'أدخل كلمة المرور'); hasError = true; }
    else if (password.length < 6) { setFieldError('password', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'); hasError = true; }
    if (hasError) return;

    const submitBtn = document.getElementById('register-submit');
    setButtonLoading(submitBtn, 'جارٍ إنشاء الحساب...');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');
      window.location.href = 'index.html';
    } catch (err) {
      setFormAlert('register-alert', err.message);
      resetButtonLoading(submitBtn);
    }
  });
}

/* =========================================================================
   Homepage — hero cards (most viewed novels)
   ========================================================================= */
function formatViews(n) {
  n = Number(n) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function buildHeroCard(novel, index) {
  const badgeHtml = index === 0
    ? `<span class="badge badge-gold">الأكثر مشاهدة <i data-icon="crown"></i></span>`
    : `<span class="badge badge-rose">رائج <i data-icon="sparkle"></i></span>`;
  const tagsHtml = (novel.categories || [])
    .slice(0, 2)
    .map(c => `<span class="tag">${c}</span>`)
    .join('');

  return `
    <a class="hero-card" href="novel.html?id=${novel.id}">
      ${buildCoverHtml(novel)}
      <div class="hero-card-top">
        ${badgeHtml}
        <span class="badge badge-dark"><i data-icon="eye"></i> ${formatViews(novel.views)}</span>
      </div>
      <div class="hero-card-body">
        <div class="eng">${novel.title_en || ''}</div>
        <h3 style="font-size:1.35rem">${novel.title}</h3>
        <div class="hero-card-tags">${tagsHtml}</div>
      </div>
    </a>`;
}

async function loadHero() {
  const heroGrid = document.querySelector('.hero-grid');
  if (!heroGrid) return;

  try {
    const res = await fetch('/api/novels?sort=views&limit=3');
    if (!res.ok) throw new Error('Request failed');
    const novels = await res.json();

    if (!novels.length) {
      heroGrid.innerHTML = `<p style="color:var(--paper-mute)">لا توجد روايات لعرضها بعد.</p>`;
      return;
    }

    heroGrid.innerHTML = novels.map(buildHeroCard).join('');
    renderIcons(heroGrid);
  } catch (err) {
    console.error('Failed to load hero novels:', err);
    heroGrid.innerHTML = `<p style="color:var(--paper-mute)">تعذّر تحميل الروايات المميزة.</p>`;
  }
}

/* =========================================================================
   Homepage — trending strip (top-viewed novels)
   ========================================================================= */
function buildTrendCard(novel, index) {
  return `
    <div class="trend-card">
      <a class="trend-cover" href="novel.html?id=${novel.id}">
        <span class="trend-rank">${index + 1}</span>
        ${buildCoverHtml(novel)}
      </a>
      <div class="trend-title">${novel.title}<span class="eng">${novel.title_en || ''}</span></div>
    </div>`;
}

async function loadTrending() {
  const grid = document.querySelector('.trending-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/novels?sort=views&limit=6');
    if (!res.ok) throw new Error('Request failed');
    const novels = await res.json();

    if (!novels.length) {
      grid.innerHTML = `<p style="color:var(--paper-mute)">لا توجد روايات رائجة بعد.</p>`;
      return;
    }

    grid.innerHTML = novels.map(buildTrendCard).join('');
    renderIcons(grid);
  } catch (err) {
    console.error('Failed to load trending novels:', err);
    grid.innerHTML = `<p style="color:var(--paper-mute)">تعذّر تحميل الروايات الرائجة.</p>`;
  }
}

/* =========================================================================
   Homepage — novel list (release-grid)
   ========================================================================= */
function buildChapterRow(chapter, isFirst) {
  if (isFirst) {
    return `
      <div class="chapter-row">
        <span class="chapter-name"><i data-icon="flame" class="flame"></i>الفصل ${chapter.chapter_number}</span>
        <span class="chapter-time">جديد</span>
      </div>`;
  }
  return `
    <div class="chapter-row">
      <span class="chapter-name">الفصل ${chapter.chapter_number}</span>
      <span class="chapter-time locked"><i data-icon="lock"></i>${relativeTime(chapter.created_at)}</span>
    </div>`;
}

function buildCoverHtml(novel) {
  if (novel.cover_image) {
    return `<img class="cover-art cover-art-img" src="/${novel.cover_image}" alt="${novel.title}">`;
  }
  const word = novel.title.split(' ')[0] || novel.title;
  return `<div class="cover-art ${coverStyleFor(novel.id)}"><span class="cover-word">${word}</span></div>`;
}

function buildReleaseCardInner(novel) {
  const rating = Number(novel.rating) > 0 ? Number(novel.rating).toFixed(1) : '—';
  const statusDotClass = novel.status === 'completed' ? 'status-dot done' : 'status-dot';

  const chaptersHtml = novel.chapters && novel.chapters.length
    ? novel.chapters.map((ch, i) => buildChapterRow(ch, i === 0)).join('')
    : `<div class="chapter-row"><span class="chapter-name" style="color:var(--paper-mute)">لا توجد فصول بعد</span></div>`;

  const typeText = typeLabel(novel.type);

  return `
    <div class="release-cover">
      ${buildCoverHtml(novel)}
      <span class="badge badge-rose">${typeText}</span>
    </div>
    <div class="release-info">
      <div class="release-title">${novel.title}</div>
      <div class="release-meta">
        <span class="release-status"><span class="${statusDotClass}"></span>${statusLabel(novel.status)}</span>
        <span class="release-rating"><i data-icon="star"></i> ${rating}</span>
      </div>
      <div class="chapter-list">${chaptersHtml}</div>
    </div>`;
}

function buildNovelCard(novel) {
  return `<a class="release-card" href="novel.html?id=${novel.id}">${buildReleaseCardInner(novel)}</a>`;
}

function reviewStatusBadge(novel) {
  if (novel.review_status === 'pending') {
    return `<span class="badge badge-gold">قيد المراجعة</span>`;
  }
  if (novel.review_status === 'rejected') {
    return `<span class="badge badge-danger">مرفوضة${novel.review_note ? ' — ' + novel.review_note : ''}</span>`;
  }
  return '';
}

function buildMyNovelCard(novel) {
  return `
    <div class="release-card release-card-owned">
      <a class="release-card-link" href="novel.html?id=${novel.id}">${buildReleaseCardInner(novel)}</a>
      <div class="release-card-actions">
        ${reviewStatusBadge(novel)}
        <a class="btn btn-ghost btn-sm" href="edit-novel.html?id=${novel.id}"><i data-icon="quill"></i> تعديل</a>
        <button type="button" class="btn btn-ghost btn-sm btn-danger-text" data-delete-novel="${novel.id}">
          <i data-icon="close"></i> حذف
        </button>
      </div>
    </div>`;
}

async function loadNovels() {
  const grid = document.getElementById('novels-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/novels');
    if (!res.ok) throw new Error('Request failed');
    const novels = await res.json();

    if (!novels.length) {
      grid.innerHTML = `<p style="color:var(--paper-mute)">لا توجد روايات منشورة بعد.</p>`;
      return;
    }

    grid.innerHTML = novels.map(buildNovelCard).join('');
    renderIcons(grid);
  } catch (err) {
    console.error('Failed to load novels:', err);
    grid.innerHTML = `<p style="color:var(--paper-mute)">تعذّر تحميل الروايات. حاول لاحقًا.</p>`;
  }
}

/* =========================================================================
   Novel detail page (novel.html)
   ========================================================================= */
function buildChapterFullRow(chapter, index, novelId) {
  const lockHtml = chapter.is_premium
    ? `<span class="lock"><i data-icon="lock"></i>مدفوع</span>`
    : '';
  return `
    <a class="chapter-full-row" href="chapter.html?novel=${novelId}&ch=${chapter.chapter_number}">
      <div class="chapter-full-left">
        <span class="ch-num">${index + 1}</span>
        <span class="ch-title">${chapter.title || 'الفصل ' + chapter.chapter_number}</span>
      </div>
      <div class="chapter-full-right">
        ${lockHtml}
        <span>${relativeTime(chapter.created_at)}</span>
      </div>
    </a>`;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function loadNovelDetail() {
  const titleEl = document.getElementById('nv-title');
  if (!titleEl) return; // not on the novel page

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    setText('nv-title', 'لم يتم تحديد رواية');
    return;
  }

  try {
    const res = await fetch(`/api/novels/${id}`);
    if (!res.ok) throw new Error('Not found');
    const novel = await res.json();

    document.title = `${novel.title} — ميداد`;
    setText('nv-crumb-title', novel.title);
    setText('nv-title', novel.title);
    setText('nv-eng', novel.title_en || '');
    setText('nv-author', novel.author);
    setText('nv-badge', typeLabel(novel.type));
    setText('nv-synopsis', novel.synopsis || '');
    setText('nv-stat-chapters', novel.chapters.length);
    setText('nv-stat-views', novel.views ?? 0);
    setText('nv-stat-followers', 0);
    setText('nv-stat-rating', Number(novel.rating) > 0 ? Number(novel.rating).toFixed(1) : '—');
    setText('nv-status-pill', statusLabel(novel.status));

    const cover = document.getElementById('nv-cover');
    if (cover) {
      cover.innerHTML = buildCoverHtml(novel);
    }

    const tagsEl = document.getElementById('nv-tags');
    if (tagsEl) {
      tagsEl.innerHTML = (novel.categories && novel.categories.length)
        ? novel.categories.map(c => `<a class="tag" href="novels.html?category=${encodeURIComponent(c)}">${c}</a>`).join('')
        : '';
    }

    const chaptersEl = document.getElementById('nv-chapters');
    if (chaptersEl) {
      chaptersEl.innerHTML = novel.chapters.length
        ? novel.chapters.map((ch, i) => buildChapterFullRow(ch, i, novel.id)).join('')
        : `<p style="padding:18px;color:var(--paper-mute)">لا توجد فصول بعد.</p>`;
      renderIcons(chaptersEl);
    }

    // simple chapter search filter
    const searchInput = document.getElementById('nv-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        document.querySelectorAll('#nv-chapters .chapter-full-row').forEach(row => {
          const num = row.getAttribute('data-chapter-number');
          row.style.display = !q || num.includes(q) ? '' : 'none';
        });
      });
    }

    initLibraryButton(novel);
    initFollowButton(novel);
    initRatingWidget(novel);
  } catch (err) {
    console.error('Failed to load novel:', err);
    setText('nv-title', 'تعذّر تحميل بيانات الرواية');
  }
}

/* =========================================================================
   Add to library (novel.html)
   ========================================================================= */
function initLibraryButton(novel) {
  const btn = document.getElementById('nv-library-btn');
  if (!btn) return;
  let inLibrary = !!novel.in_library;

  const render = () => {
    btn.innerHTML = inLibrary
      ? `<i data-icon="check"></i> في مكتبتك`
      : `<i data-icon="heart"></i> أضف للمكتبة`;
    btn.classList.toggle('btn-active', inLibrary);
    renderIcons(btn);
  };
  render();

  btn.addEventListener('click', async () => {
    if (!currentUser) { window.location.href = 'login.html'; return; }
    btn.disabled = true;
    try {
      const res = await fetch(`/api/library/${novel.id}`, {
        method: inLibrary ? 'DELETE' : 'POST',
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'فشل الإجراء');
      inLibrary = data.in_library;
      render();
      showToast('تم', inLibrary ? 'أُضيفت الرواية إلى مكتبتك' : 'أُزيلت الرواية من مكتبتك');
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

/* =========================================================================
   Follow author (novel.html)
   ========================================================================= */
function initFollowButton(novel) {
  const btn = document.getElementById('nv-follow-btn');
  if (!btn) return;
  let following = !!novel.following_author;
  let followerCount = Number(novel.followers_count) || 0;

  const render = () => {
    btn.innerHTML = following
      ? `<i data-icon="check"></i> متابَع`
      : `<i data-icon="bell"></i> تابع الكاتب`;
    btn.classList.toggle('btn-active', following);
    setText('nv-stat-followers', followerCount);
    renderIcons(btn);
  };
  render();

  btn.addEventListener('click', async () => {
    if (!currentUser) { window.location.href = 'login.html'; return; }
    btn.disabled = true;
    try {
      const res = await fetch(`/api/follow/${novel.author_id}`, {
        method: following ? 'DELETE' : 'POST',
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'فشل الإجراء');
      following = data.following;
      followerCount += following ? 1 : -1;
      render();
      showToast('تم', following ? 'أنت الآن تتابع هذا الكاتب' : 'ألغيت متابعة الكاتب');
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

/* =========================================================================
   Rating widget (novel.html)
   ========================================================================= */
function initRatingWidget(novel) {
  const starsEl = document.getElementById('nv-rating-stars');
  const countEl = document.getElementById('nv-rating-count');
  if (!starsEl) return;

  let userRating = novel.user_rating || 0;
  let average = Number(novel.rating) || 0;
  let count = Number(novel.rating_count) || 0;

  const paint = (hoverValue) => {
    const value = hoverValue || userRating;
    starsEl.querySelectorAll('.star-btn').forEach(btn => {
      const v = Number(btn.getAttribute('data-value'));
      btn.classList.toggle('filled', v <= value);
    });
  };
  const paintCount = () => {
    countEl.textContent = count > 0
      ? `${average.toFixed(1)} من ${count} تقييم`
      : 'لا توجد تقييمات بعد — كن أول من يقيّم';
  };
  paint();
  paintCount();

  starsEl.querySelectorAll('.star-btn').forEach(btn => {
    const value = Number(btn.getAttribute('data-value'));
    btn.addEventListener('mouseenter', () => paint(value));
    btn.addEventListener('mouseleave', () => paint());
    btn.addEventListener('click', async () => {
      if (!currentUser) { window.location.href = 'login.html'; return; }
      starsEl.querySelectorAll('.star-btn').forEach(b => b.disabled = true);
      try {
        const res = await fetch(`/api/novels/${novel.id}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rating: value })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'فشل إرسال التقييم');
        userRating = value;
        average = Number(data.average);
        count = data.rating_count;
        paint();
        paintCount();
        setText('nv-stat-rating', average.toFixed(1));
        showToast('تم', 'شكرًا لتقييمك!');
      } catch (err) {
        alert(err.message);
      } finally {
        starsEl.querySelectorAll('.star-btn').forEach(b => b.disabled = false);
      }
    });
  });
}

/* =========================================================================
   Publish page (publish.html)
   ========================================================================= */
function initChipSelect() {
  const chips = document.querySelectorAll('.chip-select button');
  if (!chips.length) return;

  chips.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = document.querySelectorAll('.chip-select button.selected');
      if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
      } else if (selected.length < 3) {
        btn.classList.add('selected');
      }
    });
  });
}

let selectedCoverFile = null;

function initCoverDropzone(existingCoverPath) {
  const dropzone = document.getElementById('cover-dropzone');
  if (!dropzone) return;

  function wireFileInput() {
    const inp = dropzone.querySelector('input[type="file"]');
    if (inp) inp.addEventListener('change', (e) => handleFile(e.target.files[0]));
  }

  function showPreview(src, label, isExisting) {
    dropzone.innerHTML = `
      <img src="${src}" alt="معاينة الغلاف" style="max-height:160px;border-radius:8px;object-fit:cover">
      <span>${label}</span>
      <button type="button" id="cover-remove" class="btn btn-ghost" style="margin-top:8px">${isExisting ? 'تغيير الصورة' : 'إزالة الصورة'}</button>
      <input type="file" accept="image/*" style="display:none">`;
    wireFileInput();
    document.getElementById('cover-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      if (isExisting) {
        dropzone.querySelector('input[type="file"]').click();
      } else {
        resetDropzone();
      }
    });
    renderIcons(dropzone);
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة (PNG أو JPG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يتجاوز 5 ميغابايت.');
      return;
    }
    selectedCoverFile = file;
    const reader = new FileReader();
    reader.onload = () => showPreview(reader.result, file.name, false);
    reader.readAsDataURL(file);
  }

  function resetDropzone() {
    selectedCoverFile = null;
    dropzone.innerHTML = `
      <i data-icon="upload"></i>
      <b>اسحب صورة الغلاف هنا أو اضغط للاختيار</b>
      <span>PNG أو JPG — بحجم لا يتجاوز 5 ميغابايت</span>
      <input type="file" accept="image/*">`;
    wireFileInput();
    renderIcons(dropzone);
  }

  dropzone.addEventListener('click', (e) => {
    // avoid double-opening the picker when the click already landed on the input
    if (e.target.tagName !== 'INPUT' && e.target.id !== 'cover-remove') {
      const currentInput = dropzone.querySelector('input[type="file"]');
      currentInput && currentInput.click();
    }
  });

  ['dragover', 'dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  dropzone.addEventListener('dragover', () => dropzone.classList.add('dragover'));
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    dropzone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
  });

  if (existingCoverPath) {
    showPreview(`/${existingCoverPath}`, 'الغلاف الحالي', true);
  } else {
    wireFileInput();
  }
}

function showToast(title, message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('strong').textContent = title;
  toast.querySelector('span').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function initPublishForm() {
  const form = document.getElementById('publish-form');
  if (!form) return;

  initChipSelect();
  initCoverDropzone();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('f-title').value.trim();
    const titleEn = document.getElementById('f-title-en').value.trim();
    const synopsis = document.getElementById('f-synopsis').value.trim();
    const firstChapter = document.getElementById('f-chapter').value.trim();
    
    const status = form.querySelector('input[name="status"]:checked')?.value || 'ongoing';
    
    const type = form.querySelector('input[name="type"]:checked')?.value || 'translated';
    
    const categories = Array.from(document.querySelectorAll('.chip-select button.selected')).map(b => b.textContent.trim());
    const agree = document.getElementById('f-agree').checked;

    if (!title || !synopsis || !firstChapter) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة.');
      return;
    }
    if (!agree) {
      alert('يجب الموافقة على شروط النشر أولاً.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'جارٍ الإرسال...';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('title_en', titleEn);
    formData.append('synopsis', synopsis);
    formData.append('status', status);
    formData.append('type', type); 
    formData.append('categories', JSON.stringify(categories));
    formData.append('firstChapter', firstChapter);
    if (selectedCoverFile) formData.append('cover', selectedCoverFile);

    try {
      const res = await fetch('/api/novels', {
        method: 'POST',
        credentials: 'include', 
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `فشل الطلب (${res.status})`);

      showToast('تم', 'تم إرسال روايتك، وهي الآن قيد المراجعة من الإدارة');
      setTimeout(() => { window.location.href = 'profile.html'; }, 1500);
    } catch (err) {
      console.error('Publish failed:', err);
      alert(err.message || 'حدث خطأ أثناء النشر. حاول مرة أخرى.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });
}

/* =========================================================================
   Edit novel page (edit-novel.html)
   ========================================================================= */
async function initEditForm() {
  const form = document.getElementById('edit-form');
  if (!form) return;

  if (!currentUser) await checkAuth();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const novelId = new URLSearchParams(window.location.search).get('id');
  const guard = document.getElementById('edit-guard');

  if (!novelId) {
    form.style.display = 'none';
    if (guard) { guard.style.display = ''; guard.querySelector('p').textContent = 'لم يتم تحديد رواية.'; }
    return;
  }

  let novel;
  try {
    const res = await fetch(`/api/profile/novels/${novelId}`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذّر تحميل بيانات الرواية.');
    novel = data;
  } catch (err) {
    form.style.display = 'none';
    if (guard) { guard.style.display = ''; guard.querySelector('p').textContent = err.message; }
    return;
  }

  document.getElementById('e-title').value = novel.title || '';
  document.getElementById('e-title-en').value = novel.title_en || '';
  document.getElementById('e-synopsis').value = novel.synopsis || '';
  const statusRadio = form.querySelector(`input[name="status"][value="${novel.status}"]`);
  if (statusRadio) statusRadio.checked = true;
  const typeRadio = form.querySelector(`input[name="type"][value="${novel.type}"]`);
  if (typeRadio) typeRadio.checked = true;

  initChipSelect();
  (novel.categories || []).forEach(cat => {
    document.querySelectorAll('.chip-select button').forEach(btn => {
      if (btn.textContent.trim() === cat) btn.classList.add('selected');
    });
  });

  initCoverDropzone(novel.cover_image);

  const deleteBtn = document.getElementById('edit-delete-btn');
  if (deleteBtn) deleteBtn.setAttribute('data-delete-novel', novelId);

  const manageChaptersLink = document.getElementById('edit-manage-chapters-link');
  if (manageChaptersLink) manageChaptersLink.href = `manage-chapters.html?novel=${novelId}`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('e-title').value.trim();
    const titleEn = document.getElementById('e-title-en').value.trim();
    const synopsis = document.getElementById('e-synopsis').value.trim();
    const status = form.querySelector('input[name="status"]:checked')?.value || 'ongoing';
    const type = form.querySelector('input[name="type"]:checked')?.value || novel.type;
    const categories = Array.from(document.querySelectorAll('.chip-select button.selected')).map(b => b.textContent.trim());

    if (!title || !synopsis) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'جارٍ الحفظ...';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('title_en', titleEn);
    formData.append('synopsis', synopsis);
    formData.append('status', status);
    formData.append('type', type);
    formData.append('categories', JSON.stringify(categories));
    if (selectedCoverFile) formData.append('cover', selectedCoverFile);

    try {
      const res = await fetch(`/api/novels/${novelId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `فشل الحفظ (${res.status})`);

      showToast('تم', 'تم حفظ التغييرات بنجاح');
      setTimeout(() => { window.location.href = `novel.html?id=${novelId}`; }, 1200);
    } catch (err) {
      alert(err.message || 'حدث خطأ أثناء الحفظ.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
    }
  });
}

/* =========================================================================
   Profile page (profile.html)
   ========================================================================= */
const ROLE_LABELS = { user: 'قارئ', author: 'كاتب', admin: 'مشرف', 'co-owner': 'شريك المالك', owner: 'المالك' };

function buildAvatarHtml(user) {
  if (user && user.avatar) {
    return `<img src="/${user.avatar}" alt="${user.username}">`;
  }
  const letter = user && user.username ? user.username.charAt(0).toUpperCase() : '؟';
  return letter;
}

let selectedAvatarFile = null;

async function initProfilePage() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  if (!currentUser) await checkAuth();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('profile-avatar').innerHTML = buildAvatarHtml(currentUser);
  document.getElementById('profile-username-display').textContent = currentUser.username;
  document.getElementById('profile-role-display').textContent = ROLE_LABELS[currentUser.role] || currentUser.role;
  document.getElementById('p-username').value = currentUser.username;
  document.getElementById('p-avatar-preview').innerHTML = buildAvatarHtml(currentUser);

  const avatarBtn = document.getElementById('p-avatar-btn');
  const avatarInput = document.getElementById('p-avatar-input');
  avatarBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('الرجاء اختيار ملف صورة.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('حجم الصورة يتجاوز 5 ميغابايت.'); return; }
    selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('p-avatar-preview').innerHTML = `<img src="${reader.result}">`;
    };
    reader.readAsDataURL(file);
  }); 

  document.getElementById('profile-logout-btn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = 'index.html';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('p-username').value.trim();
    if (!username) { alert('اسم المستخدم مطلوب.'); return; }

    const saveBtn = document.getElementById('profile-save-btn');
    const original = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.textContent = 'جارٍ الحفظ...';

    const formData = new FormData();
    formData.append('username', username);
    if (selectedAvatarFile) formData.append('avatar', selectedAvatarFile);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'فشل حفظ التغييرات');

      currentUser = data;
      document.getElementById('profile-username-display').textContent = currentUser.username;
      document.getElementById('profile-avatar').innerHTML = buildAvatarHtml(currentUser);
      renderAuthNav();
      showToast('تم', 'تم حفظ التغييرات بنجاح');
    } catch (err) {
      alert(err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = original;
      renderIcons(form);
    }
  });

  loadMyNovels();
  loadMyLibrary();
}

async function loadMyNovels() {
  const grid = document.getElementById('my-novels-grid');
  if (!grid) return;
  try {
    const res = await fetch('/api/profile/novels', { credentials: 'include' });
    if (!res.ok) throw new Error('Request failed');
    const novels = await res.json();
    if (!novels.length) {
      grid.innerHTML = `<p style="color:var(--paper-mute)">لم تنشر أي رواية بعد. <a href="publish.html">انشر روايتك الأولى</a></p>`;
      return;
    }
    grid.innerHTML = novels.map(buildMyNovelCard).join('');
    renderIcons(grid);
  } catch (err) {
    console.error('Failed to load my novels:', err);
    grid.innerHTML = `<p style="color:var(--paper-mute)">تعذّر تحميل رواياتك.</p>`;
  }
}

async function loadMyLibrary() {
  const grid = document.getElementById('my-library-grid');
  if (!grid) return;
  try {
    const res = await fetch('/api/profile/library', { credentials: 'include' });
    if (!res.ok) throw new Error('Request failed');
    const novels = await res.json();
    grid.innerHTML = novels.length
      ? novels.map(buildNovelCard).join('')
      : `<p style="color:var(--paper-mute)">لم تُضِف أي رواية إلى مكتبتك بعد. <a href="index.html#latest">تصفّح الروايات</a></p>`;
    renderIcons(grid);
  } catch (err) {
    console.error('Failed to load library:', err);
    grid.innerHTML = `<p style="color:var(--paper-mute)">تعذّر تحميل مكتبتك.</p>`;
  }
}

// event delegation: catches delete clicks on any [data-delete-novel] button,
// even ones added dynamically after this listener is attached
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-delete-novel]');
  if (!btn) return;
  e.preventDefault();

  if (!confirm('هل أنت متأكد من حذف هذه الرواية؟ لا يمكن التراجع عن هذا الإجراء.')) return;

  const id = btn.getAttribute('data-delete-novel');
  btn.disabled = true;
  try {
    const res = await fetch(`/api/novels/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `فشل الحذف (${res.status})`);
    if (document.getElementById('my-novels-grid')) {
      loadMyNovels();
    } else if (document.getElementById('admin-novels-list')) {
      loadAdminNovels();
    } else {
      window.location.href = 'profile.html';
    }
  } catch (err) {
    alert(err.message || 'حدث خطأ أثناء الحذف.');
    btn.disabled = false;
  }
});

/* =========================================================================
   Manage chapters (manage-chapters.html)
   ========================================================================= */
function getNovelIdFromQuery() {
  return new URLSearchParams(window.location.search).get('novel');
}

function buildChapterManageRow(chapter, novelId) {
  const lockHtml = chapter.is_premium
    ? `<span class="lock"><i data-icon="lock"></i>مدفوع</span>`
    : '';
  return `
    <div class="chapter-full-row">
      <div class="chapter-full-left">
        <span class="ch-num">${chapter.chapter_number}</span>
        <span class="ch-title">${chapter.title || 'الفصل ' + chapter.chapter_number}</span>
      </div>
      <div class="chapter-full-right">
        ${lockHtml}
        <a class="btn btn-ghost btn-sm" href="chapter.html?novel=${novelId}&ch=${chapter.chapter_number}" target="_blank">قراءة</a>
        <button type="button" class="btn btn-ghost btn-sm" data-toggle-edit-chapter="${chapter.chapter_number}">تعديل</button>
        <button type="button" class="btn btn-ghost btn-sm btn-danger-text" data-delete-chapter="${novelId}:${chapter.chapter_number}">حذف</button>
      </div>
    </div>
    <div class="chapter-edit-panel" id="chapter-edit-panel-${chapter.chapter_number}" style="display:none"></div>`;
}

function buildChapterEditForm(novelId, chapterNumber) {
  return `
    <form class="chapter-edit-form">
      <div class="form-row">
        <label>عنوان الفصل</label>
        <input type="text" class="edit-title">
      </div>
      <div class="form-row">
        <label>نص الفصل</label>
        <textarea class="edit-content" required></textarea>
      </div>
      <div class="form-row agree-row">
        <input type="checkbox" class="edit-premium" id="edit-premium-${chapterNumber}">
        <label for="edit-premium-${chapterNumber}">فصل مدفوع</label>
      </div>
      <div class="chapter-edit-actions">
        <button type="submit" class="btn btn-primary btn-sm"><i data-icon="check"></i> حفظ</button>
        <button type="button" class="btn btn-ghost btn-sm btn-danger-text" data-delete-chapter="${novelId}:${chapterNumber}">حذف الفصل</button>
      </div>
    </form>`;
}

function renderChaptersList(chapters, novelId) {
  const listEl = document.getElementById('chapters-list');
  if (!listEl) return;
  if (!chapters.length) {
    listEl.innerHTML = `<p style="padding:18px;color:var(--paper-mute)">لا توجد فصول بعد.</p>`;
    return;
  }
  listEl.innerHTML = chapters.map(ch => buildChapterManageRow(ch, novelId)).join('');
  renderIcons(listEl);
}

async function reloadChaptersList() {
  const listEl = document.getElementById('chapters-list');
  const novelId = getNovelIdFromQuery();
  if (!listEl || !novelId) return;
  try {
    const res = await fetch(`/api/profile/novels/${novelId}`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    renderChaptersList(data.chapters || [], novelId);
  } catch {
    listEl.innerHTML = `<p style="padding:18px;color:var(--paper-mute)">تعذّر تحميل الفصول.</p>`;
  }
}

async function initManageChapters() {
  const listEl = document.getElementById('chapters-list');
  if (!listEl) return;

  if (!currentUser) await checkAuth();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const novelId = getNovelIdFromQuery();
  const guard = document.getElementById('chapters-guard');
  const body = document.getElementById('chapters-page-body');

  if (!novelId) {
    body.style.display = 'none';
    guard.style.display = '';
    guard.querySelector('p').textContent = 'لم يتم تحديد رواية.';
    return;
  }

  try {
    const res = await fetch(`/api/profile/novels/${novelId}`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذّر تحميل بيانات الرواية.');
    setText('chapters-novel-title', `فصول: ${data.title}`);
    renderChaptersList(data.chapters || [], novelId);
  } catch (err) {
    body.style.display = 'none';
    guard.style.display = '';
    guard.querySelector('p').textContent = err.message;
    return;
  }

  const addForm = document.getElementById('add-chapter-form');
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('c-title').value.trim();
    const content = document.getElementById('c-content').value.trim();
    const isPremium = document.getElementById('c-premium').checked;

    if (!content) {
      alert('الرجاء كتابة نص الفصل.');
      return;
    }

    const submitBtn = addForm.querySelector('button[type="submit"]');
    const originalHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'جارٍ النشر...';

    try {
      const res = await fetch(`/api/novels/${novelId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, is_premium: isPremium })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `فشل النشر (${res.status})`);

      showToast('تم', 'تم نشر الفصل بنجاح');
      addForm.reset();
      await reloadChaptersList();
    } catch (err) {
      alert(err.message || 'حدث خطأ أثناء نشر الفصل.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
      renderIcons(addForm);
    }
  });
}

// toggles a chapter's inline edit panel open/closed, lazily fetching its content
document.addEventListener('click', async (e) => {
  const toggleBtn = e.target.closest('[data-toggle-edit-chapter]');
  if (!toggleBtn) return;

  const chNum = toggleBtn.getAttribute('data-toggle-edit-chapter');
  const novelId = getNovelIdFromQuery();
  const panel = document.getElementById(`chapter-edit-panel-${chNum}`);
  if (!panel || !novelId) return;

  const isHidden = panel.style.display === 'none' || !panel.style.display;
  if (!isHidden) { panel.style.display = 'none'; return; }
  panel.style.display = '';
  if (panel.dataset.loaded) return;

  panel.innerHTML = `<p style="color:var(--paper-mute)">جارٍ التحميل...</p>`;
  try {
    const res = await fetch(`/api/novels/${novelId}/chapters/${chNum}`);
    const chapter = await res.json();
    if (!res.ok) throw new Error(chapter.error || 'تعذّر تحميل الفصل.');

    panel.innerHTML = buildChapterEditForm(novelId, chNum);
    panel.querySelector('.edit-title').value = chapter.title || '';
    panel.querySelector('.edit-content').value = chapter.content || '';
    panel.querySelector('.edit-premium').checked = !!chapter.is_premium;
    panel.dataset.loaded = 'true';
    renderIcons(panel);
  } catch (err) {
    panel.innerHTML = `<p style="color:#f28086">${err.message}</p>`;
  }
});

// saves an open chapter-edit panel's form
document.addEventListener('submit', async (e) => {
  const form = e.target.closest('.chapter-edit-form');
  if (!form) return;
  e.preventDefault();

  const panel = form.closest('.chapter-edit-panel');
  const chNum = panel ? panel.id.replace('chapter-edit-panel-', '') : null;
  const novelId = getNovelIdFromQuery();
  if (!chNum || !novelId) return;

  const title = form.querySelector('.edit-title').value.trim();
  const content = form.querySelector('.edit-content').value.trim();
  const isPremium = form.querySelector('.edit-premium').checked;

  if (!content) {
    alert('الرجاء كتابة نص الفصل.');
    return;
  }

  const saveBtn = form.querySelector('button[type="submit"]');
  const originalHtml = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.textContent = 'جارٍ الحفظ...';

  try {
    const res = await fetch(`/api/novels/${novelId}/chapters/${chNum}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, content, is_premium: isPremium })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `فشل الحفظ (${res.status})`);

    showToast('تم', 'تم حفظ الفصل بنجاح');
    await reloadChaptersList();
  } catch (err) {
    alert(err.message || 'حدث خطأ أثناء الحفظ.');
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalHtml;
    renderIcons(form);
  }
});

// deletes a chapter (works from either the manage-chapters row button or its edit panel)
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-delete-chapter]');
  if (!btn) return;
  e.preventDefault();

  if (!confirm('هل أنت متأكد من حذف هذا الفصل؟ لا يمكن التراجع عن هذا الإجراء.')) return;

  const [novelId, chNum] = btn.getAttribute('data-delete-chapter').split(':');
  btn.disabled = true;
  try {
    const res = await fetch(`/api/novels/${novelId}/chapters/${chNum}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `فشل الحذف (${res.status})`);
    await reloadChaptersList();
  } catch (err) {
    alert(err.message || 'حدث خطأ أثناء الحذف.');
    btn.disabled = false;
  }
});


/* =========================================================================
   Admin dashboard (admin.html)
   ========================================================================= */
function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  if (!tabs.length) return;
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
      const panel = document.getElementById(btn.getAttribute('data-admin-panel'));
      if (panel) panel.style.display = '';
    });
  });
}

function buildAdminReviewRow(novel) {
  const cover = buildCoverHtml(novel);
  const searchKey = `${novel.title} ${novel.title_en || ''} ${novel.author}`.toLowerCase();
  return `
    <div class="chapter-full-row" style="align-items:flex-start" data-search="${searchKey}">
      <div class="chapter-full-left" style="align-items:flex-start;gap:14px">
        <div style="width:56px;height:76px;border-radius:8px;overflow:hidden;flex-shrink:0">${cover}</div>
        <div>
          <span class="ch-title">${novel.title}</span>
          <div style="color:var(--paper-mute);font-size:.82rem;margin-top:4px">
            بقلم ${novel.author} · ${typeLabel(novel.type)} · ${statusLabel(novel.status)}
          </div>
          <div style="color:var(--paper-mute);font-size:.82rem;margin-top:6px;max-width:60ch">${novel.synopsis || ''}</div>
        </div>
      </div>
      <div class="chapter-full-right">
        <a class="btn btn-ghost btn-sm" href="novel.html?id=${novel.id}" target="_blank">معاينة</a>
        <button type="button" class="btn btn-primary btn-sm" data-approve-novel="${novel.id}"><i data-icon="check"></i> قبول</button>
        <button type="button" class="btn btn-ghost btn-sm btn-danger-text" data-reject-novel="${novel.id}">رفض</button>
      </div>
    </div>`;
}

// filters an admin list's rows by the text in a search input, matching
// the `data-search` attribute set on each row when it was built
function wireAdminSearch(inputId, listId, emptyMessage) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const rows = list.querySelectorAll('[data-search]');
    let visibleCount = 0;
    rows.forEach(row => {
      const match = !q || row.getAttribute('data-search').includes(q);
      row.style.display = match ? '' : 'none';
      if (match) visibleCount += 1;
    });
    let emptyEl = list.querySelector('.admin-search-empty');
    if (rows.length && visibleCount === 0) {
      if (!emptyEl) {
        emptyEl = document.createElement('p');
        emptyEl.className = 'admin-search-empty';
        emptyEl.style.cssText = 'padding:18px;color:var(--paper-mute)';
        list.appendChild(emptyEl);
      }
      emptyEl.textContent = emptyMessage || 'لا توجد نتائج مطابقة.';
    } else if (emptyEl) {
      emptyEl.remove();
    }
  });
}

async function loadAdminPending() {
  const listEl = document.getElementById('admin-pending-list');
  if (!listEl) return;
  listEl.innerHTML = `<p style="color:var(--paper-mute)">جارٍ التحميل...</p>`;
  try {
    const res = await fetch('/api/admin/novels?status=pending', { credentials: 'include' });
    const novels = await res.json();
    if (!res.ok) throw new Error(novels.error || 'فشل التحميل');
    listEl.innerHTML = novels.length
      ? novels.map(buildAdminReviewRow).join('')
      : `<p style="padding:18px;color:var(--paper-mute)">لا توجد روايات بانتظار المراجعة.</p>`;
    renderIcons(listEl);
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--paper-mute)">${err.message}</p>`;
  }
}

function reviewStatusLabel(status) {
  if (status === 'pending') return 'قيد المراجعة';
  if (status === 'rejected') return 'مرفوضة';
  return 'منشورة';
}
function reviewStatusBadgeClass(status) {
  if (status === 'pending') return 'badge-gold';
  if (status === 'rejected') return 'badge-danger';
  return 'badge-teal';
}

function buildAdminNovelRow(novel) {
  const searchKey = `${novel.title} ${novel.title_en || ''} ${novel.author}`.toLowerCase();
  return `
    <div class="chapter-full-row" data-search="${searchKey}">
      <div class="chapter-full-left">
        <span class="ch-title">${novel.title}</span>
        <span class="badge ${reviewStatusBadgeClass(novel.review_status)}" style="position:static">${reviewStatusLabel(novel.review_status)}</span>
      </div>
      <div class="chapter-full-right">
        <span style="color:var(--paper-mute);font-size:.82rem">بقلم ${novel.author}</span>
        <a class="btn btn-ghost btn-sm" href="novel.html?id=${novel.id}" target="_blank">فتح</a>
        <button type="button" class="btn btn-ghost btn-sm btn-danger-text" data-delete-novel="${novel.id}">حذف</button>
      </div>
    </div>`;
}

async function loadAdminNovels() {
  const listEl = document.getElementById('admin-novels-list');
  if (!listEl) return;
  listEl.innerHTML = `<p style="color:var(--paper-mute)">جارٍ التحميل...</p>`;
  try {
    const res = await fetch('/api/admin/novels', { credentials: 'include' });
    const novels = await res.json();
    if (!res.ok) throw new Error(novels.error || 'فشل التحميل');
    listEl.innerHTML = novels.length
      ? novels.map(buildAdminNovelRow).join('')
      : `<p style="padding:18px;color:var(--paper-mute)">لا توجد روايات بعد.</p>`;
    renderIcons(listEl);
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--paper-mute)">${err.message}</p>`;
  }
}

// roles a viewer is allowed to assign. Only the owner can grant (or take
// away) the owner/co-owner role — a plain admin only sees the three
// "ordinary" roles in the dropdown.
function roleOptionsFor(viewerIsOwner) {
  const options = [
    ['user', 'قارئ'],
    ['author', 'كاتب'],
    ['admin', 'مشرف']
  ];
  if (viewerIsOwner) {
    options.push(['co-owner', 'شريك المالك'], ['owner', 'المالك']);
  }
  return options;
}

// small crown/shield mark shown next to an owner's or co-owner's name,
// so they're recognizable at a glance in the users list
function roleSymbolHtml(role) {
  if (role === 'owner') {
    return `<i data-icon="crown" class="role-symbol role-symbol-owner" title="المالك"></i>`;
  }
  if (role === 'co-owner') {
    return `<i data-icon="shield" class="role-symbol role-symbol-coowner" title="شريك المالك"></i>`;
  }
  return '';
}

function buildAdminUserRow(user) {
  const viewerRole = currentUser ? currentUser.role : null;
  const viewerIsOwner = viewerRole === 'owner';
  const viewerIsOwnerOrCoOwner = viewerIsOwner || viewerRole === 'co-owner';
  const isSelf = currentUser && Number(user.id) === Number(currentUser.id);

  // owner/co-owner targets: only the owner may touch them.
  // admin targets: the owner or a co-owner may touch them — a plain
  // admin cannot change another admin's role.
  let locked = isSelf;
  let lockMessage = 'لا يمكنك تغيير دورك الخاص';
  if (!locked && (user.role === 'owner' || user.role === 'co-owner') && !viewerIsOwner) {
    locked = true;
    lockMessage = 'فقط المالك يمكنه تعديل صلاحيات هذا المستخدم';
  } else if (!locked && user.role === 'admin' && !viewerIsOwnerOrCoOwner) {
    locked = true;
    lockMessage = 'فقط المالك أو شريك المالك يمكنه تعديل صلاحيات مشرف آخر';
  }

  const controlHtml = locked
    ? `<span class="role-locked" title="${lockMessage}">
        <i data-icon="lock"></i> ${ROLE_LABELS[user.role] || user.role}
      </span>`
    : `<select class="admin-role-select" data-user-id="${user.id}">
        ${roleOptionsFor(viewerIsOwner).map(([value, label]) =>
          `<option value="${value}" ${user.role === value ? 'selected' : ''}>${label}</option>`
        ).join('')}
      </select>`;

  return `
    <div class="chapter-full-row">
      <div class="chapter-full-left">
        <span class="ch-title">${user.username} ${roleSymbolHtml(user.role)}</span>
        <span style="color:var(--paper-mute);font-size:.82rem">${user.email || ''}</span>
      </div>
      <div class="chapter-full-right">
        ${controlHtml}
      </div>
    </div>`;
}

async function loadAdminUsers() {
  const listEl = document.getElementById('admin-users-list');
  if (!listEl) return;
  listEl.innerHTML = `<p style="color:var(--paper-mute)">جارٍ التحميل...</p>`;
  try {
    const res = await fetch('/api/admin/users', { credentials: 'include' });
    const users = await res.json();
    if (!res.ok) throw new Error(users.error || 'فشل التحميل');
    listEl.innerHTML = users.map(buildAdminUserRow).join('');
    renderIcons(listEl);
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--paper-mute)">${err.message}</p>`;
  }
}

const REPORT_TYPE_LABELS = { technical: 'مشكلة تقنية', content: 'محتوى غير لائق', payment: 'مشكلة دفع', other: 'أخرى' };

function buildAdminReportRow(report) {
  const reporter = report.username
    ? `بلّغ عنها ${report.username}`
    : (report.contact_email ? `زائر — ${report.contact_email}` : 'زائر (بدون بريد)');
  const isResolved = report.status === 'resolved';

  return `
    <div class="chapter-full-row" style="align-items:flex-start">
      <div class="chapter-full-left" style="align-items:flex-start;gap:14px">
        <span class="badge ${isResolved ? 'badge-teal' : 'badge-gold'}" style="position:static;flex-shrink:0;margin-top:2px">
          ${isResolved ? 'تم الحل' : 'مفتوح'}
        </span>
        <div>
          <span class="ch-title">${REPORT_TYPE_LABELS[report.type] || report.type}</span>
          <div style="color:var(--paper-mute);font-size:.82rem;margin-top:4px">
            ${reporter} · ${relativeTime(report.created_at)}
            ${report.page_url ? ` · <a href="${report.page_url}" target="_blank" style="text-decoration:underline">الصفحة</a>` : ''}
          </div>
          <div style="color:var(--paper-dim);font-size:.88rem;margin-top:8px;max-width:60ch;line-height:1.7">${report.message}</div>
        </div>
      </div>
      <div class="chapter-full-right">
        ${isResolved ? '' : `<button type="button" class="btn btn-primary btn-sm" data-resolve-report="${report.id}"><i data-icon="check"></i> تحديد كمحلول</button>`}
      </div>
    </div>`;
}

async function loadAdminReports() {
  const listEl = document.getElementById('admin-reports-list');
  if (!listEl) return;
  listEl.innerHTML = `<p style="color:var(--paper-mute)">جارٍ التحميل...</p>`;
  try {
    const res = await fetch('/api/admin/reports', { credentials: 'include' });
    const reports = await res.json();
    if (!res.ok) throw new Error(reports.error || 'فشل التحميل');
    listEl.innerHTML = reports.length
      ? reports.map(buildAdminReportRow).join('')
      : `<p style="padding:18px;color:var(--paper-mute)">لا توجد بلاغات حتى الآن.</p>`;
    renderIcons(listEl);
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--paper-mute)">${err.message}</p>`;
  }
}

async function initAdminPage() {
  const root = document.getElementById('admin-root');
  if (!root) return;

  if (!currentUser) await checkAuth();
  if (!currentUser || !isAdminRole(currentUser.role)) {
    window.location.href = 'index.html';
    return;
  }

  initAdminTabs();
  wireAdminSearch('admin-pending-search', 'admin-pending-list', 'لا توجد روايات مطابقة لبحثك.');
  wireAdminSearch('admin-novels-search', 'admin-novels-list', 'لا توجد روايات مطابقة لبحثك.');
  loadAdminPending();
  loadAdminNovels();
  loadAdminUsers();
  loadAdminReports();
}

// resolve-report clicks (event delegation, works for dynamically rendered rows)
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-resolve-report]');
  if (!btn) return;
  const id = btn.getAttribute('data-resolve-report');
  btn.disabled = true;
  try {
    const res = await fetch(`/api/admin/reports/${id}/resolve`, { method: 'POST', credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'فشل الإجراء');
    showToast('تم', 'تم تحديد البلاغ كمحلول');
    loadAdminReports();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
  }
});

// approve / reject clicks (event delegation, works for dynamically rendered rows)
document.addEventListener('click', async (e) => {
  const approveBtn = e.target.closest('[data-approve-novel]');
  const rejectBtn = e.target.closest('[data-reject-novel]');
  if (!approveBtn && !rejectBtn) return;

  const id = (approveBtn || rejectBtn).getAttribute(approveBtn ? 'data-approve-novel' : 'data-reject-novel');
  let note = null;
  if (rejectBtn) {
    note = prompt('سبب الرفض (اختياري، سيظهر للكاتب):') || '';
  }

  const btn = approveBtn || rejectBtn;
  btn.disabled = true;
  try {
    const res = await fetch(`/api/admin/novels/${id}/${approveBtn ? 'approve' : 'reject'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ note })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'فشل الإجراء');
    showToast('تم', approveBtn ? 'تم قبول الرواية' : 'تم رفض الرواية');
    loadAdminPending();
    loadAdminNovels();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
  }
});

// role dropdown changes
document.addEventListener('change', async (e) => {
  const select = e.target.closest('.admin-role-select');
  if (!select) return;

  const userId = select.getAttribute('data-user-id');
  const role = select.value;
  select.disabled = true;
  try {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'فشل تغيير الدور');
    showToast('تم', 'تم تحديث دور المستخدم');
    loadAdminUsers(); // refresh so symbols/locks reflect the new role
  } catch (err) {
    alert(err.message);
    loadAdminUsers(); // revert the dropdown to its real value
  } finally {
    select.disabled = false;
  }
});

/* =========================================================================
   Browse / search novels (novels.html) — one page: a text search, a set
   of category filter chips, and a sort, any combination of which can be
   active at once. State lives in the URL (?q=&category=&sort=) so the
   page is bookmarkable and the back/forward buttons work, but switching
   a filter re-fetches in place instead of a full page reload.
   ========================================================================= */
async function initNovelsBrowsePage() {
  const grid = document.getElementById('browse-grid');
  if (!grid) return; // not on novels.html

  const chipsEl = document.getElementById('browse-categories');
  const formEl = document.getElementById('browse-search-form');
  const inputEl = document.getElementById('browse-search-input');
  const tabsEl = document.getElementById('browse-tabs');
  const titleEl = document.getElementById('browse-title');
  const countEl = document.getElementById('browse-count');

  const state = { q: '', category: '', sort: 'new' };

  function readStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    state.category = params.get('category') || '';
    state.sort = params.get('sort') === 'views' ? 'views' : 'new';
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.category) params.set('category', state.category);
    if (state.sort === 'views') params.set('sort', 'views');
    const qs = params.toString();
    history.replaceState(null, '', qs ? `novels.html?${qs}` : 'novels.html');
  }

  function updateHeading() {
    let heading = 'قائمة الروايات';
    if (state.q) heading = `نتائج البحث عن "${state.q}"`;
    else if (state.category) heading = state.category;
    titleEl.textContent = heading;
    document.title = `${heading} — ميداد`;
  }

  async function loadResults() {
    updateHeading();
    grid.innerHTML = `<p style="color:var(--paper-mute)">جارٍ التحميل...</p>`;
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.category) params.set('category', state.category);
    if (state.sort === 'views') params.set('sort', 'views');

    try {
      const res = await fetch(`/api/novels?${params.toString()}`);
      const novels = await res.json();
      if (!res.ok) throw new Error('فشل التحميل');
      countEl.textContent = novels.length ? `${novels.length} رواية` : '';
      grid.innerHTML = novels.length
        ? novels.map(buildNovelCard).join('')
        : `<p style="color:var(--paper-mute)">لا توجد روايات مطابقة.</p>`;
      renderIcons(grid);
    } catch (err) {
      console.error('Failed to load novels:', err);
      grid.innerHTML = `<p style="color:var(--paper-mute)">تعذّر تحميل الروايات.</p>`;
    }
  }

  async function loadCategoryChips() {
    if (!chipsEl) return;
    try {
      const res = await fetch('/api/categories');
      const categories = await res.json();
      if (!res.ok) throw new Error('فشل التحميل');

      const chipHtml = (name, label, count) => `
        <button type="button" class="filter-chip ${state.category === name ? 'active' : ''}" data-cat="${name}">
          ${label}${count != null ? ` <span>(${count})</span>` : ''}
        </button>`;

      chipsEl.innerHTML = chipHtml('', 'الكل') +
        categories.map(c => chipHtml(c.name, c.name, c.novel_count)).join('');

      chipsEl.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          state.category = btn.getAttribute('data-cat');
          chipsEl.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          syncUrl();
          loadResults();
        });
      });
    } catch (err) {
      console.error('Failed to load categories:', err);
      chipsEl.innerHTML = '';
    }
  }

  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      state.q = inputEl.value.trim();
      syncUrl();
      loadResults();
    });
  }

  if (tabsEl) {
    tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.sort = btn.dataset.sort;
        syncUrl();
        loadResults();
      });
    });
  }

  readStateFromUrl();
  if (inputEl) inputEl.value = state.q;
  if (tabsEl) {
    tabsEl.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === state.sort));
  }

  await loadCategoryChips();
  loadResults();
}

/* =========================================================================
   Nav search popover — works on every page without touching each page's
   markup: it wraps the existing search icon button and drops a small
   input under it on click, then hands off to novels.html on submit.
   ========================================================================= */
/* =========================================================================
   Nav dropdowns (التصنيفات / مجتمعنا) — click to open/close, close on
   outside click or Escape, and only one open at a time.
   ========================================================================= */
/* =========================================================================
   Mobile drawer — opens on the hamburger, closes on the X, the backdrop,
   a nav link click, or Escape.
   ========================================================================= */
/* =========================================================================
   Report an issue — a small modal reachable from the homepage help bar
   and every page's footer. Works whether or not the person is logged in;
   admins (and co-owner/owner) see submissions in the admin dashboard.
   ========================================================================= */
/* =========================================================================
   Comments (novel.html / chapter.html) — front-end structure only. There
   is no backend for this yet — it's meant to be wired up later (a real
   API, or a third-party comments service). What's here is a working
   shell: seed comments render, the composer swaps for a "log in" prompt
   when signed out, and posting appends to the list for this visit only
   (nothing is sent anywhere or persisted).
   ========================================================================= */
const DEMO_COMMENTS = [
  { username: 'نورة القحطاني', time: 'منذ يومين', text: 'رواية رائعة! الفصل الأخير كان مليئًا بالمفاجآت.' },
  { username: 'سالم العتيبي', time: 'منذ 5 أيام', text: 'متى الفصل القادم؟ الانتظار صعب.' }
];

function buildCommentHtml(comment) {
  const letter = comment.username.charAt(0).toUpperCase();
  return `
    <div class="comment-item">
      <div class="comment-avatar">${letter}</div>
      <div class="comment-body">
        <div class="comment-meta"><b>${comment.username}</b><span>${comment.time}</span></div>
        <p class="comment-text">${comment.text}</p>
      </div>
    </div>`;
}

function initComments() {
  const list = document.getElementById('comment-list');
  if (!list) return; // not on a page with a comments section

  const countEl = document.getElementById('nv-comments-count');
  const guard = document.getElementById('comment-composer-guard');
  const form = document.getElementById('comment-form');
  const avatarEl = document.getElementById('comment-composer-avatar');

  let comments = [...DEMO_COMMENTS];

  function render() {
    if (countEl) countEl.textContent = `(${comments.length})`;
    list.innerHTML = comments.length
      ? comments.map(buildCommentHtml).join('')
      : `<p style="color:var(--paper-mute)">لا توجد تعليقات بعد. كن أول من يعلّق!</p>`;
  }

  function updateComposerVisibility() {
    const loggedIn = !!currentUser;
    if (guard) guard.style.display = loggedIn ? 'none' : '';
    if (form) form.style.display = loggedIn ? 'flex' : 'none';
    if (loggedIn && avatarEl) avatarEl.innerHTML = buildAvatarHtml(currentUser);
  }

  render();
  updateComposerVisibility();
  // checkAuth() runs elsewhere and is async, so re-check shortly after
  // in case it hadn't resolved yet on the first pass
  setTimeout(updateComposerVisibility, 500);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('comment-input');
      const text = input.value.trim();
      if (!text || !currentUser) return;
      comments = [{ username: currentUser.username, time: 'الآن', text }, ...comments];
      render();
      input.value = '';
    });
  }
}

function initReportModal() {
  const triggers = document.querySelectorAll('[data-report-issue]');
  if (!triggers.length) return;

  let overlay = null;

  function onEscape(e) { if (e.key === 'Escape') closeModal(); }

  function closeModal() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.removeEventListener('keydown', onEscape);
  }

  function openModal() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-head">
          <h3>الإبلاغ عن مشكلة</h3>
          <button type="button" class="icon-btn" data-modal-close aria-label="إغلاق"><i data-icon="close"></i></button>
        </div>
        <form id="report-form">
          <div class="form-row">
            <label for="report-type">نوع المشكلة</label>
            <select id="report-type">
              <option value="technical">مشكلة تقنية</option>
              <option value="content">محتوى غير لائق</option>
              <option value="payment">مشكلة دفع</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div class="form-row">
            <label for="report-message">تفاصيل المشكلة</label>
            <textarea id="report-message" required placeholder="اشرح المشكلة بالتفصيل..."></textarea>
          </div>
          ${!currentUser ? `
          <div class="form-row">
            <label for="report-email">بريدك الإلكتروني (اختياري)</label>
            <input type="email" id="report-email" placeholder="لنتواصل معك بخصوص البلاغ إن لزم">
          </div>` : ''}
          <button type="submit" class="btn btn-primary btn-block"><i data-icon="flag"></i> إرسال البلاغ</button>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    renderIcons(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    overlay.querySelector('[data-modal-close]').addEventListener('click', closeModal);
    document.addEventListener('keydown', onEscape);

    overlay.querySelector('#report-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = overlay.querySelector('#report-type').value;
      const message = overlay.querySelector('#report-message').value.trim();
      const emailInput = overlay.querySelector('#report-email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!message) return;

      const submitBtn = overlay.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type, message, email, page_url: window.location.href })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'فشل إرسال البلاغ');
        closeModal();
        showToast('تم استلام بلاغك', 'سيراجعه فريقنا في أقرب وقت، شكرًا لك.');
      } catch (err) {
        alert(err.message);
        submitBtn.disabled = false;
      }
    });
  }

  triggers.forEach(t => t.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));
}

function initMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const backdrop = drawer ? drawer.querySelector('.mobile-drawer-backdrop') : null;
  if (!drawer || !openBtn) return;

  const open = () => drawer.classList.add('open');
  const close = () => drawer.classList.remove('open');

  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  drawer.querySelectorAll('.mobile-drawer-panel a').forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initNavDropdowns() {
  const drops = document.querySelectorAll('.nav-drop');
  if (!drops.length) return;

  const closeAll = () => drops.forEach(d => d.classList.remove('open'));

  drops.forEach(drop => {
    const trigger = drop.querySelector(':scope > button');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = drop.classList.contains('open');
      closeAll();
      drop.classList.toggle('open', !wasOpen);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-drop')) closeAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}

function initNavSearch() {
  const btn = document.querySelector('.icon-btn[aria-label="بحث"]');
  if (!btn || btn.dataset.searchBound) return;
  btn.dataset.searchBound = 'true';

  const wrap = document.createElement('span');
  wrap.className = 'nav-search-wrap';
  btn.parentElement.insertBefore(wrap, btn);
  wrap.appendChild(btn);

  let popover = null;

  const closePopover = () => {
    if (!popover) return;
    popover.remove();
    popover = null;
    document.removeEventListener('click', onOutsideClick);
    document.removeEventListener('keydown', onEscape);
  };
  const onOutsideClick = (e) => {
    if (popover && !popover.contains(e.target) && e.target !== btn) closePopover();
  };
  const onEscape = (e) => {
    if (e.key === 'Escape') closePopover();
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popover) { closePopover(); return; }

    popover = document.createElement('form');
    popover.className = 'nav-search-popover';
    popover.innerHTML = `
      <input type="text" placeholder="ابحث عن رواية أو كاتب..." autocomplete="off">
      <button type="submit" class="icon-btn" aria-label="ابحث"><i data-icon="search"></i></button>
    `;
    wrap.appendChild(popover);
    renderIcons(popover);
    popover.querySelector('input').focus();

    popover.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const q = popover.querySelector('input').value.trim();
      if (q) window.location.href = `novels.html?q=${encodeURIComponent(q)}`;
    });

    setTimeout(() => {
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('keydown', onEscape);
    }, 0);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderIcons();
  initThemeToggle();
  checkAuth();
  loadHero();
  loadTrending();
  loadNovels();
  loadNovelDetail();
  loadChapter();
  initPublishForm();
  initEditForm();
  initManageChapters();
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
  initProfilePage();
  initAdminPage();
  initNavDropdowns();
  initMobileDrawer();
  initReportModal();
  initComments();
  initNavSearch();
  initNovelsBrowsePage();
});