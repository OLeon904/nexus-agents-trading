# Complete Setup Guide

This guide gets you from zero to a running app (local + AWS).

---

## Quick Setup (Run Once)

Open **PowerShell** in this folder and run:

```powershell
.\setup.ps1
```

This will:
- Install Node.js (if missing)
- Install dependencies
- Create `.env` from template
- Generate Prisma client
- Run migrations (if DATABASE_URL is set)

---

## 1. Free Database (2 minutes)

You need a PostgreSQL database. **Neon** offers a free tier:

1. Go to [neon.tech](https://neon.tech)
2. Sign up (GitHub login works)
3. Create a new project → **nexus-agents**
4. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)

Open `.env` and set:

```
DATABASE_URL="paste-your-neon-connection-string-here"
```

Then run:

```powershell
npx prisma migrate deploy
```

---

## 2. Run Locally

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 3. Deploy to AWS

### Option A: AWS Amplify (Recommended)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. **New app** → **Host web app**
3. Choose **GitHub** → authorize AWS
4. Select repo: **OLeon904/nexus-agents-trading**
5. Branch: **main**
6. Add environment variable:
   - Name: `DATABASE_URL`
   - Value: (your Neon connection string)
7. Click **Save and deploy**

Your site will be live at `https://main.xxxxx.amplifyapp.com`

### Option B: Manual Push Trigger

After the first deploy, push to `main` to trigger new deployments:

```powershell
git add .
git commit -m "Your message"
git push
```

---

## Optional: Market Data & AI

Add these to `.env` for full features:

| Variable | Get it from |
|----------|-------------|
| `FINNHUB_API_KEY` | [finnhub.io](https://finnhub.io) (free) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |

---

## Troubleshooting

**"npm not found"**  
- Run `setup.ps1` again (it installs Node.js via winget)  
- Or install manually: [nodejs.org](https://nodejs.org)

**"DATABASE_URL" errors**  
- Ensure `.env` has a valid PostgreSQL connection string  
- Neon: [neon.tech](https://neon.tech)

**Amplify build fails**  
- Check that `DATABASE_URL` is set in Amplify environment variables  
- View build logs in Amplify Console for details
