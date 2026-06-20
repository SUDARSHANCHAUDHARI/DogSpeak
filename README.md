# DogSpeak

**Translate Datadog alerts and logs into plain English — for anyone.**

Paste any Datadog alert, log, metric, or monitor. Pick your audience. Get a clear explanation that engineers, managers, and non-technical teammates can all understand.

Live: [sudarshanchaudhari.github.io/DogSpeak](https://sudarshanchaudhari.github.io/DogSpeak)

---

## What it does

- Paste any Datadog content: monitor alerts, log lines, CPU metrics, error traces, latency warnings
- Choose your audience — the explanation is genuinely different for each:
  - **Non-technical** — everyday analogy, zero jargon, plain sentences
  - **Manager / exec** — business impact, users affected, revenue risk, decision needed
  - **Junior developer** — concept definitions, what to check, numbered steps to follow
- Color-coded severity: OK / Info / Warn / Critical
- Streaming response (text appears as it's generated)
- Share as Slack/Teams message with one click
- Export translation history as CSV
- Dark and light mode

---

## Providers supported

| Provider | Free? | Get a key |
|----------|-------|-----------|
| Anthropic | Paid | [console.anthropic.com](https://console.anthropic.com) |
| OpenRouter | Free tier | [openrouter.ai](https://openrouter.ai) |
| Groq | Free | [console.groq.com](https://console.groq.com) |
| Ollama | Free (local) | [ollama.com](https://ollama.com) |
| Custom | — | Any OpenAI-compatible endpoint |

Your API key is stored only in your browser (sessionStorage by default — cleared when you close the tab). It is never sent to any server other than the AI provider you choose.

---

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). Paste your API key, pick a provider, try one of the built-in examples.

---

## Scripts

```bash
pnpm dev            # start dev server
pnpm build          # production build
pnpm build:pages    # build for GitHub Pages (sets /DogSpeak/ base path)
pnpm lint           # ESLint
pnpm typecheck      # TypeScript check
pnpm test           # run all tests
pnpm test:coverage  # tests with coverage report
```

---

## Environment variables (optional)

Copy `.env.example` to `.env.local` to override defaults:

```
VITE_ANTHROPIC_API_URL=   # override Anthropic endpoint
VITE_MODEL=               # override default model
```

---

## Project structure

```
src/
├── main.tsx                  # React root + ErrorBoundary
├── App.tsx                   # Root component
├── types.ts                  # Shared TypeScript interfaces
├── vite-env.d.ts             # Vite env type declarations
├── styles/
│   └── global.css            # CSS variables, resets, animations
├── components/
│   ├── Navbar.tsx            # Top bar with theme toggle
│   ├── ApiKeyInput.tsx       # Provider/model/key config + idle timeout
│   ├── InputPanel.tsx        # Textarea, examples, audience selector
│   ├── ResultPanel.tsx       # Translation output (headline, analogy, facts, action)
│   ├── HistoryPanel.tsx      # Past translations with export CSV
│   └── ErrorBoundary.tsx     # React error boundary
├── hooks/
│   ├── useApiKey.ts          # Provider config and key storage
│   ├── useTranslation.ts     # Translation state, history, AbortController
│   ├── useIdleTimeout.ts     # Auto-clear key after inactivity
│   └── useTheme.ts           # Dark/light mode toggle
└── utils/
    ├── api.ts                # AI provider calls (Anthropic + OpenAI-compatible)
    └── constants.ts          # Examples, audience schemas, severity config
```

---

## Security

- API key stored in `sessionStorage` by default — cleared on tab close
- "Remember across sessions" checkbox moves it to `localStorage` (opt-in)
- Idle timeout: auto-clears key after configurable inactivity (default 15 min)
- Translation history auto-expires after 24 hours
- Content Security Policy header restricts connections to known AI provider domains
- AbortController cancels in-flight requests; 45s timeout prevents hangs
- No backend — your key goes directly to the AI provider, never through any intermediate server

---

## Quality checks & deployment

Run the full quality bar locally before pushing:

```bash
pnpm lint        # ESLint
pnpm typecheck   # TypeScript (strict)
pnpm test        # 67 tests across 7 suites
pnpm build       # production build
```

Deployment is handled by a GitHub Actions workflow that publishes to GitHub Pages on every push to `main`. Enable it once under **Settings → Pages → Source → GitHub Actions**.

Live build: [sudarshanchaudhari.github.io/DogSpeak](https://sudarshanchaudhari.github.io/DogSpeak)

---

## Tech stack

- React 18 + Vite 5
- TypeScript (strict mode)
- CSS Modules
- Vitest + React Testing Library
- pnpm
- ESLint (flat config, typescript-eslint)
