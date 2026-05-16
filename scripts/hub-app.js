const data = window.BOOKMARKS_DATA || [];

const loader = document.getElementById('loader');
const searchInput = document.getElementById('search-input');
const categoriesContainer = document.getElementById('categories');
const featuredSection = document.getElementById('featured-section');
const mainContent = document.getElementById('main-content');
const visibleCount = document.getElementById('visible-count');
const totalCount = document.getElementById('total-count');
const hubInlineNotices = document.getElementById('hub-inline-notices');
const themeToggle = document.getElementById('theme-toggle');
const hamburgerBtn = document.getElementById('hamburger-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const hamburgerOverlay = document.getElementById('hamburger-overlay');
const hamburgerClose = document.getElementById('hamburger-close');

let activeCategories = new Set();
let searchQuery = '';
let showAll = false;
let categoryClickTimer = 0;
const HUB_ONION_NOTICE_KEY = 'hub_onion_notice_closed';

const featuredData = [
  { name: 'Docs', desc: 'Documentation', link: 'docs.html', icon: 'file-text' },
  { name: 'Files', desc: 'Downloads', link: 'files.html', icon: 'download' },
  { name: 'GitHub', desc: 'Source', link: 'https://github.com/bookmarks-cih', icon: 'github' },
  { name: 'Creators & Curators', desc: 'Curated Profiles', link: 'creators.html', icon: 'users', size: 'large' },
  { name: 'Jobs', desc: 'Careers', link: 'jobs.html', icon: 'briefcase' },
  { name: 'News', desc: 'Updates', link: 'news.html', icon: 'newspaper' },
  { name: 'Support', desc: 'Donate', link: 'https://ko-fi.com/bookmarks', icon: 'heart' }
];

const icons = {
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  'newspaper': '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>',
  'github': '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
};

function updateClock() {
  const now = new Date();
  document.getElementById('clock-time').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const knob = themeToggle.querySelector('svg');
  
  function updateIcon(theme) {
    if (theme === 'dark') {
      knob.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    } else {
      knob.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }

  updateIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
  });
  
  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      themeToggle.click();
    }
  });
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    return 'link';
  }
}

function createCard(item, index) {
  const card = document.createElement('a');
  card.className = 'bookmark-card';
  card.href = item.link || '#';
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.style.animationDelay = `${Math.min(index, 8) * 0.03}s`;
  
  card.innerHTML = `
    <div class="card-top">
      <div class="card-title">${item.name}</div>
      <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="7" y1="17" x2="17" y2="7"/>
        <polyline points="7 7 17 7 17 17"/>
      </svg>
    </div>
    <div class="card-desc">${item.desc || ''}</div>
    <div class="card-meta">
      <span class="card-category">${item.cat}</span>
      <span class="card-domain">${getDomain(item.link)}</span>
    </div>
  `;
  
  return card;
}

function renderFeatured() {
  featuredSection.innerHTML = '';
  
  if (activeCategories.size > 0 || searchQuery) {
    return;
  }
  
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = '<div class="section-title">Featured</div>';
  featuredSection.appendChild(header);
  
  const grid = document.createElement('div');
  grid.className = 'featured-grid';
  
  featuredData.forEach((item, i) => {
    const card = document.createElement('a');
    card.className = 'featured-card';
    if (item.size === 'large') {
        card.classList.add('large');
    }
    
    card.href = item.link;
    card.target = item.link.startsWith('http') ? '_blank' : '_self';
    card.rel = 'noopener noreferrer';
    card.style.animationDelay = `${i * 0.04}s`;
    
    card.innerHTML = `
      <div class="featured-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${icons[item.icon] || ''}
        </svg>
      </div>
      <div class="featured-title">${item.name}</div>
      <div class="featured-desc">${item.desc}</div>
    `;
    
    grid.appendChild(card);
  });
  
  featuredSection.appendChild(grid);
}

function render() {
  const filtered = data.filter(item => {
    const matchCat = activeCategories.size === 0 || activeCategories.has(item.cat);
    const searchStr = `${item.name} ${item.cat} ${item.desc || ''}`.toLowerCase();
    const matchSearch = searchStr.includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
  
  visibleCount.textContent = filtered.length;
  totalCount.textContent = data.length;
  
  renderFeatured();
  
  if (filtered.length === 0) {
    mainContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div class="empty-text">No results for <span class="empty-query">"${searchQuery}"</span></div>
      </div>
    `;
    return;
  }
  
  const limit = 12;
  const displayItems = showAll ? filtered : filtered.slice(0, limit);
  const hasMore = filtered.length > limit && !showAll;
  
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = '<div class="section-title">Bookmarks</div>';
  mainContent.innerHTML = '';
  mainContent.appendChild(header);
  
  const grid = document.createElement('div');
  grid.className = 'bookmarks-grid';
  
  displayItems.forEach((item, i) => {
    grid.appendChild(createCard(item, i));
  });
  
  mainContent.appendChild(grid);
  
  if (hasMore) {
    const wrapper = document.createElement('div');
    wrapper.className = 'show-more-wrapper';
    
    const btn = document.createElement('button');
    btn.className = 'show-more-btn';
    btn.textContent = `Show ${filtered.length - limit} more`;
    btn.onclick = () => {
      showAll = true;
      render();
    };
    
    wrapper.appendChild(btn);
    mainContent.appendChild(wrapper);
  }
}

function syncCategoryButtons() {
  categoriesContainer.querySelectorAll('.category-pill').forEach(b => {
    const isActive = (b.dataset.cat === 'all' && activeCategories.size === 0) ||
                     activeCategories.has(b.dataset.cat);
    b.classList.toggle('active', isActive);
  });
}

function renderHubNotices() {
  if (!hubInlineNotices) return;
  const onionActive = Array.from(activeCategories).some(cat => cat.toLowerCase() === 'onion mirror');
  const onionClosed = sessionStorage.getItem(HUB_ONION_NOTICE_KEY) === '1';
  const notices = [];

  if (onionActive && !onionClosed) {
    notices.push(`
      <div class="hub-inline-notice warn" data-notice="onion">
        <strong>Onion mirror selected.</strong> These are deepweb / Tor links. It’s normal if they do not open in a standard browser.
        <button class="hub-inline-notice-close" type="button" data-close-notice="onion" aria-label="Close">×</button>
      </div>
    `);
  }

  if (activeCategories.size === 1) {
    notices.push(`
      <div class="hub-inline-notice" data-notice="multicat-hint">
        <strong>Tip:</strong> single click replaces the current category. <strong>Double-click</strong> another category if you really want to stack filters.
      </div>
    `);
  }

  hubInlineNotices.innerHTML = notices.join('');
  hubInlineNotices.querySelectorAll('[data-close-notice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-close-notice');
      if (key === 'onion') sessionStorage.setItem(HUB_ONION_NOTICE_KEY, '1');
      renderHubNotices();
    });
  });
}

function initCategories() {
  const counts = {};
  data.forEach(item => {
    counts[item.cat] = (counts[item.cat] || 0) + 1;
  });
  
  const allBtn = document.createElement('button');
  allBtn.className = 'category-pill active';
  allBtn.textContent = 'All';
  allBtn.dataset.cat = 'all';
  categoriesContainer.appendChild(allBtn);
  
  Object.keys(counts).sort().forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-pill';
    btn.dataset.cat = cat;
    btn.title = 'Single click = replace filter · Double-click = stack filters';
    btn.innerHTML = `${cat} <span class="count">${counts[cat]}</span>`;
    categoriesContainer.appendChild(btn);
  });
  
  categoriesContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-pill');
    if (!btn) return;
    const cat = btn.dataset.cat;
    clearTimeout(categoryClickTimer);
    categoryClickTimer = setTimeout(() => {
      if (cat === 'all') {
        activeCategories.clear();
      } else if (activeCategories.has(cat)) {
        activeCategories.delete(cat);
      } else {
        activeCategories.clear();
        activeCategories.add(cat);
      }
      syncCategoryButtons();
      renderHubNotices();
      showAll = false;
      render();
    }, 220);
  });

  categoriesContainer.addEventListener('dblclick', (e) => {
    const btn = e.target.closest('.category-pill');
    if (!btn) return;
    const cat = btn.dataset.cat;
    if (!cat || cat === 'all') return;
    clearTimeout(categoryClickTimer);
    if (!activeCategories.has(cat)) {
      activeCategories.add(cat);
    }
    syncCategoryButtons();
    renderHubNotices();
    showAll = false;
    render();
  });
  renderHubNotices();
}

let searchTimeout = null;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = e.target.value.trim();
    showAll = false;
    render();
  }, 200);
});

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
  if (e.key === 'Escape') {
    searchInput.blur();
    searchInput.value = '';
    searchQuery = '';
    showAll = false;
    render();
    hideHamburgerMenu();
  }
});

function showHamburgerMenu() {
  hamburgerMenu.classList.add('show');
  hamburgerOverlay.classList.add('show');
}

function hideHamburgerMenu() {
  hamburgerMenu.classList.remove('show');
  hamburgerOverlay.classList.remove('show');
}

hamburgerBtn.addEventListener('click', showHamburgerMenu);
hamburgerClose.addEventListener('click', hideHamburgerMenu);
hamburgerOverlay.addEventListener('click', hideHamburgerMenu);

function init() {
  initTheme();

  if (Array.isArray(data) && data.length > 0) {
    console.log('Data loaded:', data.length, 'items');
    initCategories();
    render();
  } else {
    console.warn('No bookmark data found for hub.');
    visibleCount.textContent = '0';
    totalCount.textContent = '0';
    featuredSection.innerHTML = '';
    mainContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v5"></path>
            <path d="M12 16h.01"></path>
          </svg>
        </div>
        <div class="empty-text">Hub data could not be loaded.</div>
      </div>
    `;
  }

  setTimeout(() => {
    loader.classList.add('hidden');
  }, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}