(() => {
  const MARKS_KEY = 'bookmarks_marks_v2';
  const NOTICE_KEY = 'bookmarks_marks_notice_closed_v2';
  const EXPORT_NOTICE_KEY = 'bookmarks_marks_export_notice_closed_v2';
  const LIMIT = 50;
  const PAGE_NAME = (document.title || 'Bookmarks').split('-')[0].trim();
  const SESSION_KEY = 'bookmarks_session_v1';
  
  const state = {
    toastTimer: 0,
    observer: null,
    sessionId: null
  };

  function getSessionId() {
    if (!state.sessionId) {
      state.sessionId = sessionStorage.getItem(SESSION_KEY) || 'session_' + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, state.sessionId);
    }
    return state.sessionId;
  }

  function injectStyles() {
    if (document.getElementById('bookmarksEnhancementsStyle')) return;
    const style = document.createElement('style');
    style.id = 'bookmarksEnhancementsStyle';
    style.textContent = `
      .bookmark-card, .featured-card { position: relative; overflow: visible; }
      .bookmark-card-enhanced { isolation: isolate; }
      
      .mark-icon-btn {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--surface);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 5;
        padding: 0;
        color: var(--text-soft);
      }
      
      .mark-icon-btn:hover {
        background: var(--brand-soft);
        border-color: var(--brand);
        color: var(--brand-light);
      }
      
      .mark-icon-btn.is-marked {
        background: linear-gradient(135deg, rgba(255,210,84,0.18), rgba(255,160,64,0.16));
        border-color: rgba(255,206,85,0.36);
        color: #ffd86f;
      }
      
      .mark-icon-btn svg { width: 18px; height: 18px; transition: transform 0.2s ease; }
      .mark-icon-btn.is-marked svg { transform: scale(1.1); }
      
      @media (min-width: 769px) {
        .mark-icon-btn { opacity: 0; pointer-events: none; }
        .bookmark-card:hover .mark-icon-btn,
        .bookmark-card:focus-within .mark-icon-btn { opacity: 1; pointer-events: auto; }
      }
      
      @media (max-width: 768px) {
        .mark-icon-btn { opacity: 1; width: 28px; height: 28px; right: 8px; }
        .mark-icon-btn svg { width: 16px; height: 16px; }
        .bookmark-card .card-top { padding-right: 40px; }
      }
      
      .resource-favicon-badge {
        position: absolute;
        top: 12px;
        right: 48px;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        box-shadow: var(--shadow);
        z-index: 4;
      }
      .resource-favicon-badge img { width: 16px; height: 16px; object-fit: contain; border-radius: 3px; }
      
      .marks-shell {
        position: fixed;
        top: 0;
        right: -400px;
        width: 100%;
        max-width: 400px;
        height: 100vh;
        background: var(--bg-2);
        border-left: 1px solid var(--border);
        box-shadow: -10px 0 40px rgba(0,0,0,0.3);
        z-index: 1000;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
      }
      .marks-shell.show { right: 0; }
      
      .marks-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }
      .marks-title {
        font-family: "Space Grotesk", sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text);
      }
      .marks-close {
        width: 32px; height: 32px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-soft);
        transition: all 0.2s ease;
      }
      .marks-close:hover { background: var(--brand); border-color: var(--brand); color: white; }
      
      .marks-content { flex: 1; overflow-y: auto; padding: 16px; }
      .marks-list { display: flex; flex-direction: column; gap: 10px; }
      
      .mark-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        transition: all 0.2s ease;
      }
      .mark-item:hover { border-color: var(--brand); background: var(--surface-2); }
      
      .mark-item-icon {
        width: 36px; height: 36px;
        background: linear-gradient(135deg, var(--brand), var(--brand-dark));
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      .mark-item-icon svg { width: 18px; height: 18px; }
      
      .mark-item-content { flex: 1; min-width: 0; }
      .mark-item-title {
        font-weight: 600;
        color: var(--text);
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mark-item-meta { font-size: 0.75rem; color: var(--text-dim); margin-top: 2px; }
      
      .mark-item-actions { display: flex; gap: 6px; }
      .mark-item-action {
        width: 32px; height: 32px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-soft);
        text-decoration: none;
        transition: all 0.2s ease;
      }
      .mark-item-action:hover { background: var(--brand); border-color: var(--brand); color: white; }
      
      .mark-item-remove {
        width: 32px; height: 32px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-soft);
        font-size: 1.2rem;
        transition: all 0.2s ease;
      }
      .mark-item-remove:hover { background: #ef4444; border-color: #ef4444; color: white; }
      
      .marks-launcher {
        position: fixed;
        right: 20px;
        bottom: 24px;
        width: 52px;
        height: 52px;
        background: linear-gradient(135deg, var(--brand), var(--brand-dark));
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(12,132,243,0.3);
        z-index: 999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        color: white;
      }
      .marks-launcher:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 12px 32px rgba(12,132,243,0.4); }
      .marks-launcher:active { transform: translateY(0) scale(0.98); }
      .marks-launcher svg { width: 24px; height: 24px; }
      
      .marks-count-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 20px;
        height: 20px;
        background: #ef4444;
        color: white;
        font-size: 0.7rem;
        font-weight: 700;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        box-shadow: 0 2px 8px rgba(239,68,68,0.4);
      }
      
      .marks-toast {
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 20px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 1001;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        pointer-events: none;
      }
      .marks-toast.show { opacity: 1; transform: translateY(0); }
      
      @media (max-width: 480px) {
        .marks-shell { max-width: 100%; }
        .marks-launcher { right: 16px; bottom: 16px; width: 48px; height: 48px; }
        .marks-toast { right: 16px; bottom: 80px; left: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getMarksShell() {
    let shell = document.getElementById('marksShell');
    if (!shell) {
      shell = document.createElement('div');
      shell.id = 'marksShell';
      shell.className = 'marks-shell';
      shell.innerHTML = `
        <div class="marks-header">
          <div class="marks-title">Saved Marks</div>
          <button class="marks-close" id="marksClose" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="marks-content">
          <div class="marks-list" id="marksList"></div>
        </div>
      `;
      document.body.appendChild(shell);
      
      shell.querySelector('#marksClose').addEventListener('click', () => shell.classList.remove('show'));
      shell.addEventListener('click', (e) => { if (e.target === shell) shell.classList.remove('show'); });
    }
    return shell;
  }

  function loadMarks() {
    try {
      const stored = localStorage.getItem(MARKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  }

  function saveMarks(marks) {
    try {
      const limited = marks.slice(0, LIMIT);
      localStorage.setItem(MARKS_KEY, JSON.stringify(limited));
      sessionStorage.setItem(SESSION_KEY + '_marks', JSON.stringify({ marks: limited, timestamp: Date.now() }));
      updateLauncherCount();
      renderMarksPanel();
    } catch (e) { console.error('Failed to save marks:', e); }
  }

  function isMarked(resourceId) {
    return loadMarks().some(m => m.id === resourceId);
  }

  function toggleMark(resource) {
    const marks = loadMarks();
    const idx = marks.findIndex(m => m.id === resource.id);
    
    if (idx >= 0) {
      marks.splice(idx, 1);
      saveMarks(marks);
      showToast('Removed from marks');
    } else {
      if (marks.length >= LIMIT) {
        showToast('Maximum ' + LIMIT + ' marks reached');
        return;
      }
      marks.push({
        id: resource.id,
        title: resource.title || 'Untitled',
        url: resource.url || '#',
        domain: resource.domain || '',
        category: resource.category || 'General',
        page: PAGE_NAME,
        desc: resource.desc || '',
        favicon: resource.favicon || '',
        createdAt: Date.now()
      });
      saveMarks(marks);
      showToast('Saved to marks');
    }
    
    const btn = document.querySelector('[data-mark-id="' + resource.id + '"]');
    if (btn) {
      btn.classList.toggle('is-marked', isMarked(resource.id));
      updateButtonIcon(btn, isMarked(resource.id));
    }
  }

  function updateButtonIcon(btn, isMarked) {
    if (isMarked) {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';
    }
  }

  function showToast(message) {
    let toast = document.getElementById('marksToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'marksToast';
      toast.className = 'marks-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function updateLauncherCount() {
    const badge = document.querySelector('.marks-count-badge');
    const count = loadMarks().length;
    if (badge) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function createLauncher() {
    let launcher = document.querySelector('.marks-launcher');
    if (!launcher) {
      launcher = document.createElement('button');
      launcher.className = 'marks-launcher';
      launcher.setAttribute('aria-label', 'Open saved marks');
      launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span class="marks-count-badge" style="display:none">0</span>';
      launcher.addEventListener('click', () => {
        const shell = getMarksShell();
        shell.classList.toggle('show');
        if (shell.classList.contains('show')) renderMarksPanel();
      });
      document.body.appendChild(launcher);
    }
    updateLauncherCount();
  }

  function renderMarksPanel() {
    const list = document.getElementById('marksList');
    if (!list) return;
    const marks = loadMarks();
    
    if (!marks.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-dim)"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;opacity:0.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><p style="margin:0 0 8px;font-weight:600">No marks yet</p><p style="margin:0;font-size:0.85rem">Click the bookmark icon on any card to save it</p></div>';
      return;
    }
    
    list.innerHTML = marks.map(mark => '<article class="mark-item" data-mark-id="' + mark.id + '"><div class="mark-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></div><div class="mark-item-content"><div class="mark-item-title">' + escapeHtml(mark.title) + '</div><div class="mark-item-meta">' + escapeHtml(mark.category) + ' • ' + escapeHtml(mark.domain) + '</div></div><div class="mark-item-actions"><a class="mark-item-action" href="' + escapeHtml(mark.url) + '" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a><button class="mark-item-remove" data-remove-id="' + mark.id + '">×</button></div></article>').join('');
    
    list.querySelectorAll('.mark-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        saveMarks(loadMarks().filter(m => m.id !== btn.dataset.removeId));
        showToast('Removed');
      });
    });
    updateLauncherCount();
  }

  function extractResource(card) {
    const href = card.getAttribute('href') || '#';
    const titleEl = card.querySelector('.card-title, .title, h3, h2');
    const domainEl = card.querySelector('.card-domain, .domain, .meta');
    const faviconEl = card.querySelector('.card-favicon, .favicon');
    const descEl = card.querySelector('.card-desc, .desc, .description');
    const categorySection = card.closest('.category-section');
    const categoryEl = categorySection?.querySelector('.category-title') || card.querySelector('.card-category');
    
    let domain = domainEl?.textContent?.trim() || '';
    if (!domain && href !== '#') {
      try { domain = new URL(href).hostname.replace('www.', ''); } catch (e) {}
    }
    
    return {
      id: href + '_' + (titleEl?.textContent?.trim() || 'unknown'),
      url: href,
      title: titleEl?.textContent?.trim() || 'Untitled Resource',
      domain: domain,
      favicon: faviconEl?.src || faviconEl?.getAttribute('data-src') || '',
      desc: descEl?.textContent?.trim() || '',
      category: categoryEl?.textContent?.trim() || 'General',
      page: PAGE_NAME
    };
  }

  function enhanceCard(card) {
    if (!card || card.dataset.markEnhanced === '1') return;
    const href = card.getAttribute('href');
    if (!href || href === '#') return;
    
    card.dataset.markEnhanced = '1';
    card.classList.add('bookmark-card-enhanced');
    const resource = extractResource(card);
    
    if (resource.favicon) {
      const badge = document.createElement('div');
      badge.className = 'resource-favicon-badge';
      badge.innerHTML = '<img src="' + escapeHtml(resource.favicon) + '" alt="" loading="lazy">';
      card.appendChild(badge);
    }
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mark-icon-btn';
    btn.dataset.markId = resource.id;
    btn.setAttribute('aria-label', 'Save to marks');
    updateButtonIcon(btn, isMarked(resource.id));
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleMark(resource); });
    card.appendChild(btn);
  }

  function refreshEnhancements() {
    document.querySelectorAll('.bookmark-card').forEach(enhanceCard);
    updateLauncherCount();
  }

  function initObserver() {
    if (state.observer) return;
    state.observer = new MutationObserver((mutations) => {
      let hasAdded = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) { hasAdded = true; break; }
      }
      if (hasAdded) requestAnimationFrame(refreshEnhancements);
    });
    state.observer.observe(document.body, { childList: true, subtree: true });
  }

  function showNotice(id, html, storageKey) {
    const closed = sessionStorage.getItem(storageKey);
    if (closed === '1') return;
    const notice = document.createElement('div');
    notice.innerHTML = html;
    notice.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin:16px;font-size:0.9rem;color:var(--text-soft);display:flex;align-items:center;justify-content:space-between;gap:16px';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-soft);flex-shrink:0';
    closeBtn.addEventListener('click', () => { sessionStorage.setItem(storageKey, '1'); notice.remove(); });
    notice.appendChild(closeBtn);
    const container = document.getElementById('marksShell');
    if (container) {
      const header = container.querySelector('.marks-header');
      if (header) header.parentNode.insertBefore(notice, header.nextSibling);
    }
  }

  function initSessionSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === SESSION_KEY + '_marks') refreshEnhancements();
    });
  }

  function init() {
    injectStyles();
    getMarksShell();
    createLauncher();
    initSessionSync();
    showNotice('marks-storage', '<strong>Marks are local.</strong> Saved in localStorage, capped at ' + LIMIT + ' marks.', NOTICE_KEY);
    showNotice('marks-export', '<strong>Tip:</strong> Export your marks from the panel to keep them safe.', EXPORT_NOTICE_KEY);
    refreshEnhancements();
    initObserver();
    console.log('[Marks System v2] Initialized');
  }

  window.MarksSystem = { toggleMark, getMarks: loadMarks, refresh: refreshEnhancements };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
