const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { recordPageView, recordClickEvent, getAnalyticsSummary } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me-in-production';
const BASE_PATH = process.env.BASE_PATH || '/';

function assetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  return BASE_PATH + url.replace(/^\//, '');
}

app.locals.basePath = BASE_PATH;
app.locals.assetUrl = assetUrl;
app.locals.analyticsEnabled = true;

const dbInitPath = path.join(__dirname, 'database', 'analytics.db');
if (!fs.existsSync(dbInitPath)) {
  require('./database/init');
}

const profilePath = path.join(__dirname, 'data', 'profile.json');
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getOrCreateSessionId(req, res) {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    sessionId = uuidv4();
    res.setHeader('X-Session-Id', sessionId);
  }
  return sessionId;
}

function trackPageView(req, res, next) {
  if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path.includes('.')) {
    return next();
  }

  const sessionId = getOrCreateSessionId(req, res);
  try {
    recordPageView({
      sessionId,
      path: req.path,
      referrer: req.get('Referer') || req.get('Referrer'),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  } catch (err) {
    console.error('Failed to record page view:', err.message);
  }
  next();
}

app.use(trackPageView);

app.get('/', (req, res) => {
  res.render('index', { profile });
});

app.get('/admin', (req, res) => {
  res.render('admin', { tokenRequired: true });
});

app.get('/api/analytics/summary', (req, res) => {
  const token = req.query.token || req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const summary = getAnalyticsSummary();

  const caseStudies = (profile.caseStudies || []).map(function (study) {
    var clicks = 0;
    (summary.caseStudyClicks || []).forEach(function (row) {
      if (row.element_label && row.element_label.indexOf(study.title) === 0) {
        clicks += row.clicks;
      }
    });

    return {
      id: study.id,
      title: study.title,
      company: study.company,
      role: study.role,
      period: study.period,
      category: study.category,
      summary: study.summary,
      featured: study.featured,
      documentUrl: study.documentUrl || '',
      clicks: clicks
    };
  });

  res.json(Object.assign({}, summary, { caseStudies }));
});

app.post('/api/analytics/click', (req, res) => {
  const sessionId = req.headers['x-session-id'] || uuidv4();
  const { elementType, elementLabel, elementHref, section, path: pagePath } = req.body;

  if (!pagePath) {
    return res.status(400).json({ error: 'path is required' });
  }

  try {
    recordClickEvent({
      sessionId,
      elementType,
      elementLabel,
      elementHref,
      section,
      path: pagePath
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Failed to record click:', err.message);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log(`Analytics dashboard: http://localhost:${PORT}/admin`);
});
