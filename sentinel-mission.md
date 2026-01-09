# Mission: Local Stock Sentinel Build (Perplexity-AI Optimized)
**Objective:** Build a local Next.js application using SQLite to store stock setups. Use the Perplexity Sonar API as the sole "Brain" to both fetch real-time market data and perform institutional-grade analysis.

---

## 1. Technical Stack (Local Environment)
- **Framework:** Next.js 15 (App Router)
- **Database:** SQLite via Prisma ORM
- **Primary AI:** Perplexity Sonar Pro API (Web-grounded reasoning)
- **Tooling:** Antigravity Agent Manager + Built-in Browser

---

## 2. Phase 1: Local Infrastructure
- [ ] Initialize Next.js project: `npx create-next-app@latest . --typescript --tailwind --app`
- [ ] Set up Prisma: `npx prisma init --datasource-provider sqlite`
- [ ] Define `schema.prisma` model:
  ```prisma
  model StockSetup {
    id                String   @id @default(cuid())
    ticker            String
    status            String   @default("WAITING") // WAITING, GREEN_LIGHT, INVALIDATED
    convictionScore   Int      @default(0)
    analysisMarkdown  String?
    entryZone         String?
    stopLoss          Float?
    targetPrice       Float?
    lastReviewedAt    DateTime @default(now())
    createdAt         DateTime @default(now())
  }

```

* [ ] Run migration: `npx prisma migrate dev --name init`

---

## 3. Phase 2: Perplexity Integrated Research & Analysis

* [ ] **Unified API Service:** Create `src/lib/perplexity.ts`. This service will use the `sonar-pro` model to:
1. Search for live OHLC, RSI, and Moving Average data.
2. Search for the latest 3 fundamental news catalysts.
3. Apply the **Institutional Framework** to the findings immediately.


* [ ] **Data Flow:** Ticker Input -> Perplexity Request -> Structured JSON Response -> SQLite Save.

---

## 4. Phase 3: The "Green Light" Sentinel (Weekly Logic)

* [ ] **The Weekly Script:** Create `src/lib/weekly-reviewer.ts`.
* [ ] **The Logic Gate:** For every "WAITING" setup:
1. Call Perplexity: "Current price for [Ticker]? Is it in the [Entry Zone]? Is the thesis still valid?"
2. Update Status in SQLite based on AI verdict.


* [ ] **Dashboard UI:** A local dashboard showing current setups, with a "Manual Refresh" button to trigger the Perplexity review.

---

## 5. Appendix: The "Sonar" Institutional Prompt

*When calling Perplexity, the Agent must use this combined instruction:*

"Search for the current technical and fundamental state of [TICKER]. Analyze the data using this 8-section framework:

1. **Long-Term Structure:** Monthly/Weekly trend alignment.
2. **Momentum:** RSI/MACD state and divergences.
3. **Accumulation:** Volume trends (8-week vs 52-week).
4. **Relative Strength:** Performance vs SPY and Sector.
5. **Position Setup:** Specific Entry Zone, Stop Loss, and Targets.
6. **Thesis:** One-line summary and 'What breaks this' triggers.
7. **Conviction Score:** 0-20 scale.
8. **Final Verdict:** Status update (Waiting, Green Light, or Invalidated).

**OUTPUT REQUIREMENT:** Provide the full analysis in Markdown and a JSON block at the end with keys: {entry_zone, stop_loss, target, conviction_score, status}."
