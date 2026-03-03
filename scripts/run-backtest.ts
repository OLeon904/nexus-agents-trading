#!/usr/bin/env tsx
/**
 * Run backtest from CLI
 * Usage: npm run backtest
 *
 * Uses REAL data when FINNHUB_API_KEY is set in .env
 * Uses sample data otherwise
 */

import "dotenv/config";
import { runBacktest } from "../src/lib/backtest";
import { createSampleStrategy } from "../src/lib/strategy-engine";
import { fetchHistoricalBars } from "../src/lib/market-data";
import type { PriceBar } from "../src/lib/strategy-engine";

function generateSampleData(days: number): PriceBar[] {
  const bars: PriceBar[] = [];
  let price = 450;
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.48) * 2;
    price = Math.max(400, Math.min(500, price * (1 + change / 100)));
    const d = new Date();
    d.setDate(d.getDate() - (days - i));
    bars.push({
      date: d.toISOString().slice(0, 10),
      open: price,
      high: price * 1.01,
      low: price * 0.99,
      close: price,
      volume: 50_000_000 + Math.random() * 20_000_000,
    });
  }
  return bars;
}

async function main() {
  const config = createSampleStrategy();
  let data: Record<string, PriceBar[]>;

  const apiKey = process.env.FINNHUB_API_KEY?.trim();
  if (apiKey) {
    console.log("\nFetching real market data from Finnhub...");
    try {
      data = await fetchHistoricalBars(config.universe, 365, apiKey);
      const count = Object.values(data).reduce((s, b) => s + b.length, 0);
      console.log(`  Loaded ${count} bars for ${config.universe.join(", ")}\n`);
    } catch (err) {
      console.error("  Finnhub fetch failed:", (err as Error).message);
      console.log("  Falling back to sample data.\n");
      data = { SPY: generateSampleData(252) };
    }
  } else {
    console.log("\nNo FINNHUB_API_KEY in .env - using sample data.");
    console.log("  Get free key at https://finnhub.io/register for real backtests.\n");
    data = { SPY: generateSampleData(252) };
  }

  const result = runBacktest(config, data, 100_000);

  console.log("=== Backtest Results ===\n");
  console.log(`Total Return: ${result.totalReturnPct.toFixed(2)}%`);
  console.log(`Final Capital: $${result.finalCapital.toFixed(2)}`);
  console.log(`Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}`);
  console.log(`Sortino Ratio: ${result.sortinoRatio.toFixed(2)}`);
  console.log(`Max Drawdown: ${result.maxDrawdownPct.toFixed(2)}%`);
  console.log(`Win Rate: ${(result.winRate * 100).toFixed(1)}%`);
  console.log(`Trades: ${result.numTrades}`);
  console.log(`\nPassed Net-Gains Gate: ${result.passed ? "YES" : "NO"}\n`);
}

main().catch(console.error);
