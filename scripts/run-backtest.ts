#!/usr/bin/env tsx
/**
 * Run backtest from CLI
 * Usage: npm run backtest
 */

import { runBacktest } from "../src/lib/backtest";
import { createSampleStrategy } from "../src/lib/strategy-engine";
import type { PriceBar } from "../src/lib/strategy-engine";

// Generate sample data for SPY (in production, fetch from Polygon/Finnhub)
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

const config = createSampleStrategy();
const data: Record<string, PriceBar[]> = {
  SPY: generateSampleData(252),
};

const result = runBacktest(config, data, 100_000);

console.log("\n=== Backtest Results ===\n");
console.log(`Total Return: ${result.totalReturnPct.toFixed(2)}%`);
console.log(`Final Capital: $${result.finalCapital.toFixed(2)}`);
console.log(`Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}`);
console.log(`Sortino Ratio: ${result.sortinoRatio.toFixed(2)}`);
console.log(`Max Drawdown: ${result.maxDrawdownPct.toFixed(2)}%`);
console.log(`Win Rate: ${(result.winRate * 100).toFixed(1)}%`);
console.log(`Trades: ${result.numTrades}`);
console.log(`\nPassed Net-Gains Gate: ${result.passed ? "YES" : "NO"}\n`);
