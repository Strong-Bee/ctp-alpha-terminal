# CTP Alpha Terminal

CTP Alpha Terminal adalah platform Crypto Alpha, Market Intelligence, dan On-Chain Research untuk trader dan researcher. Platform ini menggabungkan market intelligence, live news, narrative research, launch radar, wallet intelligence, DeFi, risk engine, order flow, macro, cycle analysis, AI research, thesis management, dan realtime alerts.

> Core principle: AI adalah interpretation layer. Market data, news, on-chain data, liquidity, wallet activity, dan risk engine tetap menjadi sumber evidence utama.

Repository: https://github.com/Strong-Bee/ctp-alpha-terminal

## 1. Platform Modules

| Module | Fungsi |
|---|---|
| Trading Terminal | TradingView embedded chart, economic events, market workspace |
| Overview | Market pulse, module health, alpha overview |
| AI Assistant | AI research dengan NVIDIA NIM + SearX.space public SearXNG Deep Search |
| Live News | Multi-source crypto news, refresh, deduplication |
| Markets | Price, 24h change, market cap, volume, scanner |
| Narratives | Narrative discovery dan catalyst context |
| Alpha Signals | Evidence-based alpha signal workspace |
| Launch Radar | DEX Screener token dan launch intelligence |
| On-chain | Deployer, transaction, funding, CEX flow research |
| Wallet Intel | Smart money, whale, CEX dan wallet activity |
| DeFi | Pool, TVL, fees, yield dan LP-risk research |
| Risk Engine | Position sizing, risk, R:R dan exposure |
| Order Flow | Volume Profile, VWAP dan order-flow workspace |
| Macro | CPI, FOMC, PPI, NFP dan macro context |
| Cycles | Wyckoff, halving dan cycle analysis |
| Thesis | Setup, catalyst, evidence, target dan invalidation |
| Alerts | Telegram, realtime events dan per-user alert history |
| Settings | Profile, appearance, timezone dan workspace settings |

## 2. Research Framework

Pipeline:

DISCOVER → COLLECT → VALIDATE → CORRELATE → SCORE → THESIS → RISK → MONITOR

Evidence classification:
- OBSERVED — data yang benar-benar tersedia.
- INFERENCE — interpretasi berdasarkan data.
- UNKNOWN — data yang belum tersedia atau belum tervalidasi.

AI tidak boleh mengubah asumsi menjadi fakta atau menjamin hasil trading.

## 3. Alpha Score

| Component | Weight |
|---|---:|
| Narrative | 20% |
| On-chain | 20% |
| Smart Money | 20% |
| Liquidity | 10% |
| Momentum | 10% |
| Catalyst | 10% |
| Risk | 10% |

Framework ini adalah deterministic scoring framework awal dan dapat dikembangkan.

## 4. AI Assistant

AI Assistant menggunakan NVIDIA NIM melalui server-side ENV. API key tidak dikirim ke browser.

Default:
- Provider: NVIDIA NIM
- Model: `nvidia/nemotron-3-ultra-550b-a55b`
- Base URL: `https://integrate.api.nvidia.com/v1`

AI endpoints:
- GET /api/ai/config
- POST /api/ai/config
- POST /api/ai/chat
- GET /api/ai/models
- POST /api/ai/test
- POST /api/ai/deep-search

Environment:

```env
NVIDIA_API_KEY=
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3-ultra-550b-a55b
NVIDIA_ENABLE_THINKING=true
NVIDIA_REASONING_EFFORT=medium
NVIDIA_TEMPERATURE=0.15
NVIDIA_MAX_TOKENS=4096
NVIDIA_TIMEOUT_MS=120000
```

### Deep Search / SearX.space

Deep Search menggunakan public SearXNG instances yang terdaftar di SearX.space. CTP mengambil daftar instance dari:

```text
https://searx.space/data/instances.json
```

CTP tidak mengandalkan satu public instance. Untuk setiap research query, instance pool dipilih dan diputar dengan round-robin. Instance yang timeout, mengembalikan error, invalid JSON, atau tidak menghasilkan result diberi failure count dan sementara masuk cooldown. Request berikutnya otomatis mencoba instance sehat lain.

Environment:

```env
SEARXNG_DISCOVERY_URL=https://searx.space/data/instances.json
SEARXNG_INSTANCE_COUNT=8
SEARXNG_TIMEOUT_MS=12000
SEARXNG_DISCOVERY_TTL_MS=600000
SEARXNG_FAILURE_COOLDOWN_MS=60000
SEARXNG_MAX_FAILURES=2
SEARXNG_LANGUAGE=en
SEARXNG_CATEGORIES=general,news
SEARXNG_SAFESEARCH=0
SEARXNG_TIME_RANGE=
SEARXNG_PAGES=2
SEARXNG_MAX_RESULTS=18
```

SearXNG JSON support tidak seragam pada public instances. Dokumentasi resmi SearXNG menyatakan bahwa `format=json` harus diaktifkan oleh administrator instance; karena itu failover merupakan bagian penting dari desain ini.

Deep Search menjalankan beberapa query dan halaman, mendistribusikan request ke public instances, melakukan URL deduplication, menyertakan instance sumber dalam metadata, lalu mengirim source context ke NVIDIA Nemotron.

SearX.space memperbarui daftar instance secara berkala dan menyediakan `instances.json` untuk konsumsi programatik. Public instances dapat mengalami traffic tinggi, upstream blocking, CAPTCHA, rate limiting, atau downtime. Karena itu desain CTP menggunakan discovery cache, health cooldown, rotation, dan failover daripada mengunci ke satu instance.

Untuk production dengan kebutuhan tinggi, self-hosting SearXNG tetap memberikan kontrol dan konsistensi lebih besar.

## 5. Authentication

Authentication menggunakan Auth.js dengan Google OAuth, Apple OAuth, dan JWT session.

Flow: Landing Page → Login → Google/Apple → Auth.js → Session → Dashboard.

Semua route /dashboard/* diproteksi. User yang belum login diarahkan ke /login.

Environment:

AUTH_SECRET=generate-a-long-random-secret
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_APPLE_ID=
AUTH_APPLE_SECRET=

Jangan commit OAuth credentials.

## 6. Telegram Alert System

Menu Alerts menyediakan Telegram notification system dan event history per user.

Settings:
- Telegram Bot Token
- Telegram Chat ID
- Telegram enabled
- Price alerts
- News/catalyst alerts
- Wallet alerts
- Launch alerts
- Risk alerts
- Macro alerts
- Realtime engine

Database models: UserAlertSettings dan AlertEvent.

Bot Token dienkripsi server-side dan tidak dikembalikan setelah disimpan.

Trusted emitter:
- POST /api/alerts/emit
- Header: x-alert-engine-secret

Payload:

{
  "type": "price",
  "title": "BTC Alert",
  "message": "BTC crossed threshold",
  "severity": "INFO",
  "source": "market-engine",
  "metadata": {}
}

Supported types: price, news, wallet, launch, risk, macro.

Alert fan-out engine sudah tersedia. Integrasi otomatis seluruh source engine masih dikembangkan bertahap.

## 7. Live News

News engine menggunakan server-side aggregation, normalization, deduplication, categorization, dan market/narrative context.

Sources yang didukung antara lain CoinDesk, Cointelegraph, Decrypt, The Block, Bitcoin Magazine, CryptoSlate, NewsBTC, Bitcoin.com, U.Today, CryptoPotato, BeInCrypto, AMBCrypto, CryptoNews, Blockworks, The Daily Hodl, serta Google News untuk Crypto, Bitcoin, Ethereum, Solana, DeFi, ETF, Regulation, Security, dan Macro.

Configuration:
NEWS_REFRESH_MS=30000
NEWS_LIMIT=100

## 8. Markets and DEX Screener

Markets menyediakan price, 24h change, market cap, volume, scanner, dan market pulse.

Launch Radar menggunakan DEX Screener untuk token profiles, recent profiles, boosts, top boosts, ads, community takeovers, pair search, token search, token pairs, dan discovery.

Internal DEX routes berada di /api/v1/dex/*.

## 9. On-chain Intelligence

Target on-chain research:
- Deployer wallet
- Funding source
- Transaction flow
- Wallet clusters
- CEX destination
- Wash-trading indicators
- Smart-money activity
- Whale activity
- Liquidity behavior

Architecture: RPC/Indexer → Raw Blockchain Data → Normalization → Wallet Classification → Flow Analysis → Alpha/Risk Context.

## 10. DeFi Intelligence

Target module mencakup liquidity pools, TVL, volume, fees, APR/APY, LP exposure, impermanent loss, funding, basis, dan yield risk.

## 11. Risk Engine

Flow: Account Equity → Risk % → Stop Distance → Position Size → Risk/Reward → Portfolio Exposure.

Input utama: equity, entry, stop loss, risk percentage, target, leverage, dan portfolio exposure.

Risk engine bersifat deterministic dan dapat diaudit.

## 12. Order Flow

Workspace dirancang untuk Volume Profile, POC, Value Area, VWAP, Anchored VWAP, imbalance, absorption, liquidity, dan execution context.

Production-grade order flow membutuhkan provider feed yang sesuai.

## 13. Macro and Cycles

Macro context mencakup CPI, FOMC, PPI, NFP, DXY, Treasury yields, dan economic events.

Cycle analysis mencakup Wyckoff, accumulation, markup, distribution, markdown, halving cycle, seasonality, dan macro cycle context.

## 14. Realtime Architecture

Components: Redis, BullMQ, SSE, WebSocket architecture, periodic workers, dan backend event fan-out.

General flow: Market/News/Wallet/Launch/Risk/Macro → Event Engine → PostgreSQL + Telegram + SSE + Dashboard.

## 15. Multi-chain Architecture

Target chains:
- Solana
- Ethereum
- Base
- Arbitrum
- BNB Chain
- Polygon
- TRON
- Aptos
- Sui

Adapter pattern: Chain Adapter → RPC/Indexer/Token Metadata/Transactions/Wallet Activity/Liquidity → Normalized Domain → Alpha Intelligence.

## 16. Project Structure

ctp-alpha-terminal/
├── app/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── ai/
│   │   │   ├── config/
│   │   │   └── chat/
│   │   ├── alerts/
│   │   │   └── emit/
│   │   └── auth/
│   │       └── [...nextauth]/
│   ├── dashboard/
│   │   ├── [section]/
│   │   └── _components/
│   ├── login/
│   ├── providers.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── worker/
│   └── src/
├── packages/
│   ├── types/
│   └── risk-engine/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── lib/
│   ├── prisma.ts
│   └── telegram.ts
├── scripts/
│   └── dev.mjs
├── public/
├── auth.ts
├── proxy.ts
├── next.config.ts
├── package.json
└── README.md

## 17. Technology Stack

Frontend: Next.js, React, TypeScript, Tailwind CSS, Lucide React, Recharts, Auth.js.

Backend: Express.js, TypeScript, Zod, Pino, Helmet, CORS, WebSocket/SSE.

Database: PostgreSQL + Prisma.

Queue/realtime: Redis + BullMQ + SSE + WebSocket architecture.

AI: NVIDIA NIM dan OpenAI-compatible APIs.

Market intelligence: CoinGecko, RSS/news feeds, DEX Screener, TradingView embedded widgets.

Infrastructure: Nginx, Cloudflare, Linux VPS, Node.js, npm.

Docker tidak digunakan pada deployment architecture saat ini.

## 18. Requirements

Recommended: Node.js 20+, npm, PostgreSQL, Redis, Git.

Development dapat dilakukan di Windows, Linux, atau macOS.

## 19. Installation

Clone repository:

git clone https://github.com/Strong-Bee/ctp-alpha-terminal.git
cd ctp-alpha-terminal

Install:

npm install

Copy environment:

Linux/macOS: cp .env.example .env.local
Windows PowerShell: Copy-Item .env.example .env.local

Generate Prisma:
npx prisma generate

Apply migrations:
npx prisma migrate deploy

## 20. Environment

Minimal:
 DATABASE_URL=postgresql://ctp:ctp@localhost:5432/ctp_alpha
 REDIS_URL=redis://localhost:6379
 API_PORT=4000
 API_HOST=0.0.0.0
 CORS_ORIGIN=http://localhost:3000
 NEXT_PUBLIC_API_URL=http://localhost:4000

AI:
 NVIDIA_API_KEY=
 NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
 NVIDIA_MODEL=nvidia/nemotron-3-ultra-550b-a55b
 NVIDIA_ENABLE_THINKING=true
 NVIDIA_REASONING_EFFORT=medium
 NVIDIA_TEMPERATURE=0.15
 NVIDIA_MAX_TOKENS=4096
 NVIDIA_TIMEOUT_MS=120000

Deep Search:
 SEARXNG_DISCOVERY_URL=https://searx.space/data/instances.json
 SEARXNG_INSTANCE_COUNT=8
 SEARXNG_TIMEOUT_MS=12000
 SEARXNG_DISCOVERY_TTL_MS=600000
 SEARXNG_FAILURE_COOLDOWN_MS=60000
 SEARXNG_MAX_FAILURES=2
 SEARXNG_LANGUAGE=en
 SEARXNG_CATEGORIES=general,news
 SEARXNG_SAFESEARCH=0
 SEARXNG_TIME_RANGE=
 SEARXNG_PAGES=2
 SEARXNG_MAX_RESULTS=18

Auth:
 AUTH_SECRET=generate-a-long-random-secret
 AUTH_TRUST_HOST=true
 AUTH_GOOGLE_ID=
 AUTH_GOOGLE_SECRET=
 AUTH_APPLE_ID=
 AUTH_APPLE_SECRET=

Alerts:
 ALERT_ENGINE_SECRET=generate-a-long-random-alert-engine-secret

News:
 NEWS_REFRESH_MS=30000
 NEWS_LIMIT=100

AI provider/model/API key menggunakan server-side ENV. Jangan commit NVIDIA_API_KEY.

## 21. Database

Commands:
npx prisma generate
npx prisma migrate deploy
npx prisma migrate dev
npx prisma studio

Core models:
Asset, Narrative, Catalyst, Wallet, WalletTransaction, Launch, DeFiPool, MarketSnapshot, Signal, TradeThesis, UserAlertSettings, AlertEvent, UserAISettings.

## 22. Development

Satu command:

npm run dev

Menjalankan Next.js, Express API, dan BullMQ Worker.

Default endpoints:
- Frontend: http://localhost:3000
- Express: http://localhost:4000
- Health: http://localhost:4000/health
- Dashboard: http://localhost:3000/dashboard
- AI Assistant: http://localhost:3000/dashboard/ai

Individual services:
npm run dev:next
npm run dev:api
npm run dev:worker

## 23. Build

npm run build
npm run build:api
npm run build:worker
npm run build:all
npm run typecheck

Production start:
npm start
npm run start:api
npm run start:worker

## 24. API Overview

Express:
- GET /health
- GET /api/v1/dashboard/summary
- GET /api/v1/ai/health
- POST /api/v1/ai/chat
- POST /api/v1/ai/alpha-analysis
- GET /api/v1/news
- POST /api/v1/news/refresh
- GET /api/v1/realtime/events
- GET /api/v1/dex/*

Next authenticated APIs:
- GET /api/ai/config
- POST /api/ai/config
- POST /api/ai/chat
- GET /api/alerts
- POST /api/alerts
- PUT /api/alerts
- POST /api/alerts/emit

## 25. Deployment

Recommended architecture for a small VPS:

Cloudflare → Nginx → Next.js + Express → PostgreSQL + Redis → BullMQ Worker.

Suggested domains:
- alpha.cybertechnologyproject.my.id
- api-alpha.cybertechnologyproject.my.id

Untuk VPS 2 CPU / 2 GB RAM, deployment awal dapat menggunakan Nginx, Next.js, Express, PostgreSQL, Redis, dan satu worker dalam satu VPS.

Production flow: GitHub → git pull → npm install → Prisma generate → Prisma migrate deploy → npm run build:all → process manager → Nginx → Cloudflare.

Process manager dapat menggunakan systemd atau PM2.

## 26. Security

Jangan commit .env, .env.local, API keys, OAuth secrets, Telegram Bot Tokens, database credentials, AUTH_SECRET, atau ALERT_ENGINE_SECRET.

AI API key dan Telegram Bot Token disimpan sebagai encrypted secret.

Encryption menggunakan AUTH_SECRET sehingga AUTH_SECRET harus panjang, random, dan persistent.

ALERT_ENGINE_SECRET hanya boleh berada pada trusted backend/worker dan tidak boleh menggunakan NEXT_PUBLIC_ALERT_ENGINE_SECRET.

User-specific AI settings dan alert settings harus selalu diproses berdasarkan authenticated session.

## 27. TradingView

TradingView digunakan melalui official embedded widgets untuk display/reference.

CTP tidak menggunakan browser scraping TradingView sebagai core data ingestion dan tidak menjadikan embedded TradingView data sebagai backend source otomatis untuk algorithmic trading engine.

## 28. Current Status

Foundation:
- [x] Next.js dashboard
- [x] Express API
- [x] PostgreSQL
- [x] Prisma
- [x] Redis
- [x] BullMQ
- [x] npm workspaces
- [x] Auth.js
- [x] Google OAuth
- [x] Apple OAuth
- [x] Protected dashboard
- [x] Profile menu
- [x] Settings
- [x] Telegram alert configuration
- [x] NVIDIA AI configuration

Intelligence:
- [x] Live News aggregation
- [x] Market scanner
- [x] DEX Screener integration
- [x] TradingView terminal
- [x] AI Assistant
- [x] Narrative workspace
- [x] Launch Radar UI

In development:
- [ ] Full multi-chain indexer
- [ ] Wallet clustering
- [ ] Smart-money classifier
- [ ] CEX flow detection
- [ ] Deterministic Alpha Score persistence
- [ ] Full DeFi position tracking
- [ ] Production order-flow feed
- [ ] Complete macro provider
- [ ] Automatic alert integration for all source engines

## 29. Roadmap

### Phase 1 — Foundation
- [x] Core dashboard
- [x] Authentication
- [x] User profile
- [x] AI configuration
- [x] Telegram configuration
- [x] PostgreSQL
- [x] Redis/BullMQ

### Phase 2 — Data Intelligence
- [x] News ingestion
- [x] Market scanner
- [x] DEX Screener
- [ ] Multi-chain ingestion
- [ ] Wallet indexing
- [ ] Transaction classification

### Phase 3 — Alpha Engine
- [ ] Alpha Score
- [ ] Narrative scoring
- [ ] Smart-money scoring
- [ ] Liquidity scoring
- [ ] Catalyst scoring
- [ ] Manipulation detection
- [ ] Launch risk scoring

### Phase 4 — DeFi
- [ ] Pool ingestion
- [ ] TVL tracking
- [ ] Fee tracking
- [ ] LP position tracking
- [ ] Impermanent-loss engine
- [ ] Yield monitoring
- [ ] Funding/basis engine

### Phase 5 — Order Flow
- [ ] Order-book provider
- [ ] Volume Profile
- [ ] VWAP
- [ ] Imbalance
- [ ] Absorption
- [ ] Execution analytics

### Phase 6 — Automation
- [ ] Watchlists
- [ ] Per-asset thresholds
- [ ] Alert cooldown
- [ ] Alert deduplication
- [ ] Wallet alerts
- [ ] Price alerts
- [ ] Launch alerts
- [ ] News alerts
- [ ] Macro alerts
- [ ] Risk alerts
- [ ] Telegram realtime fan-out

## 30. Design Principles

### Evidence First
Tidak ada signal yang boleh hanya berdasarkan AI-generated text.

### Deterministic Risk
Risk calculation harus dapat direproduksi dan diaudit.

### AI as Analyst
AI digunakan untuk summarize, correlate, explain, investigate, generate hypotheses, dan structure thesis. AI bukan sumber market data.

### Provider Agnostic
Provider dan model dapat diganti tanpa mengubah seluruh application architecture.

### Multi-user Isolation
AI configuration, API keys, Telegram configuration, alert history, watchlists, dan future thesis data harus terisolasi per user.

### Modular Architecture
Data provider, AI provider, chain adapter, risk engine, worker, dan UI dibuat modular.

### No Docker Dependency
Development dan deployment menggunakan native services.

## 31. Current Limitations

Beberapa module masih berupa intelligence workspace dan belum menjadi production-grade data engine.

Belum seluruhnya aktif:
- Full multi-chain RPC/indexer
- Complete wallet clustering
- Smart-money classifier
- Production order-flow feed
- Complete macro provider
- Full DeFi position tracking
- Automated Alpha Score persistence
- Automatic alerts dari seluruh source engine

UI tidak boleh membuat data yang belum tersedia.

## 32. Contributing

Create branch: git checkout -b feature/your-feature

Install: npm install

Run: npm run dev

Typecheck: npm run typecheck

Build: npm run build:all

Buat commit yang jelas dan fokus pada satu perubahan.

## 33. License

Project ini dikembangkan oleh Cyber Technology Project (CTP). License repository dapat ditentukan sesuai kebijakan project.

## 34. Project Vision

Crypto Research + Market Intelligence + Narrative Intelligence + On-chain Intelligence + Wallet Intelligence + DeFi Analytics + Institutional Order Flow + Macro/Cycle Analysis + Risk Engine + AI Research + Realtime Alerts = CTP Alpha Terminal.

**Research the market. Build the thesis. Manage the risk.**