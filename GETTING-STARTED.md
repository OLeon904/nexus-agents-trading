# Get Nexus Agents Trading Running — Complete Setup

Follow these steps to get real market data, a database, and paper trading working. **All services below have free tiers.**

---

## Step 1: Database (2 minutes)

**Neon** — Free serverless PostgreSQL

1. Go to **[neon.tech](https://neon.tech)**
2. Sign up (GitHub works)
3. **New Project** → name it `nexus-agents`
4. Click **Connect** → copy the connection string
5. Open `.env` in this project and set:

```
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

6. Run migrations:

```powershell
npx prisma migrate deploy
```

---

## Step 2: Market Data for Backtesting (1 minute)

**Finnhub** — 60 API calls/minute free

1. Go to **[finnhub.io/register](https://finnhub.io/register)**
2. Sign up (email or GitHub)
3. Copy your API key from the dashboard
4. Add to `.env`:

```
FINNHUB_API_KEY="your-key-here"
```

5. Run a **real** backtest:

```powershell
npm run backtest
```

You’ll see live SPY data instead of random numbers.

---

## Step 3: Paper Trading (Optional, 3 minutes)

**Alpaca** — Free paper trading, no real money

1. Go to **[alpaca.markets](https://alpaca.markets)**
2. Sign up for a **Paper Trading** account (email only)
3. Dashboard → **API Keys** → Generate
4. Add to `.env`:

```
ALPACA_API_KEY="your-key-id"
ALPACA_SECRET_KEY="your-secret-key"
ALPACA_PAPER=true
```

Paper endpoint: `https://paper-api.alpaca.markets` (default when `ALPACA_PAPER=true`)

---

## Step 4: Run the App

```powershell
cd C:\Users\Leon\Documents\GitHub\nexus-agents-trading
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5: Deploy to AWS

1. Go to **[AWS Amplify Console](https://console.aws.amazon.com/amplify/)**
2. **New app** → **Host web app** → **GitHub**
3. Select **OLeon904/nexus-agents-trading**
4. Add environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `FINNHUB_API_KEY` — your Finnhub key
5. **Save and deploy**

---

## Free Tier Summary

| Service | Free Tier | Signup |
|---------|-----------|--------|
| **Neon** | 0.5 GB storage | [neon.tech](https://neon.tech) |
| **Polygon** | 5 calls/min | [polygon.io](https://polygon.io) |
| **Alpaca** | Paper trading + market data | [alpaca.markets](https://alpaca.markets) |
| **Twelve Data** | Free tier | [twelvedata.com](https://twelvedata.com) |
| **Alpha Vantage** | 25 calls/day | [alphavantage.co](https://www.alphavantage.co/support/#api-key) |
| **Finnhub** | 60 calls/min | [finnhub.io/register](https://finnhub.io/register) |

---

## .env Template

Your `.env` should look like:

```
DATABASE_URL="postgresql://...@xxx.neon.tech/neondb?sslmode=require"
POLYGON_API_KEY=""
ALPACA_API_KEY=""
ALPACA_SECRET_KEY=""
ALPACA_PAPER=true
TWELVEDATA_API_KEY=""
ALPHAVANTAGE_API_KEY=""
FINNHUB_API_KEY=""
```

Add any market data keys you have. Backtest tries them in order: Polygon → Alpaca → Twelve Data → Alpha Vantage → Finnhub.

---

## Troubleshooting

**"Prisma Client not found"** → Run `npx prisma generate`

**"No FINNHUB_API_KEY"** → Backtest uses sample data; add key for real data

**Amplify build fails** → Ensure `DATABASE_URL` is set in Amplify env vars
