# Deploying Nexus Agents Trading on AWS

Two deployment options: **AWS Amplify** (simplest) or **AWS App Runner** (Docker).

---

## Option 1: AWS Amplify (Recommended)

Amplify hosts your Next.js app and deploys from Git. No containers to manage.

### Prerequisites

- AWS account
- GitHub/GitLab/Bitbucket repo with your code
- RDS PostgreSQL instance (or use [Neon](https://neon.tech) / [Supabase](https://supabase.com) for managed Postgres)

### Step 1: Create RDS PostgreSQL

1. In **AWS Console** → **RDS** → **Create database**
2. Choose **PostgreSQL 16**
3. Template: **Free tier** (or Dev/Test)
4. Settings: DB name `nexus_agents`, master username, password
5. Instance: `db.t3.micro` (free tier)
6. Enable **public access** if Amplify needs to reach it (or use VPC peering)
7. Create database
8. Note the **endpoint** (e.g. `xxx.region.rds.amazonaws.com`)

### Step 2: Create Amplify App

1. **AWS Console** → **Amplify** → **New app** → **Host web app**
2. Connect your Git provider and select the repo
3. Branch: `main`
4. Amplify will detect the framework (Next.js) and use `amplify.yml`
5. Add **environment variables**:
   - `DATABASE_URL` = `postgresql://user:password@endpoint:5432/nexus_agents?sslmode=require`
   - Any other vars from `.env.example` (FINNHUB_API_KEY, etc.)

### Step 3: Deploy

Migrations run automatically in the build (see `amplify.yml`). Push to your branch (Amplify doesn’t run them by default):

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

Or use Amplify’s **Build** phase to add:

```yaml
postBuild:
  commands:
    - npx prisma migrate deploy
```

(Requires `DATABASE_URL` as a build-time env var.)

### Step 4: Deploy

Push to your branch. Amplify will build and deploy. Your site will be at:

`https://main.xxxxx.amplifyapp.com`

---

## Option 2: AWS App Runner (Docker)

Uses the included `Dockerfile` for container-based deployment.

### Step 1: Build and Push Image to ECR

```bash
aws ecr create-repository --repository-name nexus-agents-trading
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t nexus-agents-trading .
docker tag nexus-agents-trading:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexus-agents-trading:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexus-agents-trading:latest
```

### Step 2: Create App Runner Service

1. **AWS Console** → **App Runner** → **Create service**
2. Source: **Container registry** → **Amazon ECR**
3. Select your image
4. Service name: `nexus-agents-trading`
5. Port: `3000`
6. Add `DATABASE_URL` and other env vars

App Runner will give you a URL like `https://xxxxx.us-east-1.awsapprunner.com`.

---

## Environment Variables for AWS

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | RDS, Neon, or Supabase connection string |
| `NEXTAUTH_URL` | If using auth | Your Amplify/App Runner URL |
| `NEXTAUTH_SECRET` | If using auth | `openssl rand -base64 32` |
| `FINNHUB_API_KEY` | Optional | Market data |

---

## Database Hosting Alternatives

If you prefer not to use RDS:

- **[Neon](https://neon.tech)** – Serverless Postgres, free tier
- **[Supabase](https://supabase.com)** – Postgres + extras, free tier
- **[PlanetScale](https://planetscale.com)** – MySQL (requires Prisma schema changes)

Set `DATABASE_URL` to the provider’s connection string.

