(() => {
  // Configuration
  const CONFIG = {
    MARKS_LIMIT: 50,
    STORAGE_PREFIX: 'neo_marks_',
    COOKIE_ID_KEY: 'neo_cookie_id',
    SESSION_KEY: 'neo_session_v1',
    NOTICE_KEY: 'neo_marks_notice_closed',
    EXPORT_NOTICE_KEY: 'neo_marks_export_notice_closed',
    COOKIE_NOTICE_KEY: 'neo_cookie_setup_notice_closed'
  };

  const PAGE_NAME = (document.title || 'Bookmarks').split('-')[0].trim();
  
  // State management
  const state = {
    toastTimer: 0,
    observer: null,
    sessionId: null,
    cookieId: null,
    marks: [],
    isShellOpen: false,
    faviconCache: new Map() // Cache favicons to avoid repeated fetches
  };

  // Utility functions
  function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function isValidCookieId(id) {
    return id && typeof id === 'string' && /.{1,64}/.test(id);
  }

  // Favicon utilities with cache and fallback
  function getFaviconUrl(url) {
    // Check cache first
    const domain = extractDomain(url);
    if (state.faviconCache.has(domain)) {
      return state.faviconCache.get(domain);
    }
    // Use Google's favicon service as reliable fallback
    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';
    state.faviconCache.set(domain, favicon);
    return favicon;
  }

  function extractDomain(url) {
    try {
      if (!url || url === '#') return '';
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return '';
    }
  }

  // Cookie ID management
  function getCookieId() {
    if (!state.cookieId) {
      state.cookieId = localStorage.getItem(CONFIG.COOKIE_ID_KEY);
      if (!state.cookieId) {
        state.cookieId = generateId('user_');
        localStorage.setItem(CONFIG.COOKIE_ID_KEY, state.cookieId);
      }
    }
    return state.cookieId;
  }

  function setCookieId(id) {
    if (isValidCookieId(id)) {
      state.cookieId = id;
      localStorage.setItem(CONFIG.COOKIE_ID_KEY, id);
      loadMarks();
      return true;
    }
    return false;
  }

  function getSessionId() {
    if (!state.sessionId) {
      state.sessionId = sessionStorage.getItem(CONFIG.SESSION_KEY) || 'session_' + Date.now().toString(36);
      sessionStorage.setItem(CONFIG.SESSION_KEY, state.sessionId);
    }
    return state.sessionId;
  }

  // Marks storage - using localStorage with cookie-id namespacing
  function getStorageKey() {
    return CONFIG.STORAGE_PREFIX + getCookieId();
  }

  function loadMarks() {
    try {
      const key = getStorageKey();
      const data = localStorage.getItem(key);
      state.marks = data ? JSON.parse(data) : [];
      return state.marks;
    } catch (e) {
      console.error('[Marks] Load error:', e);
      state.marks = [];
      return [];
    }
  }

  function saveMarks(marks) {
    try {
      state.marks = marks.slice(0, CONFIG.MARKS_LIMIT);
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(state.marks));
      
      const event = new CustomEvent('neo-marks-updated', {
        detail: { cookieId: getCookieId(), marks: state.marks }
      });
      document.dispatchEvent(event);
      
      updateLauncherCount();
      return state.marks;
    } catch (e) {
      console.error('[Marks] Save error:', e);
      return state.marks;
    }
  }

  function isMarked(id) {
    return state.marks.some(m => m.id === id);
  }

  function toggleMark(resource) {
    const marks = loadMarks();
    const existingIndex = marks.findIndex(m => m.id === resource.id);
    
    if (existingIndex >= 0) {
      marks.splice(existingIndex, 1);
      showToast('Removed from marks');
    } else {
      if (marks.length >= CONFIG.MARKS_LIMIT) {
        showToast('Mark limit reached (' + CONFIG.MARKS_LIMIT + ')');
        return false;
      }
      marks.push({
        ...resource,
        markedAt: Date.now(),
        sessionId: getSessionId()
      });
      showToast('Added to marks');
    }
    
    saveMarks(marks);
    return true;
  }

  // UI Components
  function getMarksShell() {
    let shell = document.getElementById('neoMarksShell');
    if (shell) return shell;

    shell = document.createElement('div');
    shell.id = 'neoMarksShell';
    shell.className = 'marks-shell';
    shell.innerHTML = `
      <div class="marks-header">
        <div class="marks-header-top">
          <span class="marks-title">📑 My Marks</span>
          <button class="marks-close" aria-label="Close marks panel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="cookie-id-section">
          <label class="cookie-id-label">Cookie ID</label>
          <div class="cookie-id-input-wrapper">
            <input type="text" class="cookie-id-input" placeholder="Enter your Cookie ID" value="" />
            <button class="cookie-id-save-btn" title="Save Cookie ID">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
          <span class="cookie-id-hint">Your marks are stored per Cookie ID</span>
        </div>
      </div>
      <div class="marks-content">
        <div class="marks-stats">
          <span class="marks-count"><strong id="marksCountDisplay">0</strong> / ${CONFIG.MARKS_LIMIT} marks</span>
          <button class="marks-export-btn" title="Export marks to JSON">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
        <div class="marks-list"></div>
      </div>
    `;

    document.body.appendChild(shell);

    // Set cookie ID value
    shell.querySelector('.cookie-id-input').value = getCookieId();

    // Event listeners
    shell.querySelector('.marks-close').addEventListener('click', toggleShell);
    
    const cookieInput = shell.querySelector('.cookie-id-input');
    const cookieSaveBtn = shell.querySelector('.cookie-id-save-btn');
    
    cookieSaveBtn.addEventListener('click', () => {
      const newId = cookieInput.value.trim();
      if (setCookieId(newId)) {
        showToast('Cookie ID saved');
        renderMarksList();
      } else {
        showToast('Invalid Cookie ID format');
      }
    });

    cookieInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        cookieSaveBtn.click();
      }
    });

    shell.querySelector('.marks-export-btn').addEventListener('click', exportMarks);

    return shell;
  }

  function createLauncher() {
    let launcher = document.getElementById('neoMarksLauncher');
    if (launcher) return launcher;

    launcher = document.createElement('button');
    launcher.id = 'neoMarksLauncher';
    launcher.className = 'marks-launcher';
    launcher.setAttribute('aria-label', 'Open marks');
    launcher.innerHTML = `
      <svg class="marks-launcher-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="marks-launcher-count">0</span>
    `;
    
    launcher.addEventListener('click', toggleShell);
    document.body.appendChild(launcher);
    
    return launcher;
  }

  function toggleShell() {
    const shell = getMarksShell();
    state.isShellOpen = !state.isShellOpen;
    
    if (state.isShellOpen) {
      shell.classList.add('show');
      renderMarksList();
      document.body.style.overflow = 'hidden';
    } else {
      shell.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
  
  // Auto-close marks shell on window resize (when shrinking horizontally)
  let resizeTimeout = null;
  let lastWindowWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentWidth = window.innerWidth;
      // Close shell if window is shrinking and shell is open
      if (state.isShellOpen && currentWidth < lastWindowWidth) {
        state.isShellOpen = false;
        const shell = getMarksShell();
        shell.classList.remove('show');
        document.body.style.overflow = '';
      }
      lastWindowWidth = currentWidth;
    }, 100);
  });

  function renderMarksList() {
    const shell = getMarksShell();
    const list = shell.querySelector('.marks-list');
    const countDisplay = document.getElementById('marksCountDisplay');
    const marks = loadMarks();
    
    countDisplay.textContent = marks.length;
    
    if (marks.length === 0) {
      list.innerHTML = `
        <div class="marks-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No marks yet</p>
          <span>Click the bookmark icon on any resource to save it here</span>
        </div>
      `;
      return;
    }
    
    list.innerHTML = marks.map(mark => {
      const faviconSrc = mark.favicon || getFaviconUrl(mark.url);
      return `
      <div class="mark-item" data-mark-id="${escapeHtml(mark.id)}">
        <div class="mark-item-icon">
          ${faviconSrc ? '<img src="' + escapeHtml(faviconSrc) + '" alt="" loading="lazy" decoding="async" />' : 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>'}
        </div>
        <div class="mark-item-content">
          <div class="mark-item-title">${escapeHtml(mark.title)}</div>
          <div class="mark-item-meta">
            <span class="mark-item-domain">${escapeHtml(mark.domain)}</span>
            <span class="mark-item-sep">•</span>
            <span class="mark-item-category">${escapeHtml(mark.category)}</span>
          </div>
        </div>
        <div class="mark-item-actions">
          <a class="mark-item-visit" href="${escapeHtml(mark.url)}" target="_blank" rel="noopener" title="Visit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <button class="mark-item-remove" data-remove-id="${escapeHtml(mark.id)}" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    }).join('');
    
    list.querySelectorAll('.mark-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const removeId = btn.dataset.removeId;
        if (!removeId) return;
        const marks = loadMarks().filter(m => m.id !== removeId);
        saveMarks(marks);
        renderMarksList();
        updateLauncherCount();
        showToast('Removed from marks');
        
        // Deselect the mark button on the card
        const markBtn = document.querySelector('.mark-icon-btn[data-mark-id="' + removeId + '"]');
        if (markBtn) {
          markBtn.classList.remove('is-marked');
          markBtn.setAttribute('aria-label', 'Save to marks');
          const svg = markBtn.querySelector('.bookmark-icon');
          if (svg) svg.setAttribute('fill', 'none');
        }
      });
    });
  }

  function exportMarks() {
    const marks = loadMarks();
    if (marks.length === 0) {
      showToast('No marks to export');
      return;
    }
    
    const data = {
      cookieId: getCookieId(),
      exportedAt: new Date().toISOString(),
      marksCount: marks.length,
      marks: marks
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neo-marks-' + getCookieId() + '-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Marks exported');
  }

  function updateLauncherCount() {
    const launcher = document.getElementById('neoMarksLauncher');
    if (!launcher) return;
    
    const count = loadMarks().length;
    const countBadge = launcher.querySelector('.marks-launcher-count');
    if (countBadge) {
      countBadge.textContent = count;
      countBadge.style.opacity = count > 0 ? '1' : '0';
    }
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

  // Enhanced bookmark button with outline → filled animation
  function createMarkButton(resource) {
    const marked = isMarked(resource.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mark-icon-btn' + (marked ? ' is-marked' : '');
    btn.dataset.markId = resource.id;
    btn.setAttribute('aria-label', marked ? 'Remove from marks' : 'Save to marks');
    
    btn.innerHTML = `
      <svg class="bookmark-icon" viewBox="0 0 24 24" fill="${marked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const success = toggleMark(resource);
      if (success) {
        const isNowMarked = isMarked(resource.id);
        updateButtonIcon(btn, isNowMarked);
        btn.classList.add('mark-pulse');
        setTimeout(() => btn.classList.remove('mark-pulse'), 300);
      }
    });
    
    return btn;
  }

  function updateButtonIcon(btn, marked) {
    if (!btn) return;
    
    btn.classList.toggle('is-marked', marked);
    btn.setAttribute('aria-label', marked ? 'Remove from marks' : 'Save to marks');
    
    const svg = btn.querySelector('.bookmark-icon');
    if (svg) {
      svg.setAttribute('fill', marked ? 'currentColor' : 'none');
    }
  }

  function enhanceCard(card) {
    if (!card || card.dataset.markEnhanced === '1') return;
    const href = card.getAttribute('href');
    if (!href || href === '#') return;
    
    card.dataset.markEnhanced = '1';
    card.classList.add('bookmark-card-enhanced');
    
    const resource = extractResource(card);
    
    // Add favicon badge (left side of card)
    const faviconUrl = getFaviconUrl(resource.url);
    if (faviconUrl) {
      const badge = document.createElement('div');
      badge.className = 'resource-favicon-badge';
      badge.innerHTML = '<img src="' + escapeHtml(faviconUrl) + '" alt="" loading="lazy" decoding="async" />';
      card.insertBefore(badge, card.firstChild);
    }
    
    const markBtn = createMarkButton(resource);
    card.appendChild(markBtn);
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

  function showToast(message) {
    const existing = document.querySelector('.neo-mark-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'neo-mark-toast';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--brand);color:white;padding:12px 24px;border-radius:24px;font-size:0.9rem;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.3);z-index:10001;animation:neoToastIn 0.3s ease;';
    
    document.body.appendChild(toast);
    
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      toast.style.animation = 'neoToastOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function showCookieNotice() {
    const closed = localStorage.getItem(CONFIG.COOKIE_NOTICE_KEY);
    if (closed === '1') return;
    
    const notice = document.createElement('div');
    notice.className = 'cookie-notice-banner';
    notice.innerHTML = `
      <span><strong>🍪 Cookie ID Setup:</strong> Your marks are stored per Cookie ID. Set a custom ID or use the auto-generated one.</span>
      <button class="cookie-notice-dismiss">Got it</button>
    `;
    notice.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 20px;font-size:0.85rem;color:var(--text-soft);display:flex;align-items:center;gap:16px;box-shadow:0 8px 32px rgba(0,0,0,0.3);z-index:9999;max-width:calc(100% - 32px);';
    
    notice.querySelector('.cookie-notice-dismiss').addEventListener('click', () => {
      localStorage.setItem(CONFIG.COOKIE_NOTICE_KEY, '1');
      notice.remove();
    });
    
    document.body.appendChild(notice);
  }

  function injectStyles() {
    if (document.getElementById('neoBookmarksEnhancementsStyle')) return;
    
    const style = document.createElement('style');
    style.id = 'neoBookmarksEnhancementsStyle';
    style.textContent = `
      @keyframes neoToastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      @keyframes neoToastOut { from { opacity: 1; transform: translateX(-50%) translateY(0); } to { opacity: 0; transform: translateX(-50%) translateY(20px); } }
      @keyframes markPulse { 0% { transform: translateY(-50%) scale(1); } 50% { transform: translateY(-50%) scale(1.2); } 100% { transform: translateY(-50%) scale(1); } }
      @keyframes markFill { 0% { fill: none; } 50% { fill: currentColor; } 100% { fill: currentColor; } }
      @keyframes shellSlideIn { from { right: -400px; } to { right: 0; } }
      @keyframes shellSlideOut { from { right: 0; } to { right: -400px; } }
      
      .bookmark-card, .featured-card { position: relative; overflow: visible; }
      .bookmark-card-enhanced { isolation: isolate; }
      .bookmark-card-enhanced .card-top {
        padding-left: 50px;
      }
      .bookmark-card-enhanced .card-content {
        padding-left: 8px;
      }
      
      /* Bookmark button - always clickable, outline to filled animation */
      .mark-icon-btn {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 5;
        padding: 0;
        color: var(--text-soft);
      }
      
      .mark-icon-btn:hover {
        background: var(--brand-soft);
        border-color: var(--brand);
        color: var(--brand);
        transform: translateY(-50%) scale(1.05);
      }
      
      .mark-icon-btn.is-marked {
        background: linear-gradient(135deg, rgba(255,210,84,0.25), rgba(255,160,64,0.22));
        border-color: rgba(255,206,85,0.5);
        color: #ffd86f;
      }
      
      .mark-icon-btn.is-marked:hover {
        background: linear-gradient(135deg, rgba(255,210,84,0.35), rgba(255,160,64,0.32));
        border-color: rgba(255,206,85,0.7);
      }
      
      .mark-icon-btn .bookmark-icon {
        width: 18px;
        height: 18px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .mark-icon-btn.is-marked .bookmark-icon {
        transform: scale(1.1);
      }
      
      .mark-icon-btn.mark-pulse {
        animation: markPulse 0.3s ease;
      }
      
      .mark-icon-btn.mark-pulse .bookmark-icon {
        animation: markFill 0.25s ease;
      }
      
      /* Mobile-first: button always visible */
      @media (max-width: 768px) {
        .mark-icon-btn {
          opacity: 1 !important;
          pointer-events: auto !important;
          width: 32px;
          height: 32px;
          right: 8px;
          top: 10px;
          transform: none;
        }
        .mark-icon-btn .bookmark-icon {
          width: 16px;
          height: 16px;
        }
        .bookmark-card .card-top {
          padding-right: 44px;
        }
      }
      
      /* Desktop: subtle visibility but always clickable */
      @media (min-width: 769px) {
        .mark-icon-btn {
          opacity: 0.7;
        }
        .bookmark-card:hover .mark-icon-btn,
        .bookmark-card:focus-within .mark-icon-btn {
          opacity: 1;
        }
      }
      
      /* Favicon badge */
      .resource-favicon-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        background: var(--glass-bg, rgba(255,255,255,0.08));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border, rgba(255,255,255,0.12));
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 4;
        overflow: hidden;
      }
      .resource-favicon-badge img {
        width: 18px;
        height: 18px;
        object-fit: contain;
        image-rendering: -webkit-optimize-contrast;
      }
      .resource-favicon-badge img {
        width: 16px;
        height: 16px;
        object-fit: contain;
        border-radius: 3px;
      }
      
      /* Marks shell/panel */
      .marks-shell {
        position: fixed;
        top: 0;
        right: -400px;
        width: 100%;
        max-width: 400px;
        height: 100vh;
        background: var(--bg-2);
        border-left: 1px solid var(--border);
        box-shadow: -10px 0 40px rgba(0,0,0,0.4);
        z-index: 10000;
        transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
      }
      
      .marks-shell.show {
        right: 0;
        animation: shellSlideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .marks-header {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }
      
      .marks-header-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .marks-title {
        font-family: "Space Grotesk", sans-serif;
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text);
      }
      
      .marks-close {
        width: 34px;
        height: 34px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-soft);
        transition: all 0.2s ease;
      }
      
      .marks-close:hover {
        background: var(--brand);
        border-color: var(--brand);
        color: white;
      }
      
      /* Cookie ID section */
      .cookie-id-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .cookie-id-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .cookie-id-input-wrapper {
        display: flex;
        gap: 8px;
      }
      
      .cookie-id-input {
        flex: 1;
        padding: 10px 14px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        font-size: 0.9rem;
        font-family: "Inter", sans-serif;
        transition: all 0.2s ease;
      }
      
      .cookie-id-input:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-soft);
      }
      
      .cookie-id-save-btn {
        width: 40px;
        height: 40px;
        background: var(--brand);
        border: none;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: all 0.2s ease;
      }
      
      .cookie-id-save-btn:hover {
        background: var(--brand-dark);
        transform: scale(1.05);
      }
      
      .cookie-id-save-btn svg {
        width: 18px;
        height: 18px;
      }
      
      .cookie-id-hint {
        font-size: 0.75rem;
        color: var(--text-dim);
      }
      
      /* Marks content */
      .marks-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }
      
      .marks-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding: 12px 16px;
        background: var(--surface);
        border-radius: 10px;
        border: 1px solid var(--border);
      }
      
      .marks-count {
        font-size: 0.85rem;
        color: var(--text-soft);
      }
      
      .marks-count strong {
        color: var(--brand-light);
        font-size: 1rem;
      }
      
      .marks-export-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text-soft);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .marks-export-btn:hover {
        background: var(--brand-soft);
        border-color: var(--brand);
        color: var(--brand);
      }
      
      .marks-export-btn svg {
        width: 16px;
        height: 16px;
      }
      
      .marks-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .mark-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      
      .mark-item:hover {
        border-color: var(--brand);
        background: var(--surface-2);
        transform: translateX(4px);
      }
      
      .mark-item-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--bg);
        display: grid;
        place-items: center;
        flex-shrink: 0;
        overflow: hidden;
      }
      
      .mark-item-icon img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
      
      .mark-item-icon svg {
        width: 20px;
        height: 20px;
        color: var(--text-dim);
      }
      
      .mark-item-content {
        flex: 1;
        min-width: 0;
      }
      
      .mark-item-title {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 4px;
      }
      
      .mark-item-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: var(--text-dim);
      }
      
      .mark-item-sep {
        color: var(--border-strong);
      }
      
      .mark-item-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .mark-item-visit,
      .mark-item-remove {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
        border: none;
        color: var(--text-soft);
      }
      
      .mark-item-visit {
        color: var(--brand-light);
      }
      
      .mark-item-visit:hover {
        background: var(--brand-soft);
        color: var(--brand);
      }
      
      .mark-item-remove:hover {
        background: rgba(255, 80, 80, 0.15);
        color: #ff5050;
      }
      
      .mark-item-visit svg,
      .mark-item-remove svg {
        width: 16px;
        height: 16px;
      }
      
      .marks-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        color: var(--text-dim);
      }
      
      .marks-empty svg {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      .marks-empty p {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-soft);
        margin-bottom: 8px;
      }
      
      .marks-empty span {
        font-size: 0.85rem;
      }
      
      /* Marks launcher button */
      .marks-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--brand), var(--brand-dark));
        border: none;
        display: grid;
        place-items: center;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(12, 132, 243, 0.35);
        z-index: 9998;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: white;
      }
      
      .marks-launcher:hover {
        transform: scale(1.1) rotate(-5deg);
        box-shadow: 0 12px 40px rgba(12, 132, 243, 0.45);
      }
      
      .marks-launcher-icon {
        width: 24px;
        height: 24px;
      }
      
      .marks-launcher-count {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 22px;
        height: 22px;
        border-radius: 11px;
        background: #ff5050;
        color: white;
        font-size: 0.7rem;
        font-weight: 700;
        display: grid;
        place-items: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: opacity 0.3s ease;
        opacity: 0;
      }
      
      /* Mobile responsive adjustments */
      @media (max-width: 768px) {
        .marks-shell {
          max-width: 100%;
        }
        
        .marks-launcher {
          bottom: 16px;
          right: 16px;
          width: 52px;
          height: 52px;
        }
        
        .cookie-notice-banner {
          bottom: 80px !important;
          padding: 12px 16px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  function initSessionSync() {
    window.addEventListener('storage', (e) => {
      if (e.key.startsWith(CONFIG.STORAGE_PREFIX)) {
        loadMarks();
        renderMarksList();
        updateLauncherCount();
        
        document.querySelectorAll('.mark-icon-btn').forEach(btn => {
          const markId = btn.dataset.markId;
          if (markId) {
            updateButtonIcon(btn, isMarked(markId));
          }
        });
      }
    });
  }

  function init() {
    injectStyles();
    getMarksShell();
    createLauncher();
    initSessionSync();
    loadMarks();
    updateLauncherCount();
    
    setTimeout(() => showCookieNotice(), 1500);
    
    refreshEnhancements();
    initObserver();
    
    console.log('[Neo Marks System v3] Initialized with Cookie ID:', getCookieId());
  }

  // Public API
  window.NeoMarks = {
    toggleMark,
    getMarks: loadMarks,
    setCookieId,
    getCookieId,
    exportMarks,
    refresh: refreshEnhancements,
    openPanel: () => { if (!state.isShellOpen) toggleShell(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();