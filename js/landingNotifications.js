/* ============================================================
   Kanyadet News Widget — standalone floating icon + dropdown
   - Floating bell icon (bottom-right), unread badge count
   - Click toggles a dropdown panel: tabs (All/General/
     Education/KNEC/MOE/TSC) + headline list
   - Read/unread tracked in localStorage so nothing repeats
     or gets lost across reloads
   ============================================================ */

var READ_KEY = 'kanyadetReadNewsHeadlines';
var PREFS_KEY = 'kanyadetNewsCategoryPrefs';
var CATEGORY_PRIORITY = ['Education', 'MOE', 'TSC', 'General', 'KNEC'];

var NEWS_FEEDS = [
  { category: 'General',   emoji: '📰', url: 'https://news.google.com/rss?hl=en-KE&gl=KE&ceid=KE:en', limit: 6 },
  { category: 'Education', emoji: '🎓', url: 'https://news.google.com/rss/search?q=education+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'KNEC',      emoji: '📝', url: 'https://news.google.com/rss/search?q=KNEC&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'MOE',       emoji: '🏛️', url: 'https://news.google.com/rss/search?q=%22Ministry+of+Education%22+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'TSC',       emoji: '👩‍🏫', url: 'https://news.google.com/rss/search?q=TSC+Kenya+teachers&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 }
];

// Static fallback — used only if every live fetch fails
var FALLBACK_ITEMS = [
  { category: 'General', emoji: '🎉', title: 'Thanks for being part of the Kanyadet Community! Your support matters.', link: null, pubDate: null },
  { category: 'General', emoji: '📚', title: 'Check the library for the latest new arrivals.', link: null, pubDate: null },
  { category: 'General', emoji: '🍎', title: 'See the notice board for the current lunch menu.', link: null, pubDate: null },
  { category: 'General', emoji: '🏆', title: 'Congratulations to our recent competition winners!', link: null, pubDate: null },
  { category: 'General', emoji: '📅', title: 'Check the website for the latest exam schedule.', link: null, pubDate: null }
];

/* ---------- read tracking ---------- */
function getReadHeadlines() {
  try { return JSON.parse(localStorage.getItem(READ_KEY)) || []; }
  catch (e) { return []; }
}

function markHeadlineRead(title) {
  var read = getReadHeadlines();
  if (read.indexOf(title) === -1) {
    read.push(title);
    localStorage.setItem(READ_KEY, JSON.stringify(read));
  }
}

function isRead(title) {
  return getReadHeadlines().indexOf(title) !== -1;
}

/* ---------- category selection (which feeds the user wants to see) ---------- */
function getEnabledCategories() {
  try {
    var stored = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (stored && stored.length) return stored;
  } catch (e) {}
  return CATEGORY_PRIORITY.slice();
}

function saveEnabledCategories(list) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(list));
}

function sortByCategoryPriority(items) {
  return items.slice().sort(function (a, b) {
    return CATEGORY_PRIORITY.indexOf(a.category) - CATEGORY_PRIORITY.indexOf(b.category);
  });
}

/* ---------- helpers ---------- */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  var diffMs = Date.now() - new Date(dateStr).getTime();
  var mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

function sourceFromLink(link) {
  if (!link) return '';
  try { return new URL(link).hostname.replace('www.', ''); }
  catch (e) { return ''; }
}

/* ---------- styles ---------- */
var CATEGORY_STAMP_COLORS = {
  General:   '#3a5a78',
  Education: '#1f7a5c',
  KNEC:      '#c0392b',
  MOE:       '#2b4c8c',
  TSC:       '#6b3fa0'
};

function injectNewsStyles() {
  if (document.getElementById('kanyadet-news-styles')) return;
  var style = document.createElement('style');
  style.id = 'kanyadet-news-styles';
  style.textContent =
    '#newsWidgetIcon { position: fixed; bottom: 84px; right: 2px; width: 54px; height: 54px; border-radius: 50%; background: #c0bfc0; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; z-index: 10060; box-shadow: 0 4px 14px rgba(0,0,0,0.3); }' +
    '.news-badge { position: absolute; top: -4px; right: -4px; background: #e63946; color: #fff; font-size: 11px; font-weight: 700; line-height: 1; padding: 3px 5px; border-radius: 999px; min-width: 16px; text-align: center; display: none; }' +
    '#newsWidgetDropdown { position: fixed; bottom: 88px; right: 24px; width: 320px; max-width: calc(100vw - 32px); max-height: 420px; background: #0a083d; color: #fff; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); z-index: 10059; display: none; flex-direction: column; overflow: hidden; }' +
    '.news-panel-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.1); }' +
    '.news-panel-head h4 { color: #fff; font-size: 15px; margin: 0; }' +
    '.news-mark-all { color: #ffd166; font-size: 12px; cursor: pointer; text-decoration: underline; }' +
    '.news-settings-btn { background: none; border: none; color: #ffd166; font-size: 14px; cursor: pointer; padding: 0; }' +
    '.news-settings-panel { display: none; padding: 10px 14px 4px; border-bottom: 1px solid rgba(255,255,255,0.1); }' +
    '.news-settings-panel.open { display: block; }' +
    '.news-settings-panel label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #fff; padding: 5px 0; cursor: pointer; }' +
    '.news-settings-panel input { accent-color: #ffd166; }' +
    '.news-tabs { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 14px 0; }' +
    '.news-tab { background: rgba(255,255,255,0.12); color: #fff; border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; }' +
    '.news-tab.active { background: #ffd166; color: #0a083d; font-weight: 700; }' +
    '.news-list { overflow-y: auto; padding: 10px 14px 14px; flex: 1; }' +
    '.news-item { display: block; padding: 8px 10px; margin-bottom: 6px; border-radius: 8px; background: rgba(255,255,255,0.08); color: #fff; text-decoration: none; font-size: 13px; }' +
    '.news-item.unread { background: rgba(255,209,102,0.18); border-left: 3px solid #ffd166; }' +
    '.news-item .news-source { display: block; font-size: 11px; opacity: 0.7; margin-top: 3px; }';
  document.head.appendChild(style);
}

/* ---------- data ---------- */
function fetchAllNews() {
  var fetches = NEWS_FEEDS.map(function (feed) {
    var apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
    return fetch(apiUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status === 'ok' && data.items && data.items.length) {
          return data.items.slice(0, feed.limit).map(function (item) {
            return {
              category: feed.category,
              emoji: feed.emoji,
              title: item.title,
              link: item.link,
              pubDate: item.pubDate
            };
          });
        }
        return [];
      })
      .catch(function () { return []; });
  });

  return Promise.all(fetches).then(function (results) {
    var seen = {};
    var combined = [];
    results.forEach(function (items) {
      items.forEach(function (item) {
        if (!seen[item.title]) {
          seen[item.title] = true;
          combined.push(item);
        }
      });
    });
    return combined.length ? combined : FALLBACK_ITEMS;
  }).catch(function () {
    return FALLBACK_ITEMS;
  });
}

/* ---------- rendering ---------- */
function renderBadge(unreadCount) {
  var icon = document.getElementById('newsWidgetIcon');
  if (!icon) return;
  var badge = icon.querySelector('.news-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'news-badge';
    icon.appendChild(badge);
  }
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

function buildIconAndDropdown() {
  var icon = document.createElement('div');
  icon.id = 'newsWidgetIcon';
  icon.innerHTML = '📰';
  document.body.appendChild(icon);

  var dropdown = document.createElement('div');
  dropdown.id = 'newsWidgetDropdown';
  dropdown.innerHTML =
    '<div class="news-panel-head"><h4>📰 News</h4>' +
      '<span style="display:flex; align-items:center; gap:12px;">' +
        '<button class="news-settings-btn" type="button" aria-label="Choose categories">⚙</button>' +
        '<span class="news-mark-all">Mark all as read</span>' +
      '</span>' +
    '</div>' +
    '<div class="news-settings-panel"></div>' +
    '<div class="news-tabs"></div>' +
    '<div class="news-list"></div>';
  document.body.appendChild(dropdown);

  icon.addEventListener('click', function () {
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  });

  document.addEventListener('click', function (event) {
    if (!dropdown.contains(event.target) && !icon.contains(event.target)) {
      dropdown.style.display = 'none';
    }
  });

  return dropdown;
}

function renderNewsPanel(items, dropdown) {
  var tabsEl = dropdown.querySelector('.news-tabs');
  var listEl = dropdown.querySelector('.news-list');
  var settingsPanel = dropdown.querySelector('.news-settings-panel');
  var settingsBtn = dropdown.querySelector('.news-settings-btn');

  function renderItemsList(list) {
    listEl.innerHTML = '';
    list.forEach(function (item) {
      var el = document.createElement('a');
      var unread = !isRead(item.title);
      el.className = 'news-item' + (unread ? ' unread' : '');
      el.href = item.link || '#';
      el.target = item.link ? '_blank' : '_self';
      el.rel = 'noopener';
      var metaBits = [];
      if (sourceFromLink(item.link)) metaBits.push(sourceFromLink(item.link));
      if (item.pubDate) metaBits.push(timeAgo(item.pubDate));
      el.innerHTML = item.emoji + ' ' + item.title +
        (metaBits.length ? '<span class="news-source">' + metaBits.join(' · ') + '</span>' : '');
      el.addEventListener('click', function () {
        markHeadlineRead(item.title);
        el.classList.remove('unread');
        updateUnreadUI(items);
      });
      listEl.appendChild(el);
    });
  }

  function renderList(filterCat) {
    var enabled = getEnabledCategories();
    var pool = items.filter(function (item) { return enabled.indexOf(item.category) !== -1; });
    if (filterCat === 'All') {
      renderItemsList(sortByCategoryPriority(pool));
    } else {
      renderItemsList(pool.filter(function (item) { return item.category === filterCat; }));
    }
  }

  function renderTabs() {
    tabsEl.innerHTML = '';
    var enabled = getEnabledCategories();
    var cats = ['All'].concat(CATEGORY_PRIORITY.filter(function (c) { return enabled.indexOf(c) !== -1; }));
    cats.forEach(function (cat, i) {
      var tab = document.createElement('button');
      tab.className = 'news-tab' + (i === 0 ? ' active' : '');
      tab.textContent = cat;
      tab.addEventListener('click', function () {
        tabsEl.querySelectorAll('.news-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        renderList(cat);
      });
      tabsEl.appendChild(tab);
    });
    renderList('All');
  }

  function renderSettings() {
    settingsPanel.innerHTML = '';
    var enabled = getEnabledCategories();
    CATEGORY_PRIORITY.forEach(function (cat) {
      var label = document.createElement('label');
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = enabled.indexOf(cat) !== -1;
      checkbox.addEventListener('change', function () {
        var current = getEnabledCategories();
        if (checkbox.checked) {
          if (current.indexOf(cat) === -1) current.push(cat);
        } else {
          current = current.filter(function (c) { return c !== cat; });
        }
        if (current.length === 0) {
          checkbox.checked = true;
          return;
        }
        saveEnabledCategories(current);
        renderTabs();
      });
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(cat));
      settingsPanel.appendChild(label);
    });
  }

  settingsBtn.addEventListener('click', function () {
    settingsPanel.classList.toggle('open');
  });

  renderSettings();
  renderTabs();

  dropdown.querySelector('.news-mark-all').addEventListener('click', function () {
    items.forEach(function (item) { markHeadlineRead(item.title); });
    listEl.querySelectorAll('.news-item').forEach(function (el) { el.classList.remove('unread'); });
    updateUnreadUI(items);
  });
}

function updateUnreadUI(items) {
  var unreadCount = items.filter(function (i) { return !isRead(i.title); }).length;
  renderBadge(unreadCount);
}

/* ---------- init ---------- */
function initNewsWidget() {
  injectNewsStyles();
  var dropdown = buildIconAndDropdown();
  fetchAllNews().then(function (items) {
    renderNewsPanel(items, dropdown);
    updateUnreadUI(items);
  });
}

window.addEventListener('load', initNewsWidget);