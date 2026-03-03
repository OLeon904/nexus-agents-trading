#!/usr/bin/env tsx
/**
 * Run backtest from CLI
 * Usage: npm run backtest
 *
 * Uses REAL data when FINNHUB_API_KEY is set in .env
 * Uses sample data otherwise
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });
import { runBacktest } from "../src/lib/backtest";
import { createSampleStrategy } from "../src/lib/strategy-engine";
import { fetchHistoricalBars, type MarketDataKeys } from "../src/lib/market-data";
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

  const keys: MarketDataKeys = {
    polygonKey: process.env.POLYGON_API_KEY?.trim(),
    alpacaKeyId: process.env.ALPACA_API_KEY?.trim(),
    alpacaSecret: process.env.ALPACA_SECRET_KEY?.trim(),
    alpacaPaper: process.env.ALPACA_PAPER !== "false",
    twelveDataKey: process.env.TWELVEDATA_API_KEY?.trim(),
    alphaVantageKey: process.env.ALPHAVANTAGE_API_KEY?.trim(),
    finnhubKey: process.env.FINNHUB_API_KEY?.trim(),
  };
  const hasKey = Object.values(keys).some((v) => v && typeof v === "string");
  if (hasKey) {
    console.log("\nFetching real market data...");
    try {
      data = await fetchHistoricalBars(config.universe, 365, keys);
      const count = Object.values(data).reduce((s, b) => s + b.length, 0);
      if (count > 0) {
        console.log(`  Loaded ${count} bars for ${config.universe.join(", ")}\n`);
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.error("  Fetch failed:", (err as Error).message);
      console.log("  Falling back to sample data.");
      console.log("  Add any: POLYGON_API_KEY, ALPACA_API_KEY+SECRET, TWELVEDATA_API_KEY, ALPHAVANTAGE_API_KEY, FINNHUB_API_KEY\n");
      data = { SPY: generateSampleData(252) };
    }
  } else {
    console.log("\nNo market data API keys - using sample data.");
    console.log("  Polygon: polygon.io | Alpaca: alpaca.markets | Twelve Data: twelvedata.com");
    console.log("  Alpha Vantage: alphavantage.co | Finnhub: finnhub.io\n");
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
