# Push This Project to Your GitHub

Run these commands in a terminal (Git Bash, PowerShell, or Command Prompt) from the project folder.

## Step 1: Install Git (if needed)

If `git` is not installed: [Download Git for Windows](https://git-scm.com/download/win)

## Step 2: Create a New Repo on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `nexus-agents-trading` (or any name you prefer)
3. Choose **Public**
4. **Do not** add a README, .gitignore, or license (this project already has them)
5. Click **Create repository**

## Step 3: Push From Your Machine

**Optional but recommended:** Run `npm install` once to create `package-lock.json` (needed for Amplify builds).

Open a terminal in this project folder and run:

```bash
cd C:\Users\Leon\nexus-agents-trading

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Nexus Agents Trading"

# Add your GitHub repo as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/nexus-agents-trading.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Connect to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. **New app** → **Host web app**
3. Choose **GitHub** and authorize AWS
4. Select your repo and branch (`main`)
5. Amplify will detect Next.js and use the included `amplify.yml`
6. Add `DATABASE_URL` and other env vars
7. Deploy

Your site will be at `https://main.xxxxx.amplifyapp.com`
