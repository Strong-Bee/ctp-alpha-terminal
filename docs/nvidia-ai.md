# NVIDIA AI Integration

CTP Alpha Terminal uses NVIDIA's OpenAI-compatible inference API as an interpretation layer for the terminal. NVIDIA NIM exposes the `/v1/chat/completions` endpoint and supports configurable model IDs. citeturn0search0turn0search2

## Environment

Copy the NVIDIA settings from `.env.example` into the API environment:

```env
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3-ultra-550b-a55b
NVIDIA_ENABLE_THINKING=true
```

The API key stays on the Express server and is never exposed through `NEXT_PUBLIC_*` variables.

## Endpoints

### AI health

`GET /api/v1/ai/health`

Returns provider configuration status and the active model.

### General Alpha chat

`POST /api/v1/ai/chat`

Request:

```json
{
  "message": "Explain the current alpha regime.",
  "context": "Optional terminal context"
}
```

### Structured asset analysis

`POST /api/v1/ai/alpha-analysis`

Request:

```json
{
  "asset": "SOL",
  "market": "market data",
  "onchain": "on-chain observations",
  "walletIntel": "wallet observations",
  "narrative": "narrative and catalysts",
  "risk": "risk metrics"
}
```

The AI is deliberately positioned after the deterministic data/analytics layer. It interprets evidence, highlights bull/bear cases and invalidations, and reports data gaps; it is not the source of truth for market data or guaranteed trade outcomes.
