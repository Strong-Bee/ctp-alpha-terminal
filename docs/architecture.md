# CTP Alpha Terminal Architecture

## Runtime
- Next.js root app: dashboard, SSR/RSC and frontend UI.
- Express: REST API and business logic boundary.
- Worker: BullMQ background processing for market, wallet, on-chain, DeFi and alert jobs.
- PostgreSQL: source of truth.
- Redis: cache, queues and realtime event transport.

## Data flow
provider/RPC -> worker -> PostgreSQL -> Express API -> Next.js

Realtime:
worker -> Redis/BullMQ -> Express/WebSocket -> Next.js

## Modules
1. Narrative & Alpha
2. Launch monitoring
3. On-chain forensics
4. Wallet intelligence
5. DeFi & yield
6. Risk & sizing
7. Institutional order flow
8. Macro & cycle timing
9. Trade thesis and journal
10. Alerts

## Initial alpha model
Narrative 20%, On-chain 20%, Smart money 20%, Liquidity 10%, Momentum 10%, Catalyst 10%, Risk 10%.

AI should explain evidence and summarize a thesis; it should not replace raw market/on-chain data.

## 2 CPU / 2 GB VPS
Start with Nginx/Cloudflare, Next.js, Express, one Worker, PostgreSQL and Redis. Split workers only when workload requires it.