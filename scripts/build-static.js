const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const BASE_PATH = process.env.BASE_PATH || '/portfolio/';
const PUBLIC = path.join(ROOT, 'public');

function assetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  return BASE_PATH + url.replace(/^\//, '');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  const profilePath = path.join(ROOT, 'data', 'profile.json');
  const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));

  fs.rmSync(DOCS, { recursive: true, force: true });
  fs.mkdirSync(DOCS, { recursive: true });

  const renderLocals = {
    profile,
    basePath: BASE_PATH,
    assetUrl,
    analyticsEnabled: false
  };

  const html = await ejs.renderFile(
    path.join(ROOT, 'views', 'index.ejs'),
    renderLocals,
    { views: path.join(ROOT, 'views'), root: ROOT }
  );

  fs.writeFileSync(path.join(DOCS, 'index.html'), html);
  fs.writeFileSync(path.join(DOCS, '404.html'), html);
  fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');

  copyDir(PUBLIC, DOCS);

  console.log('Static site built at', DOCS);
  console.log('Deploy target:', 'https://rakshitanalwaya.github.io' + BASE_PATH.replace(/\/$/, '') + '/');
}

build().catch(function (err) {
  console.error(err);
  process.exit(1);
});
