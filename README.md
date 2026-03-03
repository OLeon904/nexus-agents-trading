# Nexus Agents Trading

**Multi-agent day trading platform** that combines AI strategy engineering with rigorous backtesting and net-gains gating. Built from insights in [NexusTrade](https://nexustrade.io/blog/too-many-idiots-are-using-openclaw-to-trade-heres-how-to-trade-with-ai-the-right-way-20260203) and [Temple-Stuart](https://github.com/Temple-Stuart/temple-stuart-accounting).

## Philosophy

| ❌ Wrong | ✅ Right |
|----------|----------|
| LLM decides "buy" or "sell" from vibes | AI **engineers** rules-based strategies |
| Give bots API keys to trade blindly | Backtest first, deploy only net-gains strategies |
| One monolithic "agent" | Multiple agents = multiple strategies, each with its own rules |

**Each agent** = one deployed strategy. Strategies are deterministic, backtestable, and must pass a net-gains gate before going live.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT ORCHESTRATOR                            │
│  • Capital allocation  • Risk limits  • Daily P&L tracking       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ Agent 1 │          │ Agent 2 │          │ Agent N │
   │ Strategy│          │ Strategy│          │ Strategy│
   │  (rules)│          │  (rules)│          │  (rules)│
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────┴────────┐
                    │ BACKTEST GATE   │
                    │ Sortino ≥ 0.5   │
                    │ Drawdown ≤ 15%  │
                    │ Return > 0      │
                    └─────────────────┘
```

## Quick Start

```bash
# Install
cd nexus-agents-trading
npm install

# Run backtest (uses real SPY data if FINNHUB_API_KEY is set)
npm run backtest

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Get running with real data:** See **[GETTING-STARTED.md](GETTING-STARTED.md)** — free signups for Neon (DB), Finnhub (market data), Alpaca (paper trading).

## Project Structure

```
nexus-agents-trading/
├── prisma/
│   └── schema.prisma     # Strategies, agents, executions, P&L
├── src/
│   ├── lib/
│   │   ├── types.ts          # StrategyConfig, conditions, signals
│   │   ├── strategy-engine.ts # Rule evaluation (no LLM)
│   │   ├── orchestrator.ts   # Multi-agent coordination
│   │   └── backtest.ts       # Backtest pipeline + net-gains gate
│   └── app/                  # Next.js UI
├── scripts/
│   ├── run-backtest.ts
│   └── generate-strategy.ts  # AI-assisted strategy gen (stub)
└── .env.example
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `TRADIER_ACCESS_TOKEN` | Paper/live trading (optional) |
| `FINNHUB_API_KEY` | Market data |
| `MAX_DAILY_LOSS_PERCENT` | Risk limit (default 5) |
| `MAX_POSITION_SIZE_PERCENT` | Per-position limit (default 10) |

## Net-Gains Gate

A strategy must pass before an agent can deploy:

- **Total return > 0**
- **Sortino ratio ≥ 0.5**
- **Max drawdown ≤ 15%**

## Deploy to AWS

See **[docs/AWS-DEPLOYMENT.md](docs/AWS-DEPLOYMENT.md)** for step-by-step instructions.

- **AWS Amplify** – Connect your Git repo; Amplify builds and hosts the Next.js app.
- **AWS App Runner** – Use the included `Dockerfile` for container-based deployment.
- **Database** – RDS PostgreSQL, or Neon/Supabase for a simpler setup.

---

## Roadmap

- [ ] Market data integration (Finnhub / Polygon)
- [ ] Broker execution (Tradier / Alpaca)
- [ ] AI strategy generation (Claude prompt → StrategyConfig)
- [ ] Genetic optimization for strategy params
- [ ] Temple-Stuart–style double-entry ledger for executions

## References

- [NexusTrade: How to trade with AI the right way](https://nexustrade.io/blog/too-many-idiots-are-using-openclaw-to-trade-heres-how-to-trade-with-ai-the-right-way-20260203)
- [Temple-Stuart accounting](https://github.com/Temple-Stuart/temple-stuart-accounting)
- [NextTrade (Austin Starks)](https://github.com/austin-starks/NextTrade)

---

**Disclaimer:** This is not financial advice. Trade at your own risk. Always backtest and paper-trade before using real capital.
