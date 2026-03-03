# Deploy to AWS Amplify — Quick Steps

## 1. Open AWS Amplify

Go to **[console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify)**

## 2. Create App

1. Click **New app** → **Host web app**
2. Choose **GitHub** → **Authorize** (if needed)
3. Select repo: **OLeon904/nexus-agents-trading**
4. Branch: **main**
5. Click **Next**

## 3. Add Environment Variables

Click **Advanced settings** and add (copy values from your `.env`):

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `POLYGON_API_KEY` | Your Polygon API key |
| `ALPACA_API_KEY` | Your Alpaca key ID |
| `ALPACA_SECRET_KEY` | Your Alpaca secret |
| `ALPACA_PAPER` | `true` |
| `ALPHAVANTAGE_API_KEY` | Your Alpha Vantage key (optional) |

Required: `DATABASE_URL` — the app won't build without it.

## 4. Deploy

Click **Save and deploy**. Amplify will:

- Install dependencies
- Run Prisma migrations
- Build the Next.js app

Your site will be at: **https://main.xxxxx.amplifyapp.com**

---

Code is already pushed to GitHub. Future pushes to `main` will trigger automatic deploys.
