// Static fallback — used only if the live news fetch below fails
var notifications = [
  '🎉 Thanks for being part of the Kanyadet Community! Your support matters.',
  '📚 Check the library for the latest new arrivals.',
  '🍎 See the notice board for the current lunch menu.',
  '🏆 Congratulations to our recent competition winners!',
  '🌳 Remember to keep our compound clean and green.',
  '📅 Check the website for the latest exam schedule.',
  '🗓️ Calendar updated — check the website for term dates.',
  '🏆 Watch this space for upcoming Awards Ceremony details.'
];

var SEEN_KEY = 'kanyadetSeenNewsHeadlines';

function getSeenHeadlines() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function markHeadlineSeen(headline) {
  var seen = getSeenHeadlines();
  if (seen.indexOf(headline) === -1) {
    seen.push(headline);
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  }
}

var notificationIndex = 0;

function displayNotification() {
  if (notificationIndex < notifications.length) {
    var notification = notifications[notificationIndex];
    markHeadlineSeen(notification);

    var notificationElement = document.createElement("div");
    notificationElement.classList.add("toast");
    notificationElement.innerText = notification;
    document.body.appendChild(notificationElement);

    notificationElement.classList.add("toast-enter");
    setTimeout(function () {
      notificationElement.classList.remove("toast-enter");
      setTimeout(function () {
        notificationElement.classList.add("toast-exit");
        setTimeout(function () {
          notificationElement.remove();
          notificationIndex++;
          displayNotification(); // Display the next notification after the interval
        }, 1000); // Exit animation duration
      }, 30000); // Entrance after exit duration
    },8000); //  Display animation duration
  }
}

// Fetch real Kenya news headlines — general trending plus education-specific
// (KNEC, Ministry of Education, TSC) — and use them as notification content.
// Falls back to the static list above if every fetch fails.
function loadKenyaTrendingNews() {
  var feeds = [
    { emoji: '📰', url: 'https://news.google.com/rss?hl=en-KE&gl=KE&ceid=KE:en', limit: 5 },
    { emoji: '🎓', url: 'https://news.google.com/rss/search?q=education+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 3 },
    { emoji: '📝', url: 'https://news.google.com/rss/search?q=KNEC&hl=en-KE&gl=KE&ceid=KE:en', limit: 3 },
    { emoji: '🏛️', url: 'https://news.google.com/rss/search?q=%22Ministry+of+Education%22+Kenya&hl=en-KE&gl=KE&ceid=KE:en', limit: 3 },
    { emoji: '👩‍🏫', url: 'https://news.google.com/rss/search?q=TSC+Kenya+teachers&hl=en-KE&gl=KE&ceid=KE:en', limit: 3 }
  ];

  var fetches = feeds.map(function (feed) {
    var apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
    return fetch(apiUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status === 'ok' && data.items && data.items.length) {
          return data.items.slice(0, feed.limit).map(function (item) {
            return feed.emoji + ' ' + item.title;
          });
        }
        return [];
      })
      .catch(function () {
        return [];
      });
  });

  Promise.all(fetches)
    .then(function (results) {
      var seenTitles = {};
      var combined = [];

      results.forEach(function (headlines) {
        headlines.forEach(function (headline) {
          if (!seenTitles[headline]) {
            seenTitles[headline] = true;
            combined.push(headline);
          }
        });
      });

      if (combined.length) {
        var alreadySeen = getSeenHeadlines();
        var unseen = combined.filter(function (headline) {
          return alreadySeen.indexOf(headline) === -1;
        });

        if (unseen.length) {
          notifications = unseen;
        } else {
          // The user has already seen every current headline — reset and
          // start a fresh cycle instead of showing nothing.
          localStorage.removeItem(SEEN_KEY);
          notifications = combined;
        }
      }
    })
    .catch(function (err) {
      console.warn('Could not load trending Kenya news, using fallback notifications.', err);
    })
    .finally(function () {
      // Start the sequence by displaying the first notification after an interval
      setTimeout(displayNotification, 10000);
    });
}

loadKenyaTrendingNews();