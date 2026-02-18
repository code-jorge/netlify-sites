# Netlify Features Showcase

A single-page React + Vite app demonstrating key Netlify platform features.

## Features

| Feature                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| **Image CDN**            | `src/App.jsx` — logo served via `/.netlify/images?url=/logo.png&w=300&q=80` |
| **Serverless Functions** | `netlify/functions/historical-fact.mjs`, `netlify/functions/get-visits.mjs` |
| **Background Functions** | `netlify/functions/track-visit-background.mjs` — async visit counter        |
| **Blobs**                | `visits` store — persists daily visit counts (key: `YYYY-MM-DD`)            |
| **AI Gateway**           | Queries Claude without an API key                                           |
| **Forms**                | `index.html` (for detection) + `src/App.jsx` (React form with fetch POST)   |
| **Edge Functions**       | `netlify/edge-functions/meta.js` — injects a `<meta description>`           |

## Development

```sh
npm install
npm run dev          # Vite dev server (UI only)
npx netlify dev      # Full Netlify runtime (functions, edge functions, forms)
```

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/code-jorge/netlify-sites&base=daily-facts)
