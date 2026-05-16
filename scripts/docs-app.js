// Hamburger menu elements
const hamburgerBtn = document.getElementById('hamburger-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const hamburgerOverlay = document.getElementById('hamburger-overlay');
const hamburgerClose = document.getElementById('hamburger-close');

function showHamburgerMenu() {
  hamburgerMenu.classList.add('show');
  hamburgerOverlay.classList.add('show');
}

function hideHamburgerMenu() {
  hamburgerMenu.classList.remove('show');
  hamburgerOverlay.classList.remove('show');
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', showHamburgerMenu);
if (hamburgerClose) hamburgerClose.addEventListener('click', hideHamburgerMenu);
if (hamburgerOverlay) hamburgerOverlay.addEventListener('click', hideHamburgerMenu);

// Data from Docs Page
const docsDataset = window.DOCS_DATA || [];

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}

setInterval(updateClock, 1000);
updateClock();

const themeToggle = document.getElementById('theme-toggle');

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });

    themeToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        themeToggle.click();
      }
    });
  }
}

const App = {
  config: {
    gridSelector: '#docs-grid',
    filterSelector: '#filter-container',
    countSelector: '#resource-count',
    searchSelector: '#search-input'
  },

  state: {
    rawData: [],
    currentFilter: 'all',
    searchQuery: ''
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return 'link';
    }
  },

  normalizeData(data) {
    const seen = new Set();

    return data.filter(item => {
      if (!item || !item.name || !item.link || !item.cat) return false;
      const key = `${item.name.trim().toLowerCase()}__${item.link.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  createCard(item, index) {
    const safeName = this.escapeHtml(item.name);
    const safeDesc = this.escapeHtml(item.desc);
    const safeCat = this.escapeHtml(item.cat);
    const safeLink = this.escapeHtml(item.link);
    const domain = this.getDomain(item.link);
    const delay = Math.min(index * 0.03, 0.6);

    return `
      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="bookmark-card" style="animation-delay: ${delay}s">
        <div class="card-top">
          <h3 class="card-title">${safeName}</h3>
          <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        </div>
        <div class="card-desc">${safeDesc}</div>
        <div class="card-meta">
          <span class="card-category">${safeCat}</span>
          <span class="card-domain">${domain}</span>
        </div>
      </a>
    `;
  },

  renderFilters(categories) {
    const container = document.querySelector(this.config.filterSelector);
    if (!container) return;

    container.innerHTML = categories.map(cat => {
      const isActive = cat === this.state.currentFilter;
      const label = cat === 'all' ? 'All' : cat;

      return `
        <button class="category-pill ${isActive ? 'active' : ''}" data-cat="${cat}">
          ${label}
        </button>
      `;
    }).join('');
  },

  renderGrid() {
    const grid = document.querySelector(this.config.gridSelector);
    const counter = document.querySelector(this.config.countSelector);
    if (!grid) return;

    const sorted = this.sortData([...this.state.rawData]);
    const filtered = this.filterData(sorted, this.state.currentFilter, this.state.searchQuery);

    if (counter) counter.textContent = filtered.length;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <p class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);">
          No resources found matching your criteria.
        </p>
      `;
      return;
    }

    grid.innerHTML = filtered.map((item, i) => this.createCard(item, i)).join('');
  },

  handleFilterClick(e) {
    const btn = e.target.closest('.category-pill');
    if (!btn) return;

    const category = btn.dataset.cat;
    this.state.currentFilter = category;

    document.querySelectorAll('.category-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === category);
    });

    this.renderGrid();
  },

  handleSearch(e) {
    this.state.searchQuery = e.target.value;
    this.renderGrid();
  },

  sortData(data) {
    return data.sort((a, b) =>
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    );
  },

  filterData(data, filter, query) {
    let filtered = data;

    if (filter !== 'all') {
      filtered = filtered.filter(item => (item.cat || '').toLowerCase() === filter.toLowerCase());
    }

    if (query) {
      const searchStr = query.toLowerCase();
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(searchStr) ||
        (item.desc || '').toLowerCase().includes(searchStr) ||
        (item.cat || '').toLowerCase().includes(searchStr)
      );
    }

    return filtered;
  },

  getCategories(data) {
    const cats = new Set();
    data.forEach(item => {
      if (item.cat) cats.add(item.cat);
    });

    const preferredOrder = [
      'Web Standards',
      'Frontend',
      'Backend',
      'Databases',
      'Cloud',
      'DevOps',
      'Security',
      'AI',
      'Mobile',
      'Systems',
      'APIs',
      'Testing',
      'Design'
    ];

    const sortedCats = Array.from(cats).sort((a, b) => {
      const ia = preferredOrder.indexOf(a);
      const ib = preferredOrder.indexOf(b);

      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return ['all', ...sortedCats];
  },

  init() {
    initTheme();
    this.state.rawData = this.normalizeData(docsDataset);

    const categories = this.getCategories(this.state.rawData);
    this.renderFilters(categories);
    this.renderGrid();

    const filterContainer = document.querySelector(this.config.filterSelector);
    if (filterContainer) {
      filterContainer.addEventListener('click', this.handleFilterClick.bind(this));
    }

    const searchInput = document.querySelector(this.config.searchSelector);
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}