/* ============================================================
   Kanyadet News Widget — toast ticker + bell icon/dropdown
   - Toasts keep cycling in the corner like before (card style)
   - Floating bell icon (bottom-right) opens a dropdown with
     category tabs (All/General/Education/KNEC/MOE/TSC) and a
     settings toggle to pick which categories feed the toasts
     and the dropdown list
   - Read/unread + category prefs persist in localStorage
   ============================================================ */

var READ_KEY = 'kanyadetReadNewsHeadlines';
var PREFS_KEY = 'kanyadetNewsCategoryPrefs';
var CATEGORY_PRIORITY = ['Education', 'MOE', 'TSC', 'General', 'KNEC'];

var NEWS_FEEDS = [
  { category: 'General',   url: 'https://news.google.com/rss?hl=en-KE&gl=KE&ceid=KE:en', limit: 6 },
  { category: 'Education', url: 'https://news.google.com/rss/search?q=education+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'KNEC',      url: 'https://news.google.com/rss/search?q=KNEC&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'MOE',       url: 'https://news.google.com/rss/search?q=%22Ministry+of+Education%22+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'TSC',       url: 'https://news.google.com/rss/search?q=TSC+Kenya+teachers&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 }
];

// Static fallback — used only if every live fetch fails
var FALLBACK_ITEMS = [
  { category: 'General', title: 'Thanks for being part of the Kanyadet Community! Your support matters.', link: null, pubDate: null },
  { category: 'General', title: 'Check the library for the latest new arrivals.', link: null, pubDate: null },
  { category: 'General', title: 'See the notice board for the current lunch menu.', link: null, pubDate: null },
  { category: 'General', title: 'Congratulations to our recent competition winners!', link: null, pubDate: null },
  { category: 'General', title: 'Check the website for the latest exam schedule.', link: null, pubDate: null }
];

/* ---------- icon set (inline SVG, no external font dependency) ---------- */
var ICONS = {
  bell: '<path d="M12 2a6 6 0 0 0-6 6v3.09c0 .4-.16.78-.44 1.06L4 14h16l-1.56-1.85A1.5 1.5 0 0 1 18 11.09V8a6 6 0 0 0-6-6z"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z"/><path d="M20 18H6.5a2.5 2.5 0 0 0 0 5H20"/>',
  trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M5 5H3v2a4 4 0 0 0 4 4"/><path d="M19 5h2v2a4 4 0 0 1-4 4"/><path d="M10 15h4v3h-4z"/><path d="M8 21h8"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  flag: '<path d="M4 21V4a1 1 0 0 1 1-1h12l-2 5 2 5H6a1 1 0 0 0-1 1v7"/>',
  megaphone: '<path d="M3 11v2a2 2 0 0 0 2 2h1l3 5h2l-1-5h4l6 4V6l-6 4H5a2 2 0 0 0-2 1z"/>'
};

var CATEGORY_ICON = {
  General: 'megaphone',
  Education: 'book',
  KNEC: 'calendar',
  MOE: 'flag',
  TSC: 'trophy'
};

function iconSvg(name) {
  var paths = ICONS[name] || ICONS.bell;
  return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
}

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

/* ---------- category selection (which feeds show, shared by toasts + dropdown) ---------- */
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
  if (!dateStr) return 'Just now';
  var diffMs = Date.now() - new Date(dateStr).getTime();
  var mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
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
function injectStyles() {
  if (document.getElementById('kanyadet-news-styles')) return;
  var style = document.createElement('style');
  style.id = 'kanyadet-news-styles';
  style.textContent =
    /* toast card (bottom-right ticker) */
    '.toast{position:fixed;right:16px;bottom:16px;z-index:9999;height:86px; background:#fff;' +
    'border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:12px;' +
    'border:1px solid #ececec;box-shadow:0 4px 16px rgba(0,0,0,0.08);' +
    'max-width:320px;font-family:inherit;opacity:0;transform:translateY(12px);' +
    'transition:opacity .35s ease,transform .35s ease;cursor:default;}' +
    '.toast.clickable{cursor:pointer;}' +
    '.toast-enter{opacity:1;transform:translateY(0);}' +
    '.toast-exit{opacity:0;transform:translateY(12px);}' +
    '.toast-icon{width:38px;height:38px;border-radius:50%;background:#f2f2f2;' +
    'display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#333;}' +
    '.toast-text{flex:1;min-width:0;}' +
    '.toast-title{font-weight:600;font-size:13.5px;margin:0;color:#1a1a1a;' +
    'line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;' +
    '-webkit-line-clamp:2;-webkit-box-orient:vertical;}' +
    '.toast-time{font-size:11.5px;color:#999;margin:2px 0 0;}' +
    /* bell icon + dropdown — light fintech-card theme */
    '#newsWidgetIcon { position: fixed; bottom: 20px; right: 2px; width: 48px; height: 48px; border-radius: 50%; background: #fff; color: #1a1a1a; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10060; box-shadow: 0 4px 14px rgba(0,0,0,0.12); border: 1px solid #ececec; }' +
    '.news-badge { position: absolute; top: -3px; right: -3px; background: #e63946; color: #fff; font-size: 10.5px; font-weight: 700; line-height: 1; padding: 3px 5px; border-radius: 999px; min-width: 16px; text-align: center; display: none; box-shadow: 0 0 0 2px #fff; }' +
    '#newsWidgetDropdown { position: fixed; bottom: 84px; right: 16px; width: 320px; max-width: calc(100vw - 32px); max-height: 400px; background: #f4f4f3; color: #1a1a1a; border-radius: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.18); z-index: 10059; display: none; flex-direction: column; overflow: hidden; border: 1px solid #ececec; }' +
    '.news-panel-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; background: #fff; border-bottom: 1px solid #f0f0f0; }' +
    '.news-panel-head h4 { color: #1a1a1a; font-size: 15px; font-weight: 600; margin: 0; }' +
    '.news-mark-all { color: #777; font-size: 11.5px; cursor: pointer; text-decoration: underline; }' +
    '.news-settings-btn { background: #f2f2f2; border: none; color: #1a1a1a; font-size: 11.5px; cursor: pointer; padding: 5px 10px; border-radius: 999px; }' +
    '.news-settings-panel { display: none; padding: 10px 18px 6px; background: #fff; border-bottom: 1px solid #f0f0f0; }' +
    '.news-settings-panel.open { display: block; }' +
    '.news-settings-panel label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #333; padding: 5px 0; cursor: pointer; }' +
    '.news-settings-panel input { accent-color: #1a1a1a; }' +
    '.news-tabs { display: flex; gap: 6px; flex-wrap: wrap; padding: 12px 18px 0; background: #f4f4f3; }' +
    '.news-tab { background: #fff; color: #555; border: 1px solid #ececec; padding: 4px 11px; border-radius: 999px; font-size: 11.5px; cursor: pointer; }' +
    '.news-tab.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; font-weight: 600; }' +
    '.news-list { overflow-y: auto; padding: 10px 12px 14px; flex: 1; background: #f4f4f3; }' +
    '.news-item { display: flex; align-items: center; gap: 10px; padding: 10px; margin-bottom: 8px; border-radius: 14px; background: #fff; color: #1a1a1a; text-decoration: none; border: 1px solid #f0f0f0; }' +
    '.news-item.unread { background: #fbfbfa; border-color: #e5e5e5; }' +
    '.news-item.unread::after { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #1a1a1a; flex-shrink: 0; }' +
    '.news-thumb { width: 34px; height: 34px; border-radius: 50%; background: #f2f2f2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #333; }' +
    '.news-item-text { flex: 1; min-width: 0; }' +
    '.news-item-title { font-size: 12.5px; font-weight: 500; line-height: 1.35; margin: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }' +
    '.news-source { display: block; font-size: 10.5px; color: #999; margin-top: 3px; }';
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

/* ---------- toast ticker (bottom-right, cycles continuously) ---------- */
var toastCycleIndex = 0;

function displayNextToast(allItems) {
  var pool = allItems.filter(function (item) {
    return getEnabledCategories().indexOf(item.category) !== -1;
  });
  if (!pool.length) {
    setTimeout(function () { displayNextToast(allItems); }, 30000);
    return;
  }

  var item = pool[toastCycleIndex % pool.length];
  toastCycleIndex++;

  var el = document.createElement('div');
  el.className = 'toast' + (item.link ? ' clickable' : '');
  el.innerHTML =
    '<div class="toast-icon">' + iconSvg(CATEGORY_ICON[item.category] || 'bell') + '</div>' +
    '<div class="toast-text">' +
      '<p class="toast-title"></p>' +
      '<p class="toast-time"></p>' +
    '</div>';
  el.querySelector('.toast-title').textContent = item.title; // safe text insert
  el.querySelector('.toast-time').textContent = timeAgo(item.pubDate);
  if (item.link) {
    el.addEventListener('click', function () {
      markHeadlineRead(item.title);
      window.open(item.link, '_blank', 'noopener');
    });
  }
  document.body.appendChild(el);

  requestAnimationFrame(function () { el.classList.add('toast-enter'); });

  setTimeout(function () {
    el.classList.remove('toast-enter');
    setTimeout(function () {
      el.classList.add('toast-exit');
      setTimeout(function () {
        el.remove();
        displayNextToast(allItems); // keep the ticker looping
      }, 1000); // exit animation duration
    }, 30000); // hold time before exit
  }, 8000); // entrance animation duration
}

/* ---------- bell icon + dropdown ---------- */
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
  icon.innerHTML = iconSvg('bell');
  document.body.appendChild(icon);

  var dropdown = document.createElement('div');
  dropdown.id = 'newsWidgetDropdown';
  dropdown.innerHTML =
    '<div class="news-panel-head"><h4>News</h4>' +
      '<span style="display:flex; align-items:center; gap:12px;">' +
        '<button class="news-settings-btn" type="button" aria-label="Choose categories">Categories</button>' +
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

      var thumb = document.createElement('div');
      thumb.className = 'news-thumb';
      thumb.innerHTML = iconSvg(CATEGORY_ICON[item.category] || 'bell');
      el.appendChild(thumb);

      var textWrap = document.createElement('div');
      textWrap.className = 'news-item-text';
      var titleEl = document.createElement('p');
      titleEl.className = 'news-item-title';
      titleEl.textContent = item.title;
      textWrap.appendChild(titleEl);
      if (metaBits.length) {
        var meta = document.createElement('span');
        meta.className = 'news-source';
        meta.textContent = metaBits.join(' \u00b7 ');
        textWrap.appendChild(meta);
      }
      el.appendChild(textWrap);
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
        saveEnabledCategories(current); // also reshapes the toast pool live
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
  injectStyles();
  var dropdown = buildIconAndDropdown();
  fetchAllNews().then(function (items) {
    renderNewsPanel(items, dropdown);
    updateUnreadUI(items);
    setTimeout(function () { displayNextToast(items); }, 10000); // toast ticker starts after initial delay
  });
}

window.addEventListener('load', initNewsWidget);