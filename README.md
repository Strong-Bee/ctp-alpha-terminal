# CTP Alpha Terminal

Crypto Alpha & On-Chain Intelligence platform for narrative discovery, launch monitoring, wallet intelligence, DeFi analytics, risk management and institutional market structure.

## Stack
- Next.js App Router frontend
- Express.js + TypeScript API
- PostgreSQL + Prisma
- Redis + BullMQ
- TypeScript shared packages
- Docker Compose for PostgreSQL and Redis

## Layout
- app/: Next.js frontend
- api/: Express REST API
- worker/: BullMQ worker
- packages/types/: shared domain types
- packages/risk-engine/: deterministic risk calculations
- prisma/: database schema
- docs/: architecture

## Local development
1. Copy .env.example to .env.
2. Start PostgreSQL and Redis with `npm install
3. Run the Next.js app with `npm run dev`.
4. Run API with `npm run --workspace=@ctp/api install && npm run --workspace=@ctp/api dev`.
5. Run worker with `npm run --workspace=@ctp/worker install && npm run --workspace=@ctp/worker dev`.

API: http://localhost:4000
Health: http://localhost:4000/health
Dashboard summary: http://localhost:4000/api/v1/dashboard/summary

See docs/architecture.md for the scaling plan.
