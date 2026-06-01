# Rakshita Nalwaya — Portfolio Website

Professional portfolio site for job applications, built with **Node.js**, **Express**, **EJS**, and **SQLite**.

**Live site:** [https://rakshitanalwaya.github.io/portfolio/](https://rakshitanalwaya.github.io/portfolio/)

## Features

- Resume-backed profile: experience, case studies, AI projects, and education
- Dedicated **AI Project Spotlight** section
- LinkedIn and GitHub integration
- Downloadable resume PDF
- Analytics: page views, click tracking, private dashboard at `/admin` (Node server or Render)

## Local development

```bash
npm install
npm run init-db
npm start
```

- Site: [http://localhost:3000](http://localhost:3000)
- Analytics: [http://localhost:3000/admin](http://localhost:3000/admin) (default token: `change-me-in-production`)

## Customize content

Edit **`data/profile.json`** to update your profile. Your resume PDF lives at **`public/resume/Resume_Rakshita.pdf`**.

After editing, restart the server (`npm start`) or use `npm run dev` for auto-reload.

## Deploy on Render (full site + analytics)

Use [Render](https://render.com) to host the **Node.js app** so `/admin` tracks real visitors on a public URL.

### Option A — Render Dashboard (recommended)

1. Push this repo to [github.com/rakshitanalwaya/portfolio](https://github.com/rakshitanalwaya/portfolio)
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect the `portfolio` repository (uses `render.yaml` in this repo)
4. After deploy, open **Environment** and copy the generated `ADMIN_TOKEN`
5. Visit:
   - Site: `https://<your-service>.onrender.com`
   - Admin: `https://<your-service>.onrender.com/admin`

Manual web service settings:

| Setting | Value |
|---------|--------|
| Build Command | `npm install && npm run init-db` |
| Start Command | `npm start` |
| Health Check | `/health` |
| `NODE_VERSION` | `22.22.0` |
| `BASE_PATH` | `/` |
| `ADMIN_TOKEN` | generate a secret |

**Note:** SQLite analytics persist while the service runs. On Render’s free plan, data may reset when you redeploy.

### Option B — Render MCP in Cursor

Per [Render’s MCP docs](https://render.com/docs/mcp-server):

1. Create a [Render API key](https://dashboard.render.com/u/settings?add-api-key)
2. Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_RENDER_API_KEY"
      }
    }
  }
}
```

3. Restart Cursor
4. Prompt: *Set my Render workspace to [YOUR_WORKSPACE]*
5. Prompt: *Create a web service from github.com/rakshitanalwaya/portfolio with build npm install && npm run init-db and start npm start*

### Using the admin dashboard on Render

1. Open `https://<your-service>.onrender.com/admin`
2. Enter `ADMIN_TOKEN` from Render **Environment**
3. Click **Load data**
4. Visit your live site — page views and clicks appear in the dashboard

## Deploy to GitHub Pages

The site is published at **https://rakshitanalwaya.github.io/portfolio/** from the [`portfolio`](https://github.com/rakshitanalwaya/portfolio) repository.

Pushing to the `main` branch triggers a GitHub Actions workflow that:

1. Builds a static version of the site (`npm run build`)
2. Deploys the `docs/` output to GitHub Pages

To preview the production build locally:

```bash
npm run build
npx serve docs -l 3000
```

Then open [http://localhost:3000/portfolio/](http://localhost:3000/portfolio/) (the `serve` package serves the `docs` folder; paths match GitHub Pages when using a subpath).

**Note:** Analytics and the `/admin` dashboard require the Node.js server (`npm start`). They are disabled on the public GitHub Pages site.

## Environment variables (Node server)

```bash
export ADMIN_TOKEN="your-secret-token"
export GA_MEASUREMENT_ID="G-XXXXXXXXXX"
export PORT=3000
npm start
```

## Google Analytics (GA4)

This portfolio supports **Google Analytics 4** via `GA_MEASUREMENT_ID`.

- **GitHub Pages (static deploy)**: add a repo secret named `GA_MEASUREMENT_ID` (e.g. `G-XXXXXXXXXX`). The GitHub Actions workflow injects it during `npm run build`.
- **Render (Node server)**: set `GA_MEASUREMENT_ID` in Render → **Environment**.

## Links

- [Portfolio](https://rakshitanalwaya.github.io/portfolio/)
- [LinkedIn](https://www.linkedin.com/in/rakshitanalwaya/)
- [GitHub](https://github.com/rakshitanalwaya)
- [AI News Aggregator](https://github.com/rakshitanalwaya/ai-news-aggregator-master)
