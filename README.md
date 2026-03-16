# DogSpeak 🐶

**Datadog plain English translator** — paste any Datadog alert, log, or metric and get a simple explanation anyone can understand.

Powered by [Claude](https://claude.ai) (Anthropic).

---

## Features

- Paste any Datadog content: alerts, logs, CPU metrics, monitor triggers, error traces
- 3 audience modes: non-technical, manager/exec, junior developer
- Color-coded severity: OK / Info / Warn / Critical
- Plain English headline, explanation, key facts, and recommended action
- Translation history saved in the browser (last 10)
- API key stored securely in localStorage

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production

```bash
npm run build
```

The output will be in the `dist/` folder — you can deploy it to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Setup

### Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Paste it into the API Key field in the app — it will be saved in your browser's localStorage

The key is **never sent anywhere** except directly to `api.anthropic.com`.

---

## Project Structure

```
dogspeak/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite config
├── package.json
├── src/
│   ├── main.jsx                # React root
│   ├── App.jsx                 # Root component
│   ├── App.module.css
│   ├── styles/
│   │   └── global.css          # Global CSS variables & resets
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── Navbar.module.css
│   │   ├── ApiKeyInput.jsx     # API key entry & storage
│   │   ├── ApiKeyInput.module.css
│   │   ├── InputPanel.jsx      # Textarea + examples + audience
│   │   ├── InputPanel.module.css
│   │   ├── ResultPanel.jsx     # Translation result display
│   │   ├── ResultPanel.module.css
│   │   ├── HistoryPanel.jsx    # Past translations list
│   │   └── HistoryPanel.module.css
│   ├── hooks/
│   │   ├── useTranslation.js   # Translation state & history logic
│   │   └── useApiKey.js        # API key persistence
│   └── utils/
│       ├── api.js              # Anthropic API call + prompt
│       └── constants.js        # Examples, audience options, severity config
```

---

## Tech Stack

- **React 18** + **Vite**
- **CSS Modules** for scoped styling
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) for translation
- No other dependencies

---

## Deploying

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
```

### GitHub Pages

```bash
npm run build
# Push dist/ to gh-pages branch
```
