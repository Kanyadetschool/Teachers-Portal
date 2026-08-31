/* ============================================================
   Kanyadet News Widget — toast ticker + bell icon/dropdown
   - Toasts keep cycling in the corner like before (card style)
   - Floating bell icon (bottom-right) opens a dropdown with
     category tabs (All/General/Education/KNEC/MOE/TSC/Guidelines)
     and a settings toggle to pick which categories feed the toasts
     and the dropdown list
   - Read/unread + category prefs persist in localStorage
   ============================================================ */

var READ_KEY = 'kanyadetReadNewsHeadlines';
var PREFS_KEY = 'kanyadetNewsCategoryPrefs';
var LAST_VISIT_KEY = 'kanyadetNewsLastVisit';
var SOUND_PREF_KEY = 'kanyadetNewsSoundEnabled';
var SAVED_KEY = 'kanyadetNewsSaved';
var CATEGORY_PRIORITY = ['Education', 'MOE', 'TSC', 'General', 'Politics', 'KNEC', 'Guidelines'];

var NEWS_FEEDS = [
  { category: 'General',   url: 'https://news.google.com/rss?hl=en-KE&gl=KE&ceid=KE:en', limit: 6 },
  { category: 'Education', url: 'https://news.google.com/rss/search?q=education+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'KNEC',      url: 'https://news.google.com/rss/search?q=KNEC&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'MOE',       url: 'https://news.google.com/rss/search?q=%22Ministry+of+Education%22+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'TSC',       url: 'https://news.google.com/rss/search?q=TSC+Kenya+teachers&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 },
  { category: 'Politics',  url: 'https://news.google.com/rss/search?q=Kenya+politics&hl=en-KE&gl=KE&ceid=KE:en', limit: 4 }
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
  megaphone: '<path d="M3 11v2a2 2 0 0 0 2 2h1l3 5h2l-1-5h4l6 4V6l-6 4H5a2 2 0 0 0-2 1z"/>',
  landmark: '<path d="M3 21h18"/><path d="M5 21V10"/><path d="M9 21V10"/><path d="M15 21V10"/><path d="M19 21V10"/><path d="M2 10l10-6 10 6"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3z"/>',
  document: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/><path d="M9 13h6M9 17h6"/>'
};

var CATEGORY_ICON = {
  General: 'megaphone',
  Education: 'book',
  KNEC: 'calendar',
  MOE: 'flag',
  TSC: 'trophy',
  Politics: 'landmark',
  Guidelines: 'document'
};

// Rotates the same blue/teal/gold accents used throughout the site's
// notices across categories, so the list reads with a bit of variety
// instead of one flat color.
var CATEGORY_ACCENT = {
  General: 'gold',
  Education: 'blue',
  KNEC: 'teal',
  MOE: 'blue',
  TSC: 'gold',
  Politics: 'teal',
  Guidelines: 'gold'
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

/* ---------- saved/bookmarked headlines ---------- */
function getSavedHeadlines() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
  catch (e) { return []; }
}

function isSaved(title) {
  return getSavedHeadlines().indexOf(title) !== -1;
}

function toggleSaved(title) {
  var saved = getSavedHeadlines();
  var idx = saved.indexOf(title);
  if (idx === -1) { saved.push(title); } else { saved.splice(idx, 1); }
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch (e) {}
}

/* ---------- last-visit tracking (for the "new since last visit" divider) ---------- */
function getLastVisitTimestamp() {
  var stored = parseInt(localStorage.getItem(LAST_VISIT_KEY), 10);
  return isNaN(stored) ? 0 : stored;
}

function updateLastVisitTimestamp() {
  try { localStorage.setItem(LAST_VISIT_KEY, String(Date.now())); } catch (e) {}
}

function countNewUnreadSince(items, boundary) {
  return items.filter(function (item) {
    if (isRead(item.title)) return false;
    var t = item.pubDate ? new Date(item.pubDate).getTime() : 0;
    return t > boundary;
  }).length;
}

/* ---------- sound/vibration alert on new unread ---------- */
function isSoundEnabled() {
  return localStorage.getItem(SOUND_PREF_KEY) === '1';
}

function setSoundEnabled(on) {
  try { localStorage.setItem(SOUND_PREF_KEY, on ? '1' : '0'); } catch (e) {}
}

function playUnreadAlert() {
  if (!isSoundEnabled()) return;
  try {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      var ctx = new Ctx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch (e) {}
  if (navigator.vibrate) {
    try { navigator.vibrate(120); } catch (e) {}
  }
}

/* Debounces alert triggers so a burst of new items (e.g. several arriving
   from a refresh in quick succession) fires one alert instead of one per
   call. Callers pass how many new items they're reporting; counts pile up
   until the debounce window elapses, then a single alert fires. */
var pendingNewAlertCount = 0;
var alertDebounceTimer = null;
var ALERT_DEBOUNCE_MS = 1500;

function queueUnreadAlert(newCount) {
  if (!newCount) return;
  pendingNewAlertCount += newCount;
  if (alertDebounceTimer) clearTimeout(alertDebounceTimer);
  alertDebounceTimer = setTimeout(function () {
    playUnreadAlert();
    pendingNewAlertCount = 0;
    alertDebounceTimer = null;
  }, ALERT_DEBOUNCE_MS);
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
    /* Shared tokens — same palette/type system as the security notice
       (wm-security-notice.js): soft white/gold gradient, Fraunces
       headline, Plus Jakarta Sans body, blue/teal/gold accents. */
    ':root{--nw-blue:#2980b9;--nw-blue-dk:#1a5276;--nw-teal:#16a085;--nw-gold:#f39c12;' +
    '--nw-chip:#f3f5f8;--nw-border:rgba(20,30,45,.08);--nw-border-strong:rgba(20,30,45,.14);' +
    '--nw-text:#101c2c;--nw-text2:#5b6472;--nw-text3:#98a0ac;' +
    '--nw-card-shadow:0 20px 48px -16px rgba(30,50,80,.26),0 6px 16px -8px rgba(41,128,185,.14);}' +
    /* toast card (bottom-right ticker) */
    '.toast{position:fixed;left:5px;top:0px;z-index:99999;min-height:86px;' +
    'background:linear-gradient(160deg,#ffffff,#f8f1e3 130%);' +
    'border-radius:18px;padding:12px 16px 12px 14px;display:flex;align-items:center;gap:12px;' +
    'border:1px solid var(--nw-border-strong);box-shadow:var(--nw-card-shadow);' +
    'max-width:320px;font-family:"Plus Jakarta Sans",-apple-system,sans-serif;opacity:0;transform:translateY(12px);' +
    'transition:opacity .35s ease,transform .35s ease;cursor:default;overflow:hidden;}' +
    '.toast::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;' +
    'background:linear-gradient(90deg,var(--nw-blue),var(--nw-teal) 55%,var(--nw-gold));}' +
    '.toast.clickable{cursor:pointer;}' +
    '.toast-enter{opacity:1;transform:translateY(0);}' +
    '.toast-exit{opacity:0;transform:translateY(12px);}' +
    '.toast-icon{width:38px;height:38px;border-radius:50%;' +
    'background:linear-gradient(135deg,var(--nw-blue),var(--nw-blue-dk));' +
    'display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;}' +
    '.toast-text{flex:1;min-width:0;}' +
    '.toast-title{font-weight:700;font-size:13.5px;margin:0;color:var(--nw-text);' +
    'line-height:1.35;font-family:"Plus Jakarta Sans",-apple-system,sans-serif;}' +
    '.toast-time{font-size:11.5px;color:var(--nw-text3);margin:2px 0 0;font-family:"Plus Jakarta Sans",-apple-system,sans-serif;}' +
    /* bell icon + dropdown — same soft gradient card as the notice */
    '#newsWidgetIcon { position: fixed; bottom: 20px; left: 5px; width: 48px; height: 48px; border: none; border-radius: 50%; background: linear-gradient(135deg,var(--nw-blue),var(--nw-blue-dk)); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10060; box-shadow: 0 10px 24px -6px rgba(41,128,185,.45); }' +
    '.news-badge { position: absolute; top: -3px; right: -3px; background: linear-gradient(135deg,var(--nw-gold),#d9840b); color: #fff; font-size: 10.5px; font-weight: 700; line-height: 1; padding: 3px 5px; border-radius: 999px; min-width: 16px; text-align: center; display: none; box-shadow: 0 0 0 2px #fff; }' +
    '#newsWidgetDropdown { position: fixed; bottom: 84px; left: 16px; width: 320px; max-width: calc(100vw - 32px); max-height: 400px; background: linear-gradient(160deg,#ffffff,#f8f1e3 130%); color: var(--nw-text); border-radius: 22px; box-shadow: var(--nw-card-shadow); z-index:999999999; display: none; flex-direction: column; overflow: hidden; border: 1px solid var(--nw-border-strong); font-family: "Plus Jakarta Sans", -apple-system, sans-serif; }' +
    '#newsWidgetDropdown::before { content: ""; display: block; height: 4px; flex-shrink: 0; background: linear-gradient(90deg,var(--nw-blue),var(--nw-teal) 55%,var(--nw-gold)); }' +
    '.news-panel-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px 14px; background: transparent; border-bottom: 1px solid var(--nw-border); }' +
    '.news-panel-head h4 { color: var(--nw-text); font-size: 17px; font-weight: 600; margin: 0; font-family: "Fraunces", serif; letter-spacing: -.2px; }' +
    '.news-mark-all { color: var(--nw-blue); font-size: 11.5px; font-weight: 600; cursor: pointer; text-decoration: none; }' +
    '.news-mark-all:hover { text-decoration: underline; }' +
    '.news-settings-btn { background: var(--nw-chip); border: 1px solid var(--nw-border); color: var(--nw-blue-dk); font-size: 11px; font-weight: 700; cursor: pointer; padding: 5px 11px; border-radius: 999px; }' +
    '.news-settings-panel { display: none; padding: 12px 18px 8px; background: transparent; border-bottom: 1px solid var(--nw-border); }' +
    '.news-settings-panel.open { display: block; }' +
    '.news-settings-panel label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--nw-text2); padding: 5px 0; cursor: pointer; }' +
    '.news-settings-panel input { accent-color: var(--nw-blue); }' +
    '.news-tabs { display: flex; gap: 6px; flex-wrap: wrap; padding: 12px 18px 0; background: transparent; }' +
    '.news-tab { background: #fff; color: var(--nw-text2); border: 1px solid var(--nw-border); padding: 4px 11px; border-radius: 999px; font-size: 11.5px; font-weight: 600; cursor: pointer; }' +
    '.news-tab.active { background: linear-gradient(135deg,var(--nw-blue),var(--nw-blue-dk)); color: #fff; border-color: transparent; font-weight: 700; }' +
    '.news-list { overflow-y: auto; padding: 12px 14px 16px; flex: 1; background: transparent; }' +
    '.news-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 13px; margin-bottom: 8px; border-radius: 14px; background: var(--nw-chip); color: var(--nw-text); text-decoration: none; border: 1px solid var(--nw-border); transition: border-color .15s ease, background .15s ease; }' +
    '.news-item:hover { border-color: var(--nw-border-strong); background: #eef1f4; }' +
    '.news-item.unread { background: #fff; border-color: rgba(41,128,185,.22); }' +
    '.news-item.unread::after { content: ""; position: absolute; top: 12px; right: 12px; width: 7px; height: 7px; border-radius: 50%; background: var(--nw-blue); flex-shrink: 0; }' +
    '.news-thumb { width: 34px; height: 34px; border-radius: 50%; background: rgba(41,128,185,.14); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--nw-blue); }' +
    '.news-thumb-teal { background: rgba(22,160,133,.15); color: var(--nw-teal); }' +
    '.news-thumb-gold { background: rgba(243,156,18,.16); color: var(--nw-gold); }' +
    '.news-item-text { flex: 1; min-width: 0; }' +
    '.news-item-title { font-size: 12.5px; font-weight: 600; line-height: 1.35; margin: 0; color: var(--nw-text); }' +
    '.news-source { display: block; font-size: 10.5px; color: var(--nw-text3); margin-top: 3px; }' +
    '.news-divider { position: relative; text-align: center; margin: 12px 0 10px; }' +
    '.news-divider::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--nw-border); }' +
    '.news-divider span { position: relative; background: #fbf7ee; padding: 0 8px; font-size: 10px; font-weight: 800; color: var(--nw-blue-dk); text-transform: uppercase; letter-spacing: .1em; font-family: "Plus Jakarta Sans", sans-serif; }' +
    '.news-sound-toggle { border-top: 1px solid var(--nw-border); margin-top: 4px; padding-top: 8px !important; }' +
    '.news-pin { background: none; border: none; padding: 4px; margin: 0; flex-shrink: 0; color: var(--nw-text3); cursor: pointer; display: flex; align-items: center; justify-content: center; }' +
    '.news-pin.pinned { color: var(--nw-gold); }';
  document.head.appendChild(style);
}

/* ---------- KNEC official pages (plain HTML, not RSS — scraped client-side) ----------
   These knec.ac.ke pages don't expose feeds, so each is fetched through a CORS proxy (KNEC's
   server sends no Access-Control-Allow-Origin header, so a direct browser fetch always fails —
   we go straight to the proxy instead of wasting a doomed request) and parsed the same way:
   KNEC's theme prefixes each item with a label ("News", "Guidelines", ...) and ends it with a
   "Read more" link — we strip both to get the title. Neither page publishes dates, so these
   items carry pubDate:null like the static fallback items do — no time badge shown, intentional. */
var KNEC_PAGES = [
  { url: 'https://www.knec.ac.ke/news-2/', category: 'KNEC', label: 'News' },
  { url: 'https://www.knec.ac.ke/category/guidelines/', category: 'Guidelines', label: 'Guidelines' }
];
var KNEC_ORIGIN = 'https://www.knec.ac.ke/';
var KNEC_CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url='
];
var KNEC_ITEM_LIMIT = 8;

function fetchKnecHtml(url) {
  return fetch(url, { cache: 'no-store' }).then(function (res) {
    if (!res.ok) throw new Error('bad status');
    return res.text();
  });
}

function parseKnecHtml(html, category, label) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var items = [];
  var seen = {};

  var links = Array.prototype.slice.call(doc.querySelectorAll('a'));
  links.forEach(function (a) {
    var text = (a.textContent || '').trim().toLowerCase();
    if (text.indexOf('read more') !== 0) return; // KNEC's own "Read more" link text

    var href = a.getAttribute('href');
    if (!href) return;
    try { href = new URL(href, KNEC_ORIGIN).toString(); } catch (e) { return; }

    var title = extractKnecTitle(a, label);
    if (!title || seen[title]) return;
    seen[title] = true;
    items.push({ category: category, title: title, link: href, pubDate: null });
  });

  return items.slice(0, KNEC_ITEM_LIMIT);
}

// Walks up from a "Read more" link to the smallest ancestor whose text, once the
// leading category label and trailing "Read more" are stripped, looks like a real title.
function extractKnecTitle(anchor, label) {
  var labelPattern = new RegExp('^\\s*' + label + '\\s+', 'i');
  var containerSelectors = ['li', 'article', '.post', '.entry', 'div'];
  for (var i = 0; i < containerSelectors.length; i++) {
    var container = anchor.closest(containerSelectors[i]);
    if (!container) continue;
    var text = (container.textContent || '')
      .replace(labelPattern, '')
      .replace(/\s*Read more.*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length > 5 && text.length < 200) return text;
  }
  return null;
}

// Tries each CORS proxy in turn (rather than a direct fetch, which KNEC's server always
// rejects) so one proxy being down or rate-limited doesn't take the whole category out.
function fetchViaProxies(url, proxies) {
  if (!proxies.length) return Promise.reject(new Error('all proxies failed'));
  var proxied = proxies[0] + encodeURIComponent(url) + '&_=' + Date.now();
  return fetchKnecHtml(proxied).catch(function () {
    return fetchViaProxies(url, proxies.slice(1));
  });
}

function fetchKnecPage(page) {
  return fetchViaProxies(page.url, KNEC_CORS_PROXIES)
    .then(function (html) { return parseKnecHtml(html, page.category, page.label); })
    .catch(function () { return []; });
}

function fetchAllKnecPages() {
  return Promise.all(KNEC_PAGES.map(fetchKnecPage)).then(function (results) {
    return results.reduce(function (all, items) { return all.concat(items); }, []);
  });
}

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

  fetches.push(fetchAllKnecPages());

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
    var opening = dropdown.style.display !== 'flex';
    dropdown.style.display = opening ? 'flex' : 'none';
    if (opening) updateLastVisitTimestamp();
  });

  document.addEventListener('click', function (event) {
    if (!dropdown.contains(event.target) && !icon.contains(event.target)) {
      dropdown.style.display = 'none';
    }
  });

  return dropdown;
}

function renderNewsPanel(items, dropdown, sessionBoundary) {
  var tabsEl = dropdown.querySelector('.news-tabs');
  var listEl = dropdown.querySelector('.news-list');
  var settingsPanel = dropdown.querySelector('.news-settings-panel');
  var settingsBtn = dropdown.querySelector('.news-settings-btn');

  function itemTime(item) {
    return item.pubDate ? new Date(item.pubDate).getTime() : 0;
  }

  var activeFilter = 'All';

  function renderItemsList(list) {
    listEl.innerHTML = '';
    var sorted = list.slice().sort(function (a, b) { return itemTime(b) - itemTime(a); });
    var seenNew = false;
    var dividerInserted = false;
    sorted.forEach(function (item) {
      var isNewSinceVisit = itemTime(item) > sessionBoundary;
      if (isNewSinceVisit) seenNew = true;
      if (!isNewSinceVisit && seenNew && !dividerInserted) {
        var divider = document.createElement('div');
        divider.className = 'news-divider';
        var dividerLabel = document.createElement('span');
        dividerLabel.textContent = 'New since last visit';
        divider.appendChild(dividerLabel);
        listEl.appendChild(divider);
        dividerInserted = true;
      }
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
      var accent = CATEGORY_ACCENT[item.category];
      thumb.className = 'news-thumb' + (accent && accent !== 'blue' ? ' news-thumb-' + accent : '');
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

      var pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.className = 'news-pin' + (isSaved(item.title) ? ' pinned' : '');
      pinBtn.setAttribute('aria-label', isSaved(item.title) ? 'Remove from saved' : 'Save for later');
      pinBtn.innerHTML = iconSvg('bookmark');
      pinBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleSaved(item.title);
        var nowSaved = isSaved(item.title);
        pinBtn.classList.toggle('pinned', nowSaved);
        pinBtn.setAttribute('aria-label', nowSaved ? 'Remove from saved' : 'Save for later');
        if (activeFilter === 'Saved') renderList('Saved');
      });
      el.appendChild(pinBtn);

      el.addEventListener('click', function () {
        markHeadlineRead(item.title);
        el.classList.remove('unread');
        updateUnreadUI(items);
      });
      listEl.appendChild(el);
    });
  }

  function renderList(filterCat) {
    activeFilter = filterCat;
    if (filterCat === 'Saved') {
      renderItemsList(items.filter(function (item) { return isSaved(item.title); }));
      return;
    }
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
    var cats = ['All'].concat(CATEGORY_PRIORITY.filter(function (c) { return enabled.indexOf(c) !== -1; })).concat(['Saved']);
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

    var soundLabel = document.createElement('label');
    soundLabel.className = 'news-sound-toggle';
    var soundCheckbox = document.createElement('input');
    soundCheckbox.type = 'checkbox';
    soundCheckbox.checked = isSoundEnabled();
    soundCheckbox.addEventListener('change', function () {
      setSoundEnabled(soundCheckbox.checked);
      if (soundCheckbox.checked) playUnreadAlert(); // quick preview so they know it's on
    });
    soundLabel.appendChild(soundCheckbox);
    soundLabel.appendChild(document.createTextNode('Sound & vibration alerts'));
    settingsPanel.appendChild(soundLabel);
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
  var sessionBoundary = getLastVisitTimestamp(); // captured before this visit updates it
  var dropdown = buildIconAndDropdown();
  fetchAllNews().then(function (items) {
    renderNewsPanel(items, dropdown, sessionBoundary);
    updateUnreadUI(items);
    var newCount = countNewUnreadSince(items, sessionBoundary);
    if (newCount > 0) {
      queueUnreadAlert(newCount);
    }
    setTimeout(function () { displayNextToast(items); }, 10000); // toast ticker starts after initial delay
  });
}

window.addEventListener('load', initNewsWidget);