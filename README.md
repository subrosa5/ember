# Ember

**[→ Open Ember](https://ember-nine-dun.vercel.app)**

An autonomous coding agent that runs in the browser. You give it a task; it
plans, reads/writes files, and runs shell commands — all inside an isolated,
ephemeral [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) VM, never
on your real machine.

Built with Next.js, the [Vercel AI SDK](https://ai-sdk.dev) `ToolLoopAgent`,
and `@vercel/sandbox`.

## How it works

- Each browser session gets its own persistent sandbox (`src/lib/sandbox.ts`).
- The agent (`src/lib/agent.ts`) has four tools (`src/lib/tools.ts`): read
  file, write file, list directory, run shell command — all executed inside
  that sandbox.
- `src/app/api/agent/route.ts` streams the agent's reasoning and tool calls
  to the browser via `createAgentUIStreamResponse`.
- The UI (`src/components/`) renders it as a black/red/gold terminal console.

## Setup

### 1. Model access (AI Gateway)

```bash
cp .env.example .env.local
```

Get an API key from [Vercel AI Gateway](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway%2Fapi-keys)
and set it as `AI_GATEWAY_API_KEY` in `.env.local`. (On a Vercel deployment
this is automatic via OIDC — no key needed.)

### 2. Sandbox access

```bash
vercel link
vercel env pull
```

This pulls a short-lived `VERCEL_OIDC_TOKEN` into `.env.local`, which
`@vercel/sandbox` uses to create VMs. It expires after ~12h locally — rerun
`vercel env pull` when it does. In production on Vercel this is automatic.

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Built-in abuse protection

Every message can trigger several LLM calls and spin up a sandbox VM, so a
script hammering the endpoint could run up your AI Gateway bill fast. Two
guards are in place:

- **Per-IP rate limit** (`src/lib/rate-limit.ts`): max 8 requests per 10
  minutes per IP, backed by [Vercel Runtime Cache](https://vercel.com/docs/runtime-cache)
  (falls back to in-memory locally). Excess requests get a `429`.
- **Capped agent loop** (`src/lib/agent.ts`): each message can run at most 15
  tool-loop steps, bounding the worst-case cost of a single request.

This isn't bulletproof (a botnet spreading across many IPs would still get
through) — for stronger protection, set a spending limit on AI Gateway in
your Vercel dashboard, or add the WAF custom-rule rate limit described in
[Vercel Firewall docs](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules)
(requires Pro plan).

## Deploy

```bash
vercel deploy --prod
```

Costs to be aware of: every message triggers a model call (billed through
your Vercel/Anthropic usage) and may spin up a sandbox VM (billed per
second of use, see [Sandbox pricing](https://vercel.com/docs/vercel-sandbox)).
If you deploy this publicly without authentication, anyone with the URL can
run up your bill — add auth before sharing the link widely.
