(function () {
  const BASE_PATH = window.PORTFOLIO_BASE_PATH || '/';
  const apiRoot = BASE_PATH.replace(/\/$/, '') || '';

  const tokenInput = document.getElementById('admin-token');
  const loadBtn = document.getElementById('load-analytics');
  const dashboard = document.getElementById('dashboard');
  const errorEl = document.getElementById('admin-error');
  const statsGrid = document.getElementById('stats-grid');

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleString();
  }

  function fillTable(tableId, rows, renderRow) {
    const tbody = document.querySelector('#' + tableId + ' tbody');
    tbody.innerHTML = rows.length
      ? rows.map(renderRow).join('')
      : '<tr><td colspan="99">No data yet</td></tr>';
  }

  function renderStats(data) {
    statsGrid.innerHTML = [
      { label: 'Total page views', value: data.totalViews },
      { label: 'Unique visitors', value: data.uniqueVisitors },
      { label: 'Total clicks', value: data.totalClicks }
    ]
      .map(function (stat) {
        return (
          '<article class="stat-card">' +
          '<span>' + stat.label + '</span>' +
          '<strong>' + stat.value + '</strong>' +
          '</article>'
        );
      })
      .join('');
  }

  async function loadAnalytics() {
    const token = tokenInput.value.trim();
    if (!token) {
      errorEl.textContent = 'Please enter your admin token.';
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;

    try {
      const res = await fetch(apiRoot + '/api/analytics/summary?token=' + encodeURIComponent(token));
      if (!res.ok) throw new Error('Invalid token or unauthorized');

      const data = await res.json();
      dashboard.hidden = false;
      renderStats(data);

      var caseStudiesGrid = document.getElementById('case-studies-grid');
      if (caseStudiesGrid) {
        var studies = data.caseStudies || [];
        caseStudiesGrid.innerHTML = studies.length
          ? studies.map(function (study) {
              return (
                '<article class="case-study-admin-card">' +
                '<div class="case-study-admin-card__top">' +
                '<span class="case-study-admin-card__category">' + (study.category || 'Case study') + '</span>' +
                '<span class="case-study-admin-card__clicks">' + study.clicks + ' click' + (study.clicks === 1 ? '' : 's') + '</span>' +
                '</div>' +
                '<h3>' + study.title + '</h3>' +
                '<p class="case-study-admin-card__company">' + study.company + ' · ' + study.role + '</p>' +
                '<p class="case-study-admin-card__summary">' + study.summary + '</p>' +
                '<div class="case-study-admin-card__footer">' +
                '<span class="case-study-admin-card__period">' + study.period + '</span>' +
                (study.featured ? '<span class="case-study-admin-card__featured">Featured</span>' : '') +
                (study.documentUrl
                  ? '<a href="' + study.documentUrl + '" target="_blank" rel="noopener">Document</a>'
                  : '<a href="' + BASE_PATH + '#case-' + study.id + '" target="_blank" rel="noopener">View on site</a>') +
                '</div>' +
                '</article>'
              );
            }).join('')
          : '<p class="admin-empty">No case studies yet. Add entries to <code>data/profile.json</code> under <code>caseStudies</code>.</p>';
      }

      fillTable('views-by-day', data.viewsByDay, function (row) {
        return '<tr><td>' + row.day + '</td><td>' + row.views + '</td></tr>';
      });

      fillTable('clicks-by-section', data.clicksBySection, function (row) {
        return '<tr><td>' + row.section + '</td><td>' + row.clicks + '</td></tr>';
      });

      fillTable('top-clicks', data.topClicks, function (row) {
        return (
          '<tr><td>' + (row.element_label || '—') + '</td>' +
          '<td>' + (row.section || '—') + '</td>' +
          '<td>' + (row.element_href || '—') + '</td>' +
          '<td>' + row.clicks + '</td></tr>'
        );
      });

      fillTable('recent-views', data.recentViews, function (row) {
        return (
          '<tr><td>' + formatDate(row.created_at) + '</td>' +
          '<td>' + row.path + '</td>' +
          '<td>' + (row.referrer || 'Direct') + '</td></tr>'
        );
      });

      fillTable('recent-clicks', data.recentClicks, function (row) {
        return (
          '<tr><td>' + formatDate(row.created_at) + '</td>' +
          '<td>' + (row.element_label || '—') + '</td>' +
          '<td>' + (row.section || '—') + '</td></tr>'
        );
      });

      sessionStorage.setItem('admin_token', token);
    } catch (err) {
      dashboard.hidden = true;
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  }

  loadBtn.addEventListener('click', loadAnalytics);

  tokenInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') loadAnalytics();
  });

  const saved = sessionStorage.getItem('admin_token');
  if (saved) {
    tokenInput.value = saved;
  }
})();
