(function () {
  const SESSION_KEY = 'portfolio_session_id';
  const BASE_PATH = window.PORTFOLIO_BASE_PATH || '/';
  const ANALYTICS_ENABLED = window.PORTFOLIO_ANALYTICS_ENABLED !== false;

  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function getSection(el) {
    const section = el.closest('section[id]');
    return section ? section.id : null;
  }

  function getTrackingSection(el) {
    if (el.getAttribute('data-section')) return el.getAttribute('data-section');
    var parent = el.closest('[data-section]');
    if (parent) return parent.getAttribute('data-section');
    var track = el.closest('[data-track]');
    if (track) return track.getAttribute('data-track');
    return getSection(el);
  }

  function trackClick(el) {
    if (!ANALYTICS_ENABLED) return;

    const payload = {
      elementType: el.tagName.toLowerCase(),
      elementLabel: el.getAttribute('data-label') || el.textContent.trim().slice(0, 120),
      elementHref: el.getAttribute('href') || null,
      section: getTrackingSection(el),
      path: window.location.pathname
    };

    fetch((BASE_PATH.replace(/\/$/, '') || '') + '/api/analytics/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': getSessionId()
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {
      /* silent fail for analytics */
    });
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href], button[data-track]');
    if (!link) return;

    const isTracked =
      link.hasAttribute('data-track') ||
      link.closest('[data-track]') ||
      link.getAttribute('href')?.startsWith('http') ||
      link.getAttribute('href')?.startsWith('mailto:');

    if (isTracked) {
      trackClick(link);
    }
  });
})();
