const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'analytics.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function recordPageView({ sessionId, path, referrer, userAgent, ip }) {
  const stmt = db.prepare(`
    INSERT INTO page_views (session_id, path, referrer, user_agent, ip_hash)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(sessionId, path, referrer || null, userAgent || null, hashIp(ip));
}

function recordClickEvent({ sessionId, elementType, elementLabel, elementHref, section, path }) {
  const stmt = db.prepare(`
    INSERT INTO click_events (session_id, element_type, element_label, element_href, section, path)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    sessionId,
    elementType || null,
    elementLabel || null,
    elementHref || null,
    section || null,
    path
  );
}

function getAnalyticsSummary() {
  const totalViews = db.prepare('SELECT COUNT(*) AS count FROM page_views').get().count;
  const uniqueVisitors = db.prepare('SELECT COUNT(DISTINCT session_id) AS count FROM page_views').get().count;
  const totalClicks = db.prepare('SELECT COUNT(*) AS count FROM click_events').get().count;

  const viewsByDay = db.prepare(`
    SELECT date(created_at) AS day, COUNT(*) AS views
    FROM page_views
    GROUP BY date(created_at)
    ORDER BY day DESC
    LIMIT 30
  `).all();

  const topClicks = db.prepare(`
    SELECT element_label, element_href, section, COUNT(*) AS clicks
    FROM click_events
    WHERE element_label IS NOT NULL AND element_label != ''
    GROUP BY element_label, element_href, section
    ORDER BY clicks DESC
    LIMIT 20
  `).all();

  const clicksBySection = db.prepare(`
    SELECT COALESCE(section, 'unknown') AS section, COUNT(*) AS clicks
    FROM click_events
    GROUP BY section
    ORDER BY clicks DESC
  `).all();

  const recentViews = db.prepare(`
    SELECT path, referrer, created_at
    FROM page_views
    ORDER BY created_at DESC
    LIMIT 25
  `).all();

  const recentClicks = db.prepare(`
    SELECT element_label, element_href, section, path, created_at
    FROM click_events
    ORDER BY created_at DESC
    LIMIT 25
  `).all();

  const caseStudyClicks = db.prepare(`
    SELECT element_label, COUNT(*) AS clicks
    FROM click_events
    WHERE section IN ('case-studies', 'case-study') AND element_label IS NOT NULL AND element_label != ''
    GROUP BY element_label
    ORDER BY clicks DESC
  `).all();

  return {
    totalViews,
    uniqueVisitors,
    totalClicks,
    viewsByDay,
    topClicks,
    clicksBySection,
    recentViews,
    recentClicks,
    caseStudyClicks
  };
}

module.exports = {
  db,
  recordPageView,
  recordClickEvent,
  getAnalyticsSummary
};
