import OpenAI from 'openai';

if (!process.env.PERPLEXITY_API_KEY) {
    console.warn('Warning: PERPLEXITY_API_KEY is not set. API calls will fail.');
}

const client = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    baseURL: 'https://api.perplexity.ai',
});

export interface PerplexityAnalysisResult {
    markdownAnalysis: string;
    structuredData: {
        entry_zone: string | null;
        stop_loss: number | null;
        target: number | null;
        long_bias: boolean;
        status: 'WAITING' | 'GREEN_LIGHT' | 'INVALIDATED';
    };
}

const SWING_TRADING_PROMPT = `# SIMPLE SWING TRADING ANALYSIS PROMPT
## LONG-ONLY | BUY THE DIP AT EMA WITH VOLUME

You are a trading analyst for **daily timeframe** swing trades (multi-week to multi-month holds).  
**LONG POSITIONS ONLY.**

Focus on ONE setup type: **Price at or below EMA support, ready to bounce with volume.**

Use ONLY these components:
- 150-period Exponential Moving Average (150 EMA)
- 200-period Exponential Moving Average (200 EMA)
- Volume vs 20-day average
- Distance of price from EMAs (in percentage)

---

## ANALYSIS STRUCTURE

When I provide a ticker symbol, respond in this exact format:

### 1) EMA POSITION
- Price vs 150 EMA: [Above/At/Below by X.X%]
- Price vs 200 EMA: [Above/At/Below by X.X%]
- 150 EMA vs 200 EMA: [Above/Below]

### 2) DISTANCE CHECK
- Distance from 150 EMA: [X.X%]
- Distance from 200 EMA: [X.X%]
- Status: [At support / Below support / Too far away]

### 3) VOLUME
- Current volume vs 20-day average: [X.Xx ratio]
- Volume trend on recent down days: [High/Low]
- Volume trend on recent up days: [High/Low]

### 4) TRADE SETUP
**ENTRY SIGNAL:** YES or NO

If YES (ready to trade now):
- **Entry:** [Price at or just below which EMA]
- **Setup:** [Describe the dip/support]
- **Watch for:** [Volume spike on bounce]
- **Stop:** [Below EMA or swing low]
- **Target:** [Resistance level or % gain]

If NO (not ready yet):
- **Why not now:** [Price too far from EMA / weak structure / no volume / wrong trend]
- **Future setup (when conditions align):**
  - **Entry will be:** [Specific price at EMA level]
  - **Stop will be:** [Below that EMA, specific price]
  - **Target will be:** [Next resistance, % gain]
  - **Risk/Reward:** [Calculate the R:R]
- **Conditions needed:**
  - [List 2-3 specific things that need to happen]

### 5) WATCHLIST STATUS
**KEEP AN EYE ON THIS:** YES or NO

If YES:
- **Why watch:** [What makes this interesting]
- **What needs to happen:** [Specific condition to trigger entry]
- **Price alert:** [Set alert at this level]
- **Check again:** [When to review]

If NO:
- **Skip because:** [Structure broken / no setup forming / better opportunities elsewhere]

---

## ENTRY RULES (ALL REQUIRED)

**Setup requirements:**
1. Price is AT the 150 EMA or 200 EMA (within 2% distance) OR Price is BELOW 150/200 EMA but showing reversal signs
2. 150 EMA > 200 EMA (uptrend structure)
3. Volume >= 1.5x average when price starts to bounce
4. Price not below BOTH EMAs by more than 5%

**NO TRADE if:**
- Price more than 5% below both EMAs (too broken)
- 150 EMA below 200 EMA (wrong trend structure)
- Price already 10%+ above EMAs (missed the dip)
- Volume below 1.0x average (no conviction)

---

## ALWAYS PROVIDE A FUTURE SETUP

**CRITICAL RULE:** Even if ENTRY SIGNAL = NO, you MUST still provide:
1. What the entry price WOULD BE (at which EMA level)
2. Where the stop WOULD GO (specific price)
3. What the target WOULD BE (specific price and % gain)
4. Exact risk/reward ratio for that future setup
5. List of 2-4 specific conditions that need to happen

---

## WATCHLIST CRITERIA

**Mark as WATCHLIST = YES if:**
- Stock is 3-8% above 150 EMA (pullback coming soon)
- Stock approaching 150 EMA but hasn't tested it yet (1-3% away)
- Good structure (150 > 200) but volume too low today (wait for volume)
- Just broke below 150 EMA today (might bounce tomorrow)
- Strong uptrend but extended (will watch for next dip)

**Mark as WATCHLIST = NO if:**
- Stock below both EMAs with 150 < 200 (broken trend)
- More than 10% above EMAs (too extended)
- Below 200 EMA (wrong side of trend)
- Weak structure, choppy price action

---

## KEY PRINCIPLES

- **Buy the dip, not the rip:** Only enter at or below EMA support
- **Volume is the trigger:** Setup is ready when volume confirms the bounce
- **EMAs show trend:** 150 > 200 = uptrend, buy dips to 150 EMA
- **Within 2% is "at the EMA":** Don't wait for exact touch
- **Be patient:** If price is extended above EMAs, wait for the pullback

---

**OUTPUT REQUIREMENT:** After your analysis, provide a JSON block at the end with keys: 
{
  "entry_zone": "price or range string",
  "stop_loss": number,
  "target": number,
  "long_bias": true/false (Set to true if ENTRY SIGNAL is YES),
  "status": "WAITING" or "GREEN_LIGHT" or "INVALIDATED"
}

LOGIC FOR STATUS:
- If ENTRY SIGNAL is YES -> "GREEN_LIGHT"
- If ENTRY SIGNAL is NO but KEEP AN EYE ON THIS is YES -> "WAITING"
- If both are NO -> "INVALIDATED"
`;

export async function analyzeTicker(ticker: string): Promise<PerplexityAnalysisResult> {
    const prompt = `Analyze ${ticker} using the swing trading framework below:\n\n${SWING_TRADING_PROMPT}`;

    const response = await client.chat.completions.create({
        model: 'sonar-pro',
        messages: [
            {
                role: 'system',
                content: 'You are a professional swing trading analyst focused on daily timeframe setups using EMAs and volume.'
            },
            {
                role: 'user',
                content: prompt
            }
        ]
    });

    const content = response.choices[0].message.content || '';

    // Extract JSON block
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*?\}/);
    let structuredData: any = { status: 'WAITING', long_bias: false };

    if (jsonMatch) {
        try {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            structuredData = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse JSON from Perplexity response', e);
        }
    }

    return {
        markdownAnalysis: content,
        structuredData: {
            entry_zone: structuredData.entry_zone || null,
            stop_loss: structuredData.stop_loss ? parseFloat(String(structuredData.stop_loss).replace(/[^0-9.-]/g, '')) : null,
            target: structuredData.target ? parseFloat(String(structuredData.target).replace(/[^0-9.-]/g, '')) : null,
            long_bias: structuredData.long_bias === true,
            status: structuredData.status || 'WAITING',
        }
    };
}

// ============ FUNDAMENTAL ANALYSIS ============

export interface FundamentalData {
    marketCap: string;
    peRatio: string;
    revenue: string;
    eps: string;
    sector: string;
    aiInsight: string;
}

const FUNDAMENTAL_PROMPT = `You are a financial analyst. For the given stock ticker, provide current fundamental data and a brief insight.

Respond in this EXACT format:

### FUNDAMENTALS
- **Market Cap:** [value, e.g. $2.5T]
- **P/E Ratio:** [value, e.g. 28.5]
- **Revenue (TTM):** [value, e.g. $394B]
- **EPS (TTM):** [value, e.g. $6.42]
- **Sector:** [sector name]

### AI INSIGHT
[2-3 sentences about the company's financial health, growth prospects, and any notable risks or opportunities. Be direct and actionable.]

After your analysis, provide a JSON block:
{
  "market_cap": "value",
  "pe_ratio": "value", 
  "revenue": "value",
  "eps": "value",
  "sector": "sector name",
  "ai_insight": "your 2-3 sentence insight"
}`;

export async function analyzeFundamentals(ticker: string): Promise<FundamentalData> {
    const response = await client.chat.completions.create({
        model: 'sonar-pro',
        messages: [
            {
                role: 'system',
                content: 'You are a financial analyst providing fundamental data on stocks. Be concise and accurate.'
            },
            {
                role: 'user',
                content: `Analyze the fundamentals for ${ticker}:\n\n${FUNDAMENTAL_PROMPT}`
            }
        ]
    });

    const content = response.choices[0].message.content || '';

    // Extract JSON
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*?\}/);
    let data: any = {};

    if (jsonMatch) {
        try {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            data = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse fundamentals JSON', e);
        }
    }

    return {
        marketCap: data.market_cap || 'N/A',
        peRatio: data.pe_ratio || 'N/A',
        revenue: data.revenue || 'N/A',
        eps: data.eps || 'N/A',
        sector: data.sector || 'N/A',
        aiInsight: data.ai_insight || 'Unable to generate insight.',
    };
}

